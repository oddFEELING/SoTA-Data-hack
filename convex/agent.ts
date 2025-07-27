import { tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { v } from "convex/values";
import { Agent, createTool } from "@convex-dev/agent";
import { api, components } from "./_generated/api";
import { fileInterpreterTool } from "./agents/conversation/tools/code_interpreter.tool";

export const conversationAgent = new Agent(components.agent, {
  name: "conversation-agent",
  chat: openai.chat("gpt-4o"),
  textEmbedding: openai.embedding("text-embedding-3-small"),
  maxSteps: 10,
  instructions:
    "You are an analyser assistant that has access to a suite of knowledge bases. Search your knowledge bases befor answering any questions",
  tools: {
    knowledgeTool: createTool({
      description: "Checks knowledge base for data",
      args: z.object({
        query: z
          .string()
          .describe("The query to search the knowledge base for"),
      }),
      // Note: annotate the return type of the handler to avoid type cycles.
      handler: async (ctx, args): Promise<{ answer: string }> => {
        const result = await ctx.runAction(api.rag.askRagQuestion, {
          prompt: args.query,
          userId: "user_306s7vAHgXbF3Flcwm1Jwnivan9",
        });
        console.log("query", args.query);
        console.log("result", result.answer);
        return { answer: result.answer };
      },
    }),
    fileInterpreterTool: fileInterpreterTool,
  },
});
