import React from 'react';
import { Link } from 'react-router-dom';
import { FacebookIcon, InstagramIcon, LinkedinIcon, MailIcon, PhoneIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { footerExplore, footerLegal } from '../../data/navigation';
import { Logo } from '../ui/Logo';
import { LanguageSwitcher } from './LanguageSwitcher';

const socials = [
{ key: 'footer.linkedin', icon: LinkedinIcon },
{ key: 'footer.instagram', icon: InstagramIcon },
{ key: 'footer.facebook', icon: FacebookIcon }];


export function Footer() {
  const { t } = useI18n();
  const phoneHref = `tel:${t('common.phone').replace(/[^\d+]/g, '')}`;

  return (
    <footer className="bg-ink text-sky-100/70">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(2,1fr)]">
          <div>
            <Logo variant="footer" />
            <p className="mt-4 max-w-sm text-2xs leading-relaxed">{t('footer.promise')}</p>
            <ul className="mt-5 flex gap-2" aria-label={t('footer.social')}>
              {socials.map(({ key, icon: Icon }) =>
              <li key={key}>
                  <a
                  href="#"
                  aria-label={t(key)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 text-sky-100/80 transition-colors duration-200 ease-signature hover:border-sky-400 hover:text-white">
                  
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              )}
            </ul>
          </div>

          <nav aria-label={t('footer.explore')}>
            <h2 className="text-2xs font-semibold text-white">{t('footer.explore')}</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {footerExplore.map((item) =>
              <li key={item.to}>
                  <Link to={item.to} className="nv-link text-2xs hover:text-white">
                    {t(item.labelKey)}
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div>
            <h2 className="text-2xs font-semibold text-white">{t('footer.contactTitle')}</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <a href={phoneHref} className="inline-flex items-center gap-2 text-2xs hover:text-white">
                  <PhoneIcon className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                  {t('common.phone')}
                </a>
              </li>
              <li>
                <a href={`mailto:${t('common.email')}`} className="inline-flex items-center gap-2 break-all text-2xs hover:text-white">
                  <MailIcon className="h-3.5 w-3.5 shrink-0 text-sky-400" aria-hidden="true" />
                  {t('common.email')}
                </a>
              </li>
              <li className="pt-2">
                <LanguageSwitcher tone="light" />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.8125rem]">{t('footer.copyright')}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {footerLegal.map((item) =>
            <li key={item.to}>
                <Link to={item.to} className="nv-link text-[0.8125rem] hover:text-white">
                  {t(item.labelKey)}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </footer>);

}
