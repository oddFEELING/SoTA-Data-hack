// Re-export Convex types using direct relative import
export type { Doc, Id, TableNames } from "../convex/_generated/dataModel";

// Specific types for your tables
export type FileDoc = Doc<"files">;
export type FileId = Id<"files">;

const de = api;
