'use client';

import { Locale } from '@/lib/i18n';

interface LanguageSwitcherProps {
  locale: Locale;
  onChange: (locale: Locale) => void;
}

export function LanguageSwitcher({ locale, onChange }: LanguageSwitcherProps) {
  return (
    <div className="language-switcher" aria-label="Language">
      {(['pt', 'en'] as Locale[]).map((option) => (
        <button
          className={locale === option ? 'language-switcher__option is-active' : 'language-switcher__option'}
          key={option}
          onClick={() => onChange(option)}
          type="button"
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}