export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-dashed border-taupe bg-paper">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-6 py-6 text-xs text-taupe-dark md:flex-row md:items-center md:justify-between md:px-16">
        <span>Ledger &amp; Tag — toko online</span>
        <span className="font-mono">© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
