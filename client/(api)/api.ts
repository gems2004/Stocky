import { ShopInfoForm } from "@/app/(auth)/setup/schema";
import axios from "axios";
import { SetupStatusDto, SuccessResponse } from "./type";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

export const GetSetupStatus = async () => {
  let res = await api.get("/setup/status");
  return res.data;
};

export const SetupShopInfo = async (
  shopInfo: ShopInfoForm
): Promise<SuccessResponse<SetupStatusDto>> => {
  let res = await api.post("/setup/shop", { ...shopInfo });
  return res.data;
};
