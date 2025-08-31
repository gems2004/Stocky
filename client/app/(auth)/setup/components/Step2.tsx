import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { BusinessType, Currency, ShopInfoForm, SetupDataForm } from "../schema";
import { Button } from "@/components/ui/button";
import { SetupShopInfo } from "@/(api)/api";

interface Props {
  setSetupData: React.Dispatch<any>;
  form: UseFormReturn<ShopInfoForm>;
  nextStep: () => void;
  previousStep: () => void;
}

export default function Step2({
  setSetupData,
  form,
  nextStep,
  previousStep,
}: Props) {
  const { control, handleSubmit } = form;

  async function onSubmit(data: ShopInfoForm) {
    setSetupData((prev: any) => {
      return {
        ...prev,
        ...data,
      };
    });
    let res = await SetupShopInfo(data);
    console.log(res);

    nextStep();
  }
  return (
    <Form {...form}>
      <form className="flex flex-col gap-20 justify-center items-center w-1/2">
        <div className="grid grid-cols-2 gap-4 w-full">
          <FormField
            control={control}
            name="shop_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shop Name:</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Shop Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="shop_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shop Address:</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Shop Address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number:</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Phone Number"
                    {...field}
                    type="tel"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="shop_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shop Email Address:</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Shop Email" {...field} type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-2">
            <FormField
              control={control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Website (Optional):"}</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Website" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name="business_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Type:</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a business type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={BusinessType.FOOD}>Food</SelectItem>
                    <SelectItem value={BusinessType.CLOTHING}>
                      Clothing
                    </SelectItem>
                    <SelectItem value={BusinessType.GENERAL_RETAIL}>
                      General Retail
                    </SelectItem>
                    <SelectItem value={BusinessType.TECHNOLOGY}>
                      Tech Store
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency:</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={Currency.USD}>US Dollar</SelectItem>
                    <SelectItem value={Currency.EUR}>Euro</SelectItem>
                    <SelectItem value={Currency.SYP}>Syrian Pound</SelectItem>
                    <SelectItem value={Currency.GBP}>British Pound</SelectItem>
                    <SelectItem value={Currency.CAD}>
                      Canadian Dollar
                    </SelectItem>
                    <SelectItem value={Currency.AUD}>
                      Australian Dollar
                    </SelectItem>
                    <SelectItem value={Currency.SAR}>Saudi Riyal</SelectItem>
                    <SelectItem value={Currency.JPY}>Japanese Yen</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-between w-full">
          <Button
            size="xl"
            onClick={previousStep}
            variant={"outline"}
            type="button"
          >
            Back
          </Button>
          <Button size="xl" onClick={handleSubmit(onSubmit)} type="button">
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
}
