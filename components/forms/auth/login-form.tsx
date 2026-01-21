"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginData } from "@/lib/schemas/auth";
import { AppleIcon, GoogleIcon } from "@/components/icons";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
  });

  useEffect(() => {
    const registered = searchParams.get("registered");
    if (registered === "true") {
      toast.success("Clinic registered successfully. Please login.");
    }
    const error = searchParams.get("error");
    if (error === "CredentialsSignin") {
      toast.error("Invalid credentials. Please try again.");
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginData) => {
    try {
      const res = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (res?.error) {
        if (res.error === "CredentialsSignin") {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(res.error || "Authentication failed");
        }
      } else {
        toast.success("Logged in successfully!");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold">Welcome back</CardTitle>
          <CardDescription>Login to your kumacare account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                />
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
              </Field>
              <div className="flex items-end">
                <Link
                  href="/forgot-password"
                  className="ml-auto text-xs underline-offset-2 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => signIn("apple")}
                >
                  <AppleIcon className="h-5 w-5" />
                  <span className="sr-only">Login with Apple</span>
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => signIn("google")}
                >
                  <GoogleIcon className="h-5 w-5" />
                  <span className="sr-only">Login with Google</span>
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline">
                  Sign up
                </Link>
              </FieldDescription>
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Owning a clinic? </span>
                <Link href="/register-clinic" className="font-medium underline">
                  Register your Clinic
                </Link>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <Link href="#" className="underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="underline">
          Privacy Policy
        </Link>
        .
      </FieldDescription>
    </div>
  );
}
