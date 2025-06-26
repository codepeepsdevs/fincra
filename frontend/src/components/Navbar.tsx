"use client";

import React, { useState, useRef, useEffect } from "react";
import useUserStore from "@/store/user.store";
import { FiChevronDown } from "react-icons/fi";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const { user, logout } = useUserStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userData] = useState(user);

  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full h-16 bg-white shadow z-40 flex items-center px-4 lg:px-6"
      style={{ minHeight: "64px" }}
    >
      <div className="w-full h-full flex items-center justify-end">
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-3 rounded-lg px-4 py-2 transition"
            onClick={() => setDropdownOpen((open) => !open)}
          >
            {/* Manual Avatar */}
            <div className="w-6 md:w-10 h-6 md:h-10 rounded-full bg-purple-100 flex items-center justify-center text-base md:text-2xl font-bold text-purple-600">
              {userData?.fullname ? userData.fullname[0] : "U"}
            </div>
            <div className="text-left">
              {/* desktop */}
              <div className="lg:flex hidden font-medium text-sm text-gray-900">
                {userData?.fullname || "User Name"}
              </div>

              {/* mobile */}
              <div
                onClick={handleLogout}
                className="lg:hidden flex font-medium text-sm text-gray-900 hover:text-primary"
              >
                Logout
              </div>
            </div>
            <FiChevronDown className="lg:flex hidden w-4 h-4 cursor-pointer text-gray-400" />
          </button>
          {dropdownOpen && (
            <div className="lg:flex hidden absolute right-0 mt-2 w-40 bg-white rounded shadow z-50">
              <button
                className="w-full text-left px-4 py-2 text-sm hover:text-primary cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
