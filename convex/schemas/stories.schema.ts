import { v } from "convex/values";
import { defineTable } from "convex/server";

export const stories = defineTable({
  title: v.string(),
  description: v.string(),
  creator: v.string(),
  tags: v.array(v.string()),
}).index("by_creator", ["creator"]);
