'use client';
import { solutionCopy } from '@/lib/solution-copy';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';
export function Navigation({ t, locale }: { t: Dictionary; locale: Locale }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="container nav-inner">
        <Link href="/" className="wordmark" aria-label="BUHARIY TECH — bosh sahifa">
          BUHARIY<span>TECH</span>
        </Link>
        <nav
          className={open ? 'nav-links open' : 'nav-links'}
          aria-label="Asosiy navigatsiya"
          id="main-nav"
        >
          {[
            ['/services', t.nav[0]],
            ['/#solutions', solutionCopy[locale].nav],
            ['/portfolio', t.nav[1]],
            ['/about', t.nav[2]],
            ['/contact', t.nav[3]],
          ].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <select
            aria-label="Til / Язык / Language"
            value={locale}
            onChange={(e) => {
              document.cookie = `bt_locale=${e.target.value};path=/;max-age=31536000;samesite=lax`;
              location.reload();
            }}
          >
            {['uz', 'ru', 'en'].map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
          <Link className="button small nav-cta" href="/contact">
            {t.start}
            <ArrowUpRight size={17} />
          </Link>
          <button
            className="menu-toggle"
            aria-label={open ? 'Menyuni yopish' : 'Menyuni ochish'}
            aria-expanded={open}
            aria-controls="main-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
