import React from "react";
import H4 from "@/components/typography/H4";
import { SetupDataForm } from "../schema";
import { Button } from "@/components/ui/button";

interface Props {
  setupData: SetupDataForm;
}

export default function Step5({ setupData }: Props) {
  console.log(setupData);

  return (
    <>
      <div className="flex flex-col gap-8 w-1/2">
        <H4>Shop Information:</H4>
        <div className="font-bold flex gap-4">
          <div className="flex flex-col grow gap-4">
            <p>
              Shop Name:{" "}
              <span className="font-normal text-secondary">
                {setupData.shop_name}
              </span>
            </p>
            <p>
              Shop Address:{" "}
              <span className="font-normal text-secondary">
                {setupData.shop_address}
              </span>
            </p>
            <p>
              Phone Number:{" "}
              <span className="font-normal text-secondary">
                {setupData.phone}
              </span>
            </p>
          </div>
          <div className="flex flex-col grow gap-4">
            <p>
              Shop Email:{" "}
              <span className="font-normal text-secondary">
                {setupData.shop_email}
              </span>
            </p>
            <p>
              Business Type:{" "}
              <span className="font-normal text-secondary">
                {setupData.business_type}
              </span>
            </p>
            <p>
              Currency:{" "}
              <span className="font-normal text-secondary">
                {setupData.currency}
              </span>
            </p>
          </div>
          {setupData.website && (
            <p>
              Website:{" "}
              <span className="font-normal text-secondary">
                {setupData.website}
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
                {setupData.db_type}
              </span>
            </p>
            <p>
              Database Name:{" "}
              <span className="font-normal text-secondary">
                {setupData.db_name}
              </span>
            </p>
            <p>
              Hostname:{" "}
              <span className="font-normal text-secondary">
                {setupData.host}
              </span>
            </p>
          </div>
          <div className="flex flex-col grow gap-4">
            <p>
              Port:{" "}
              <span className="font-normal text-secondary">
                {setupData.port}
              </span>
            </p>
            <p>
              Username:{" "}
              <span className="font-normal text-secondary">
                {setupData.db_username}
              </span>
            </p>
            <p>
              Password:{" "}
              <span className="font-normal text-secondary">
                {setupData.db_password}
              </span>
            </p>
          </div>
          <div className="flex flex-col grow gap-4">
            <p>
              SSL:{" "}
              <span className="font-normal text-secondary">
                {setupData.ssl ? "Enabled" : "Disabled"}
              </span>
            </p>
            {setupData.table_prefix && (
              <p>
                Table Prefix:{" "}
                <span className="font-normal text-secondary">
                  {setupData.table_prefix}
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
                {setupData.username}
              </span>
            </p>
            <p>
              Email:{" "}
              <span className="font-normal text-secondary">
                {setupData.email}
              </span>
            </p>
          </div>
          <div className="flex flex-col grow gap-4">
            <p>
              First Name:{" "}
              <span className="font-normal text-secondary">
                {setupData.first_name}
              </span>
            </p>
            {setupData.last_name && (
              <p>
                Last Name:{" "}
                <span className="font-normal text-secondary">
                  {setupData.last_name}
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
