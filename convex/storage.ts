import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const uploadFile = mutation({
  args: {
    storageId: v.id("_storage"),
    owner: v.string(),
    name: v.string(),
    type: v.string(),
    size: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("files", {
      owner: args.owner,
      name: args.name,
      type: args.type,
      body: args.storageId,
      size: args.size,
      indexed: false,
    });
  },
});

export const listFiles = query({
  args: { owner: v.string() },
  handler: async (ctx, { owner }) => {
    return await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("owner"), owner))
      .collect();
  },
});

export const getFile = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, { fileId }) => {
    return await ctx.db.get(fileId);
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, { fileId }): Promise<boolean> => {
    const file = await ctx.db.get(fileId);
    if (!file) return true;
    await ctx.db.delete(fileId);
    await ctx.storage.delete(file.body);
    return true;
  },
});

export const toggleFileIndexed = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, { fileId }) => {
    const file = await ctx.db.get(fileId);
    if (!file) return;
    await ctx.db.patch(fileId, { indexed: !file.indexed });
  },
});

export const deleteFiles = mutation({
  args: { fileIds: v.array(v.id("files")) },
  handler: async (ctx, { fileIds }) => {
    await Promise.all(
      fileIds.map((fileId) => {
        ctx.runMutation(api.storage.deleteFile, { fileId });
      })
    );
    return true;
  },
});

export const getFileUrl = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);

    if (!file) return null;

    const url = await ctx.storage.getUrl(file.body);

    return { url, type: file.type };
  },
});

export const getUserFiles = query({
  args: {},
  handler: async (ctx): Promise<Doc<"files">[]> => {
    const files = await ctx.db.query("files").collect();
    return files;
  },
});
