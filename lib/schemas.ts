import { z } from "zod";

// Pesan validasi client-side: hanya UX (PRD §C.1); server tetap otoritatif (PRD §L).
export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginValues = z.infer<typeof loginSchema>;

// Miror validasi server (PRD §C.1): password min 8 + huruf & angka.
export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Nama wajib diisi"),
    email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter dengan huruf dan angka")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)/,
        "Password minimal 8 karakter dengan huruf dan angka",
      ),
    confirm_password: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((v) => v.password === v.confirm_password, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirm_password"],
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password minimal 8 karakter dengan huruf dan angka")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)/,
        "Password minimal 8 karakter dengan huruf dan angka",
      ),
    confirm_password: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((v) => v.password === v.confirm_password, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirm_password"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
