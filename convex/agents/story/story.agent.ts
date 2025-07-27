import { openai } from "@ai-sdk/openai";
import { Agent, createTool } from "@convex-dev/agent";
import { api, components } from "convex/_generated/api";
import { action } from "convex/_generated/server";
import { v } from "convex/values";
import { getChatContextTool } from "./tools/get_chat_context";
import { getFileList } from "../conversation/tools/get_file_list";
import z from "zod";
import { fileInterpreterTool } from "../conversation/tools/code_interpreter.tool";

export const storyAgent = new Agent(components.agent, {
  name: "story-agent",
  chat: openai.chat("gpt-4o"),
  textEmbedding: openai.embedding("text-embedding-3-small"),
  maxSteps: 10,
  instructions: `You are an assistant that helps data journalists write better stories by going through the chats they have had with you in the past to see what insights thye have gotten from their files and want to use in writing their story.. You have access to some tools and would be required to use these at random times. Always stick to the tools that have been specified in the request.
  - You will be given a threadId and an existing story.
  - usually, the stories should be a result of the insights generated within the chats
  - Your job is to give sggestions into how the stories can be improved based on the analysis.
  - You also have access to the files to check specific information from the knowledge base or analyse files using the interpreter.
  
  <important>
  - Focus on improving the story and not on the thread.
  - Always get enough context and information in order to provide quality responses.
  - Be concise and succinct in your responses.
  </important>
  `,
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
