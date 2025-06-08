import React, { useState } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import SideMenu from "./SideMenu";

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);

  return (
    <div className="relative">
      {/* Top Navbar */}
      <div className="flex items-center gap-5 bg-white border-b border-gray-200/50 px-7 sticky top-0 z-30 h-[61px]">
        <button
          className="block lg:hidden text-black"
          onClick={() => setOpenSideMenu(!openSideMenu)}
        >
          {openSideMenu ? (
            <HiOutlineX className="text-2xl" />
          ) : (
            <HiOutlineMenu className="text-2xl" />
          )}
        </button>
        <h2 className="text-lg font-semibold text-black">Expense Tracker</h2>
      </div>

      {/* Sidebar for Mobile */}
      {openSideMenu && (
        <div className="fixed top-[61px] left-0 z-40 bg-white shadow-md w-64 h-[calc(100vh-61px)] lg:hidden">
          <SideMenu activeMenu={activeMenu} />
        </div>
      )}
    </div>
  );
};

export default Navbar;
