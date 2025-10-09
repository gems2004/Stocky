import React, { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ShopForm, ShopSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShopInfoDto } from "@/api/type";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUpdateShopInfo } from "@/api/settingsApi";
import { toast } from "sonner";
import { BusinessType, Currency } from "@/app/(auth)/setup/schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  shopData: ShopInfoDto | undefined;
};

export default function EditShopForm({ shopData }: Props) {
  const { mutate: updateShopInfoMutation, isPending: isUpdatingShop } =
    useUpdateShopInfo();

  const form = useForm<ShopForm>({
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

  const { handleSubmit, reset } = form;

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
      },
      onError: (error) => {
        toast.error(`Failed to update shop information: ${error.message}`);
      },
    });
  };

  useEffect(() => {
    if (shopData) {
      reset({
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
  }, [shopData, reset]);

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
      <Form {...form}>
        <form onSubmit={handleSubmit(handleShopInfoSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="shopName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shopAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shopEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop Email Address</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="businessType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="general_retail">
                        General Retail
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end pt-6">
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
