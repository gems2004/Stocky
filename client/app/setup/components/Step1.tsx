import H1 from "@/components/typography/H1";
import { Button } from "@/components/ui/button";
import React from "react";

interface Props {
  nextStep: () => void;
}
export default function Step1({ nextStep }: Props) {
  return (
    <>
      <H1>
        Welcome To <span className="text-primary">Stocky</span>
      </H1>
      <div className="text-secondary text-center">
        <p>
          Thank you for choosing Stocky, your all-in-one solution for managing
          your retail business, inventory, and point-of-sale operations.
        </p>
        <p>
          This initial setup wizard will guide you through configuring your shop
          information, database connection, and administrator account.
        </p>
        <p>
          The process is simple and should only take a few minutes to complete.
          Once set up, you'll have access to powerful features including:
        </p>
        <p>- Product and inventory management</p>
        <p>- Fast and intuitive point-of-sale transactions</p>
        <p>- Detailed sales reporting</p>
        <p>- Customer loyalty programs</p>
        <p>Let's get started with setting up your shop!</p>
      </div>
      <Button size="xl" onClick={nextStep} type="button">
        Next
      </Button>
    </>
  );
}
