import { HTMLAttributes } from 'react';

// TODO: usado pra indicar "sua vez" / "vez do oponente", e o veredito sim/não das perguntas.
export function Badge(props: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} />;
}
