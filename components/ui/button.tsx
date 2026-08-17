import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

const styles = {
  primary: "bg-stamp text-paper hover:bg-stamp-dark",
  secondary: "border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
} as const;

// ponytail: darken 8% on hover (DESIGN §5), no scale/glow, no shadow.
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex min-h-11 items-center justify-center rounded-sm px-5 py-3 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp disabled:opacity-40 disabled:pointer-events-none ${styles[variant]} ${className}`}
      {...props}
    />
  ),
);

Button.displayName = "Button";
