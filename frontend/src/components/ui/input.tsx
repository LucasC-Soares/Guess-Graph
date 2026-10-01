import { InputHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      className={`min-h-[46px] w-full border border-[var(--line)] bg-white px-[13px] text-[var(--ink)] outline-none transition-shadow focus:border-[var(--teal)] focus:ring-[3px] focus:ring-[rgba(28,119,112,.14)]${className ? ` ${className}` : ''}`}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
