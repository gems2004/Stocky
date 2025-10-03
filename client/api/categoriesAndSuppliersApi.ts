import { useQuery, useMutation } from "@tanstack/react-query";
import api from "./interceptor";
import { 
  ApiResponse, 
  CategoryResponseDto, 
  CreateCategoryDto,
  UpdateCategoryDto,
  SupplierResponseDto,
  CreateSupplierDto,
  UpdateSupplierDto
} from "./type";

// Category API functions
const getCategories = async (): Promise<ApiResponse<CategoryResponseDto[]>> => {
  let res = await api.get("/category");
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

const deleteCategory = async (
  id: number
): Promise<ApiResponse<null>> => {
  let res = await api.delete(`/category/${id}`);
  return res.data;
};

// Supplier API functions
const getSuppliers = async (): Promise<ApiResponse<SupplierResponseDto[]>> => {
  let res = await api.get("/supplier");
  return res.data;
};

const createSupplier = async (
  data: CreateSupplierDto
): Promise<ApiResponse<SupplierResponseDto>> => {
  let res = await api.post("/supplier", { ...data });
  return res.data;
};

const updateSupplier = async (
  id: number,
  data: UpdateSupplierDto
): Promise<ApiResponse<SupplierResponseDto>> => {
  let res = await api.put(`/supplier/${id}`, { ...data });
  return res.data;
};

const deleteSupplier = async (
  id: number
): Promise<ApiResponse<null>> => {
  let res = await api.delete(`/supplier/${id}`);
  return res.data;
};

// React Query hooks
export const useGetCategories = () => {
  return useQuery({
    queryFn: getCategories,
    queryKey: ["categories"],
  });
};

export const useCreateCategory = () => {
  return useMutation({
    mutationFn: createCategory,
  });
};

export const useUpdateCategory = () => {
  return useMutation({
    mutationFn: updateCategory,
  });
};

export const useDeleteCategory = () => {
  return useMutation({
    mutationFn: deleteCategory,
  });
};

export const useGetSuppliers = () => {
  return useQuery({
    queryFn: getSuppliers,
    queryKey: ["suppliers"],
  });
};

export const useCreateSupplier = () => {
  return useMutation({
    mutationFn: createSupplier,
  });
};

export const useUpdateSupplier = () => {
  return useMutation({
    mutationFn: updateSupplier,
  });
};

export const useDeleteSupplier = () => {
  return useMutation({
    mutationFn: deleteSupplier,
  });
};