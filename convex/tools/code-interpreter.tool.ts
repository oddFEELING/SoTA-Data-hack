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
    fileUrl: z.string().describe("The url of the file to get data from"),
  }),

  handler: async (ctx, args): Promise<string> => {
    try {
      console.log("Downloading file from URL:", args.fileUrl);

      // Step 1: Download the file from the URL
      const fileResponse = await axios.get(args.fileUrl, {
        responseType: "arraybuffer", // Get file as binary data
      });

      // Step 2: Create a container (or use existing one)
      const container = await client.containers.create({
        name: "file-interpreter-container",
      });
      console.log("Container created:", container.id);

      // Step 3: Upload the file to the container using axios
      const formData = new FormData();
      // Convert arraybuffer to Blob with appropriate mime type
      const contentType =
        fileResponse.headers["content-type"] || "application/octet-stream";
      const blob = new Blob([fileResponse.data], { type: contentType });
      formData.append("file", blob, "new-file");

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

      console.log("File uploaded successfully:", uploadResponse.data);

      // Step 4: Use the uploaded file with code interpreter
      const result = await client.responses.create({
        model: "gpt-4.1", // Using the correct model from documentation
        tools: [
          {
            type: "code_interpreter",
            container: container.id, // Pass the container ID directly for explicit mode
          },
        ],
        instructions,
        input: `Analyze the file named '${
          uploadResponse.data.filename || "new-file"
        }' in the container. The file has been uploaded from ${args.fileUrl}`,
      });

      return result.output_text;
    } catch (error) {
      console.error("Error in file interpreter tool:", error);

      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to process file: ${
            error.response?.data?.error?.message || error.message
          }`
        );
      }

      throw error;
    }
  },
});

export { fileInterpreterTool };
