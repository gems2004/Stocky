import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./interceptor";
import {
  ApiResponse,
  InventoryLogResponseDto,
  PagedInventoryLogResponseDto,
} from "./type";

const getInventoryLogs = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Promise<ApiResponse<PagedInventoryLogResponseDto>> => {
  const res = await api.get(`/inventory/logs?page=${page}&limit=${limit}`);
  return res.data;
};

const getInventoryLogById = async (
  id: number
): Promise<ApiResponse<InventoryLogResponseDto>> => {
  let res = await api.get(`/inventory/logs/${id}`);
  return res.data;
};

const adjustInventory = async (
  data: {
    productId: number;
    changeAmount: number;
    reason: string;
  }
): Promise<ApiResponse<InventoryLogResponseDto>> => {
  let res = await api.post("/inventory/adjust", { ...data });
  return res.data;
};

export const useGetInventoryLogById = (id: number) => {
  return useQuery({
    queryFn: () => getInventoryLogById(id),
    queryKey: ["inventory-log", id],
    enabled: !!id,
  });
};

export const useGetInventoryLogs = (page: number, limit: number = 10) => {
  return useQuery({
    queryFn: () => getInventoryLogs({ page, limit }),
    queryKey: ["inventory-logs", page, limit],
  });
};

export const useAdjustInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adjustInventory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inventory-logs"] }),
  });
};