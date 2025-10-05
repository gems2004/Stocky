import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./interceptor";
import {
  ApiResponse,
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "./type";

const getCategories = async (): Promise<ApiResponse<CategoryResponseDto[]>> => {
  let res = await api.get("/category");
  return res.data;
};

const getCategoryById = async (id: number): Promise<ApiResponse<CategoryResponseDto>> => {
  let res = await api.get(`/category/${id}`);
  return res.data;
};

const createCategory = async (
  data: CreateCategoryDto
): Promise<ApiResponse<CategoryResponseDto>> => {
  let res = await api.post("/category", { ...data });
  return res.data;
};

const updateCategory = async (
  id: number,
  data: UpdateCategoryDto
): Promise<ApiResponse<CategoryResponseDto>> => {
  let res = await api.put(`/category/${id}`, { ...data });
  return res.data;
};

const deleteCategory = async (id: number): Promise<ApiResponse<null>> => {
  let res = await api.delete(`/category/${id}`);
  return res.data;
};

export const useGetCategories = () => {
  return useQuery({
    queryFn: getCategories,
    queryKey: ["categories"],
  });
};

export const useGetCategoryById = (id: number) => {
  return useQuery({
    queryFn: () => getCategoryById(id),
    queryKey: ["category", id],
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const query = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => query.invalidateQueries({ queryKey: ["categories"] }),
  });
};

export const useUpdateCategory = (id: number) => {
  const query = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCategoryDto) => updateCategory(id, data),
    onSuccess: () => query.invalidateQueries({ queryKey: ["categories"] }),
  });
};

export const useDeleteCategory = () => {
  const query = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => query.invalidateQueries({ queryKey: ["categories"] }),
  });
};
