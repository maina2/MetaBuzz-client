import React from "react";
import { Link, useLocation } from "react-router-dom";
import { HomeIcon, UserIcon, MessageIcon, BellIcon, LogoutIcon, MenuIcon, CloseIcon } from "./Icons";

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar, isMobile }) => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Home", icon: <HomeIcon size={20} /> },
    { path: "/profile", label: "Profile", icon: <UserIcon size={20} /> },
    { path: "/messages", label: "Messages", icon: <MessageIcon size={20} /> },
    { path: "/notifications", label: "Notifications", icon: <BellIcon size={20} /> },
  ];

  return (
    <div
      className={`h-screen fixed left-0 top-0 bg-gray-900 text-white transition-all duration-300 shadow-xl ${
        collapsed ? "w-20" : "w-64"
      } ${isMobile ? (collapsed ? "-translate-x-full" : "translate-x-0") : ""}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && <h2 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">MetaBuzz</h2>}
        <button 
          onClick={toggleSidebar} 
          className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
        >
          {collapsed ? <MenuIcon size={20} /> : <CloseIcon size={20} />}
        </button>
      </div>
      
      <div className="py-6">
        <ul className="space-y-2 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-all ${
                    isActive 
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white" 
                      : "hover:bg-gray-800 text-gray-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        
        <div className="px-3 mt-auto pt-6 border-t border-gray-700 mt-6">
          <Link
            to="/logout"
            className="flex items-center p-3 rounded-lg text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <span className="mr-3"><LogoutIcon size={20} /></span>
            {!collapsed && <span>Logout</span>}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;