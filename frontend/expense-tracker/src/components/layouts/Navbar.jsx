import React, { useState } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { LuMoon, LuSun } from "react-icons/lu";
import { useTheme } from "../../context/ThemeContext";
import SideMenu from "./SideMenu";

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="relative">
      {/* Top Navbar */}
      <div className="flex items-center justify-between gap-5 bg-white dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-800 px-4 md:px-7 sticky top-0 z-30 h-[64px] backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
        <div className="flex items-center gap-5">
          <button
            className="block lg:hidden text-gray-900 dark:text-gray-50 hover:text-primary dark:hover:text-primary transition-colors"
            onClick={() => setOpenSideMenu(!openSideMenu)}
          >
            {openSideMenu ? (
              <HiOutlineX className="text-2xl" />
            ) : (
              <HiOutlineMenu className="text-2xl" />
            )}
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Expense Tracker</h2>
        </div>
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all"
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            <LuSun className="text-xl" />
          ) : (
            <LuMoon className="text-xl" />
          )}
        </button>
      </div>

      {/* Sidebar for Mobile */}
      {openSideMenu && (
        <div className="fixed top-[64px] left-0 z-40 bg-white dark:bg-gray-900 shadow-lg dark:shadow-gray-900/50 w-64 h-[calc(100vh-64px)] lg:hidden border-r border-gray-200 dark:border-gray-800">
          <SideMenu activeMenu={activeMenu} />
        </div>
      )}
    </div>
  );
};

export default Navbar;
