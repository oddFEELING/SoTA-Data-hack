import React, { useState } from "react";
import { SidebarTrigger } from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useTheme } from "../providers/theme.provider";
import { Moon, Sun } from "lucide-react";
import { Monitor } from "iconsax-reactjs";

type DashbaordNavbarProps = {
  startActions?: React.ReactNode;
  endActions?: React.ReactNode;
};

const DashboardNavbar: React.FC<DashbaordNavbarProps> = ({
  startActions,
  endActions,
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-full flex border-b shadow-sm px-4 lg:px-6 items-center h-[var(--header-height)] justify-between">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        {startActions}
      </div>

      <div className="flex items-center gap-2">
        {endActions}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              {theme === "system" && <Monitor />}
              {theme === "dark" && <Moon />}
              {theme === "light" && <Sun />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default DashboardNavbar;
