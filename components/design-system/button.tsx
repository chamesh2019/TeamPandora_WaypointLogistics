import React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "create" | "ghost" | "danger" | "compact";
  size?: "default" | "compact" | "pill" | "full";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Base Figma button styles
    let variantStyles = "";
    if (variant === "primary") {
      variantStyles =
        "bg-[#F5C542] text-[#0F1928] font-semibold hover:bg-[#D4A200] hover:-translate-y-[1px] shadow-[0_2px_10px_rgba(245,197,66,0.3)] hover:shadow-[0_4px_16px_rgba(245,197,66,0.38)]";
    } else if (variant === "secondary") {
      variantStyles =
        "bg-white dark:bg-[#1C1C38] text-[#0F1020] dark:text-white/90 border border-black/[0.07] dark:border-white/[0.08] hover:bg-[#F5F6FB] dark:hover:bg-white/5 hover:border-black/10";
    } else if (variant === "create") {
      variantStyles =
        "bg-[#6366F1] text-white font-bold rounded-full hover:bg-[#4F46E5] hover:-translate-y-[1px] shadow-[0_4px_14px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.42)]";
    } else if (variant === "ghost") {
      variantStyles =
        "bg-transparent text-[#7B7B9D] hover:bg-[#F5F6FB] dark:hover:bg-white/5 hover:text-[#0F1020] dark:hover:text-white";
    } else if (variant === "danger") {
      variantStyles =
        "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20";
    }

    let sizeStyles = "min-h-[38px] px-4 py-1.5 text-xs rounded-[10px]";
    if (size === "compact" || variant === "compact") {
      sizeStyles = "min-h-[30px] px-2.5 py-1 text-[9px] rounded-md font-semibold";
    } else if (size === "pill" || variant === "create") {
      sizeStyles = "min-h-[40px] px-4 py-2 text-xs rounded-full font-bold";
    } else if (size === "full") {
      sizeStyles = "w-full min-h-[42px] px-4 py-2 text-xs rounded-[10px]";
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 border-0 outline-none select-none cursor-pointer transition-all duration-150 font-sans disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
          sizeStyles,
          variantStyles,
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
