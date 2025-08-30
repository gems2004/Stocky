import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import H4 from "@/components/typography/H4";
import { AdminUserForm, DatabaseConfigForm, ShopInfoForm } from "../schema";
import { Button } from "@/components/ui/button";

interface Props {
  shopInfo: ShopInfoForm;
  dataConfig: DatabaseConfigForm;
  adminUser: AdminUserForm;
}

export default function Step5({ shopInfo, dataConfig, adminUser }: Props) {
  console.log(shopInfo);
  console.log(dataConfig);
  console.log(adminUser);

  return (
    <>
      <div className="flex flex-col gap-8 w-1/2">
        <H4>Shop Information:</H4>
        <div className="font-bold flex gap-4">
          <div className="flex flex-col grow gap-4">
            <p>
              Shop Name:{" "}
              <span className="font-normal text-secondary">
                {shopInfo.shop_name}
              </span>
            </p>
            <p>
              Shop Address:{" "}
              <span className="font-normal text-secondary">
                {shopInfo.shop_address}
              </span>
            </p>
            <p>
              Phone Number:{" "}
              <span className="font-normal text-secondary">
                {shopInfo.phone}
              </span>
            </p>
          </div>
          <div className="flex flex-col grow gap-4">
            <p>
              Shop Email:{" "}
              <span className="font-normal text-secondary">
                {shopInfo.shop_email}
              </span>
            </p>
            <p>
              Business Type:{" "}
              <span className="font-normal text-secondary">
                {shopInfo.business_type}
              </span>
            </p>
            <p>
              Currency:{" "}
              <span className="font-normal text-secondary">
                {shopInfo.currency}
              </span>
            </p>
          </div>
          {shopInfo.website && (
            <p>
              Website:{" "}
              <span className="font-normal text-secondary">
                {shopInfo.website}
              </span>
            </p>
          )}
        </div>
        <H4>Database Config:</H4>
        <div className="font-bold flex gap-4">
          <div className="flex flex-col grow gap-4">
            <p>
              Database Type:{" "}
              <span className="font-normal text-secondary">
                {dataConfig.db_type}
              </span>
            </p>
            <p>
              Database Name:{" "}
              <span className="font-normal text-secondary">
                {dataConfig.db_name}
              </span>
            </p>
            <p>
              Hostname:{" "}
              <span className="font-normal text-secondary">
                {dataConfig.host}
              </span>
            </p>
          </div>
          <div className="flex flex-col grow gap-4">
            <p>
              Port:{" "}
              <span className="font-normal text-secondary">
                {dataConfig.port}
              </span>
            </p>
            <p>
              Username:{" "}
              <span className="font-normal text-secondary">
                {dataConfig.db_username}
              </span>
            </p>
            <p>
              Password:{" "}
              <span className="font-normal text-secondary">
                {dataConfig.db_password}
              </span>
            </p>
          </div>
          <div className="flex flex-col grow gap-4">
            <p>
              SSL:{" "}
              <span className="font-normal text-secondary">
                {dataConfig.ssl ? "Enabled" : "Disabled"}
              </span>
            </p>
            {dataConfig.table_prefix && (
              <p>
                Table Prefix:{" "}
                <span className="font-normal text-secondary">
                  {dataConfig.table_prefix}
                </span>
              </p>
            )}
          </div>
        </div>
        <H4>Admin Information:</H4>
        <div className="font-bold flex gap-4">
          <div className="flex flex-col grow gap-4">
            <p>
              Username:{" "}
              <span className="font-normal text-secondary">
                {adminUser.username}
              </span>
            </p>
            <p>
              Email:{" "}
              <span className="font-normal text-secondary">
                {adminUser.email}
              </span>
            </p>
          </div>
          <div className="flex flex-col grow gap-4">
            <p>
              First Name:{" "}
              <span className="font-normal text-secondary">
                {adminUser.first_name}
              </span>
            </p>
            {adminUser.last_name && (
              <p>
                Last Name:{" "}
                <span className="font-normal text-secondary">
                  {adminUser.last_name}
                </span>
              </p>
            )}
          </div>
        </div>
        <Button size="xl" className="w-fit self-center">
          Done
        </Button>
      </div>
    </>
  );
}
