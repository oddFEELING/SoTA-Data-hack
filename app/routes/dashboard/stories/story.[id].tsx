import { TextBold, TextItalic, TextUnderline } from "iconsax-reactjs";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  Pilcrow,
  Save,
  Strikethrough,
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
import { EditorProvider } from "./partials/editor-provider";
import { useTiptapSync } from "@convex-dev/prosemirror-sync/tiptap";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/story.[id]";
import usePresence from "@convex-dev/presence/react";
import FacePile from "@convex-dev/presence/facepile";
import "~/styles/facepile.css";

// TODO attach to actual user
const GentleEditorFacePile = ({ storyId }: { storyId: string }) => {
  const [name] = useState(() => "User " + Math.floor(Math.random() * 10000));
  const presenceState = usePresence(api.presence, storyId, name);
  return <FacePile presenceState={presenceState ?? []} />;
};

const SingleStoryPage = ({ params }: Route.LoaderArgs) => {
  const { id } = params;
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
      <DashboardNavbar startActions={<GentleEditorFacePile storyId={id} />} />
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <ToolBar editor={editor} />
          <Frame
            onClick={() => {
              editor?.commands.focus();
            }}
            className="h-full overflow-y-auto"
          >
            <EditorProvider sync={sync}>
              <>
                <BubbleMenu>This is a bubble menu</BubbleMenu>
                <EditorContent
                  editor={editor}
                  className={cn(
                    "bottom-10 rounded-none lg:rounded-lg shadow-none border-none placeholder:text-muted-foreground max-h-[150px] overflow-y-auto flex-grow resize-none bg-transparent p-2 text-sm outline-none focus:ring-0 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-0 w-full z-50"
                  )}
                />
              </>
            </EditorProvider>
          </Frame>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30} maxSize={30} minSize={10} collapsible>
          <Frame>Two</Frame>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
};

export default SingleStoryPage;

type ToolBarProps = {
  editor: Editor | null;
};

const ToolBar: React.FC<ToolBarProps> = ({ editor }) => {
  return (
    <div className="w-full border-b  h-14 flex items-center gap-4 px-3 py-2">
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

      <Button
        variant="outline"
        size="sm"
        onClick={() => editor?.commands.focus()}
      >
        Focus
      </Button>
    </div>
  );
};
