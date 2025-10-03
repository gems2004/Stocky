import H3 from "@/components/typography/H3";

import React from "react";
import InventoryTable from "./inventoryTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Inventory() {
  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <H3 className="py-4">Store Inventory:</H3>
        <InventoryTable />
      </div>
      <Button asChild>
        <Link href="/products/new" className="self-end">
          Create Product
        </Link>
      </Button>
    </div>
  );
}
