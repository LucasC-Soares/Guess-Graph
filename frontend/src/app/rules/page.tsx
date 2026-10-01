'use client';

import Link from 'next/link';
import { SiteHeader } from '@/components/ui/site-header';
import { useI18n } from '@/lib/i18n-context';

export default function RulesPage() {
  const { t } = useI18n();

  return (
    <main className="site-shell">
      <SiteHeader />
      <div className="page-frame info-page">
        <section className="info-hero">
          <span className="hero-kicker">{t('rulesEyebrow')}</span>
          <h1 className="info-title">{t('rulesTitle')}</h1>
          <p className="hero-copy">{t('rulesIntro')}</p>
        </section>
        <div className="rules-flow">
          <section className="rules-section">
            <span className="step-number">01</span>
            <div><h2>{t('rulesSecretTitle')}</h2><p>{t('rulesSecretText')}</p></div>
          </section>
          <section className="rules-section">
            <span className="step-number">02</span>
            <div><h2>{t('rulesRoomTitle')}</h2><p>{t('rulesRoomText')}</p></div>
          </section>
          <section className="rules-section rules-section--split">
            <span className="step-number">03</span>
            <div>
              <h2>{t('rulesTurnTitle')}</h2>
              <p>{t('rulesTurnText')}</p>
              <p>{t('rulesQuestionDetail')}</p>
            </div>
          </section>
          <section className="rules-section">
            <span className="step-number">04</span>
            <div><h2>{t('rulesGuessTitle')}</h2><p>{t('rulesGuessText')}</p><p>{t('rulesGuessDetail')}</p></div>
          </section>
          <section className="rules-section rules-section--ending">
            <span className="step-number">05</span>
            <div><h2>{t('rulesEndTitle')}</h2><p>{t('rulesEndText')}</p></div>
          </section>
        </div>
        <div className="info-footer"><Link className="text-link" href="/">{t('backHome')}</Link></div>
      </div>
    </main>
  );
}
