import { useAction } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Toggle } from "~/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
  ShieldCheck,
  Loader2,
  BatteryMedium,
  BatteryLow,
  BatteryFull,
  Edit2,
} from "lucide-react";
import { api } from "convex/_generated/api";
import { Editor } from "@tiptap/react";
import { TextBold, TextItalic, TextUnderline } from "iconsax-reactjs";

type ToolBarProps = {
  editor: Editor | null;
  storyId: string;
};

export const ToolBar: React.FC<ToolBarProps> = ({ editor, storyId }) => {
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
          <Toggle
            size="sm"
            pressed={editor?.isActive("bold")}
            onPressedChange={() => {
              editor?.chain().focus().toggleBold().run();
            }}
            title="Bold (Ctrl+B)"
          >
            <TextBold />
          </Toggle>

          {/* ~ ======= Italic ======= ~ */}
          <Toggle
            size="sm"
            pressed={editor?.isActive("italic")}
            onPressedChange={() => {
              editor?.chain().focus().toggleItalic().run();
            }}
            title="Italic (Ctrl+I)"
          >
            <TextItalic />
          </Toggle>

          {/* ~ ======= Underline ======= ~ */}
          <Toggle
            size="sm"
            pressed={editor?.isActive("underline")}
            onPressedChange={() => {
              editor?.chain().focus().toggleUnderline().run();
            }}
            title="Underline (Ctrl+U)"
          >
            <TextUnderline />
          </Toggle>

          {/* ~ ======= Strikethrough ======= ~ */}
          <Toggle
            size="sm"
            pressed={editor?.isActive("strike")}
            onPressedChange={() => {
              editor?.chain().focus().toggleStrike().run();
            }}
            title="Strikethrough (Ctrl+Shift+X)"
          >
            <Strikethrough />
          </Toggle>

          {/* ~ ======= List ======= ~ */}
          <Toggle
            size="sm"
            pressed={editor?.isActive("bulletList")}
            onPressedChange={() => {
              editor?.chain().focus().toggleBulletList().run();
            }}
            title="Bullet List"
          >
            <List />
          </Toggle>
        </div>

        {/* ~ ======= Text type ======= ~ */}
        <Select
          value={
            editor?.isActive("heading", { level: 1 })
              ? "1"
              : editor?.isActive("heading", { level: 2 })
              ? "2"
              : editor?.isActive("heading", { level: 3 })
              ? "3"
              : editor?.isActive("heading", { level: 4 })
              ? "4"
              : "p"
          }
          onValueChange={(value) => {
            // Handle different text types based on value
            if (value === "p") {
              editor?.chain().focus().setParagraph().run();
            } else {
              const level = parseInt(value) as 1 | 2 | 3 | 4;
              editor?.chain().focus().toggleHeading({ level }).run();
              editor?.commands.focus();
            }
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Text type" />
          </SelectTrigger>
          <SelectContent className="w-44 [&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0">
            <SelectItem value="1">
              <Heading1 size={16} aria-hidden="true" />
              <span>Heading 1</span>
            </SelectItem>
            <SelectItem value="2">
              <Heading2 size={16} aria-hidden="true" />
              <span>Heading 2</span>
            </SelectItem>
            <SelectItem value="3">
              <Heading3 size={16} aria-hidden="true" />
              <span>Heading 3</span>
            </SelectItem>
            <SelectItem value="4">
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
          {/* ~ ======= Text Alignment ======= ~ */}
          {/* Note: Text alignment requires TextAlign extension which isn't currently configured */}
          {/* Keeping UI for future implementation when TextAlign is added to editor */}
          <ToggleGroup
            type="single"
            defaultValue="left"
            disabled={true} // Disabled until TextAlign extension is added
          >
            <ToggleGroupItem
              value="left"
              title="Align left (requires TextAlign extension)"
            >
              <AlignLeft />
            </ToggleGroupItem>

            {/* ~ ======= Align center ======= ~ */}
            <ToggleGroupItem
              value="center"
              title="Align center (requires TextAlign extension)"
            >
              <AlignCenter />
            </ToggleGroupItem>

            {/* ~ ======= Align right ======= ~ */}
            <ToggleGroupItem
              value="right"
              title="Align right (requires TextAlign extension)"
            >
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
