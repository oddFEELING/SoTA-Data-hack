import React, { useEffect, useState } from "react";
import Frame from "~/components/frame";
import {
  EditorProvider,
  EditorContent,
  useEditor,
  useCurrentEditor,
  type Editor,
} from "@tiptap/react";
import { FloatingMenu, BubbleMenu } from "@tiptap/react/menus";
import { useTiptapSync } from "@convex-dev/prosemirror-sync/tiptap";

import StarterKit from "@tiptap/starter-kit";

import DashboardNavbar from "~/components/navigation/dash-navbar";
import { api } from "convex/_generated/api";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { EllipsisVertical, Loader2, MoreHorizontal } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { NoteRemove, Trash } from "iconsax-reactjs";
import { CreateStoryDialog } from "~/components/dialogs/create-story.dialog";
import { useNavigate } from "react-router";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "sonner";

const StoriesPage = () => {
  const sync = useTiptapSync(api.canvas, "user-1");
  const stories = useQuery(api.story.getUserStories);
  const deleteStory = useMutation(api.story.deleteStory);
  const [showCreateStoryDialog, setShowCreateStoryDialog] =
    useState<boolean>(false);
  const isLoadingStories = !!stories === undefined;
  const navigate = useNavigate();
  if (sync.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <DashboardNavbar />
      <CreateStoryDialog
        open={showCreateStoryDialog}
        onOpenChange={setShowCreateStoryDialog}
      />
      <Frame>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-medium">Stories</h3>
            <p className="text-sm text-muted-foreground">
              Collaborate on stories with your team and Nubia!
            </p>
          </div>

          <Button size="sm" onClick={() => setShowCreateStoryDialog(true)}>
            Create story
          </Button>
        </div>

        {/* ~ =================================== ~ */}
        {/* -- Loading state -- */}
        {/* ~ =================================== ~ */}
        {isLoadingStories && (
          <section className="flex items-center justify-center h-full">
            <Loader2 className="w-4 h-4 animate-spin" />
          </section>
        )}

        {/* ~ =================================== ~ */}
        {/* -- EMpty state -- */}
        {/* ~ =================================== ~ */}
        {stories && stories.length === 0 && (
          <section className="flex items-center flex-col gap-3 justify-center h-44 rounded-xl border border-dashed mt-10">
            <span className="p-2 rounded-lg bg-muted/50">
              <NoteRemove
                size={25}
                strokeWidth={1.5}
                className="text-muted-foreground"
              />
            </span>
            <p className="text-sm text-muted-foreground">
              You don't have any stories yet.
            </p>

            <Button onClick={() => setShowCreateStoryDialog(true)}>
              Create story
            </Button>
          </section>
        )}

        {/* ~ =================================== ~ */}
        {/* -- Stories list -- */}
        {/* ~ =================================== ~ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {stories &&
            stories.length > 0 &&
            stories.map((story) => {
              return (
                <Card
                  className="cursor-pointer duration-300 ease-out hover:ring ring-primary/20"
                  onClick={() => {
                    navigate(`/dashboard/stories/${story._id}`);
                  }}
                >
                  <CardHeader>
                    <span className="w-full flex items-center justify-between">
                      <CardTitle>{story.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-rose-500"
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteStory({ storyId: story._id }).then(() => {
                                toast.success("Story deleted");
                              });
                            }}
                          >
                            <Trash size={14} strokeWidth={1.5} />
                          </Button>
                        </DropdownMenuTrigger>
                      </DropdownMenu>
                    </span>
                    <CardDescription>{story.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
        </div>
      </Frame>
    </>
  );
};

export default StoriesPage;

const AppEditor: React.FC<{}> = ({}) => {
  const { editor } = useCurrentEditor();

  return (
    <>
      <BubbleMenu>This is a bubble menu</BubbleMenu>
      <EditorContent
        editor={editor}
        className={cn(
          "bottom-10 rounded-none lg:rounded-lg shadow-none border-none placeholder:text-muted-foreground max-h-[150px] overflow-y-auto flex-grow resize-none bg-transparent p-2 text-sm outline-none focus:ring-0 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-0 w-full z-50"
        )}
      />
    </>
  );
};
