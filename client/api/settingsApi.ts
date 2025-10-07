import {
  DatabaseUpdateDto,
  ShopPartialUpdateDto,
  UpdateUserDto,
  CombinedSettingsDto,
  UserResponseDto,
  ApiResponse,
} from "./type";
import api from "./interceptor";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const getCombinedSettings = async (): Promise<
  ApiResponse<CombinedSettingsDto>
> => {
  const res = await api.get<ApiResponse<CombinedSettingsDto>>("/settings/all");
  return res.data;
};

export const updateDatabaseConfig = async (
  config: DatabaseUpdateDto
): Promise<ApiResponse<{ isDatabaseConfigured: boolean }>> => {
  const res = await api.put<ApiResponse<{ isDatabaseConfigured: boolean }>>(
    "/settings/database",
    { ...config }
  );
  return res.data;
};

export const updateShopInfo = async (
  info: ShopPartialUpdateDto
): Promise<ApiResponse<{ isShopConfigured: boolean }>> => {
  const res = await api.put<ApiResponse<{ isShopConfigured: boolean }>>(
    "/settings/shop",
    { ...info }
  );
  return res.data;
};

export const updateUserProfile = async (
  userData: UpdateUserDto
): Promise<ApiResponse<UserResponseDto>> => {
  const res = await api.post<ApiResponse<UserResponseDto>>("/settings/user", {
    ...userData,
  });
  return res.data;
};

// React Query hooks with proper error handling
export const useGetCombinedSettings = () => {
  return useQuery({
    queryKey: ["combinedSettings"],
    queryFn: getCombinedSettings,
  });
};

export const useUpdateDatabaseConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDatabaseConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["combinedSettings"] });
    },
  });
};

export const useUpdateShopInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateShopInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["combinedSettings"] });
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["combinedSettings"] });
    },
  });
};
