import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./interceptor";
import {
  ApiResponse,
  TransactionResponseDto,
  CreateTransactionDto,
  UpdateTransactionDto,
} from "./type";

const getTransactions = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Promise<ApiResponse<{ data: TransactionResponseDto[]; total: number; page: number; limit: number }>> => {
  const res = await api.get(`/transactions?page=${page}&limit=${limit}`);
  return res.data;
};

const getTransactionById = async (
  id: number
): Promise<ApiResponse<TransactionResponseDto>> => {
  let res = await api.get(`/transactions/${id}`);
  return res.data;
};

const createTransaction = async (
  data: CreateTransactionDto
): Promise<ApiResponse<TransactionResponseDto>> => {
  let res = await api.post("/transactions", { ...data });
  return res.data;
};

const updateTransaction = async (
  id: number,
  data: UpdateTransactionDto
): Promise<ApiResponse<TransactionResponseDto>> => {
  let res = await api.put(`/transactions/${id}`, { ...data });
  return res.data;
};

const deleteTransaction = async (id: number): Promise<ApiResponse<null>> => {
  let res = await api.delete(`/transactions/${id}`);
  return res.data;
};

export const useGetTransactionById = (id: number) => {
  return useQuery({
    queryFn: () => getTransactionById(id),
    queryKey: ["transaction", id],
    enabled: !!id,
  });
};

export const useGetTransactions = (page: number, limit: number = 10) => {
  return useQuery({
    queryFn: () => getTransactions({ page, limit }),
    queryKey: ["transactions", page, limit],
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
};

export const useUpdateTransaction = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transaction: UpdateTransactionDto) => updateTransaction(id, transaction),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
};