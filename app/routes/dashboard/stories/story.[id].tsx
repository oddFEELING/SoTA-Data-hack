import { Edit2, TextBold, TextItalic, TextUnderline } from "iconsax-reactjs";

import React, { useState } from "react";
import Frame from "~/components/frame";
import DashboardNavbar from "~/components/navigation/dash-navbar";
import { Button } from "~/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { ChevronLeft, ArrowLeft } from "lucide-react";
import { Toggle } from "~/components/ui/toggle";
import {
  EditorContent,
  useCurrentEditor,
  useEditor,
  type Editor,
} from "@tiptap/react";

import { ScrollArea } from "~/components/ui/scroll-area";
import { EditorProvider } from "./partials/editor-provider";
import { useTiptapSync } from "@convex-dev/prosemirror-sync/tiptap";
import { api } from "convex/_generated/api";
import { useQuery, useAction } from "convex/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/story.[id]";
import usePresence from "@convex-dev/presence/react";

import { useNavigate } from "react-router";
import { useUser } from "@clerk/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import AgentPanel from "./partials/agent-panel";
import { ToolBar } from "./partials/editor-toolbar";
import StarterKit from "@tiptap/starter-kit";

const GentleEditorFacePile = ({ storyId }: { storyId: string }) => {
  const { user } = useUser();
  const [name] = useState(
    () => user?.fullName ?? "User " + Math.floor(Math.random() * 10000)
  );
  const presenceState = usePresence(api.presence, storyId, name);

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
  const editor = useEditor(
    {
      extensions: sync.extension ? [StarterKit, sync.extension] : [StarterKit],
      content: sync?.initialContent ?? "",
      editorProps: {
        attributes: {
          class: "prose prose-sm max-w-none focus:outline-none",
        },
      },
    },
    [sync.isLoading]
  );

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
              className="h-[calc(100vh-8.5rem)] overflow-y-auto p-4"
            >
              <>
                <BubbleMenu>This is a bubble menu</BubbleMenu>
                <EditorContent
                  editor={editor}
                  className={cn(
                    "rounded-none lg:rounded-lg shadow-none border-none placeholder:text-muted-foreground overflow-visible flex-grow resize-none bg-transparent p-2 text-sm outline-none focus:ring-0 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-0 w-full z-50"
                  )}
                />
              </>
            </Frame>
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30} maxSize={30} minSize={10} collapsible>
          {/* ~ =================================== ~ */}
          {/* -- Agent section -- */}
          {/* ~ =================================== ~ */}
          {editor && <AgentPanel story={editor?.getText() ?? ""} />}
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
};

export default SingleStoryPage;
