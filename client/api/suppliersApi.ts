import { useQuery, useMutation } from "@tanstack/react-query";
import api from "./interceptor";
import {
  ApiResponse,
  SupplierResponseDto,
  CreateSupplierDto,
  UpdateSupplierDto,
} from "./type";

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

const deleteSupplier = async (id: number): Promise<ApiResponse<null>> => {
  let res = await api.delete(`/supplier/${id}`);
  return res.data;
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

export const useUpdateSupplier = (id: number) => {
  return useMutation({
    mutationFn: (data: UpdateSupplierDto) => updateSupplier(id, data),
  });
};

export const useDeleteSupplier = () => {
  return useMutation({
    mutationFn: deleteSupplier,
  });
};
