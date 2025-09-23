"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pen } from "lucide-react";
import { useGetProducts } from "@/api/productsApi";
export default function InventoryTable() {
  const { data: products } = useGetProducts();
  console.log(products);

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>In Stock</TableHead>
          <TableHead>Order At</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Test</TableCell>
          <TableCell>T41</TableCell>
          <TableCell>Burger King</TableCell>
          <TableCell>13</TableCell>
          <TableCell>10</TableCell>
          <TableCell>$15</TableCell>
          <TableCell>
            <Pen />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
