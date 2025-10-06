"use client";
import H1 from "@/components/typography/H1";
import H2 from "@/components/typography/H2";
import H4 from "@/components/typography/H4";
import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import LowStockItemsTable from "@/components/LowStockItemsTable";
import { Calculator, DollarSign, ShoppingCart } from "lucide-react";
import {
  CartesianAxis,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
};
const chartData = [
  { day: "Sunday", sale: 186 },
  { day: "Monday", sale: 305 },
  { day: "Tuesday", sale: 237 },
  { day: "Wednesday", sale: 73 },
  { day: "Thursday", sale: 209 },
  { day: "Friday", sale: 214 },
  { day: "Saturday", sale: 250 },
];
const statsData = [
  { icon: DollarSign, title: "Total Revenue", value: "$12,435" },
  { icon: ShoppingCart, title: "Total Orders", value: "243" },
  { icon: Calculator, title: "Avg. Order Value", value: "$51.17" },
];
export default function Home() {
  return (
    <main className="grid grid-cols-3  gap-6">
      <div className="container rounded-2xl border border-primary/20 p-6 bg-white col-span-2">
        <H4 className="mb-4">Last Week Sales</H4>
        <ChartContainer config={chartConfig} className="w-full aspect-video">
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="sale"
              strokeWidth={2}
              dot={true}
              activeDot={{ r: 6 }}
              stroke="var(--primary)"
            />
          </LineChart>
        </ChartContainer>
      </div>
      <div className="col-span-1 flex flex-col h-full gap-6">
        {statsData.map((item, index) => (
          <Card key={index} className="p-6 flex-1">
            <div className="flex items-center gap-6 h-full">
              <div className="p-5 rounded-full bg-primary/20">
                <item.icon className="text-primary w-8 h-8" />
              </div>
              <div>
                <p className="text-base text-muted-foreground">{item.title}</p>
                <p className="text-4xl font-bold">{item.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    <div className="col-span-3 mt-6">
        <LowStockItemsTable />
      </div>
    </main>
  );
}
