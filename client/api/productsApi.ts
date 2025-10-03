import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./interceptor";
import {
  ApiResponse,
  ProductResponseDto,
  CreateProductDto,
  UpdateProductDto,
  PagedProductResponseDto,
} from "./type";

const getProducts = async (): Promise<ApiResponse<PagedProductResponseDto>> => {
  let res = await api.get("/products");
  return res.data;
};

const createProduct = async (
  data: CreateProductDto
): Promise<ApiResponse<ProductResponseDto>> => {
  let res = await api.post("/products", { ...data });
  return res.data;
};

const updateProduct = async (
  id: number,
  data: UpdateProductDto
): Promise<ApiResponse<ProductResponseDto>> => {
  let res = await api.put(`/products/${id}`, { ...data });
  return res.data;
};

const deleteProduct = async (id: number): Promise<ApiResponse<null>> => {
  let res = await api.delete(`/products/${id}`);
  return res.data;
};

export const useGetProducts = () => {
  return useQuery({
    queryFn: getProducts,
    queryKey: ["products"],
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};

export const useUpdateProduct = (id: number, product: UpdateProductDto) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => updateProduct(id, product),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};
