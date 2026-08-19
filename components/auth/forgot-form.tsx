"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    try {
      // Server selalu balas 200 generic — tidak membocorkan eksistensi akun.
      await api.post("/auth/forgot-password", values);
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors.length > 0) {
          for (const e of err.errors) {
            setError(e.field as keyof ForgotPasswordValues, {
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

  if (submitted) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[15px] text-ink">
          Jika email terdaftar, kami telah mengirimkan tautan reset password.
          Periksa kotak masuk Anda.
        </p>
        <p className="text-sm text-taupe-dark">
          Tidak menerima email? Coba periksa folder spam, atau{" "}
          <Link
            href="/login"
            className="font-medium text-ink underline-offset-2 hover:underline"
          >
            kembali ke halaman masuk
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
      <p className="text-[15px] text-ink">
        Masukkan email Anda. Jika terdaftar, kami akan mengirim tautan untuk
        mengatur ulang password.
      </p>

      {errors.root?.message && (
        <p
          role="alert"
          className="rounded-sm border border-error px-4 py-3 text-sm text-error"
        >
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

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Mengirim…" : "Kirim tautan reset"}
      </Button>

      <p className="text-center text-sm text-taupe-dark">
        Ingat password?{" "}
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
