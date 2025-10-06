"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import React from "react";
import { LoginForm, LoginSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/api/loginApi";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon, BadgeDollarSign } from "lucide-react";
import H4 from "@/components/typography/H4";

export default function Login() {
  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { mutateAsync: handleLogin, isPending, isError, error } = useLogin();
  const router = useRouter();

  async function onSubmit(data: LoginForm) {
    try {
      let res = await handleLogin(data);
      if (res.success) router.push("/");
    } catch (error) {}
  }

  return (
    <main>
      <div className="flex items-center gap-2 px-8 py-4 fixed">
        <BadgeDollarSign size="40px" /> {/* Replace later with logo */}
        <H4>Stocky</H4>
      </div>
      <div className="flex flex-col items-center justify-center w-full h-screen gap-12">
        <div className="text-center opacity-80">
          <H4>Welcome Back</H4>
          <p className="text-secondary pt-2">Sign in to manage your store.</p>
        </div>
        <div className="w-[550px]">
          <Form {...form}>
            <form className="flex flex-col gap-6">
              <div className="flex flex-col gap-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Username"
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Password"
                          {...field}
                          type="password"
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button variant="ghost" className="border-0 self-end" asChild>
                  <a className="text-primary hover:text-primary/60">
                    Forgot your password?
                  </a>
                </Button>
              </div>
              {isError && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Login failed!</AlertTitle>
                  <AlertDescription>
                    <p>{error.message || "Login failed. Please try again."}</p>
                  </AlertDescription>
                </Alert>
              )}
              <Button
                size="lg"
                onClick={form.handleSubmit(onSubmit)}
                type="button"
              >
                Login
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </main>
  );
}
