"use client";

import { sideBarMenuData } from "@/constants";
import React, { useState } from "react";
import { HiX, HiMenu } from "react-icons/hi";
import Image from "next/image";
import { DarkLogo } from "../../public/images";
import { useRouter } from "next/navigation";
import classNames from "classnames";
import { usePathname } from "next/navigation";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white shadow-lg z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-[70%] md:w-[30%] lg:w-[15%] 2xl:w-[13%]`}
      >
        {/* Logo at the top */}
        <div className="p-6 py-4.5 font-bold text-lg border-b border-gray-200 flex items-center justify-between">
          <Image alt="Logo" src={DarkLogo} className="flex w-20 h-6" />
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1 hover:bg-gray-100 rounded"
          >
            <HiX size={20} />
          </button>
        </div>

        {/* Navigation menu */}
        <nav className="flex-1 px-4 mt-4 overflow-y-auto">
          <ul className="flex flex-col gap-2">
            {sideBarMenuData?.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id}>
                  <div
                    onClick={() => {
                      router.push(item.path);
                      toggleSidebar();
                    }}
                    className={classNames(
                      "flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md transition-colors duration-200",
                      {
                        "bg-[#F1EAFF] border-[2px] border-[#AC89FF] text-primary":
                          pathname === item.path,
                      }
                    )}
                  >
                    <Icon size={20} />
                    <span className="font-semibold">{item.title}</span>
                  </div>
                </div>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default SideBar;
