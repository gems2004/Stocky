"use client";
import H3 from "@/components/typography/H3";
import React, { useState } from "react";
import DataTable from "@/components/dataTable";
import { columns } from "./columns";
import { useGetTransactions } from "@/api/transactionsApi";
import { PaginationState } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Orders() {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: transactions, isLoading, error } = useGetTransactions(pageIndex + 1, pageSize);

  if (isLoading) return <div>Loading...</div>;
  if (error || !transactions?.success) return <div>Error loading orders</div>;

  const pagination = {
    pageIndex,
    pageSize,
  };

  const onPaginationChange = (
    updater: React.SetStateAction<PaginationState>
  ) => {
    setPagination(updater);
  };

  const pageCount = Math.ceil(transactions.data.total / pageSize);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
        <H3>Orders:</H3>
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
              </SelectContent>
            </Select>
          </div>
          <input
            type="text"
            placeholder="Search orders..."
            className="bg-white border rounded-md px-3 py-2 text-sm w-full sm:w-64"
          />
        </div>
      </div>
      <div className="w-full p-6 bg-white rounded-xl shadow-sm">
        <div>
          <DataTable
            columns={columns}
            data={transactions.data.data}
            total={transactions.data.total}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            pageCount={pageCount}
          />
        </div>
      </div>
    </div>
  );
}
