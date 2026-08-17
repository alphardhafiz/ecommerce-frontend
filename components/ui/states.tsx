import { Button } from "./button";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-sm bg-taupe/50 motion-reduce:animate-none ${className}`}
    />
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      <p className="max-w-sm text-[15px] text-taupe-dark">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

// Nada error langsung & aksi, tanpa permintaan maaf (DESIGN §8).
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-[15px] text-error">{message}</p>
      <Button variant="secondary" className="mt-2" onClick={onRetry}>
        Coba lagi
      </Button>
    </div>
  );
}
