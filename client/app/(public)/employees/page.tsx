"use client";
import H3 from "@/components/typography/H3";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DataTable from "@/components/dataTable";
import { columns } from "./columns";
import { useGetUsers } from "@/api/usersApi";
import { PaginationState } from "@tanstack/react-table";

export default function Employees() {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: users, isLoading } = useGetUsers(pageIndex + 1, pageSize);

  if (isLoading) return <div>Loading...</div>;
  if (!users?.success) return <div>Error loading employees</div>;

  const pagination = {
    pageIndex,
    pageSize,
  };

  const onPaginationChange = (
    updater: React.SetStateAction<PaginationState>
  ) => {
    setPagination(updater);
  };

  const pageCount = Math.ceil(users.data.total / pageSize);

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <H3 className="py-4">Employees:</H3>
        <DataTable
          columns={columns}
          data={users.data.data}
          total={users.data.total}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          pageCount={pageCount}
        />
      </div>
      <Button asChild>
        <Link href="/employees/new" className="self-end">
          Add Employee
        </Link>
      </Button>
    </div>
  );
}
