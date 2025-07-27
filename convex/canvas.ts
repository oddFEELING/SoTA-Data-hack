import { components } from "./_generated/api";
import { ProsemirrorSync } from "@convex-dev/prosemirror-sync";
import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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

export const applyStyleGuide = action({
  args: {
    storyId: v.id("stories"),
    styleGuide: v.union(v.literal("AP"), v.literal("BBC")),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { storyId, styleGuide } = args;

    // Get the current content from the canvas
    const snapshot = await ctx.runQuery(
      prosemirrorSync.component.lib.getSnapshot,
      {
        id: storyId,
      }
    );

    if (!snapshot || !snapshot.content) {
      throw new Error("No content found for this story");
    }

    // Parse the JSON content to extract text while preserving structure
    let currentText = "";
    let originalStructure: any[] = [];

    try {
      const content = JSON.parse(snapshot.content);

      // Extract text while preserving paragraph breaks
      const extractTextWithBreaks = (node: any): string => {
        if (typeof node === "string") return node;
        if (node.text) return node.text;
        if (node.content && Array.isArray(node.content)) {
          // If this is a paragraph node, add double line breaks
          if (node.type === "paragraph") {
            return node.content.map(extractTextWithBreaks).join("") + "\n\n";
          }
          return node.content.map(extractTextWithBreaks).join(" ");
        }
        return "";
      };

      // Extract the full text for processing with paragraph breaks preserved
      currentText = extractTextWithBreaks(content);

      // Store the original structure for reconstruction
      originalStructure = content.content || [];
    } catch (error) {
      // If parsing fails, try to use the content as plain text
      currentText = snapshot.content;
    }

    if (!currentText.trim()) {
      throw new Error("No text content to process");
    }

    // Create the prompt based on the style guide
    const styleGuidePrompts = {
      AP: `Please rewrite the following text according to AP (Associated Press) style guide. AP style emphasizes clarity, brevity, and accuracy. Key rules include:
- Use numerals for numbers 10 and above, spell out numbers below 10
- Use title case for headlines
- Use active voice
- Avoid jargon and clichés
- Use present tense for current events
- Use past tense for historical events
- Use proper attribution for quotes
- Use specific, concrete language

IMPORTANT: Preserve the exact paragraph structure and spacing. Keep the same number of paragraphs and maintain the same spacing between them. Use double line breaks (\\n\\n) to separate paragraphs.

Text to rewrite:
${currentText}`,
      BBC: `Please rewrite the following text according to BBC style guide. BBC style emphasizes impartiality, accuracy, and accessibility. Key rules include:
- Use clear, simple language
- Avoid jargon and technical terms when possible
- Use active voice
- Be impartial and balanced
- Use specific, concrete examples
- Use proper attribution
- Use present tense for current events
- Use past tense for historical events
- Use British English spelling where appropriate

IMPORTANT: Preserve the exact paragraph structure and spacing. Keep the same number of paragraphs and maintain the same spacing between them. Use double line breaks (\\n\\n) to separate paragraphs.

Text to rewrite:
${currentText}`,
    };

    const prompt = styleGuidePrompts[styleGuide];

    // Use the RAG system to generate the rewritten text
    // We'll use a temporary user ID for this operation
    const tempUserId = `style-guide-${storyId}`;

    // First, add the current text to the RAG system
    await ctx.runAction(api.rag.add, {
      text: currentText,
      userId: tempUserId,
    });

    // Then generate the rewritten text using the RAG system
    const result = await ctx.runAction(api.rag.askRagQuestion, {
      prompt,
      userId: tempUserId,
    });

    const rewrittenText = result.answer;

    // Split the rewritten text into paragraphs, preserving the original spacing
    // This will maintain the exact paragraph structure from the original
    const paragraphs = rewrittenText.split(/\n\s*\n/).filter((p) => p.trim());

    // Create content structure that preserves paragraphs with proper spacing
    const newContent = {
      type: "doc",
      content: paragraphs.flatMap((paragraph, index) => {
        const paragraphNode = {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: paragraph.trim(),
            },
          ],
        };

        // Add an empty paragraph after each paragraph except the last one
        // This creates visual spacing between paragraphs in the editor
        if (index < paragraphs.length - 1) {
          return [
            paragraphNode,
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "\u00A0", // Non-breaking space to ensure the paragraph is rendered
                },
              ],
            },
          ];
        }
        return [paragraphNode];
      }),
    };

    // Get the current version and increment it
    const currentVersion = snapshot.version || 0;
    const newVersion = currentVersion + 1;

    // Submit the new snapshot with the rewritten content
    // This will properly trigger frontend updates
    await ctx.runMutation(prosemirrorSync.component.lib.submitSnapshot, {
      id: storyId,
      content: JSON.stringify(newContent),
      version: newVersion,
    });

    return true;
  },
});
