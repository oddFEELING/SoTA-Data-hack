import React from "react";
import { Outlet } from "react-router";
import RootProvider from "~/components/providers";

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <RootProvider>
      <Outlet />
    </RootProvider>
  );
};
