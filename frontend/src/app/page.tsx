'use client';

import { CreateRoomForm } from '@/features/room/components/create-room-form';
import { JoinRoomForm } from '@/features/room/components/join-room-form';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useI18n } from '@/lib/i18n-context';
import Link from 'next/link';

function HomeContent() {
  const { locale, setLocale, t } = useI18n();
  return (
    <main className="site-shell">
      <header className="topbar"><Link className="wordmark" href="/">{t('brand')}</Link><LanguageSwitcher locale={locale} onChange={setLocale} /></header>
      <div className="page-frame"><div className="landing-grid">
        <section><span className="hero-kicker">{t('subtitle')}</span><h1 className="hero-title">{t('brand')}</h1><p className="hero-copy">{t('tagline')}</p></section>
        <section><CreateRoomForm /><JoinRoomForm /></section>
      </div></div>
    </main>
  );
}

export default function HomePage() {
  return <HomeContent />;
}
