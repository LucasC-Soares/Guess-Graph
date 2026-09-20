'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
import { Locale, translate, TranslationKey } from './i18n';

const I18nContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void; t: (key: TranslationKey) => string } | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('pt');
  return <I18nContext.Provider value={{ locale, setLocale, t: (key) => translate(locale, key) }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}