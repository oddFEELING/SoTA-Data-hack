import { createTool } from "@convex-dev/agent";
import type { MessageDoc } from "@convex-dev/agent";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { conversationAgent } from "convex/agent";
import { z } from "zod";

export const getChatContextTool = createTool({
  description: "gets relevant context from a given chjat by it's id.",
  args: z.object({
    threadId: z.string().describe("The id of the chat to extract context from"),
    prompt: z
      .string()
      .describe(
        "An indepth description of the context you want to extract from the chat"
      ),
  }),

  handler: async (ctx, args) => {
    const { threadId, prompt } = args;
    const user = await ctx.auth.getUserIdentity();
    const thread = await ctx.runQuery(api.thread.getThreadById, {
      threadId,
    });
    const messages: MessageDoc[] = await conversationAgent.fetchContextMessages(
      ctx,
      {
        threadId,
        messages: [{ role: "user", content: prompt }],
        userId: thread?.userId ?? "",
        contextOptions: {
          searchOtherThreads: true,
        },
      }
    );

    return messages;
  },
});
