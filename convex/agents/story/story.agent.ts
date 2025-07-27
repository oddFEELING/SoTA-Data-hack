import { openai } from "@ai-sdk/openai";
import { Agent } from "@convex-dev/agent";
import { components } from "convex/_generated/api";

export const storyAgent = new Agent(components.agent, {
  name: "story-agent",
  chat: openai.chat("gpt-4o"),
  textEmbedding: openai.embedding("text-embedding-3-small"),
  maxSteps: 10,
  instructions:
    "You are an assistant that helps data journalists write better stories by going through the chats they have had with you in the past to see what insights thye have gotten from their files and want to use in writing their story.. You have access to some tools and would be required to use these at random times. Always stick to the tools that have been specified in the request.",
});
