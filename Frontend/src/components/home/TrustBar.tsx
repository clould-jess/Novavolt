import React from 'react';
import { BatteryChargingIcon, CalendarRangeIcon, HeadphonesIcon, ReceiptIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { Reveal } from '../ui/Reveal';

const items = [
{ key: 'trust.electric', icon: BatteryChargingIcon },
{ key: 'trust.transparent', icon: ReceiptIcon },
{ key: 'trust.support', icon: HeadphonesIcon },
{ key: 'trust.availability', icon: CalendarRangeIcon }];


export function TrustBar() {
  const { t } = useI18n();

  return (
    <section className="border-b border-line bg-white py-8">
      <div className="mx-auto flex max-w-content flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="max-w-xs font-display text-base font-semibold tracking-[-0.02em] text-ink">{t('trust.title')}</p>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-4 lg:flex lg:items-center lg:gap-8">
          {items.map(({ key, icon: Icon }, index) =>
          <Reveal as="li" key={key} index={index} className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-50 text-action" aria-hidden="true">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-2xs font-semibold text-body">{t(key)}</span>
            </Reveal>
          )}
        </ul>
      </div>
    </section>);

}