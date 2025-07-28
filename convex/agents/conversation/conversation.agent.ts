import { tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { v } from "convex/values";
import { Agent, createTool } from "@convex-dev/agent";
import { api, components } from "../../_generated/api";
import { fileInterpreterTool } from "./tools/code_interpreter.tool";
import { getFileList } from "./tools/get_file_list";
import { ConversationAgentPrompt } from "./conversation_agent.prompt";

export const conversationAgent = new Agent(components.agent, {
  name: "conversation-agent",
  chat: openai.chat("gpt-4o"),
  textEmbedding: openai.embedding("text-embedding-3-small"),
  maxSteps: 10,
  instructions: ConversationAgentPrompt({}),
  tools: {
    knowledgeTool: createTool({
      description:
        "This can be used to extract content from files that have been marked as 'inKnowledgebase' in the knowledge base",
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
    getFileList,
  },
});
