import React, { type FormEvent, useEffect, useRef, useState } from "react";
import { type Table } from "@tanstack/react-table";
import {
  Add,
  ArchiveBox,
  CloudPlus,
  SearchStatus,
  Trash,
} from "iconsax-reactjs";
import {
  ChevronDown,
  Download,
  LayoutList,
  Settings2,
  Share,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useUser } from "@clerk/react-router";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Loader2, X } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { formatFileSize } from "~/helpers/format-file-size";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "~/lib/utils";
import { toSentenceCase } from "~/helpers/to-sentence-case";
import { ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { type Doc } from "convex/_generated/dataModel";

type FileDataTableFilterProps = {
  table: Table<Doc<"files">>;
};

const FileDataTableFilter = ({ table }: FileDataTableFilterProps) => {
  const { user } = useUser();
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const uploadFile = useMutation(api.storage.uploadFile);
  const deleteFiles = useMutation(api.storage.deleteFiles);

  const selectedCount = table.getSelectedRowModel().rows.length;
  const imageInput = useRef<HTMLInputElement>(null);

  const [selectedFile, setSlectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "ready"
  >("idle");

  // ~ ======= handle upload file ======= ~
  async function handleUploadFile(event: FormEvent) {
    setUploadState("uploading");
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
    setUploadState("idle");
  }

  return (
    <div className="mt-2 flex w-full items-center justify-between px-0.5 py-2">
      <div className="flex items-center gap-2">
        <div className="relative flex w-full max-w-64 items-center">
          <SearchStatus size={16} className="absolute left-2" />
          <Input
            placeholder="Search by name..."
            className="pl-7"
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
          />
        </div>
        {/* ~ =================================== ~ */}
        {/* -- Manage selected items -- */}
        {/* ~ =================================== ~ */}
        <DropdownMenu>
          {selectedCount > 0 && (
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <span>{selectedCount} Selected</span>
                <ChevronDown size={15} strokeWidth={1.5} className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
          )}
          <DropdownMenuContent className="w-44" align="start" side="bottom">
            <DropdownMenuItem>
              <Download size={15} strokeWidth={1.5} />
              <span>Download</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share size={15} strokeWidth={1.5} />
              <span>Share</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <ArchiveBox size={15} strokeWidth={1.5} />
              <span>Archive</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                deleteFiles({
                  fileIds: table
                    .getSelectedRowModel()
                    .rows.map((row) => row.original._id),
                })
              }
            >
              <Trash size={15} strokeWidth={1.5} />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center space-x-4">
        {/* ~ =================================== ~ */}
        {/* -- FIle upload -- */}
        {/* ~ =================================== ~ */}
        <form onSubmit={handleUploadFile} className="flex items-center gap-2">
          {selectedFile && (
            <Badge variant="secondary" className="pr-1.5 text-sm font-normal">
              <span className="max-w-[200px] truncate">
                {selectedFile.name}
              </span>
              <span className="mx-1.5 text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => {
                  setSlectedFile(null);
                  setUploadState("idle");
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          <Button
            variant={uploadState === "idle" ? "ghost" : "default"}
            size="sm"
            type="button"
            onClick={(event) => {
              if (uploadState === "idle") {
                imageInput.current?.click();
              } else if (uploadState === "ready") {
                handleUploadFile(event);
              } else if (uploadState === "uploading") {
                return;
              }
            }}
            disabled={uploadState === "uploading"}
          >
            {uploadState === "idle" && (
              <>
                <Add />
                <span>New file</span>
              </>
            )}
            {uploadState === "ready" && (
              <>
                <CloudPlus />
                <span>Upload</span>
              </>
            )}
            {uploadState === "uploading" && (
              <>
                <Loader2 className="animate-spin" />
                <span>Uploading...</span>
              </>
            )}
          </Button>
          <input
            type="file"
            className="hidden"
            accept="image/*, application/pdf, text/csv, text/plain"
            ref={imageInput}
            onChange={(event) => {
              setSlectedFile(event.target.files![0]);
              if (event.target.files![0]) {
                setUploadState("ready");
              }
            }}
            disabled={selectedFile !== null}
          />
        </form>

        {/* ~ =================================== ~ */}
        {/* -- Column visibility -- */}
        {/* ~ =================================== ~ */}
        <Popover>
          <PopoverTrigger asChild>
            <Button role="combobox" variant="ghost" size="icon">
              <LayoutList size={15} strokeWidth={1.5} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0" align="end">
            <Command>
              <CommandInput placeholder="Search columns..." />
              <CommandList>
                <CommandEmpty>No Fields on this table.</CommandEmpty>
                <CommandGroup>
                  {table
                    .getAllColumns()
                    .filter(
                      (column) =>
                        typeof column.accessorFn !== "undefined" &&
                        column.getCanHide()
                    )
                    .map((column) => {
                      return (
                        <CommandItem
                          key={column.id}
                          onSelect={() =>
                            column.toggleVisibility(!column.getIsVisible())
                          }
                        >
                          <span className="truncate">
                            {toSentenceCase(column.id)}
                          </span>
                          <Check
                            size={14}
                            strokeWidth={1.3}
                            className={cn(
                              "ml-auto shrink-0",
                              column.getIsVisible()
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      );
                    })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default FileDataTableFilter;
