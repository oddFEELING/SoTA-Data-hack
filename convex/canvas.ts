import { components } from "./_generated/api";
import { ProsemirrorSync } from "@convex-dev/prosemirror-sync";
import { action, mutation } from "./_generated/server";
import { v } from "convex/values";

const prosemirrorSync = new ProsemirrorSync(components.prosemirrorSync);

export const {
  getSnapshot,
  submitSnapshot,
  latestVersion,
  getSteps,
  submitSteps,
} = prosemirrorSync.syncApi({});

export const createCanvas = action({
  args: {
    storyId: v.id("stories"),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { storyId } = args;
    await prosemirrorSync.create(ctx, storyId, []);
    return true;
  },
});

export const deleteCanvas = mutation({
  args: {
    storyId: v.id("stories"),
  },

  handler: async (ctx, args): Promise<boolean> => {
    await ctx.runMutation(prosemirrorSync.component.lib.deleteDocument, {
      id: args.storyId,
    });
    return true;
  },
});
