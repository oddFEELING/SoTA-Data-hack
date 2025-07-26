import React from "react";
import { cn } from "~/lib/utils";

type FrameProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
};

const Frame: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  onClick,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "w-full max-w-7xl mx-auto h-[var(--panel-body-height)] overflow-y-auto py-5 px-4 md:px-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Frame;
