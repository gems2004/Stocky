import { useQuery } from "@tanstack/react-query";
import api from "./interceptor";
import { ApiResponse, ProductResponseDto } from "./type";

const getProducts = async (): Promise<ApiResponse<ProductResponseDto>> => {
  let res = await api.get("/products");
  return res.data;
};

export const useGetProducts = () => {
  return useQuery({
    queryFn: getProducts,
    queryKey: ["products"],
  });
};
