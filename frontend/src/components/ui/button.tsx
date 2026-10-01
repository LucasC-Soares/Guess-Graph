import { ButtonHTMLAttributes } from 'react';

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, ...buttonProps } = props;
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center border-0 px-[18px] font-sans text-[.82rem] font-bold leading-none transition duration-200 ease-out hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0${className ? ` ${className}` : ''}`}
      {...buttonProps}
    />
  );
}
