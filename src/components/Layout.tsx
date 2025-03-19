import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarCollapsed(false); // Always show sidebar on larger screens
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} isMobile={isMobile} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isMobile ? "ml-0" : sidebarCollapsed ? "ml-20" : "ml-64"}`}>
        <Navbar sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} isMobile={isMobile} />

        <main className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <Outlet /> 
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-4 text-center text-gray-500 text-sm mt-8">
          <p>© {new Date().getFullYear()} MetaBuzz. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
