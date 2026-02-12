import React, { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import Navbar from "./Navbar";
import SideMenu from "./SideMenu";

const DashboardLayout = ({ children, activeMenu }) => {
  const { user } = useContext(UserContext);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Top Navbar */}
      <Navbar activeMenu={activeMenu} />

      {/* Content below Navbar */}
      {user && (
        <div className="flex flex-1">
          {/* Sidebar for large screens */}
          <div className="hidden lg:block">
            <SideMenu activeMenu={activeMenu} />
          </div>

          {/* Main content area */}
          <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
