"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { registerSchema, type RegisterValues } from "@/lib/schemas";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  async function onSubmit(values: RegisterValues) {
    try {
      await api.post("/auth/register", values);
      toast.success("Akun berhasil dibuat. Silakan masuk.");
      router.replace("/login");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors.length > 0) {
          for (const e of err.errors) {
            setError(e.field as keyof RegisterValues, { message: e.message });
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6"
    >
      {errors.root?.message && (
        <p
          role="alert"
          className="rounded-sm border border-error px-4 py-3 text-sm text-error"
        >
          {errors.root.message}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-ink">
          Nama
        </label>
        <Input
          id="name"
          autoComplete="name"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name?.message && (
          <p className="text-sm text-error">{errors.name.message}</p>
        )}
      </div>

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
        <label htmlFor="password" className="text-sm font-medium text-ink">
          Password
        </label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <p className="text-sm text-taupe-dark">
          Minimal 8 karakter dengan huruf dan angka.
        </p>
        {errors.password?.message && (
          <p className="text-sm text-error">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="confirm_password" className="text-sm font-medium text-ink">
          Konfirmasi Password
        </label>
        <PasswordInput
          id="confirm_password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirm_password}
          {...register("confirm_password")}
        />
        {errors.confirm_password?.message && (
          <p className="text-sm text-error">{errors.confirm_password.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Mendaftar…" : "Daftar"}
      </Button>

      <p className="text-center text-sm text-taupe-dark">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-medium text-ink underline-offset-2 hover:underline"
        >
          Masuk
        </Link>
      </p>
    </form>
  );
}
