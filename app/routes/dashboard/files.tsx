import React from "react";
import Frame from "~/components/frame";
import { type FormEvent, useState, useRef } from "react";
import DashboardNavbar from "~/components/navigation/dash-navbar";
import { Button } from "~/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useUser } from "@clerk/react-router";
import {
  FileDataTable,
  fileDataTableColumns,
} from "~/components/data-tables/files/files.datatable";

const FilesPage = () => {
  const { user } = useUser();
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const uploadFile = useMutation(api.storage.uploadFile);
  const files = useQuery(api.storage.listFiles, { owner: user!.id });

  const imageInput = useRef<HTMLInputElement>(null);
  const [selectedFile, setSlectedFile] = useState<File | null>(null);

  // ~ ======= handle upload file ======= ~
  async function handleUploadFile(event: FormEvent) {
    event.preventDefault();

    const postUrl = await generateUploadUrl();
    const result = await fetch(postUrl, {
      method: "POST",
      body: selectedFile,
      headers: {
        "content-type": selectedFile!.type,
      },
    });
    const { storageId } = await result.json();
    await uploadFile({
      storageId,
      owner: user!.id,
      name: selectedFile!.name,
      type: selectedFile!.type,
      size: selectedFile!.size,
    });

    setSlectedFile(null);
  }
  return (
    <>
      <DashboardNavbar />
      <Frame>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-medium">Files</h3>
            <p className="text-sm text-muted-foreground">
              Files give your agents the knowledge they need to answer questions
            </p>
          </div>
        </div>

        <section className="mt-10">
          <FileDataTable columns={fileDataTableColumns} data={files ?? []} />
        </section>
      </Frame>
    </>
  );
};

export default FilesPage;
