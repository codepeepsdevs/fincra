"use client";

import React, { useState, useEffect } from "react";
import useUserStore from "@/store/user.store";
import Button from "@/components/shared/Button";
import Image from "next/image";
import { EUR, GBP, NGN, USD } from "../../../../public/images";
import { TbExchange } from "react-icons/tb";
import toast from "react-hot-toast";
import { useConvertCurrency, useGetCoversionRate } from "@/api/fx/fx.queries";
import { AxiosError, AxiosResponse } from "axios";
import { useQueryClient } from "@tanstack/react-query";

interface ConversionFormData {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
}

const ConversionContent = () => {
  const { accounts } = useUserStore();
  const [formData, setFormData] = useState<ConversionFormData>({
    fromCurrency: "",
    toCurrency: "",
    amount: "",
  });
  const [conversionRate, setConversionRate] = useState<number | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [availableCurrencies] = useState<string[]>([
    "USD",
    "EUR",
    "GBP",
    "NGN",
  ]);

  const {
    data: rateData,
    refetch: fetchConversionRate,
    isError: isErrorRate,
    isFetching: isFetchingRate,
  } = useGetCoversionRate(
    formData.fromCurrency,
    formData.toCurrency,
    parseFloat(formData.amount)
  );
  const queryClient = useQueryClient();

  const { mutate: convertCurrency, isPending: isConverting } =
    useConvertCurrency(
      (error: AxiosError<{ message: string }>) => {
        toast.error(
          error.response?.data?.message || "Error converting currency"
        );
      },
      (data: AxiosResponse) => {
        toast.success(data?.data?.message || "Currency converted successfully");
        queryClient.invalidateQueries({
          queryKey: ["user-accounts"],
        });
        queryClient.invalidateQueries({
          queryKey: ["fx-conversion-history"],
        });

        setFormData(() => ({
          fromCurrency: "",
          toCurrency: "",
          amount: "",
        }));

        setConversionRate(null);
        setConvertedAmount(null);
      }
    );

  useEffect(() => {
    if (rateData) {
      setConversionRate(rateData?.data?.data?.rate);
      setConvertedAmount(rateData?.data?.data?.convertedAmount || null);
    }
  }, [rateData]);

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case "USD":
        return {
          icon: <Image src={USD} alt="usd" width={24} height={24} />,
          symbol: "$",
        };
      case "NGN":
        return {
          icon: <Image src={NGN} alt="ngn" width={24} height={24} />,
          symbol: "₦",
        };
      case "EUR":
        return {
          icon: <Image src={EUR} alt="eur" width={24} height={24} />,
          symbol: "€",
        };
      case "GBP":
        return {
          icon: <Image src={GBP} alt="gbp" width={24} height={24} />,
          symbol: "£",
        };
      default:
        return {
          icon: null,
          symbol: "",
        };
    }
  };

  const getAccountBalance = (currency: string) => {
    const account = accounts?.find((acc) => acc.currency === currency);
    return account?.balance || 0;
  };

  // Fetch exchange rate when currencies change
  useEffect(() => {
    if (
      formData.fromCurrency &&
      formData.toCurrency &&
      formData.fromCurrency !== formData.toCurrency
    ) {
      fetchConversionRate();
    } else {
      setConversionRate(null);
      setConvertedAmount(null);
    }
  }, [formData.fromCurrency, formData.toCurrency]);

  const handleCurrencySwap = () => {
    setFormData((prev) => ({
      ...prev,
      fromCurrency: prev.toCurrency,
      toCurrency: prev.fromCurrency,
    }));
  };

  const handleInputChange = (
    field: keyof ConversionFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConversion = () => {
    if (!conversionRate) {
      toast.error("Get conversion rate first");
      return;
    }

    convertCurrency({
      from: formData.fromCurrency,
      to: formData.toCurrency,
      amount: parseFloat(formData.amount),
      rate: conversionRate,
    });
  };

  console.log("rate data: ", rateData);
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Convert Currency
        </h2>
        <p className="text-gray-600">
          Convert your currency to another with real-time exchange rates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conversion Form */}
        <div className="space-y-6">
          <div className="space-y-4">
            {/* From Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Currency
              </label>
              <div className="relative">
                <select
                  value={formData.fromCurrency}
                  onChange={(e) =>
                    handleInputChange("fromCurrency", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select currency</option>
                  {availableCurrencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency} - {getCurrencyIcon(currency).symbol}
                    </option>
                  ))}
                </select>
                {formData.fromCurrency && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getCurrencyIcon(formData.fromCurrency).icon}
                  </div>
                )}
              </div>
              {formData.fromCurrency && (
                <p className="text-sm text-gray-500 mt-1">
                  Available: {getCurrencyIcon(formData.fromCurrency).symbol}
                  {getAccountBalance(formData.fromCurrency).toLocaleString()}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.fromCurrency && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {getCurrencyIcon(formData.fromCurrency).symbol}
                  </div>
                )}
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={handleCurrencySwap}
                disabled={!formData.fromCurrency || !formData.toCurrency}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TbExchange className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* To Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Currency
              </label>
              <div className="relative">
                <select
                  value={formData.toCurrency}
                  onChange={(e) =>
                    handleInputChange("toCurrency", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select currency</option>
                  {availableCurrencies
                    ?.filter((currency) => currency !== formData.fromCurrency)
                    .map((currency) => (
                      <option key={currency} value={currency}>
                        {currency} - {getCurrencyIcon(currency).symbol}
                      </option>
                    ))}
                </select>
                {formData.toCurrency && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getCurrencyIcon(formData.toCurrency).icon}
                  </div>
                )}
              </div>
            </div>

            {/* Convert Button */}
            <Button
              onClick={handleConversion}
              isLoading={isConverting}
              disabled={
                !formData.fromCurrency ||
                !formData.toCurrency ||
                !formData.amount ||
                !conversionRate ||
                isConverting
              }
              className="w-full text-white"
            >
              Convert Currency
            </Button>
          </div>
        </div>

        {/* Conversion Preview */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TbExchange className="text-blue-500" />
            Conversion Preview
          </h3>

          {isFetchingRate ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">
                Fetching exchange rate...
              </span>
            </div>
          ) : isErrorRate ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-red-500 mb-2">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="text-base font-medium text-gray-800 mb-3">
                Couldn't fetch exchange rate
              </div>
              <Button
                onClick={() => fetchConversionRate()}
                isLoading={isFetchingRate}
                disabled={isFetchingRate}
                className="w-auto px-4 text-white"
              >
                Try Again
              </Button>
            </div>
          ) : conversionRate ? (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCurrencyIcon(formData.fromCurrency).icon}
                    <span className="font-medium text-gray-700">
                      1 {formData.fromCurrency}
                    </span>
                    <TbExchange className="mx-1 text-blue-400" />
                    {getCurrencyIcon(formData.toCurrency).icon}
                    <span className="font-medium text-gray-700">
                      {conversionRate?.toFixed(4)} {formData.toCurrency}
                    </span>
                  </div>
                  <button
                    onClick={() => fetchConversionRate()}
                    className="ml-2 p-1 rounded hover:bg-blue-100 transition"
                    title="Refresh rate"
                  >
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582M20 20v-5h-.581M5.582 9A7.978 7.978 0 014 12c0 4.418 3.582 8 8 8a7.978 7.978 0 004.418-1.418M18.418 15A7.978 7.978 0 0020 12c0-4.418-3.582-8-8-8a7.978 7.978 0 00-4.418 1.418"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center text-xs text-gray-500 gap-1">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  Rate updated: {new Date().toLocaleTimeString()}
                </div>
              </div>

              {convertedAmount && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-100 flex flex-col gap-2 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">
                      You'll Receive
                    </span>
                    <span className="text-lg font-bold text-green-700 flex items-center gap-1">
                      {getCurrencyIcon(formData.toCurrency).icon}
                      {convertedAmount?.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formData.amount} {formData.fromCurrency} ×{" "}
                    {conversionRate?.toFixed(4)}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-700">
                  Real-time exchange rates from reliable sources
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <div className="text-center">
                <TbExchange className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Select currencies to see conversion preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversionContent;
