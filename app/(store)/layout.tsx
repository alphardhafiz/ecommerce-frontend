import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ToastProvider } from "@/components/ui/toast";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </ToastProvider>
  );
}
