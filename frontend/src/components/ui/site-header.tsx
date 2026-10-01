'use client';

import Link from 'next/link';
import { LanguageSwitcher } from './language-switcher';
import { useI18n } from '@/lib/i18n-context';

export function SiteHeader() {
  const { locale, setLocale, t } = useI18n();

  return (
    <header className="topbar">
      <Link className="wordmark" href="/">{t('brand')}</Link>
      <nav aria-label={t('mainNavigation')} className="site-nav">
        <Link href="/rules">{t('rules')}</Link>
        <Link href="/about">{t('about')}</Link>
      </nav>
      <LanguageSwitcher locale={locale} onChange={setLocale} />
    </header>
  );
}
