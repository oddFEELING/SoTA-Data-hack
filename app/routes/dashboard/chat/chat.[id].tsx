import React, { useEffect, useState, useRef } from "react";
import Frame from "~/components/frame";
import DashboardNavbar from "~/components/navigation/dash-navbar";
import type { Route } from "../../+types/_layout";
import { type UIMessage } from "@convex-dev/agent/react";
import { useAction, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useNavigate } from "react-router";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { ChevronDown, Edit2 } from "lucide-react";
import { ArchiveBox } from "iconsax-reactjs";
import { PromptBox } from "~/components/prompt.input";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";
import { Card } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useUser } from "@clerk/react-router";
import { Bot, User } from "lucide-react";
import { cn } from "~/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AssistantMessage } from "./partials/assistant-message";

const ChatPage = ({ params }: Route.LoaderArgs) => {
  const { id } = params;
  const navigate = useNavigate();
  const [messageValue, setMessageValue] = useState("");
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const thread = useQuery(api.thread.getThreadById, { threadId: id as string });
  const search = useAction(api.rag.search);
  const continueThread = useAction(api.thread.continueThread);

  // Only fetch messages when we have a valid thread
  const messages = useThreadMessages(
    api.thread.listMessages,
    thread?._id ? { threadId: thread._id } : "skip",
    { initialNumItems: 10, stream: true }
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.results]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Use the controlled value instead of FormData
    if (!messageValue.trim()) {
      return;
    }

    continueThread({
      threadId: id as string,
      prompt: messageValue,
    });

    // Reset the controlled value
    setMessageValue("");
  };

  if (thread === undefined) {
    return <div>Loading...</div>;
  }

  if (thread === null) {
    return <div>Thread not found</div>;
  }

  return (
    <>
      <DashboardNavbar
        startActions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <span>{thread?.title}</span>
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="bottom">
              <DropdownMenuItem>
                <Edit2 />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <ArchiveBox />
                <span>Archive</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <Frame>
        <div className="relative w-full h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full">
            {toUIMessages(messages?.results ?? []).map((message) => (
              <>
                {
                  {
                    assistant: <AssistantMessage message={message} />,
                    system: <AssistantMessage message={message} />,
                    data: <></>,
                    user: (
                      <div
                        key={message.key}
                        className={cn("flex gap-3 mb-6 justify-end")}
                      >
                        {/* Assistant/System Avatar - Show on left for non-user messages */}
                        {message.role !== "user" && (
                          <Avatar className="size-8 shrink-0">
                            <AvatarFallback className="bg-secondary">
                              <Bot className="size-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}

                        {/* Message Card */}
                        <Card
                          className={cn(
                            "max-w-[70%] p-4 shadow-sm bg-primary text-primary-foreground"
                          )}
                        >
                          {/* Message content */}
                          <div className="text-sm leading-relaxed prose prose-p:text-white dark:prose-p:text-primary-foreground">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        </Card>

                        {/* User Avatar - Show on right for user messages */}
                        {message.role === "user" && (
                          <Avatar className="size-8 shrink-0">
                            <AvatarImage src={user?.imageUrl} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <User className="size-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ),
                  }[message.role]
                }
              </>
            ))}
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
          <div className="w-full max-w-3xl mx-auto p-4">
            <form onSubmit={handleSubmit}>
              <PromptBox
                className="w-full"
                name="message"
                value={messageValue}
                onChange={(e) => setMessageValue(e.target.value)}
              />
            </form>
          </div>
        </div>
      </Frame>
    </>
  );
};

export default ChatPage;
