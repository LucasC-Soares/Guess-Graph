import type { Metadata } from 'next';
import '@/styles/globals.css';
import { I18nProvider } from '@/lib/i18n-context';
import { QueryProvider } from '@/lib/query-provider';

export const metadata: Metadata = {
  title: 'Guess Graph',
  description: 'Adivinhe as propriedades do grafo do seu oponente',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body><QueryProvider><I18nProvider>{children}</I18nProvider></QueryProvider></body>
    </html>
  );
}
