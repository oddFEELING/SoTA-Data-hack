import { v } from "convex/values";
import { defineTable } from "convex/server";

export const users = defineTable({
  name: v.string(),
  tokenIdentifier: v.string(),
}).index("by_token", ["tokenIdentifier"]);
