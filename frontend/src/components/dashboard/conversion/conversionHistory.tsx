"use client";

import React, { useState, useEffect } from "react";
import CustomTable from "@/components/shared/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { useGetFxConversionHistory } from "@/api/user/user.queries";
import { IConversionHistory } from "@/constants/types";
import TableSkeleton from "@/components/skeletons/CustomTableSkeleton";
import { formatDateTime } from "@/utils/parser";

const ConversionHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  const [totalPages, setTotalPages] = useState(0);

  const { data: conversionHistory, isPending } = useGetFxConversionHistory(
    currentPage,
    pageSize
  );

  useEffect(() => {
    if (conversionHistory) {
      setData(conversionHistory?.data?.data?.conversionHistory || []);
      setTotalPages(conversionHistory?.data?.data?.pagination?.totalPages || 0);
      setTotalItems(conversionHistory?.data?.data?.pagination?.totalItems || 0);
    }
  }, [conversionHistory]);

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
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
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
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="mb-6">
        <h2 className="font-bold mb-1">Conversion History</h2>
        <p className="text-gray-600 text-sm">
          Track all your currency conversions
        </p>
      </div>

      <div className="space-y-4">
        {isPending ? (
          <TableSkeleton />
        ) : data?.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <CustomTable columns={columns} data={data || []} />
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-2 sm:gap-0">
              <div className="text-sm text-gray-700 text-center sm:text-left">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, totalItems)} of{" "}
                {totalItems || 0} results
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="w-fit sm:w-auto cursor-pointer px-3 py-1 bg-primary text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-700 text-center">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="w-fit sm:w-auto cursor-pointer px-3 py-1  bg-primary text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <NoConversionHistory />
        )}
      </div>
    </div>
  );
};

export default ConversionHistory;
