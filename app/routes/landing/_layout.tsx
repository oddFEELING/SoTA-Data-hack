import LandingNavbar from "~/components/navigation/landing-navbar";
import { Outlet } from "react-router";

const LandingPageLayout = () => {
  return (
    <div className="w-full min-h-[100dvh]">
      <LandingNavbar />
      <Outlet />
    </div>
  );
};

export default LandingPageLayout;
