"use client";

import { useGetUserAccounts } from "@/api/user/user.queries";
import useUserStore from "@/store/user.store";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { GiClockwiseRotation } from "react-icons/gi";
import BalanceSkeleton from "../../skeletons/BalanceSekeleton";
import Image from "next/image";
import { EUR, GBP, NGN, USD } from "../../../../public/images";

const MyBalances = () => {
  const { accounts, setAccounts } = useUserStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();
  const { data: userAccounts, isPending } = useGetUserAccounts();

  useEffect(() => {
    if (userAccounts) {
      setAccounts(userAccounts?.data?.data);
    }
  }, [userAccounts]);

  const handleRefreshBalance = () => {
    setIsRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ["user-accounts"] });

    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case "USD":
        return {
          icon: <Image src={USD} alt="usd" width={20} height={20} />,
          symbol: "$",
        };
      case "NGN":
        return {
          icon: <Image src={NGN} alt="usd" width={20} height={20} />,
          symbol: "₦",
        };
      case "EUR":
        return {
          icon: <Image src={EUR} alt="usd" width={20} height={20} />,
          symbol: "€",
        };
      case "GBP":
        return {
          icon: <Image src={GBP} alt="usd" width={20} height={20} />,
          symbol: "£",
        };
      default:
    }
  };

  const showSkeleton = isPending || isRefreshing;

  return (
    <div className="w-full flex items-center justify-center p-6 bg-white">
      <div className="w-full flex flex-col gap-4">
        <div className="flex items-center gap-4 font-semibold">
          <h2>My Balances</h2>

          <GiClockwiseRotation
            onClick={handleRefreshBalance}
            className={`cursor-pointer transition-all duration-300 ${
              isRefreshing && !isPending ? "animate-spin" : ""
            }`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4">
          {showSkeleton
            ? Array.from({ length: 4 }).map((_, index) => (
                <BalanceSkeleton key={index} />
              ))
            : accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-center gap-4 p-6 rounded-xl border border-[#F4F4F4] bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-white transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="w-full flex flex-col md:gap-2 gap-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 font-medium">
                        Available Balance
                      </p>
                      <div className="p-2 bg-white rounded-full shadow-sm">
                        {getCurrencyIcon(account.currency)?.icon}
                      </div>
                    </div>

                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                      {`${
                        getCurrencyIcon(account.currency)?.symbol
                      }${account.balance?.toLocaleString()}`}
                    </h1>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default MyBalances;
