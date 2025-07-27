import { WandSparkles } from "lucide-react";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { useAction, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useUser } from "@clerk/react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Message } from "iconsax-reactjs";
import type { Id } from "convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollArea } from "~/components/ui/scroll-area";

const AgentPanel = () => {
  const { user } = useUser();

  const threads = useQuery(api.thread.listThreads, { userId: user?.id ?? "" });
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const selectedThread = threads?.page.find(
    (thread) => thread._id === selectedThreadId
  );

  const talkToAgent = useAction(api.story_agent.talk);

  return (
    <div className="w-full h-[calc(100vh-8.5rem)] flex flex-col">
      <div className="w-full flex items-center justify-between border-b py-2 h-14 px-3 shrink-0">
        <Select
          value={selectedThreadId ?? undefined}
          onValueChange={setSelectedThreadId}
          disabled={!threads?.page.length}
        >
          <SelectTrigger className="border-none shadow-none">
            <SelectValue
              placeholder="Connected thread"
              className="[&>span_svg]:text-muted-foreground/80 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0"
            />
          </SelectTrigger>
          <SelectContent>
            {threads?.page.map((thread) => (
              <SelectItem value={thread._id} key={thread._id}>
                <Message size={16} aria-hidden="true" />
                <span className="truncate">{thread.title}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={async () => {
            if (!selectedThreadId || !user?.id) return;
            setIsLoading(true);
            const data = await talkToAgent({
              prompt: "What is the selected thread about",
              threadId: selectedThreadId,
              userId: user.id,
            });

            setSuggestions(data);
            setIsLoading(false);
          }}
        >
          <WandSparkles size={16} strokeWidth={1.5} />
          <span> {isLoading ? "Running..." : "Run agent"}</span>
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="w-full overflow-y-auto p-3 prose prose-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {suggestions}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AgentPanel;
