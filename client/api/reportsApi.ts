import { useQuery } from "@tanstack/react-query";
import api from "./interceptor";
import { ApiResponse, ProductResponseDto } from "./type";

const getLowStockProducts = async (): Promise<ApiResponse<ProductResponseDto[]>> => {
  const res = await api.get('/reports/low-stock');
  return res.data;
};

export const useGetLowStockProducts = () => {
  return useQuery({
    queryFn: () => getLowStockProducts(),
    queryKey: ['low-stock-products'],
  });
};