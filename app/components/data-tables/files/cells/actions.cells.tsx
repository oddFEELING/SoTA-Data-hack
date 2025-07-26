import { useUser } from "@clerk/react-router";
import { api } from "convex/_generated/api";
import { type Doc } from "convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { BatteryCharging, DocumentDownload, Trash } from "iconsax-reactjs";
import {
  DatabaseZap,
  Download,
  MoreHorizontal,
  MoreVertical,
  CheckCircle,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

type ActionCellProps = {
  rowFile: Doc<"files">;
};

export const ActionCell: React.FC<ActionCellProps> = ({ rowFile }) => {
  const { user } = useUser();
  const deleteFile = useMutation(api.storage.deleteFile);

  const extracted = useAction(api.store.extractTextFromPdf);

  return (
    <span className="w-max items-center justify-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => deleteFile({ fileId: rowFile._id })}
      >
        <Trash />
      </Button>

      <Button variant="ghost" size="icon">
        <Download />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="group-hover:opacity-0">
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom">
          <DropdownMenuItem
            disabled={!!(!rowFile.type.includes("pdf") || rowFile.indexed)}
            onClick={async () => {
              const text = await extracted({
                fileId: rowFile._id,
                userId: user!.id,
              });
              console.log(text);
            }}
          >
            {!rowFile.indexed ? (
              <>
                <DatabaseZap size={16} strokeWidth={1.5} />
                <span>Add to agent</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} strokeWidth={1.5} />
                <span>Added to agent</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
};
