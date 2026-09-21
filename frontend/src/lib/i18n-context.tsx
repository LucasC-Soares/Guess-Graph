'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { Locale, translate, TranslationKey } from './i18n';

const I18nContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void; t: (key: TranslationKey) => string } | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('pt');
  const value = useMemo(() => ({ locale, setLocale, t: (key: TranslationKey) => translate(locale, key) }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}