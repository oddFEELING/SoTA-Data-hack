import {
  CreateOrganization,
  SignInButton,
  UserButton,
} from "@clerk/react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { Link, useNavigate } from "react-router";
import { Button } from "../ui/button";

const LandingNavbar = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-background border-b rounded-b-md px-4 lg:px-8 h-16 flex items-center justify-between">
      <Link to="/">
        <span>GentleEditor</span>
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
