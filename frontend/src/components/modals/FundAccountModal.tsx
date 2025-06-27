"use client";

import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import useUserStore from "@/store/user.store";
import Button from "@/components/shared/Button";
import Image from "next/image";
import { EUR, GBP, NGN, USD } from "../../../public/images";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { useFundAccount } from "@/api/user/user.queries";
import { useQueryClient } from "@tanstack/react-query";

interface FundAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FundAccountModal: React.FC<FundAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { accounts } = useUserStore();
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const queryClient = useQueryClient();
  const onError = (error: AxiosError<{ message: string }>) => {
    toast.dismiss();
    const errorMessage = error?.response?.data?.message;
    toast.error(errorMessage || "An error occurred");
  };

  const onSuccess = () => {
    toast.dismiss();
    setSelectedAccount("");
    setAmount("");
    toast.success("Account funded successfully");
    queryClient.invalidateQueries({ queryKey: ["user-accounts"] });
    onClose();
  };

  const { mutate: fundAccount, isPending: fundAccountPending } = useFundAccount(
    onError,
    onSuccess
  );

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case "USD":
        return {
          icon: <Image src={USD} alt="usd" width={20} height={20} />,
          symbol: "$",
        };
      case "NGN":
        return {
          icon: <Image src={NGN} alt="ngn" width={20} height={20} />,
          symbol: "₦",
        };
      case "EUR":
        return {
          icon: <Image src={EUR} alt="eur" width={20} height={20} />,
          symbol: "€",
        };
      case "GBP":
        return {
          icon: <Image src={GBP} alt="gbp" width={20} height={20} />,
          symbol: "£",
        };
      default:
        return {
          icon: null,
          symbol: "",
        };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAccount || !amount) {
      return;
    }

    fundAccount({
      currency: selectedAccount,
      amount: parseFloat(amount),
    });
  };

  const handleClose = () => {
    if (!fundAccountPending) {
      setSelectedAccount("");
      setAmount("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base md:text-xl font-semibold text-gray-800">
            Fund Account
          </h2>
          <button
            onClick={handleClose}
            disabled={fundAccountPending}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
          >
            <IoClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="md:space-y-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-gray-700">
              Select Account <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              disabled={fundAccountPending}
              className="w-full text-sm md:text-base p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#7535FD] focus:ring-1 focus:ring-[#7535FD] disabled:opacity-50 disabled:cursor-not-allowed"
              required
            >
              <option value="">Choose an account</option>
              {accounts.map((account) => {
                const currencyInfo = getCurrencyIcon(account.currency);
                return (
                  <option key={account.id} value={account.currency}>
                    {account.currency} - {currencyInfo.symbol}
                    {account.balance.toLocaleString()}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm md:text-base font-medium text-gray-700">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              {selectedAccount && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  {getCurrencyIcon(selectedAccount)?.icon}
                </div>
              )}
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={fundAccountPending}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                className={`w-full text-sm md:text-base p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#7535FD] focus:ring-1 focus:ring-[#7535FD] disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedAccount ? "pl-12" : ""
                }`}
                required
              />
            </div>
          </div>

          {selectedAccount && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Balance:</span>
                <span className="font-semibold text-gray-800">
                  {(() => {
                    if (selectedAccount) {
                      const currencyInfo = getCurrencyIcon(selectedAccount);
                      return `${currencyInfo.symbol}${accounts
                        .find((acc) => acc.currency === selectedAccount)
                        ?.balance.toLocaleString()}`;
                    }
                    return "";
                  })()}
                </span>
              </div>
            </div>
          )}

          <div className="w-full">
            <Button
              type="submit"
              isLoading={fundAccountPending}
              disabled={!selectedAccount || !amount}
              className="w-full text-sm md:text-base bg-[#7535FD] text-white hover:bg-[#6a2ff0]"
            >
              Fund Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FundAccountModal;
