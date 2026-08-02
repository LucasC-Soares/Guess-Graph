import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guess Graph',
  description: 'Adivinhe as propriedades do grafo do seu oponente',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
