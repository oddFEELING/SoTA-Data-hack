import type { MessageDoc, SyncStreamsReturnValue } from "@convex-dev/agent";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React from "react";
import { Bot, Brain, Code, Cog, Wrench } from "lucide-react";
import { type UIMessage, useSmoothText } from "@convex-dev/agent/react";
import { Code1, DocumentText, OceanProtocol } from "iconsax-reactjs";
import { cn } from "~/lib/utils";

type AssistantMessageProps = {
  message: UIMessage;
};

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  message,
}) => {
  const [visibleText] = useSmoothText(message.content, {
    startStreaming: message.status === "streaming",
  });
  return (
    <div className="flex flex-col gap-2 my-4 p-3 rounded-lg">
      <div className="flex items-center gap-2">
        <OceanProtocol size={16} />
        <p className="text-sm font-medium">Nubia</p>
      </div>
      {message.parts?.map((part, idx) => (
        <div key={idx}>
          {part.type === "text" && (
            <div className="prose dark:prose-p:text-primary-foreground dark:prose-li:text-primary-foreground dark:prose-strong:text-primary-foreground dark:prose-a:text-primary-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {visibleText}
              </ReactMarkdown>
            </div>
          )}

          {part.type === "tool-invocation" && (
            <div className="flex  gap-2 items-center border w-max py-1 px-3 rounded">
              {part.toolInvocation.state !== "result" && (
                <Cog
                  size={16}
                  strokeWidth={1.5}
                  className={cn("animate-spin")}
                />
              )}

              {part.toolInvocation.state === "result" &&
                part.toolInvocation.toolName === "knowledgeTool" && (
                  <Brain size={16} strokeWidth={1.5} />
                )}

              {part.toolInvocation.state === "result" &&
                part.toolInvocation.toolName === "getFileList" && (
                  <DocumentText size={16} strokeWidth={1.5} />
                )}

              {part.toolInvocation.state === "result" &&
                part.toolInvocation.toolName === "fileInterpreterTool" && (
                  <Code1 size={16} strokeWidth={1.5} />
                )}

              <p className="text-sm font-medium">
                <span className="text-muted-foreground">
                  {part.toolInvocation.state === "result"
                    ? "used "
                    : "running tool: "}
                </span>
                {part.toolInvocation.toolName}{" "}
              </p>
            </div>
          )}
        </div>
      ))}

      {message.status === "streaming" && (
        <div className="flex items-center space-x-1">
          <div className="bg-primary w-1 h-1 rounded-full animate-pulse" />
          <div className="bg-primary w-2 h-2 rounded-full animate-pulse" />
          <div className="bg-primary w-3 h-3 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
};
