"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { AlertCircleIcon } from "lucide-react";

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
      <div className="flex items-center justify-center w-full h-screen">
        <Card className="w-[650px] px-4 py-8">
          <CardHeader>
            <CardTitle className="text-3xl">Login to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="flex flex-col gap-8">
                <div className="flex flex-col gap-8">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username:</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Your Username" {...field} />
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
                        <FormLabel>Password:</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter You Password"
                            {...field}
                            type="password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button variant="ghost" className="border-0 self-end" asChild>
                    <a className="text-muted-foreground text-sm underline">
                      Forgot your password?
                    </a>
                  </Button>
                </div>
                {isError && (
                  <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Login failed!</AlertTitle>
                    <AlertDescription>
                      <p>
                        {error.message || "Login failed. Please try again."}
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
                <Button
                  size="lg"
                  onClick={form.handleSubmit(onSubmit)}
                  type="button"
                  className="w-1/4"
                >
                  Login
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
