"use client";
import H3 from "@/components/typography/H3";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DataTable from "@/components/dataTable";
import { columns } from "./columns";
import { useGetProducts } from "@/api/productsApi";
import { PaginationState } from "@tanstack/react-table";

export default function Inventory() {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: products, isLoading } = useGetProducts(pageIndex + 1, pageSize);

  if (isLoading) return <div>Loading...</div>;
  if (!products?.success) return <div>Error loading products</div>;

  const pagination = {
    pageIndex,
    pageSize,
  };

  const onPaginationChange = (
    updater: React.SetStateAction<PaginationState>
  ) => {
    setPagination(updater);
  };

  const pageCount = Math.ceil(products.data.total / pageSize);

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <H3 className="py-4">Store Inventory:</H3>
        <DataTable
          columns={columns}
          data={products.data.data}
          total={products.data.total}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          pageCount={pageCount}
        />
      </div>
      <Button asChild>
        <Link href="/products/new" className="self-end">
          Create Product
        </Link>
      </Button>
    </div>
  );
}
