import { defineTable } from "convex/server";
import { v } from "convex/values";

export const files = defineTable({
  owner: v.string(),
  name: v.string(),
  type: v.string(),
  body: v.id("_storage"),
  size: v.number(),
  indexed: v.boolean(),
});
