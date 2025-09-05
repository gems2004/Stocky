import React from "react";
import H4 from "@/components/typography/H4";
import { Button } from "@/components/ui/button";
import { useSetupStore } from "@/store/setupState";
import { useGetSetupStatus } from "@/api/setupApi";

export default function Step5() {
  const { shopInfo, databaseConfig, user } = useSetupStore();
  const { data: setup } = useGetSetupStatus();

  if (!shopInfo || !databaseConfig || !user) {
    return <p>Please complete setup</p>;
  }

  if (!setup) return <p>Loading...</p>;

  return (
    <>
      <div className="flex flex-col gap-8 w-1/2">
        <H4>Shop Information:</H4>
        <div className="font-bold flex gap-4">
          <div className="flex flex-col grow gap-4">
            <p>
              Shop Name:{" "}
              <span className="font-normal text-secondary">
                {shopInfo.name}
              </span>
            </p>
            <p>
              Shop Address:{" "}
              <span className="font-normal text-secondary">
                {shopInfo.address}
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
                {shopInfo.email}
              </span>
            </p>
            <p>
              Business Type:{" "}
              <span className="font-normal text-secondary">
                {shopInfo.businessType}
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
                {databaseConfig.type}
              </span>
            </p>
            <p>
              Database Name:{" "}
              <span className="font-normal text-secondary">
                {databaseConfig.database}
              </span>
            </p>
            <p>
              Hostname:{" "}
              <span className="font-normal text-secondary">
                {databaseConfig.host}
              </span>
            </p>
          </div>
          <div className="flex flex-col grow gap-4">
            <p>
              Port:{" "}
              <span className="font-normal text-secondary">
                {databaseConfig.port}
              </span>
            </p>
            <p>
              Username:{" "}
              <span className="font-normal text-secondary">
                {databaseConfig.username}
              </span>
            </p>
            {/* <p>
              Password:{" "}
              <span className="font-normal text-secondary">
                {databaseConfig.db_password}
              </span>
            </p> */}
          </div>
          <div className="flex flex-col grow gap-4">
            <p>
              SSL:{" "}
              <span className="font-normal text-secondary">
                {databaseConfig.ssl ? "Enabled" : "Disabled"}
              </span>
            </p>
            {databaseConfig.tablePrefix && (
              <p>
                Table Prefix:{" "}
                <span className="font-normal text-secondary">
                  {databaseConfig.tablePrefix}
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
                {user.username}
              </span>
            </p>
            <p>
              Email:{" "}
              <span className="font-normal text-secondary">{user.email}</span>
            </p>
          </div>
          <div className="flex flex-col grow gap-4">
            <p>
              First Name:{" "}
              <span className="font-normal text-secondary">
                {user.firstName}
              </span>
            </p>
            {user.lastName && (
              <p>
                Last Name:{" "}
                <span className="font-normal text-secondary">
                  {user.lastName}
                </span>
              </p>
            )}
          </div>
        </div>
        {setup.success && setup.data.isSetupComplete ? (
          <Button size="xl" className="w-fit self-center">
            Done
          </Button>
        ) : (
          <>
            <p className="text-destructive self-center">
              Please complete setup before advancing
            </p>
            <Button size="xl" className="w-fit self-center" variant="outline">
              Go Back
            </Button>
          </>
        )}
      </div>
    </>
  );
}
