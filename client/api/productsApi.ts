import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./interceptor";
import {
  ApiResponse,
  ProductResponseDto,
  CreateProductDto,
  UpdateProductDto,
  PagedProductResponseDto,
} from "./type";

const getProducts = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Promise<ApiResponse<PagedProductResponseDto>> => {
  const res = await api.get(`/products?page=${page}&limit=${limit}`);
  return res.data;
};

const getProductById = async (
  id: number
): Promise<ApiResponse<ProductResponseDto>> => {
  let res = await api.get(`/products/${id}`);
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

const searchProduct = async (
  query: string
): Promise<ApiResponse<PagedProductResponseDto>> => {
  let res = await api.get(`/products/search?query=${query}&page=1&limit=20`);
  return res.data;
};

export const useGetProductById = (id: number) => {
  return useQuery({
    queryFn: () => getProductById(id),
    queryKey: ["product", id],
    enabled: !!id,
  });
};

export const useGetProducts = (page: number, limit: number = 10) => {
  return useQuery({
    queryFn: () => getProducts({ page, limit }),
    queryKey: ["products", page, limit],
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};

export const useUpdateProduct = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: UpdateProductDto) => updateProduct(id, product),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
};

export const useUpdateProductWithId = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updateProductDto }: { id: number; updateProductDto: UpdateProductDto }) => 
      updateProduct(id, updateProductDto),
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

export const useSearchProduct = (query: string) => {
  return useQuery({
    queryFn: () => searchProduct(query),
    queryKey: ["products", "search", query],
    enabled: query.length > 0, // Only run the query when there's an actual search term
  });
};
