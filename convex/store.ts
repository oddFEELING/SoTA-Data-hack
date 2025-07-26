"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
// @ts-ignore
import pdf from "pdf-parse-debugging-disabled";

export const extractTextFromPdf = action({
  args: {
    fileId: v.id("files"),
    userId: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const file = await ctx.runQuery(api.storage.getFileUrl, {
      fileId: args.fileId,
    });

    if (!file) {
      throw new Error("File not found.");
    }

    console.log(`Fetching PDF from URL: ${file?.url}`);

    const response = await fetch(file.url as string);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();

    // 3. Parse the PDF buffer
    // (This happens on the server, not in the user's browser)
    const options = {
      pdfjs: {
        worker: null, // Correct for Node.js environment
      },
    };
    const data = await pdf(buffer, options);
    await ctx.runAction(api.rag.add, {
      text: data.text,
      userId: args.userId,
    });

    await ctx.runMutation(api.storage.toggleFileIndexed, {
      fileId: args.fileId,
    });

    return data.text;
  },
});
