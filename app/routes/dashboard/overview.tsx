import React from "react";
import Frame from "~/components/frame";
import DashboardNavbar from "~/components/navigation/dash-navbar";

const OverViewPage = () => {
  return (
    <div className="">
      <DashboardNavbar />
      <Frame>
        <p>Overview</p>
      </Frame>
    </div>
  );
};

export default OverViewPage;
