import { useQuery } from "@tanstack/react-query";
import api from "./interceptor";
import { ApiResponse, ProductResponseDto, DashboardStatsResponse, WeeklySalesResponse } from "./type";

const getLowStockProducts = async (): Promise<ApiResponse<ProductResponseDto[]>> => {
  const res = await api.get('/reports/low-stock');
  return res.data;
};

const getDashboardStats = async (startDate?: string, endDate?: string): Promise<ApiResponse<DashboardStatsResponse>> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const res = await api.get('/reports/dashboard-stats', { params });
  return res.data;
};

const getWeeklySales = async (startDate?: string, endDate?: string): Promise<ApiResponse<WeeklySalesResponse>> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const res = await api.get('/reports/weekly-sales', { params });
  return res.data;
};

export const useGetLowStockProducts = () => {
  return useQuery({
    queryFn: () => getLowStockProducts(),
    queryKey: ['low-stock-products'],
  });
};

export const useGetDashboardStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryFn: () => getDashboardStats(startDate, endDate),
    queryKey: ['dashboard-stats', startDate, endDate],
  });
};

export const useGetWeeklySales = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryFn: () => getWeeklySales(startDate, endDate),
    queryKey: ['weekly-sales', startDate, endDate],
  });
};