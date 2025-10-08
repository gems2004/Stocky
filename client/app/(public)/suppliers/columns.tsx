import { SupplierResponseDto } from "@/api/type";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<SupplierResponseDto>[] = [
  {
    accessorKey: "name",
    header: () => <span className="font-bold">Name</span>,
    cell: ({ row }) => {
      return <div className="font-bold">{row.getValue("name")}</div>;
    },
  },
  {
    accessorKey: "contact_person",
    header: () => <span className="font-bold">Contact Person</span>,
    cell: ({ row }) => {
      return (
        <div className="text-gray-600">{row.getValue("contact_person")}</div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: () => <span className="font-bold">Phone</span>,
    cell: ({ row }) => {
      return <div className="text-gray-600">{row.getValue("phone")}</div>;
    },
  },
  {
    accessorKey: "email",
    header: () => <span className="font-bold">Email</span>,
    cell: ({ row }) => {
      return <div className="text-gray-600">{row.getValue("email")}</div>;
    },
  },
  {
    accessorKey: "address",
    header: () => <span className="font-bold">Address</span>,
    cell: ({ row }) => {
      return <div className="text-gray-600">{row.getValue("address")}</div>;
    },
  },
];
