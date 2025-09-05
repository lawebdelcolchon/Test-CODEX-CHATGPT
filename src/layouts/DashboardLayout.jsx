// src/layouts/DashboardLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MobileSidebar from "../components/MobileSidebar";
import Breadcrumb from "../components/Breadcrumb";

export default function DashboardLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const isLaptopOrTabletLandscape =
      window.innerWidth >= 1024 || (window.innerWidth >= 768 && window.innerHeight < window.innerWidth);
    return isLaptopOrTabletLandscape;
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="relative flex h-screen flex-col items-start overflow-hidden lg:flex-row">
      {/* Progress bar (opcional) */}
      <div className="fixed inset-x-0 top-0 z-50 h-1"></div>
      
      {/* Sidebar */}
      {isSidebarOpen && (
        <div>
          <Sidebar />
        </div>
      )}
            
      {/* Main Content Area */}
      <div className="flex h-screen w-full flex-col overflow-auto">
        {/* Header */}
        <div className="grid w-full grid-cols-2 border-b p-3">
          <div className="flex items-center gap-x-1.5">
            {/* Mobile menu button */}
            <div>
              <button
                onClick={() => {
                  if (window.innerWidth >= 1024) {
                    toggleSidebar();
                  } else {
                    toggleMobileSidebar();
                  }
                }}
                className="transition-fg items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:shadow-buttons-neutral disabled:text-ui-fg-disabled text-ui-fg-subtle bg-ui-button-transparent hover:bg-ui-button-transparent-hover active:bg-ui-button-transparent-pressed focus-visible:shadow-buttons-neutral-focus focus-visible:bg-ui-bg-base disabled:!bg-transparent disabled:!shadow-none h-7 w-7 p-1 flex"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" className="text-ui-fg-muted">
                  <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" clipPath="url(#a)">
                    <path d="M12.167 1.75H2.833c-.982 0-1.777.824-1.777 1.84v7.82c0 1.016.795 1.84 1.777 1.84h9.334c.982 0 1.777-.824 1.777-1.84V3.59c0-1.016-.796-1.84-1.777-1.84M3.9 4.5v6" />
                  </g>
                  <defs>
                    <clipPath id="a">
                      <path fill="#fff" d="M0 0h15v15H0z" />
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </div>
            {/* Breadcrumb */}
            <Breadcrumb />
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center justify-end gap-x-3">
            {/* Notifications */}
            <button
              type="button"
              className="transition-fg inline-flex items-center justify-center overflow-hidden rounded-md outline-none disabled:bg-ui-bg-disabled disabled:shadow-buttons-neutral disabled:text-ui-fg-disabled bg-ui-button-transparent hover:bg-ui-button-transparent-hover active:bg-ui-button-transparent-pressed focus-visible:shadow-buttons-neutral-focus focus-visible:bg-ui-bg-base disabled:!bg-transparent disabled:!shadow-none h-7 w-7 p-1 text-ui-fg-muted hover:text-ui-fg-subtle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
                <path fill="currentColor" fillRule="evenodd" d="M7.5.347A4.973 4.973 0 0 0 2.528 5.32v4.222c0 .568-.46 1.027-1.028 1.027a.75.75 0 0 0 0 1.5h12a.75.75 0 0 0 0-1.5c-.568 0-1.028-.46-1.028-1.027V5.32A4.973 4.973 0 0 0 7.5.347m3.472 9.195c0 .366.078.713.218 1.027H3.81a2.5 2.5 0 0 0 .218-1.027V5.32a3.473 3.473 0 0 1 6.944 0zm-2.405 3.333a.444.444 0 0 1 .435.536c-.154.73-.771 1.242-1.501 1.242S6.153 14.142 6 13.41a.445.445 0 0 1 .434-.536z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex h-full w-full flex-col items-center overflow-y-auto transition-opacity delay-200 duration-200">
          <div className="flex w-full max-w-[1600px] flex-col gap-y-2 p-3">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={closeMobileSidebar} />
    </div>
  );
}
