"use client";
import H3 from "@/components/typography/H3";
import { Plus } from "lucide-react";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DataTable from "@/components/dataTable";
import { columns } from "./columns";
import { PaginationState } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for inventory logs
const mockInventoryLogs = [
  {
    id: 1,
    product: { name: "Laptop" },
    quantityChange: 10,
    reason: "Restock",
    dateTime: new Date("2023-05-15T10:30:00"),
  },
  {
    id: 2,
    product: { name: "Mouse" },
    quantityChange: -5,
    reason: "Sale",
    dateTime: new Date("2023-05-16T14:45:00"),
  },
  {
    id: 3,
    product: { name: "Keyboard" },
    quantityChange: 20,
    reason: "Restock",
    dateTime: new Date("2023-05-17T09:15:00"),
  },
  {
    id: 4,
    product: { name: "Monitor" },
    quantityChange: -2,
    reason: "Damaged",
    dateTime: new Date("2023-05-18T16:20:00"),
  },
  {
    id: 5,
    product: { name: "Headphones" },
    quantityChange: 15,
    reason: "Restock",
    dateTime: new Date("2023-05-19T11:30:00"),
  },
];

export default function InventoryLogs() {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // For now using mock data, in a real implementation this would come from an API
  const data = {
    success: true,
    data: {
      data: mockInventoryLogs,
      total: mockInventoryLogs.length,
    },
  };

  if (!data.success) return <div>Error loading inventory logs</div>;

  const pagination = {
    pageIndex,
    pageSize,
  };

  const onPaginationChange = (
    updater: React.SetStateAction<PaginationState>
  ) => {
    setPagination(updater);
  };

  const pageCount = Math.ceil(data.data.total / pageSize);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
        <H3 className="py-4">Inventory Logs:</H3>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <Select>
              <SelectTrigger className="w-fit bg-white px-3 py-2 text-black">
                <svg
                  className="w-4 h-4 mr-2 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span>Filter</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reasons</SelectItem>
                <SelectItem value="restock">Restock</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="damage">Damage</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-fit bg-white px-3 py-2 text-black">
                <svg
                  className="w-4 h-4 mr-2 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
                <span>Sort</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="name-asc">Product A-Z</SelectItem>
                <SelectItem value="name-desc">Product Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <input
            type="text"
            placeholder="Search inventory logs..."
            className="bg-white border rounded-md px-3 py-2 text-sm w-full sm:w-64"
          />
          <Button asChild>
            <Link href="/inventory-logs/adjust" className="self-end">
              <svg
                className="w-4 h-4 mr-1 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
              Adjust Inventory
            </Link>
          </Button>
        </div>
      </div>
      <div className="w-full p-6 bg-white rounded-xl shadow-sm">
        <DataTable
          columns={columns}
          data={data.data.data}
          total={data.data.total}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          pageCount={pageCount}
        />
      </div>
    </div>
  );
}