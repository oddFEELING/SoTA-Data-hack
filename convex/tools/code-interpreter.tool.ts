import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import OpenAI from "openai";
import axios from "axios";

const client = new OpenAI();

const instructions = `
Your job is to analyze the file and return a structured statistical analysis of the data.
`;

const fileInterpreterTool = createTool({
  description: "Gets data from files",

  args: z.object({
    additionalInstructions: z
      .string()
      .describe("The instructions for the tool"),
    files: z.array(
      z.object({
        url: z.string(),
        name: z.string(),
      })
    ),
  }),

  handler: async (ctx, args): Promise<string> => {
    try {
      // Step 1: Download all files from URLs
      console.log(`Downloading ${args.files.length} files...`);

      const downloadedFiles = await Promise.all(
        args.files.map(async (file) => {
          console.log(`Downloading file from URL: ${file.url}`);
          const fileResponse = await axios.get(file.url, {
            responseType: "arraybuffer", // Get file as binary data
          });

          return {
            name: file.name,
            data: fileResponse.data,
            contentType:
              fileResponse.headers["content-type"] ||
              "application/octet-stream",
          };
        })
      );

      // Step 2: Create a container for all files
      const container = await client.containers.create({
        name: "file-interpreter-container",
      });
      console.log("Container created:", container.id);

      // Step 3: Upload all files to the container
      const uploadedFiles = await Promise.all(
        downloadedFiles.map(async (file) => {
          const formData = new FormData();
          // Convert arraybuffer to Blob with appropriate mime type
          const blob = new Blob([file.data], { type: file.contentType });
          formData.append("file", blob, file.name);

          // Upload file to OpenAI container
          const uploadResponse = await axios.post(
            `https://api.openai.com/v1/containers/${container.id}/files`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${
                  process.env.OPENAI_API_KEY || client.apiKey
                }`,
                // FormData will automatically set the correct Content-Type with boundary
              },
            }
          );

          console.log(
            `File uploaded successfully: ${file.name}`,
            uploadResponse.data
          );

          return {
            originalName: file.name,
            uploadedName: uploadResponse.data.filename || file.name,
          };
        })
      );

      // Step 4: Combine base instructions with additional instructions
      const combinedInstructions = args.additionalInstructions
        ? `${instructions}\n\nAdditional Instructions:\n${args.additionalInstructions}`
        : instructions;

      // Step 5: Create input prompt listing all files
      const filesList = uploadedFiles
        .map(
          (file) => `- ${file.uploadedName} (originally: ${file.originalName})`
        )
        .join("\n");

      const inputPrompt = `Analyze the following ${uploadedFiles.length} file(s) in the container:\n${filesList}\n\nPerform a comprehensive analysis considering all files together.`;

      // Step 6: Use the uploaded files with code interpreter
      const result = await client.responses.create({
        model: "gpt-4.1", // Using the correct model from documentation
        tools: [
          {
            type: "code_interpreter",
            container: container.id, // Pass the container ID directly for explicit mode
          },
        ],
        instructions: combinedInstructions,
        input: inputPrompt,
      });

      return result.output_text;
    } catch (error) {
      console.error("Error in file interpreter tool:", error);

      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to process files: ${
            error.response?.data?.error?.message || error.message
          }`
        );
      }

      throw error;
    }
  },
});

export { fileInterpreterTool };
