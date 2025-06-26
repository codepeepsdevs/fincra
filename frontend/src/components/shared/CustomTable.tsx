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
  columns: ColumnDef<T, any>[];
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
      <table className="min-w-full bg-white">
        <thead className="bg-[#1C065A]  text-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left font-semibold"
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
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2">
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
