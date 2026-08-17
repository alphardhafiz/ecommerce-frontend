import type { HTMLAttributes } from "react";

// Surface di atas `paper`: border tipis, tanpa shadow (DESIGN §3).
export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-sm border border-taupe bg-paper-raised ${className}`}
      {...props}
    />
  );
}
