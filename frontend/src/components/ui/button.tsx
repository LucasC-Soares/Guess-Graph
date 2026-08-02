import { ButtonHTMLAttributes } from 'react';

// TODO: estilizar (Tailwind, CSS Modules, etc.)
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} />;
}
