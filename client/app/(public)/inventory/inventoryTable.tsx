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
import { ProductResponseDto } from "@/api/type";

export default function InventoryTable() {
  const { data: response, isLoading, isSuccess } = useGetProducts();

  if (isLoading) return <p>Loading...</p>;

  if (!isSuccess) return;

  const products: ProductResponseDto[] = response?.success
    ? response.data.data
    : [];

  return (
    <Table className="w-full grow flex-1">
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>In Stock</TableHead>
          <TableHead>Order At</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          return (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.sku}</TableCell>
              <TableCell>{product.supplier.name}</TableCell>
              <TableCell>{product.category.name}</TableCell>
              <TableCell>{product.stockQuantity}</TableCell>
              <TableCell>{product.minStockLevel}</TableCell>
              <TableCell>{product.price}</TableCell>
              <TableCell>{product.cost}</TableCell>
              <TableCell>
                <Pen />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
