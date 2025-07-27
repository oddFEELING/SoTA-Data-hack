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

export const factCheck = action({
  args: {
    storyId: v.id("stories"),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { storyId } = args;

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
    } catch (error) {
      // If parsing fails, try to use the content as plain text
      currentText = snapshot.content;
    }

    if (!currentText.trim()) {
      throw new Error("No text content to process");
    }

    // Create the fact checking prompt
    const factCheckPrompt = `Please fact-check the following article and identify any potential factual errors, inconsistencies, or claims that need verification. 

For each issue you find, provide:
1. The specific claim or statement that needs verification
2. Why it might be incorrect or needs verification
3. What additional research or sources would be needed to verify it

If you find no factual errors, simply state "No factual errors detected."

IMPORTANT: Only provide the fact check analysis. Do not include the original article text in your response.

Text to fact-check:
${currentText}`;

    // Use the RAG system to generate the fact-checked text
    const tempUserId = `fact-check-${storyId}`;

    // First, add the current text to the RAG system
    await ctx.runAction(api.rag.add, {
      text: currentText,
      userId: tempUserId,
    });

    // Then generate the fact-checked text using the RAG system
    const result = await ctx.runAction(api.rag.askRagQuestion, {
      prompt: factCheckPrompt,
      userId: tempUserId,
    });

    const factCheckResults = result.answer;

    // Parse the original content to preserve its structure
    let originalContent;
    try {
      originalContent = JSON.parse(snapshot.content);
    } catch (error) {
      // If parsing fails, create a simple paragraph structure
      originalContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: currentText,
              },
            ],
          },
        ],
      };
    }

    // Create the fact check results section
    const factCheckSection = {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "FACT CHECK RESULTS:",
        },
      ],
    };

    // Split the fact check results into paragraphs
    const factCheckParagraphs = factCheckResults
      .split(/\n\s*\n/)
      .filter((p) => p.trim());

    // Create fact check content structure
    const factCheckContent = factCheckParagraphs.map((paragraph) => ({
      type: "paragraph",
      content: [
        {
          type: "text",
          text: paragraph.trim(),
        },
      ],
    }));

    // Combine original content with fact check results
    const newContent = {
      type: "doc",
      content: [
        ...originalContent.content,
        // Add spacing before fact check section
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "\u00A0", // Non-breaking space for spacing
            },
          ],
        },
        factCheckSection,
        ...factCheckContent,
      ],
    };

    // Get the current version and increment it
    const currentVersion = snapshot.version || 0;
    const newVersion = currentVersion + 1;

    // Submit the new snapshot with the fact-checked content
    await ctx.runMutation(prosemirrorSync.component.lib.submitSnapshot, {
      id: storyId,
      content: JSON.stringify(newContent),
      version: newVersion,
    });

    return true;
  },
});

export const focusGroup = action({
  args: {
    storyId: v.id("stories"),
    focusGroupType: v.union(
      v.literal("knowledgeable"),
      v.literal("semi-familiar"),
      v.literal("unfamiliar")
    ),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { storyId, focusGroupType } = args;

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
    } catch (error) {
      // If parsing fails, try to use the content as plain text
      currentText = snapshot.content;
    }

    if (!currentText.trim()) {
      throw new Error("No text content to process");
    }

    // Create the focus group prompts based on familiarity level
    const focusGroupPrompts = {
      knowledgeable: `You are a focus group participant who is VERY FAMILIAR with the subject matter of this article. You have deep knowledge and expertise in this field.

Please read the following article and provide SUCCINCT and SPECIFIC feedback from your perspective as someone who is knowledgeable about this topic. Consider:

- Is the information accurate and up-to-date?
- Are there any gaps in the explanation that someone with your knowledge would notice?
- Is the technical depth appropriate for your level of expertise?
- Are there any inaccuracies or oversimplifications?
- How well does it compare to other sources you've read on this topic?

Provide your feedback in a clear, constructive manner. Be specific about what works and what could be improved.

IMPORTANT: Only provide the focus group feedback. Do not include the original article text in your response.

Article to review:
${currentText}`,
      "semi-familiar": `You are a focus group participant who is SOMEWHAT FAMILIAR with the subject matter of this article. You have some background knowledge but are not an expert.

Please read the following article and provide SUCCINCT and SPECIFIC feedback from your perspective as someone who is somewhat familiar with this topic. Consider:

- Is the information clear and accessible to someone with your level of knowledge?
- Are there terms or concepts that need better explanation?
- Does the article build on your existing knowledge effectively?
- Are there parts that are too technical or too basic for your level?
- How well does it help you understand the topic better?

Provide your feedback in a clear, constructive manner. Be specific about what works and what could be improved.

IMPORTANT: Only provide the focus group feedback. Do not include the original article text in your response.

Article to review:
${currentText}`,
      unfamiliar: `You are a focus group participant who is UNFAMILIAR with the subject matter of this article. You have little to no background knowledge about this topic.

Please read the following article and provide SUCCINCT and SPECIFIC feedback from your perspective as someone who is new to this topic. Consider:

- Is the information accessible to someone with no prior knowledge?
- Are there terms or concepts that need better explanation?
- Does the article provide enough context and background information?
- Are there parts that are confusing or unclear?
- How well does it help you understand the topic as a beginner?

Provide your feedback in a clear, constructive manner. Be specific about what works and what could be improved.

IMPORTANT: Only provide the focus group feedback. Do not include the original article text in your response.

Article to review:
${currentText}`,
    };

    const prompt = focusGroupPrompts[focusGroupType];

    // Use the RAG system to generate the focus group feedback
    const tempUserId = `focus-group-${storyId}-${focusGroupType}`;

    // First, add the current text to the RAG system
    await ctx.runAction(api.rag.add, {
      text: currentText,
      userId: tempUserId,
    });

    // Then generate the focus group feedback using the RAG system
    const result = await ctx.runAction(api.rag.askRagQuestion, {
      prompt,
      userId: tempUserId,
    });

    const focusGroupFeedback = result.answer;

    // Parse the original content to preserve its structure
    let originalContent;
    try {
      originalContent = JSON.parse(snapshot.content);
    } catch (error) {
      // If parsing fails, create a simple paragraph structure
      originalContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: currentText,
              },
            ],
          },
        ],
      };
    }

    // Create the focus group feedback section header
    const focusGroupHeader = {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: `FOCUS GROUP FEEDBACK (${focusGroupType.toUpperCase()}):`,
        },
      ],
    };

    // Split the focus group feedback into paragraphs
    const feedbackParagraphs = focusGroupFeedback
      .split(/\n\s*\n/)
      .filter((p) => p.trim());

    // Create focus group feedback content structure
    const feedbackContent = feedbackParagraphs.map((paragraph) => ({
      type: "paragraph",
      content: [
        {
          type: "text",
          text: paragraph.trim(),
        },
      ],
    }));

    // Combine original content with focus group feedback
    const newContent = {
      type: "doc",
      content: [
        ...originalContent.content,
        // Add spacing before focus group section
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "\u00A0", // Non-breaking space for spacing
            },
          ],
        },
        focusGroupHeader,
        ...feedbackContent,
      ],
    };

    // Get the current version and increment it
    const currentVersion = snapshot.version || 0;
    const newVersion = currentVersion + 1;

    // Submit the new snapshot with the focus group feedback
    await ctx.runMutation(prosemirrorSync.component.lib.submitSnapshot, {
      id: storyId,
      content: JSON.stringify(newContent),
      version: newVersion,
    });

    return true;
  },
});

export const libelCheck = action({
  args: {
    storyId: v.id("stories"),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const { storyId } = args;

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
    } catch (error) {
      // If parsing fails, try to use the content as plain text
      currentText = snapshot.content;
    }

    if (!currentText.trim()) {
      throw new Error("No text content to process");
    }

    // Create the libel checking prompt
    const libelCheckPrompt = `You are a legal expert specializing in UK defamation law. Please analyze the following article for potential libel issues from a UK legal perspective.

Consider the following aspects of UK libel law:
- Defamation: Any statement that harms a person's reputation
- Libel: Written defamation (as opposed to slander which is spoken)
- Key elements: The statement must be defamatory, refer to the claimant, and be published to a third party
- Defenses: Truth, honest opinion, public interest, privilege, etc.
- Identification: Whether a reasonable person would understand the statement to refer to the claimant

For each potential issue you identify, provide:
1. The specific statement or passage that could be problematic
2. Why it might constitute libel under UK law
3. What legal risks it poses
4. Suggestions for how to mitigate the risk (e.g., adding context, qualifying statements, etc.)

If you find no potential libel issues, simply state "No potential libel issues detected."

IMPORTANT: Only provide the libel check analysis. Do not include the original article text in your response.

Article to analyze:
${currentText}`;

    // Use the RAG system to generate the libel check analysis
    const tempUserId = `libel-check-${storyId}`;

    // First, add the current text to the RAG system
    await ctx.runAction(api.rag.add, {
      text: currentText,
      userId: tempUserId,
    });

    // Then generate the libel check analysis using the RAG system
    const result = await ctx.runAction(api.rag.askRagQuestion, {
      prompt: libelCheckPrompt,
      userId: tempUserId,
    });

    const libelCheckResults = result.answer;

    // Parse the original content to preserve its structure
    let originalContent;
    try {
      originalContent = JSON.parse(snapshot.content);
    } catch (error) {
      // If parsing fails, create a simple paragraph structure
      originalContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: currentText,
              },
            ],
          },
        ],
      };
    }

    // Create the libel check results section header
    const libelCheckHeader = {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "LIBEL CHECK RESULTS:",
        },
      ],
    };

    // Split the libel check results into paragraphs
    const libelCheckParagraphs = libelCheckResults
      .split(/\n\s*\n/)
      .filter((p) => p.trim());

    // Create libel check content structure
    const libelCheckContent = libelCheckParagraphs.map((paragraph) => ({
      type: "paragraph",
      content: [
        {
          type: "text",
          text: paragraph.trim(),
        },
      ],
    }));

    // Combine original content with libel check results
    const newContent = {
      type: "doc",
      content: [
        ...originalContent.content,
        // Add spacing before libel check section
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "\u00A0", // Non-breaking space for spacing
            },
          ],
        },
        libelCheckHeader,
        ...libelCheckContent,
      ],
    };

    // Get the current version and increment it
    const currentVersion = snapshot.version || 0;
    const newVersion = currentVersion + 1;

    // Submit the new snapshot with the libel check results
    await ctx.runMutation(prosemirrorSync.component.lib.submitSnapshot, {
      id: storyId,
      content: JSON.stringify(newContent),
      version: newVersion,
    });

    return true;
  },
});
