"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import classNames from "classnames";

interface CustomTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  className?: string;
}

function CustomTable<T>({
  columns,
  data,
  className = "",
}: CustomTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div
      className={`overflow-x-auto rounded border border-gray-100 shadow ${className}`}
    >
      <table className="min-w-full bg-white relative">
        <thead className="bg-[#1C065A] text-sm text-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => (
                <th
                  key={header.id}
                  className={classNames("px-4 py-3 text-left font-semibold", {
                    "sticky left-0 z-10 bg-[#1C065A]": index === 0,
                  })}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={classNames({
                "text-sm": true,
                "bg-white": row.index % 2 === 0,
                "bg-gray-100": row.index % 2 !== 0,
              })}
            >
              {row.getVisibleCells().map((cell, index) => (
                <td
                  key={cell.id}
                  className={classNames("px-4 py-2", {
                    "sticky left-0 z-10": index === 0,
                    "bg-white": row.index % 2 === 0 && index === 0,
                    "bg-gray-100": row.index % 2 !== 0 && index === 0,
                  })}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomTable;
