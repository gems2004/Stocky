import { ShopInfoForm } from "@/app/(auth)/setup/schema";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3500",
});

export const GetSetupStatus = async () => {
  let res = await api.get("/setup/status");
  return res.data;
};

export const SetupShopInfo = async (shopInfo: ShopInfoForm) => {
  let res = await api.post("/setup/shop", { ...shopInfo });
  return res.data;
};
