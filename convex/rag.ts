import { api, components, internal } from "./_generated/api";
import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Doc } from "~/types";

export const rag = new RAG(components.rag, {
  textEmbeddingModel: openai.embedding("text-embedding-3-small"),
  embeddingDimension: 1536,
});

export const add = action({
  args: { text: v.string(), userId: v.string() },
  handler: async (ctx, { text, userId }) => {
    await rag.add(ctx, {
      namespace: userId,
      text,
    });
  },
});

export const search = action({
  args: { query: v.string(), userId: v.string() },
  handler: async (ctx, { query, userId }) => {
    const { results, text, entries } = await rag.search(ctx, {
      namespace: userId,
      query,
      limit: 5,
      vectorScoreThreshold: 0.5,
    });

    return {
      results,
      text,
      entries,
    };
  },
});

export const askRagQuestion = action({
  args: { prompt: v.string(), userId: v.string() },
  handler: async (ctx, { prompt, userId }) => {
    const { text: answer, context } = await rag.generateText(ctx, {
      search: { namespace: userId, limit: 5 },
      prompt,
      model: openai.chat("gpt-4.1"),
    });

    return { answer, context };
  },
});
