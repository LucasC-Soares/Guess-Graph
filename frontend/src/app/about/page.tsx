'use client';

import Link from 'next/link';
import { SiteHeader } from '@/components/ui/site-header';
import { PROJECT_REPOSITORY_URL, LINKEDIN_URL } from '@/constants/links';
import { useI18n } from '@/lib/i18n-context';

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <main className="site-shell">
      <SiteHeader />
      <div className="page-frame info-page about-page">
        <section className="info-hero about-hero">
          <span className="hero-kicker">{t('aboutEyebrow')}</span>
          <h1 className="info-title">{t('aboutTitle')}</h1>
          <p className="hero-copy">{t('aboutIntro')}</p>
        </section>
        <section className="about-layout">
          <article className="about-story">
            <span className="eyebrow">{t('aboutOriginEyebrow')}</span>
            <h2>{t('aboutOriginTitle')}</h2>
            <p>{t('aboutOriginText')}</p>
            <p>{t('aboutStoryText')}</p>
            <p>{t('aboutTechText')}</p>
          </article>
          <aside className="about-links">
            <span className="eyebrow">{t('aboutLinksEyebrow')}</span>
            <a className="about-link" href={PROJECT_REPOSITORY_URL} rel="noreferrer" target="_blank">
              <span>{t('repositoryLabel')}</span><strong>GitHub <span aria-hidden="true">↗</span></strong>
            </a>
            <a className="about-link" href={LINKEDIN_URL} rel="noreferrer" target="_blank">
              <span>{t('linkedinLabel')}</span><strong>LinkedIn <span aria-hidden="true">↗</span></strong>
            </a>
          </aside>
        </section>
        <div className="info-footer"><Link className="text-link" href="/">{t('backHome')}</Link></div>
      </div>
    </main>
  );
}
