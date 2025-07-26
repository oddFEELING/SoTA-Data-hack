import type { Doc } from "convex/_generated/dataModel";

type IndexedCellProps = {
  rowFile: Doc<"files">;
};

export const IndexedCell: React.FC<IndexedCellProps> = ({ rowFile }) => {
  return <span>{rowFile.indexed ? "Yes" : "No"}</span>;
};
