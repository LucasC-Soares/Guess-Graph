import { HTMLAttributes } from 'react';

export function Badge(props: HTMLAttributes<HTMLSpanElement>) {
  const { className, ...badgeProps } = props;
  return (
    <span
      className={`inline-block bg-[var(--yellow)] px-[9px] py-[7px] font-sans text-[.72rem] font-bold leading-none text-[var(--ink)]${className ? ` ${className}` : ''}`}
      {...badgeProps}
    />
  );
}
