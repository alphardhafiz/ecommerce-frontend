"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/schemas";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";

export function ResetForm({ token }: { token: string | undefined }) {
  const router = useRouter();
  const toast = useToast();
  const [invalidToken, setInvalidToken] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm_password: "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    try {
      await api.post("/auth/reset-password", {
        token,
        password: values.password,
        confirm_password: values.confirm_password,
      });
      toast.success("Password berhasil diubah. Silakan masuk.");
      router.replace("/login");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "INVALID_RESET_TOKEN") {
          setInvalidToken(true);
          return;
        }
        if (err.errors.length > 0) {
          for (const e of err.errors) {
            setError(e.field as keyof ResetPasswordValues, {
              message: e.message,
            });
          }
          return;
        }
        setError("root", { message: err.message });
        return;
      }
      setError("root", { message: "Terjadi kesalahan. Coba lagi." });
    }
  }

  if (!token || invalidToken) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[15px] text-ink">
          Tautan reset password tidak valid atau sudah kadaluarsa.
        </p>
        <p className="text-sm text-taupe-dark">
          Minta tautan baru melalui halaman{" "}
          <Link
            href="/forgot-password"
            className="font-medium text-ink underline-offset-2 hover:underline"
          >
            lupa password
          </Link>
          .
        </p>
      </div>
    );
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
        <label htmlFor="password" className="text-sm font-medium text-ink">
          Password Baru
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
        {isSubmitting ? "Menyimpan…" : "Ubah password"}
      </Button>
    </form>
  );
}