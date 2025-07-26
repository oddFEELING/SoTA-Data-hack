import { type ColumnDef } from "@tanstack/react-table";
import { type Doc } from "convex/_generated/dataModel";
import { Checkbox } from "~/components/ui/checkbox";
import { formatFileSize } from "~/helpers/format-file-size";
import { ActionCell } from "./cells/actions.cells";
import { IndexedCell } from "./cells/indexed.cells";
import { format } from "date-fns";

export const fileDataTableColumns: ColumnDef<Doc<"files">>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        aria-label="select all"
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "_id",
    header: "File ref",
    enableHiding: true,
    cell: ({ row }) => <span>{row.original._id}</span>,
  },

  { accessorKey: "name", header: "Name", enableHiding: false },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <span>{row.original.type}</span>,
  },

  {
    accessorKey: "_creationTime",
    header: "Uploaded",
    cell: ({ row }) => (
      <span>{format(row.original._creationTime, "MMM d, yyyy")}</span>
    ),
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => {
      const size = formatFileSize(row.original.size);
      return <span>{size}</span>;
    },
  },

  {
    accessorKey: "indexed",
    header: "Indexed",
    cell: ({ row }) => <IndexedCell rowFile={row.original} />,
  },

  {
    id: "actions",
    cell: ({ row }) => {
      return <ActionCell rowFile={row.original} />;
    },
  },
];
