"use client";

import React, { useState, useEffect } from "react";
import CustomTable from "@/components/shared/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { useGetFxConversionHistory } from "@/api/user/user.queries";
import { IConversionHistory } from "@/constants/types";
import TableSkeleton from "@/components/skeletons/CustomTableSkeleton";

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
        const date = new Date(value.replace(" ", "T"));
        return date.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Conversion History
        </h2>
        <p className="text-gray-600">Track all your currency conversions</p>
      </div>

      <div className="space-y-4">
        {isPending ? (
          <TableSkeleton />
        ) : data?.length > 0 ? (
          <>
            <CustomTable columns={columns} data={data || []} />

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, totalItems)} of{" "}
                {totalItems || 0} results
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="cursor-pointer px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="cursor-pointer px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
