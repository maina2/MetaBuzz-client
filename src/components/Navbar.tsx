import React from "react";
import { BellIcon, MessageIcon, SearchIcon, MenuIcon } from "./Icons";

interface NavbarProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarCollapsed, toggleSidebar, isMobile }) => {
  return (
    <nav className="bg-white border-b border-gray-200 py-3 px-6 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {isMobile && (
            <button 
              onClick={toggleSidebar} 
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 mr-2"
            >
              <MenuIcon size={20} />
            </button>
          )}
          
          {sidebarCollapsed && (
            <div className="text-xl font-bold mr-8 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              MetaBuzz
            </div>
          )}
          
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <SearchIcon size={18} />
            </span>
            <input
              type="search"
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg pl-10 p-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none w-64 max-w-full"
              placeholder="Search..."
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-gray-100 relative text-gray-500">
            <MessageIcon size={20} />
            <span className="absolute top-0 right-0 h-3 w-3 bg-teal-500 rounded-full border-2 border-white"></span>
          </button>
          
          <button className="p-2 rounded-full hover:bg-gray-100 relative text-gray-500">
            <BellIcon size={20} />
            <span className="absolute top-0 right-0 h-3 w-3 bg-teal-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="ml-3 border-l pl-3 border-gray-200">
            <button className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 flex items-center justify-center text-white font-medium">
                MB
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium text-gray-800">Morgan Black</div>
                <div className="text-xs text-gray-500">Premium User</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;