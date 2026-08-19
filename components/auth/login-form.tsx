"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { loginSchema, type LoginValues } from "@/lib/schemas";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    try {
      await login(values.email, values.password);
      toast.success("Berhasil masuk.");
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors.length > 0) {
          // Error per field dari backend (VALIDATION_ERROR) → inline (PRD §L).
          for (const e of err.errors) {
            setError(e.field as keyof LoginValues, { message: e.message });
          }
          return;
        }
        setError("root", { message: err.message });
        return;
      }
      setError("root", { message: "Terjadi kesalahan. Coba lagi." });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {errors.root?.message && (
        <p role="alert" className="rounded-sm border border-error px-4 py-3 text-sm text-error">
          {errors.root.message}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email?.message && (
          <p className="text-sm text-error">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className="text-sm font-medium text-ink">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-taupe-dark underline-offset-2 hover:underline"
          >
            Lupa password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password?.message && (
          <p className="text-sm text-error">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Masuk…" : "Masuk"}
      </Button>

      <p className="text-center text-sm text-taupe-dark">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-ink underline-offset-2 hover:underline">
          Daftar
        </Link>
      </p>
    </form>
  );
}
