import { LoginForm } from "@/app/(auth)/login/schema";
import api from "./interceptor";
import { ApiResponse, AuthResponseDto } from "./type";
import { useMutation } from "@tanstack/react-query";

const login = async (
  data: LoginForm
): Promise<ApiResponse<AuthResponseDto>> => {
  let res = await api.post("/auth/login", { ...data });
  return res.data;
};

const logout = async (): Promise<ApiResponse<null>> => {
  let res = await api.post("/auth/logout");
  return res.data;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: logout,
  });
};
