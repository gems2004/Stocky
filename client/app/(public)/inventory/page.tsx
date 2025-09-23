import H3 from "@/components/typography/H3";

import React from "react";
import InventoryTable from "./table";

export default function Inventory() {
  return (
    <>
      <H3 className="py-4">Store Inventory:</H3>
      <InventoryTable />
    </>
  );
}
