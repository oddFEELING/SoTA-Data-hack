import {
  Add,
  Bag2,
  Copy,
  DocumentText,
  Folder2,
  Home,
  MenuBoard,
  MessageAdd,
  MessageText1,
} from "iconsax-reactjs";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarFooter,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuAction,
  SidebarGroupAction,
} from "../ui/sidebar";
import {
  Cog,
  Edit2,
  MoreHorizontal,
  PenLine,
  Share2,
  Sofa,
  Trash2,
  PencilLine,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/react-router";
import { useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { cn } from "~/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";

const AppSidebar = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const createThread = useMutation(api.thread.createThread);
  const deleteThread = useMutation(api.thread.deleteThread);
  const threads = useQuery(api.thread.listThreads, { userId: user?.id || "" });

  return (
    <Sidebar variant="inset" collapsible="icon">
      {/* ~ =================================== ~ */}
      {/* -- Header -- */}
      {/* ~ =================================== ~ */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <PencilLine /> GentleEditor
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ~ =================================== ~ */}
      {/* -- Content -- */}
      {/* ~ =================================== ~ */}
      <SidebarContent className="mt-4">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Overview"
                isActive={pathname.includes("/dashboard/overview")}
                onClick={() => navigate("/dashboard/overview")}
              >
                <Home />
                <span>Overview</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={pathname.includes("/dashboard/files")}
                onClick={() => navigate("/dashboard/files")}
              >
                <DocumentText />
                <span>Files</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={pathname.includes("/dashboard/stories")}
                onClick={() => navigate("/dashboard/stories")}
              >
                <MenuBoard />
                <span>Stories</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={pathname.includes("/dashboard/chats")}
                onClick={() => navigate("/dashboard/chats")}
              >
                <Bag2 />
                <span>Explore</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator className="mt-2" />
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            <MessageText1 className="mr-2" />
            <span>Chats</span>
          </SidebarGroupLabel>
          <SidebarGroupAction
            title="New chat"
            onClick={() => {
              createThread({
                userId: user!.id,
                title: "New chat",
              });
            }}
          >
            <Add />
          </SidebarGroupAction>

          <SidebarMenu>
            {threads?.page.map((thread) => {
              return (
                <SidebarMenuItem key={thread._id} className="group/thread">
                  <SidebarMenuButton
                    isActive={pathname.includes(
                      `/dashboard/chat/${thread._id}`
                    )}
                    onClick={() => navigate(`/dashboard/chat/${thread._id}`)}
                  >
                    <span>{thread.title}</span>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      className="group-hover/thread:opacity-100 opacity-0 transition-opacity"
                    >
                      <SidebarMenuAction>
                        <MoreHorizontal />
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                      <DropdownMenuItem>
                        <Edit2 />
                        <span>Rename</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy />
                        <span>Copy id</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 />
                        <span>Share</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => deleteThread({ threadId: thread._id })}
                      >
                        <Trash2 />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* ~ =================================== ~ */}
      {/* -- Footer -- */}
      {/* ~ =================================== ~ */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <UserButton
                appearance={{
                  elements: {
                    rootBox: {
                      width: "100%",
                      justifyContent: "flex-start",
                    },
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Settings"
                    labelIcon={<Cog size={16} />}
                    onClick={() => {}}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
