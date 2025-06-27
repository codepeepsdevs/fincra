"use client";

import React from "react";
import CustomTable from "@/components/shared/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Header from "@/components/dashboard/overview/Header";
import MyBalances from "@/components/dashboard/overview/MyBalances";
import ConversionChart from "@/components/dashboard/overview/ConversionChart";
import TableSkeleton from "@/components/skeletons/CustomTableSkeleton";
import { useRouter } from "next/navigation";
import { useGetFxConversionHistory } from "@/api/user/user.queries";
import { IConversionHistory } from "@/constants/types";
import { formatDateTime } from "@/utils/parser";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const columns: ColumnDef<IConversionHistory>[] = [
  {
    accessorKey: "createdAt",
    header: "Date/Time",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return formatDateTime(value);
    },
  },
  { accessorKey: "fromCurrency", header: "From" },
  { accessorKey: "toCurrency", header: "To" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return <span>{value?.toLocaleString()}</span>;
    },
  },
  { accessorKey: "rate", header: "Rate" },
  {
    header: "Converted",
    cell: ({ row }) => {
      const value = row.original.amount;
      const rate = row.original.rate;
      const convertedAmount = value * rate;
      return <span>{convertedAmount?.toLocaleString()}</span>;
    },
  },
];

const NoConversionHistory = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        No conversions yet
      </h3>
      <p className="text-gray-500 text-center text-sm mb-4">
        Your conversion history will appear here
      </p>
      <button
        onClick={() => router.push("/conversion")}
        className="bg-[#7535FD] cursor-pointer text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Convert Currency
      </button>
    </div>
  );
};

const Overview = () => {
  const { data: conversionHistory, isPending } = useGetFxConversionHistory(
    1,
    8
  );
  const hasData = conversionHistory?.data?.data?.conversionHistory?.length > 0;

  return (
    <div className="flex flex-col gap-6 h-full w-full mx-auto p-0 md:p-6">
      <Header />

      <MyBalances />

      {/* Chart and Table side by side on large screens, stacked on mobile */}
      <div className="flex flex-col 2xl:flex-row gap-6 flex-1 min-h-0">
        <ConversionChart />

        <div className="bg-white rounded-xl shadow p-6 flex-1 min-w-[300px] md:max-h-[450px] flex flex-col">
          <div className="mb-4 font-semibold">Recent Conversion History</div>
          <div className="flex-1 min-h-0 overflow-auto no-scrollbar">
            {isPending ? (
              <TableSkeleton />
            ) : hasData ? (
              <CustomTable
                columns={columns}
                data={conversionHistory?.data?.data?.conversionHistory || []}
              />
            ) : (
              <NoConversionHistory />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
