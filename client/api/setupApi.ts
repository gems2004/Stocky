import {
  AdminUserForm,
  DatabaseConfigForm,
  ShopInfoForm,
} from "@/app/(auth)/setup/schema";
import { SetupStatusDto, ApiResponse } from "./type";
import api from "./interceptor";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const getSetupStatus = async (): Promise<
  ApiResponse<SetupStatusDto>
> => {
  const res = await api.get<ApiResponse<SetupStatusDto>>("/setup/status");
  return res.data;
};

export const setupShopInfo = async (
  shopInfo: ShopInfoForm
): Promise<ApiResponse<SetupStatusDto>> => {
  const res = await api.post<ApiResponse<SetupStatusDto>>("/setup/shop", {
    ...shopInfo,
  });
  return res.data;
};

export const setupDatabaseConfig = async (
  dbInfo: DatabaseConfigForm
): Promise<ApiResponse<SetupStatusDto>> => {
  const res = await api.post<ApiResponse<SetupStatusDto>>("/setup/database", {
    ...dbInfo,
  });
  return res.data;
};

export const setupAdminInfo = async (
  adminInfo: AdminUserForm
): Promise<ApiResponse<SetupStatusDto>> => {
  const res = await api.post<ApiResponse<SetupStatusDto>>("/users", {
    ...adminInfo,
  });
  return res.data;
};

const completeSetup = async (): Promise<ApiResponse<SetupStatusDto>> => {
  const res = await api.post("/setup/complete");
  return res.data;
};

// React Query hooks with proper error handling
export const useGetSetupStatus = () => {
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

export const useSetupAdminInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setupAdminInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setupStatus"] });
    },
  });
};

export const useCompleteSetup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeSetup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setupStatus"] });
    },
  });
};
