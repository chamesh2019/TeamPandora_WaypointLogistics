import React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, isError, type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full h-[42px] px-3 border border-black/[0.07] dark:border-white/[0.08] rounded-lg bg-[#F5F6FB] dark:bg-[#1C1C38] text-[#0F1020] dark:text-white text-xs outline-none transition-all duration-150 placeholder:text-slate-400 dark:placeholder:text-slate-500",
          "focus:border-[#F5C542] focus:bg-white dark:focus:bg-[#141425] focus:shadow-[0_0_0_3px_rgba(245,197,66,0.18)]",
          isError &&
          "border-[#EF4444] focus:border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.18)]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "w-full h-[42px] px-3 border border-black/[0.07] dark:border-white/[0.08] rounded-lg bg-[#F5F6FB] dark:bg-[#1C1C38] text-[#0F1020] dark:text-white text-xs outline-none transition-all duration-150 cursor-pointer",
        "focus:border-[#F5C542] focus:bg-white dark:focus:bg-[#141425] focus:shadow-[0_0_0_3px_rgba(245,197,66,0.18)]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full min-h-[80px] p-3 border border-black/[0.07] dark:border-white/[0.08] rounded-lg bg-[#F5F6FB] dark:bg-[#1C1C38] text-[#0F1020] dark:text-white text-xs outline-none transition-all duration-150 resize-y placeholder:text-slate-400 dark:placeholder:text-slate-500",
        "focus:border-[#F5C542] focus:bg-white dark:focus:bg-[#141425] focus:shadow-[0_0_0_3px_rgba(245,197,66,0.18)]",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export function FieldLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "block text-[9px] font-bold text-[#7B7B9D] dark:text-slate-400 tracking-[0.07em] uppercase mb-1.5",
        className
      )}
    >
      {children}
    </label>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label className={cn("relative inline-block w-[42px] h-[24px] cursor-pointer", className)}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="opacity-0 w-0 h-0 absolute"
      />
      <span
        className={cn(
          "absolute inset-0 rounded-full transition-colors duration-200",
          checked ? "bg-[#F5C542]" : "bg-black/[0.12] dark:bg-white/20"
        )}
      >
        <span
          className={cn(
            "absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white transition-transform duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.2)]",
            checked && "translate-x-[18px]"
          )}
        />
      </span>
    </label>
  );
}
