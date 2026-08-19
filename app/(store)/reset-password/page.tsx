import { ResetForm } from "@/components/auth/reset-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <section className="mx-auto flex w-full max-w-md flex-col px-6 py-16 md:px-16">
      <h1 className="font-display text-[32px] leading-[1.15] text-ink">
        Atur Ulang Password
      </h1>
      <p className="mt-2 text-[15px] text-taupe-dark">
        Buat password baru untuk akun Anda.
      </p>
      <div className="mt-8 rounded-sm border border-taupe bg-paper-raised p-6 md:p-8">
        <ResetForm token={token} />
      </div>
    </section>
  );
}