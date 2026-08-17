import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  color?: "stamp" | "ledger" | "mustard" | "error";
};

// Cap stempel karet: miring, border tebal, tanpa background (DESIGN §4.4).
const colors = {
  stamp: "border-stamp text-stamp",
  ledger: "border-ledger text-ledger",
  mustard: "border-mustard text-mustard",
  error: "border-error text-error",
} as const;

export function Badge({ color = "stamp", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-block -rotate-6 rounded-xs border-2 px-2 py-0.5 text-xs font-semibold uppercase tracking-widest ${colors[color]} ${className}`}
      {...props}
    />
  );
}
