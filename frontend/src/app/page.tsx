'use client';

import { CreateRoomForm } from '@/features/room/components/create-room-form';
import { JoinRoomForm } from '@/features/room/components/join-room-form';
import { SiteHeader } from '@/components/ui/site-header';
import { useI18n } from '@/lib/i18n-context';

function HomeContent() {
  const { t } = useI18n();
  return (
    <main className="site-shell">
      <SiteHeader />
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
