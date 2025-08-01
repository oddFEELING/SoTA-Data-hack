import {
  CreateOrganization,
  SignInButton,
  UserButton,
} from "@clerk/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { Link, useNavigate } from "react-router";
import { Button } from "../ui/button";
import { OceanProtocol } from "iconsax-reactjs";

const LandingNavbar = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-background border-b rounded-b-md px-4 lg:px-8 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <OceanProtocol size={18} />
        <span className="text-lg font-medium">Nubia</span>
      </Link>

      <Authenticated>
        <div className="flex items-center gap-4">
          <Link to="/dashboard/overview">
            <Button variant="ghost" size="sm">
              <span>Dashboard</span>
            </Button>
          </Link>
          <UserButton />
        </div>
      </Authenticated>

      <Unauthenticated>
        <SignInButton mode="modal">
          <Button size="sm">
            <span>Sign in</span>
          </Button>
        </SignInButton>
      </Unauthenticated>
    </div>
  );
};

export default LandingNavbar;
