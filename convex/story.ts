import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createStory = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    tags: v.optional(v.array(v.string())),
  },

  handler: async (ctx, args): Promise<Id<"stories">> => {
    const { title, description, tags } = args;
    const user = await ctx.auth.getUserIdentity();
    const story = await ctx.db.insert("stories", {
      title,
      description,
      tags: tags || [],
      creator: user!.email as string,
    });

    return story;
  },
});

export const getUserStories = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    const stories = await ctx.db
      .query("stories")
      .withIndex("by_creator", (q) => q.eq("creator", user!.email as string))
      .collect();
    return stories;
  },
});

export const getStoryById = query({
  args: {
    storyId: v.string(),
  },
  handler: async (ctx, args) => {
    const { storyId } = args;
    const story = await ctx.db.get(storyId as Id<"stories">);
    return story;
  },
});
