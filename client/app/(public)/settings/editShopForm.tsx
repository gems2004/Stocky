import React, { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ShopForm, ShopSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiResponse, CombinedSettingsDto, ShopInfoDto } from "@/api/type";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateShopInfo } from "@/api/settingsApi";
import { toast } from "sonner";
import { BusinessType, Currency } from "@/app/(auth)/setup/schema";
import { Form } from "@/components/ui/form";

type Props = {
  shopData: ShopInfoDto | undefined;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<ApiResponse<CombinedSettingsDto>, Error>>;
};

export default function EditShopForm({ shopData, refetch }: Props) {
  const { mutate: updateShopInfoMutation, isPending: isUpdatingShop } =
    useUpdateShopInfo();

  const {
    register: registerShopInfo,
    handleSubmit: handleSubmitShopInfo,
    formState: { errors: shopInfoErrors },
    reset: resetShopForm,
    setValue: setShopInfoValue,
    watch: watchShopInfo,
  } = useForm<ShopForm>({
    resolver: zodResolver(ShopSchema),
    defaultValues: {
      shopName: "",
      shopAddress: "",
      phone: "",
      shopEmail: "",
      taxRate: 0,
      currency: Currency.EMPTY,
      businessType: BusinessType.EMPTY,
      website: "",
    },
  });

  const handleShopInfoSubmit: SubmitHandler<ShopForm> = (data) => {
    const shopData = {
      name: data.shopName,
      address: data.shopAddress,
      phone: data.phone || "",
      email: data.shopEmail || "",
      taxRate: data.taxRate || 0,
      currency: data.currency,
      businessType: data.businessType,
      website: data.website || "", // Not available in the form but in DTO
    };

    updateShopInfoMutation(shopData, {
      onSuccess: () => {
        toast.success("Shop information updated successfully");
        refetch(); // Refresh settings data after update
      },
      onError: (error) => {
        toast.error(`Failed to update shop information: ${error.message}`);
      },
    });
  };

  useEffect(() => {
    if (shopData) {
      resetShopForm({
        shopName: shopData.name || "",
        shopAddress: shopData.address || "",
        phone: shopData.phone || "",
        shopEmail: shopData.email || "",
        taxRate: shopData.taxRate || 0,
        currency: shopData.currency || Currency.EMPTY,
        businessType: shopData.businessType || BusinessType.EMPTY,
        website: shopData.website || "",
      });
    }
  }, [shopData, resetShopForm]);

  return (
    <Card className="shadow-none">
      <CardHeader className="p-4 pb-2 border-b border-gray-200">
        <CardTitle className="text-2xl font-bold text-primary">
          Shop Information
        </CardTitle>
        <CardDescription>
          Manage your shop details and business information
        </CardDescription>
      </CardHeader>
      <Form>
        <form onSubmit={handleSubmitShopInfo(handleShopInfoSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input id="shopName" {...registerShopInfo("shopName")} />
              {shopInfoErrors.shopName && (
                <p className="text-destructive text-sm mt-1">
                  {shopInfoErrors.shopName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shopAddress">Shop Address</Label>
              <Input id="shopAddress" {...registerShopInfo("shopAddress")} />
              {shopInfoErrors.shopAddress && (
                <p className="text-destructive text-sm mt-1">
                  {shopInfoErrors.shopAddress.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" {...registerShopInfo("phone")} />
              {shopInfoErrors.phone && (
                <p className="text-destructive text-sm mt-1">
                  {shopInfoErrors.phone.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shopEmail">Shop Email Address</Label>
              <Input
                id="shopEmail"
                type="email"
                {...registerShopInfo("shopEmail")}
              />
              {shopInfoErrors.shopEmail && (
                <p className="text-destructive text-sm mt-1">
                  {shopInfoErrors.shopEmail.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  {...registerShopInfo("taxRate", { valueAsNumber: true })}
                />
                {shopInfoErrors.taxRate && (
                  <p className="text-destructive text-sm mt-1">
                    {shopInfoErrors.taxRate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  key={`currency-select-${watchShopInfo("currency")}`}
                  value={watchShopInfo("currency") || undefined}
                  onValueChange={(value) => setShopInfoValue("currency", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Currency.USD}>
                      US Dollar (USD)
                    </SelectItem>
                    <SelectItem value={Currency.EUR}>Euro (EUR)</SelectItem>
                    <SelectItem value={Currency.GBP}>
                      British Pound (GBP)
                    </SelectItem>
                    <SelectItem value={Currency.JPY}>
                      Japanese Yen (JPY)
                    </SelectItem>
                    <SelectItem value={Currency.CAD}>
                      Canadian Dollar (CAD)
                    </SelectItem>
                    <SelectItem value={Currency.AUD}>
                      Australian Dollar (AUD)
                    </SelectItem>
                    <SelectItem value={Currency.SAR}>
                      Saudi Riyal (SAR)
                    </SelectItem>
                    <SelectItem value={Currency.SYP}>
                      Syrian Pound (SYP)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {shopInfoErrors.currency && (
                  <p className="text-destructive text-sm mt-1">
                    {shopInfoErrors.currency.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select
                key={`businessType-select-${watchShopInfo("businessType")}`}
                value={watchShopInfo("businessType") || undefined}
                onValueChange={(value) =>
                  setShopInfoValue("businessType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="general_retail">General Retail</SelectItem>
                </SelectContent>
              </Select>
              {shopInfoErrors.businessType && (
                <p className="text-destructive text-sm mt-1">
                  {shopInfoErrors.businessType.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isUpdatingShop}
            >
              {isUpdatingShop ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
