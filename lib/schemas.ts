import { z } from "zod";

// Pesan validasi client-side: hanya UX (PRD §C.1); server tetap otoritatif (PRD §L).
export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginValues = z.infer<typeof loginSchema>;
