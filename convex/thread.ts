import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { conversationAgent } from "./agent";
import { paginationOptsValidator, type PaginationResult } from "convex/server";
import type { MessageDoc } from "@convex-dev/agent";
import { components } from "./_generated/api";

export const createThread = mutation({
  args: { userId: v.string(), title: v.string() },
  handler: async (ctx, args): Promise<{ threadId: string }> => {
    const { threadId } = await conversationAgent.createThread(ctx, {
      userId: args.userId,
      title: args.title || "New Thread",
    });

    return { threadId };
  },
});

export const continueThread = action({
  args: { prompt: v.string(), threadId: v.string() },
  handler: async (ctx, { prompt, threadId }): Promise<string> => {
    const { thread } = await conversationAgent.continueThread(ctx, {
      threadId,
    });
    const result = await thread.generateText(
      { prompt },
      {
        storageOptions: {
          saveMessages: "all",
        },
      }
    );
    return result.text;
  },
});

export const listMessages = query({
  args: { threadId: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args): Promise<PaginationResult<MessageDoc>> => {
    const paginated = await conversationAgent.listMessages(ctx, {
      ...args,
    });
    return paginated;
  },
});

export const listThreads = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const threads = await ctx.runQuery(
      components.agent.threads.listThreadsByUserId,
      { userId: args.userId }
    );
    return threads;
  },
});

export const getThreadById = query({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    const thread = await ctx.runQuery(components.agent.threads.getThread, {
      threadId: args.threadId,
    });
    return thread;
  },
});

export const deleteThread = mutation({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    await conversationAgent.deleteThreadAsync(ctx, { threadId: args.threadId });
    return { success: true };
  },
});
