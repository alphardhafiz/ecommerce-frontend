import { forwardRef, type InputHTMLAttributes } from "react";

// Storefront input: border-bottom style, seperti form kertas (DESIGN §5).
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`min-h-11 w-full border-b border-taupe bg-transparent px-1 py-2 text-[15px] text-ink transition-colors placeholder:text-taupe-dark focus:border-ink focus:border-b-2 focus:outline-none ${className}`}
      {...props}
    />
  ),
);

Input.displayName = "Input";
