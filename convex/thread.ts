import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { conversationAgent } from "./agents/conversation/conversation.agent";
import { paginationOptsValidator, type PaginationResult } from "convex/server";
import {
  syncStreams,
  vStreamArgs,
  type MessageDoc,
  type SyncStreamsReturnValue,
} from "@convex-dev/agent";
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
  handler: async (ctx, { prompt, threadId }) => {
    const { thread } = await conversationAgent.continueThread(ctx, {
      threadId,
    });
    const result = await thread.streamText(
      { prompt },
      {
        saveStreamDeltas: true,
        storageOptions: {
          saveMessages: "all",
        },
      }
    );
    await result.consumeStream();
    return result.toTextStreamResponse();
  },
});

export const listMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    const paginated = await conversationAgent.listMessages(ctx, {
      ...args,
    });
    const streams = await syncStreams(ctx, components.agent, {
      threadId: args.threadId,
      streamArgs: args.streamArgs,
    });

    return { ...paginated, streams };
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
