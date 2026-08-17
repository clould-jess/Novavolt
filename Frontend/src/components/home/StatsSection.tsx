import { ActivityIcon, CarIcon, LeafIcon, SparklesIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { LiveCounter } from '../ui/LiveCounter';
import { Reveal } from '../ui/Reveal';
import { SectionTitle } from '../ui/SectionTitle';

export function StatsSection() {
  const { t } = useI18n();

  const stats = [
    {
      id: 'evCars',
      to: 1000,
      prefix: '+',
      suffix: '',
      rate: 0,
      decimals: 0,
      icon: CarIcon,
      accentColor: 'bg-sky-50 text-action border-sky-100'
    },
    {
      id: 'kmDriven',
      to: 87112186,
      prefix: '',
      suffix: ' km',
      rate: 2.315, // ~2.315 km added per second
      decimals: 0,
      icon: ActivityIcon,
      accentColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      isLive: true
    },
    {
      id: 'co2Saved',
      to: 5077637.94,
      prefix: '',
      suffix: ' kg',
      rate: 0.1349, // ~0.1349 kg CO2 saved per second
      decimals: 2,
      icon: LeafIcon,
      accentColor: 'bg-teal-50 text-teal-600 border-teal-100',
      isLive: true
    },
    {
      id: 'satisfaction',
      to: 99.4,
      prefix: '',
      suffix: ' %',
      rate: 0,
      decimals: 1,
      icon: SparklesIcon,
      accentColor: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    }
  ];

  return (
    <section className="relative border-y border-line bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="relative mx-auto max-w-content">
        <div className="flex flex-col items-center text-center">
          {/* Live Indicator Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {t('common.live') || 'En direct'}
          </div>

          {/* Pure White Header with Animated Underline */}
          <SectionTitle
            as="h2"
            variant={3}
            align="center"
            tone="dark"
            title={t('stats.title')}
            subtitle={t('stats.subtitle')}
            className="mx-auto max-w-2xl"
          />
        </div>

        {/* Stats Grid Cards */}
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {stats.map(({ id, to, prefix, suffix, rate, decimals, icon: Icon, accentColor, isLive }, index) => (
            <Reveal as="li" key={id} index={index}>
              <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-line bg-white p-6 shadow-sm transition-all duration-300 hover:border-action/40 hover:shadow-xl">
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`grid h-11 w-11 place-items-center rounded-xl border ${accentColor}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {isLive && (
                      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-emerald-700">
                        Live
                      </span>
                    )}
                  </div>

                  <p className="mt-6 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                    <LiveCounter
                      to={to}
                      ratePerSecond={rate}
                      decimals={decimals}
                      prefix={prefix}
                      suffix={suffix}
                    />
                  </p>
                </div>

                <p className="mt-3 text-sm font-medium leading-snug text-muted">
                  {t(`stats.${id}`)}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}