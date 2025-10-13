"use client";
import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import LowStockItemsTable from "@/components/LowStockItemsTable";
import { Calculator, DollarSign, ShoppingCart } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useGetWeeklySales, useGetDashboardStats } from "@/api/reportsApi";
import { formatCurrency } from "@/lib/utils";

const chartConfig = {
  sale: {
    label: "Sales",
    color: "#2563eb",
  },
};

export default function Home() {
  // Fetch dashboard data from API
  const { data: weeklySalesData, isLoading: weeklySalesLoading, isError: weeklySalesError } = useGetWeeklySales();
  const { data: dashboardStatsData, isLoading: statsLoading, isError: statsError } = useGetDashboardStats();

  // Check if API call was successful before accessing data
  const chartData = weeklySalesData?.success ? weeklySalesData.data.data : [];
  
  // Get stats data from API or fallback to default values
  const statsData = dashboardStatsData?.success && dashboardStatsData.data?.stats ? [
    { icon: DollarSign, title: "Total Revenue", value: formatCurrency(dashboardStatsData.data.stats.total_revenue) },
    { icon: ShoppingCart, title: "Total Orders", value: dashboardStatsData.data.stats.total_orders.toString() },
    { icon: Calculator, title: "Avg. Order Value", value: formatCurrency(dashboardStatsData.data.stats.avg_order_value) },
  ] : [
    { icon: DollarSign, title: "Total Revenue", value: "$0.00" },
    { icon: ShoppingCart, title: "Total Orders", value: "0" },
    { icon: Calculator, title: "Avg. Order Value", value: "$0.00" },
  ];

  // Show loading state while data is loading
  if (weeklySalesLoading || statsLoading) {
    return (
      <main className="grid grid-cols-3 gap-6">
        <div className="container rounded-2xl border border-primary/20 p-6 bg-white col-span-2">
          <h6 className="mb-4 text-3xl font-bold">Last Week Sales</h6>
          <div className="w-full aspect-video flex items-center justify-center">
            Loading...
          </div>
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

  // Handle API errors
  if (weeklySalesError || statsError) {
    return (
      <main className="grid grid-cols-3 gap-6">
        <div className="container rounded-2xl border border-primary/20 p-6 bg-white col-span-2">
          <h6 className="mb-4 text-3xl font-bold">Last Week Sales</h6>
          <div className="w-full aspect-video flex items-center justify-center text-red-500">
            Error loading data
          </div>
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

  return (
    <main className="grid grid-cols-3 gap-6">
      <div className="container rounded-2xl border border-primary/20 p-6 bg-white col-span-2">
        <h6 className="mb-4 text-3xl font-bold">Last Week Sales</h6>
        <ChartContainer config={chartConfig} className="w-full aspect-video">
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Sales']} />
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
