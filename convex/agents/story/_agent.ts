import { openai } from "@ai-sdk/openai";
import { Agent, createTool } from "@convex-dev/agent";
import { api, components } from "convex/_generated/api";
import { action } from "convex/_generated/server";
import { v } from "convex/values";
import { getChatContextTool } from "./tools/get_chat_context";
import { getFileList } from "../conversation/tools/get_file_list";
import z from "zod";
import { fileInterpreterTool } from "../conversation/tools/code_interpreter.tool";
import { StoryAgentPrompt } from "./story_agent_prompt";

export const storyAgent = new Agent(components.agent, {
  name: "story-agent",
  chat: openai.chat("gpt-4o"),
  textEmbedding: openai.embedding("text-embedding-3-small"),
  maxSteps: 10,
  instructions: StoryAgentPrompt({}),
  tools: {
    getChatContextTool,
    getFileList,

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

export const talk = action({
  args: {
    prompt: v.string(),
    threadId: v.string(),
    userId: v.string(),
    story: v.string(),
  },
  handler: async (ctx, args) => {
    const { prompt, threadId, userId, story } = args;

    const response = await storyAgent.generateText(
      ctx,
      {
        userId,
      },
      {
        prompt: `
        ${prompt}
        <threadId>
        ${threadId}
        </threadId>
        
        <userId>
        ${userId}
        </userId>

        <story>
        ${story}
        </story>`,
      }
    );

    return response.text;
  },
});
