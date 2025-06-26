"use client";

import useUserStore from "@/store/user.store";
import React, { useState } from "react";
import { MdPlayArrow } from "react-icons/md";
import FundAccountModal from "@/components/modals/FundAccountModal";

const Header = () => {
  const { user } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="w-full flex items-center justify-between">
        <h1 className="font-semibold text-xl text-gray-700">
          Hello, {user?.fullname}
        </h1>

        <div
          className="flex items-center gap-2 bg-[#7535FD] text-white p-4 py-3 rounded-lg cursor-pointer hover:bg-[#6a2ff0] transition-colors"
          onClick={handleOpenModal}
        >
          <p className="font-medium">Fund Balance</p>
          <MdPlayArrow className="text-white" />
        </div>
      </div>

      <FundAccountModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default Header;
