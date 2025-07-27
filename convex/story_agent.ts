import { action } from "./_generated/server";
import { storyAgent } from "./agents/story/story.agent";
import { v } from "convex/values";

export const talk = action({
  args: {
    prompt: v.string(),
    threadId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { prompt, threadId, userId } = args;

    const response = await storyAgent.generateText(
      ctx,
      {
        userId,
      },
      {
        prompt: `
        ${prompt}
        The thread Id is: ${threadId} and the userId is: ${userId}`,
      }
    );

    return response.text;
  },
});
