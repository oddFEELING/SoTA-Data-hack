import { redirect, useNavigate } from "react-router";
import { Outlet } from "react-router";
import { useUser } from "@clerk/react-router";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import AppSidebar from "~/components/navigation/app-sidebar";

const DashboardLayout = () => {
  const { isLoaded, user } = useUser();
  const navigate = useNavigate();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (isLoaded && !user) {
    return navigate("/", { replace: true });
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <main className="w-full h-full">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
