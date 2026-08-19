import { ForgotForm } from "@/components/auth/forgot-form";

export default function ForgotPasswordPage() {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col px-6 py-16 md:px-16">
      <h1 className="font-display text-[32px] leading-[1.15] text-ink">
        Lupa Password
      </h1>
      <p className="mt-2 text-[15px] text-taupe-dark">
        Atur ulang password Anda melalui email.
      </p>
      <div className="mt-8 rounded-sm border border-taupe bg-paper-raised p-6 md:p-8">
        <ForgotForm />
      </div>
    </section>
  );
}