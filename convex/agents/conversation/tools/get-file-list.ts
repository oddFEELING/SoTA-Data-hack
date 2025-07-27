import { createTool } from "@convex-dev/agent";
import { api } from "convex/_generated/api";
import { z } from "zod";
import type { Doc } from "~/types";

export const getFileList = createTool({
  description: "gets the list of available filers to the agent",
  args: z.object({}),
  handler: async (
    ctx
  ): Promise<
    {
      fileName: string;
      fileUrl: string;
      inKnowledgebase: boolean;
    }[]
  > => {
    const files = await ctx.runQuery(api.storage.getUserFiles);

    const filesForAgent = files?.map(
      async (
        file
      ): Promise<{
        fileName: string;
        fileUrl: string;
        inKnowledgebase: boolean;
      }> => {
        const fileUrl = await ctx.runQuery(api.storage.getFileUrl, {
          fileId: file.body,
        });

        return {
          fileName: file.name,
          fileUrl: fileUrl!.url as string,
          inKnowledgebase: file.indexed,
        };
      }
    );

    return await Promise.all(filesForAgent);
  },
});
