import { DatabaseConfigForm, ShopInfoForm } from "@/app/(auth)/setup/schema";
import { SetupStatusDto, ApiResponse } from "./type";
import { api } from "./api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const getSetupStatus = async (): Promise<
  ApiResponse<SetupStatusDto>
> => {
  const res = await api.get<ApiResponse<SetupStatusDto>>("/setup/status");
  return res.data;
};

export const setupShopInfo = async (
  shopInfo: ShopInfoForm
): Promise<ApiResponse<SetupStatusDto>> => {
  try {
    const res = await api.post<ApiResponse<SetupStatusDto>>("/setup/shop", {
      ...shopInfo,
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.error.message);
    }
    throw error;
  }
};

export const setupDatabaseConfig = async (
  dbInfo: DatabaseConfigForm
): Promise<ApiResponse<SetupStatusDto>> => {
  try {
    const res = await api.post<ApiResponse<SetupStatusDto>>("/setup/database", {
      ...dbInfo,
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.error.message);
    }
    throw error;
  }
};

// React Query hooks with proper error handling
export const useSetupStatus = () => {
  return useQuery({
    queryKey: ["setupStatus"],
    queryFn: getSetupStatus,
  });
};

export const useSetupShopInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setupShopInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setupStatus"] });
    },
  });
};

export const useSetupDatabaseConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setupDatabaseConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setupStatus"] });
    },
  });
};
