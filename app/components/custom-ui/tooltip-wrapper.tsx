import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type TooltipWrapperProps = {
  children: React.ReactNode;
  tooltip: string;
  delayDuration?: number;
};

export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  tooltip,
  delayDuration = 300,
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={delayDuration}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
