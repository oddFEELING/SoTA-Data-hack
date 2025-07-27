import { Edit2, TextBold, TextItalic, TextUnderline } from "iconsax-reactjs";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  Paintbrush,
  Pilcrow,
  Save,
  Strikethrough,
  ChevronDown,
  Swords,
  Quote,
  Users,
  ArrowLeft,
  ChevronLeft,
  ShieldCheck,
  Loader2,
  BatteryMedium,
  BatteryLow,
  BatteryFull,
} from "lucide-react";
import React, { useState } from "react";
import Frame from "~/components/frame";
import DashboardNavbar from "~/components/navigation/dash-navbar";
import { Button } from "~/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { Toggle } from "~/components/ui/toggle";
import { EditorContent, useCurrentEditor, type Editor } from "@tiptap/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { ScrollArea } from "~/components/ui/scroll-area";
import { EditorProvider } from "./partials/editor-provider";
import { useTiptapSync } from "@convex-dev/prosemirror-sync/tiptap";
import { api } from "convex/_generated/api";
import { useQuery, useAction } from "convex/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/story.[id]";
import usePresence from "@convex-dev/presence/react";
// import FacePile from "@convex-dev/presence/facepile";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSub,
  DropdownMenuRadioItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useNavigate } from "react-router";
import { useUser } from "@clerk/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { toast } from "sonner";
import AgentPanel from "./partials/agent-panel";

// TODO attach to actual user
const GentleEditorFacePile = ({ storyId }: { storyId: string }) => {
  const { user } = useUser();
  const [name] = useState(
    () => user?.fullName ?? "User " + Math.floor(Math.random() * 10000)
  );
  const presenceState = usePresence(api.presence, storyId, name);

  // return <FacePile presenceState={presenceState ?? []} />;
  return (
    <div className="flex items-center -space-x-[10px]">
      {presenceState?.map((state, idx) => (
        <>
          <Avatar
            key={idx}
            className="ring-1 ring-white cursor-pointer hover:shadow-md "
          >
            <AvatarImage src={state.userId} />
            <AvatarFallback>{state.userId.charAt(0)}</AvatarFallback>
          </Avatar>
        </>
      ))}
    </div>
  );
};

const SingleStoryPage = ({ params }: Route.LoaderArgs) => {
  const { id } = params;
  const navigate = useNavigate();
  const sync = useTiptapSync(api.canvas, id as string);
  const story = useQuery(api.story.getStoryById, {
    storyId: id ?? "",
  });
  const { editor } = useCurrentEditor();

  if (sync.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <DashboardNavbar
        endActions={<GentleEditorFacePile storyId={id} />}
        startActions={
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/stories")}
            >
              <ChevronLeft strokeWidth={1.5} />
            </Button>
            <Button variant="ghost">{story?.title}</Button>
          </div>
        }
      />
      <ResizablePanelGroup direction="horizontal">
        {/* ~ =================================== ~ */}
        {/* -- Editor section -- */}
        {/* ~ =================================== ~ */}
        <ResizablePanel>
          <ToolBar editor={editor} storyId={id} />
          <ScrollArea className="h-[calc(100vh-8.5rem)]">
            <Frame
              onClick={() => {
                editor?.commands.focus();
              }}
              className="min-h-full p-4"
            >
              <EditorProvider sync={sync}>
                <>
                  <BubbleMenu>This is a bubble menu</BubbleMenu>
                  <EditorContent
                    editor={editor}
                    className={cn(
                      "rounded-none lg:rounded-lg shadow-none border-none placeholder:text-muted-foreground overflow-visible flex-grow resize-none bg-transparent p-2 text-sm outline-none focus:ring-0 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-0 w-full z-50"
                    )}
                  />
                </>
              </EditorProvider>
            </Frame>
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30} maxSize={30} minSize={10} collapsible>
          {/* ~ =================================== ~ */}
          {/* -- Agent section -- */}
          {/* ~ =================================== ~ */}
          <AgentPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
};

export default SingleStoryPage;

type ToolBarProps = {
  editor: Editor | null;
  storyId: string;
};

const ToolBar: React.FC<ToolBarProps> = ({ editor, storyId }) => {
  const [isApplyingStyleGuide, setIsApplyingStyleGuide] = useState(false);
  const [isFactChecking, setIsFactChecking] = useState(false);
  const [isFocusGrouping, setIsFocusGrouping] = useState(false);
  const [isLibelChecking, setIsLibelChecking] = useState(false);
  const applyStyleGuide = useAction(api.canvas.applyStyleGuide);
  const factCheck = useAction(api.canvas.factCheck);
  const focusGroup = useAction(api.canvas.focusGroup);
  const libelCheck = useAction(api.canvas.libelCheck);

  const handleStyleGuideApply = async (styleGuide: "AP" | "BBC") => {
    if (!storyId) return;

    setIsApplyingStyleGuide(true);
    try {
      await applyStyleGuide({
        storyId: storyId as any, // Type assertion needed for Convex ID
        styleGuide,
      });
      toast.success(`${styleGuide} style guide applied successfully!`);

      // Refresh the page to show the updated content
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error applying style guide:", error);
      toast.error("Failed to apply style guide. Please try again.");
    } finally {
      setIsApplyingStyleGuide(false);
    }
  };

  const handleFactCheck = async () => {
    if (!storyId) return;

    setIsFactChecking(true);
    try {
      await factCheck({
        storyId: storyId as any, // Type assertion needed for Convex ID
      });
      toast.success("Fact check completed successfully!");

      // Refresh the page to show the updated content
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error performing fact check:", error);
      toast.error("Failed to perform fact check. Please try again.");
    } finally {
      setIsFactChecking(false);
    }
  };

  const handleFocusGroup = async (
    focusGroupType: "knowledgeable" | "semi-familiar" | "unfamiliar"
  ) => {
    if (!storyId) return;

    setIsFocusGrouping(true);
    try {
      await focusGroup({
        storyId: storyId as any, // Type assertion needed for Convex ID
        focusGroupType,
      });
      toast.success("Focus group feedback completed successfully!");

      // Refresh the page to show the updated content
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error performing focus group analysis:", error);
      toast.error("Failed to perform focus group analysis. Please try again.");
    } finally {
      setIsFocusGrouping(false);
    }
  };

  const handleLibelCheck = async () => {
    if (!storyId) return;

    setIsLibelChecking(true);
    try {
      await libelCheck({
        storyId: storyId as any, // Type assertion needed for Convex ID
      });
      toast.success("Libel check completed successfully!");

      // Refresh the page to show the updated content
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error performing libel check:", error);
      toast.error("Failed to perform libel check. Please try again.");
    } finally {
      setIsLibelChecking(false);
    }
  };

  return (
    <div className="w-full border-b  h-14 flex items-center gap-4 px-3 py-2 justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 h-max">
          <Button variant="ghost" size="icon">
            <Save strokeWidth={1.5} />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          {/* ~ ======= Bold ======= ~ */}
          <Toggle size="sm">
            <TextBold />
          </Toggle>

          {/* ~ ======= Italic ======= ~ */}
          <Toggle size="sm">
            <TextItalic />
          </Toggle>

          {/* ~ ======= Underline ======= ~ */}
          <Toggle size="sm">
            <TextUnderline />
          </Toggle>

          {/* ~ ======= Strikethrough ======= ~ */}
          <Toggle size="sm">
            <Strikethrough />
          </Toggle>

          {/* ~ ======= List ======= ~ */}
          <Toggle size="sm">
            <List />
          </Toggle>
        </div>

        {/* ~ ======= Text type ======= ~ */}
        <Select>
          <SelectTrigger>
            <SelectValue
              defaultValue="p"
              placeholder="Text type"
              className="[&>span_svg]:text-muted-foreground/80 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0"
            />
          </SelectTrigger>
          <SelectContent className="w-44 [&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0">
            <SelectItem value="h1">
              <Heading1 size={16} aria-hidden="true" />
              <span>Heading 1</span>
            </SelectItem>
            <SelectItem value="h2">
              <Heading2 size={16} aria-hidden="true" />
              <span>Heading 2</span>
            </SelectItem>
            <SelectItem value="h3">
              <Heading3 size={16} aria-hidden="true" />
              <span>Heading 3</span>
            </SelectItem>
            <SelectItem value="h4">
              <Heading4 size={16} aria-hidden="true" />
              <span>Heading 4</span>
            </SelectItem>
            <SelectItem value="p">
              <Pilcrow size={16} aria-hidden="true" />
              <span>Paragraph</span>
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          {/* ~ ======= Align left ======= ~ */}
          <ToggleGroup type="single" defaultValue="left" variant="outline">
            <ToggleGroupItem value="left">
              <AlignLeft />
            </ToggleGroupItem>

            {/* ~ ======= Align center ======= ~ */}
            <ToggleGroupItem value="center">
              <AlignCenter />
            </ToggleGroupItem>

            {/* ~ ======= Align right ======= ~ */}
            <ToggleGroupItem value="right">
              <AlignRight />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            disabled={
              isApplyingStyleGuide ||
              isFactChecking ||
              isFocusGrouping ||
              isLibelChecking
            }
          >
            {isApplyingStyleGuide ||
            isFactChecking ||
            isFocusGrouping ||
            isLibelChecking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>
                  {isApplyingStyleGuide
                    ? "Applying..."
                    : isFactChecking
                    ? "Fact checking..."
                    : isFocusGrouping
                    ? "Focus grouping..."
                    : "Libel checking..."}
                </span>
              </>
            ) : (
              <>
                <span>Menu</span>
                <ChevronDown />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuItem
            onClick={() => handleStyleGuideApply("AP")}
            disabled={
              isApplyingStyleGuide ||
              isFactChecking ||
              isFocusGrouping ||
              isLibelChecking
            }
          >
            <Paintbrush size={14} strokeWidth={1} />
            <span>Style Guide: AP style</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStyleGuideApply("BBC")}
            disabled={
              isApplyingStyleGuide ||
              isFactChecking ||
              isFocusGrouping ||
              isLibelChecking
            }
          >
            <Paintbrush size={14} strokeWidth={1} />
            <span>Style Guide: BBC style</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Quote size={14} strokeWidth={1} />
            <span>Fact Filling</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleFactCheck}
            disabled={
              isApplyingStyleGuide ||
              isFactChecking ||
              isFocusGrouping ||
              isLibelChecking
            }
          >
            <ShieldCheck size={14} strokeWidth={1} />
            <span>Fact Check</span>
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Users size={14} strokeWidth={1} className="mr-2" />
              <span>Focus Groups</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => handleFocusGroup("knowledgeable")}
                  disabled={
                    isApplyingStyleGuide ||
                    isFactChecking ||
                    isFocusGrouping ||
                    isLibelChecking
                  }
                >
                  <BatteryFull size={14} strokeWidth={1} />
                  <span>Focus Group: Knowledgeable</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleFocusGroup("semi-familiar")}
                  disabled={
                    isApplyingStyleGuide ||
                    isFactChecking ||
                    isFocusGrouping ||
                    isLibelChecking
                  }
                >
                  <BatteryMedium size={14} strokeWidth={1} />
                  <span>Focus Group: Semi familiar</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleFocusGroup("unfamiliar")}
                  disabled={
                    isApplyingStyleGuide ||
                    isFactChecking ||
                    isFocusGrouping ||
                    isLibelChecking
                  }
                >
                  <BatteryLow size={14} strokeWidth={1} />
                  <span>Focus Group: Unfamiliar</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem
            onClick={handleLibelCheck}
            disabled={
              isApplyingStyleGuide ||
              isFactChecking ||
              isFocusGrouping ||
              isLibelChecking
            }
          >
            <Swords size={14} strokeWidth={1} />
            <span>Libel Check</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Edit2 size={14} strokeWidth={1} />
            <span>Instructions</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
