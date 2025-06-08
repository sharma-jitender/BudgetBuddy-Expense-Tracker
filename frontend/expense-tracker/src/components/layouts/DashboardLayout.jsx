import React, { useContext } from "react";
import { UserContext } from "../../context/userContext";
import Navbar from "./Navbar";
import SideMenu from "./SideMenu";

const DashboardLayout = ({ children, activeMenu }) => {
  const { user } = useContext(UserContext);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
          <div className="flex-1 p-5">{children}</div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
