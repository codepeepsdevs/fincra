import Navbar from "@/components/Navbar";
import SideBar from "@/components/SideBar";
import UserProtectionProvider from "@/providers/UserProtectionProvider";
import React from "react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserProtectionProvider>
      <div className="flex">
        <SideBar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 bg-secondary p-4 lg:p-6 mt-16 lg:ml-[15%] 2xl:ml-[13%] transition-all duration-300">
            {children}
          </main>
        </div>
      </div>
    </UserProtectionProvider>
  );
};

export default DashboardLayout;
