import { ShopInfoForm } from "@/app/(auth)/setup/schema";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

export const GetSetupStatus = async () => {
  let res = await api.get("/setup/status");
  return res.data;
};

export const SetupShopInfo = async (shopInfo: ShopInfoForm) => {
  let { shop_address, shop_email, shop_name, ...rest } = shopInfo;
  console.log(shopInfo);

  let res = await api.post("/setup/shop", {
    address: shop_address,
    email: shop_email,
    name: shop_name,
    ...rest,
  });
  return res.data;
};
