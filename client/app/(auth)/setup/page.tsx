"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Step1 from "./components/Step1";
import Step2 from "./components/Step2";
import Step3 from "./components/Step3";
import Step4 from "./components/Step4";
import Step5 from "./components/Step5";
import { Progress } from "@/components/ui/progress";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AdminUserForm,
  AdminUserSchema,
  BusinessType,
  Currency,
  DatabaseConfigForm,
  DatabaseConfigSchema,
  DatabaseType,
  ShopInfoForm,
  ShopInfoSchema,
} from "./schema";

export default function SetupForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const step2Form = useForm<ShopInfoForm>({
    resolver: zodResolver(ShopInfoSchema),
    defaultValues: {
      address: "",
      email: "",
      name: "",
      phone: "",
      website: "",
      currency: Currency.EMPTY,
      businessType: BusinessType.EMPTY,
    },
  });
  const step3Form = useForm<DatabaseConfigForm>({
    resolver: zodResolver(DatabaseConfigSchema),
    defaultValues: {
      ssl: true,
      database: "",
      host: "",
      port: "",
      password: "",
      username: "",
      tablePrefix: "",
      type: DatabaseType.EMPTY,
    },
  });
  const step4Form = useForm<AdminUserForm>({
    resolver: zodResolver(AdminUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      username: "",
    },
  });

  async function nextStep() {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function previousStep() {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  function renderCurrentStep() {
    switch (currentStep) {
      case 1:
        return <Step1 nextStep={nextStep} />;
      case 2:
        return (
          <Step2
            form={step2Form}
            nextStep={nextStep}
            previousStep={previousStep}
          />
        );
      case 3:
        return (
          <Step3
            form={step3Form}
            nextStep={nextStep}
            previousStep={previousStep}
          />
        );
      case 4:
        return (
          <Step4
            form={step4Form}
            nextStep={nextStep}
            previousStep={previousStep}
          />
        );
      case 5:
        return <Step5 />;
    }
  }
  return (
    <main className="w-full min-h-screen px-8 flex flex-col gap-20 items-center justify-center">
      <div className="w-2/3 flex flex-col gap-4">
        <p className="font-bold text-xl">Step {currentStep} of 5</p>
        <Progress value={currentStep * 20} />
      </div>
      {renderCurrentStep()}
    </main>
  );
}
