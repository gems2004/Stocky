"use client";
import H3 from "@/components/typography/H3";
import React, { useState } from "react";
import DataTable from "@/components/dataTable";
import { columns } from "./columns";
import { TransactionResponseDto } from "@/api/type";
import { PaginationState } from "@tanstack/react-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Fake data for orders
const fakeOrders: TransactionResponseDto[] = [
  {
    id: 1,
    customerId: 1,
    customer: {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      address: "123 Main St, New York, NY",
      totalSpent: 150.75,
      createdAt: new Date("2023-01-15"),
      updatedAt: new Date("2023-01-15"),
    },
    userId: 1,
    totalAmount: 249.99,
    taxAmount: 19.99,
    discountAmount: 10.0,
    paymentMethod: "Credit Card",
    status: "completed",
    createdAt: new Date("2023-05-15T10:30:00"),
    transactionItems: [],
  },
  {
    id: 2,
    customerId: 2,
    customer: {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      phone: "+1987654321",
      address: "456 Oak Ave, Los Angeles, CA",
      totalSpent: 89.5,
      createdAt: new Date("2023-02-20"),
      updatedAt: new Date("2023-02-20"),
    },
    userId: 1,
    totalAmount: 125.5,
    taxAmount: 10.04,
    discountAmount: 5.0,
    paymentMethod: "Cash",
    status: "pending",
    createdAt: new Date("2023-05-16T14:45:00"),
    transactionItems: [],
  },
  {
    id: 3,
    customerId: 3,
    customer: {
      id: 3,
      firstName: "Robert",
      lastName: "Johnson",
      email: "robert.j@example.com",
      phone: "+1555123456",
      address: "789 Pine St, Chicago, IL",
      totalSpent: 320.25,
      createdAt: new Date("2023-03-10"),
      updatedAt: new Date("2023-03-10"),
    },
    userId: 1,
    totalAmount: 89.99,
    taxAmount: 7.2,
    discountAmount: 0,
    paymentMethod: "Debit Card",
    status: "completed",
    createdAt: new Date("2023-05-17T09:15:00"),
    transactionItems: [],
  },
  {
    id: 4,
    customerId: null,
    customer: undefined,
    userId: 1,
    totalAmount: 45.75,
    taxAmount: 3.66,
    discountAmount: 2.0,
    paymentMethod: "Cash",
    status: "completed",
    createdAt: new Date("2023-05-18T16:20:00"),
    transactionItems: [],
  },
  {
    id: 5,
    customerId: 4,
    customer: {
      id: 4,
      firstName: "Emily",
      lastName: "Williams",
      email: "emily.w@example.com",
      phone: "+14445556666",
      address: "321 Elm Blvd, Miami, FL",
      totalSpent: 210.0,
      createdAt: new Date("2023-04-05"),
      updatedAt: new Date("2023-04-05"),
    },
    userId: 1,
    totalAmount: 199.99,
    taxAmount: 16.0,
    discountAmount: 15.0,
    paymentMethod: "Credit Card",
    status: "pending",
    createdAt: new Date("2023-05-19T11:30:00"),
    transactionItems: [],
  },
];

export default function Orders() {
  const [data] = useState({
    success: true,
    data: {
      data: fakeOrders,
      total: fakeOrders.length,
    },
  });

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

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

  if (!data.success) return <div>Error loading orders</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
        <H3>Orders:</H3>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <Select>
              <SelectTrigger className="w-fit bg-white px-3 py-2 text-black">
                <svg className="w-4 h-4 mr-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
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
                <svg className="w-4 h-4 mr-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
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
      <div className="w-full p-6 bg-white rounded-xl">
        <div>
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
    </div>
  );
}
