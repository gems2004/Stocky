import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./interceptor";
import {
  ApiResponse,
  UserResponseDto,
  CreateUserDto,
  UpdateUserDto,
  PagedUserResponseDto,
} from "./type";

const getUsers = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Promise<ApiResponse<PagedUserResponseDto>> => {
  const res = await api.get(`/users?page=${page}&limit=${limit}`);
  return res.data;
};

const getUserById = async (
  id: number
): Promise<ApiResponse<UserResponseDto>> => {
  let res = await api.get(`/users/${id}`);
  return res.data;
};

const createUser = async (
  data: CreateUserDto
): Promise<ApiResponse<UserResponseDto>> => {
  let res = await api.post("/users", { ...data });
  return res.data;
};

const updateUser = async (
  id: number,
  data: UpdateUserDto
): Promise<ApiResponse<UserResponseDto>> => {
  let res = await api.put(`/users/${id}`, { ...data });
  return res.data;
};

const deleteUser = async (id: number): Promise<ApiResponse<null>> => {
  let res = await api.delete(`/users/${id}`);
  return res.data;
};

export const useGetUserById = (id: number) => {
  return useQuery({
    queryFn: () => getUserById(id),
    queryKey: ["user", id],
    enabled: !!id,
  });
};

export const useGetUsers = (page: number, limit: number = 10) => {
  return useQuery({
    queryFn: () => getUsers({ page, limit }),
    queryKey: ["users", page, limit],
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useUpdateUser = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: UpdateUserDto) => updateUser(id, user),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};