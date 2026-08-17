import { useState } from 'react';
import { FuelIcon, SparklesIcon, ZapIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface SavingsCalculatorProps {
  className?: string;
  defaultWeeklyKm?: number;
}

export function SavingsCalculator({ className, defaultWeeklyKm = 800 }: SavingsCalculatorProps) {
  const { t, money } = useI18n();
  const [weeklyKm, setWeeklyKm] = useState(defaultWeeklyKm);

  // Financial assumptions for Canadian market (Gas vs EV)
  // Gas car: ~10 L/100km @ $1.65/L = $0.165/km + ~ $0.025/km extra maintenance = $0.190/km
  // EV: ~18 kWh/100km @ $0.11/kWh = $0.0198/km + minimal maintenance = $0.025/km
  const gasCostPerKm = 0.19;
  const evCostPerKm = 0.025;

  const weeklyGasCost = weeklyKm * gasCostPerKm;
  const weeklyEvCost = weeklyKm * evCostPerKm;

  const monthlyGasCost = weeklyGasCost * 4.33;
  const monthlyEvCost = weeklyEvCost * 4.33;
  const monthlySavings = monthlyGasCost - monthlyEvCost;
  const annualSavings = monthlySavings * 12;

  const evPercentageOfGas = Math.round((monthlyEvCost / monthlyGasCost) * 100);

  return (
    <Card tone="soft" className={`overflow-hidden p-6 sm:p-8 lg:p-10 ${className || ''}`}>
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-action/20 bg-action/10 px-3.5 py-1 text-2xs font-semibold text-action">
            <SparklesIcon className="h-3.5 w-3.5" />
            {t('calculator.badge')}
          </span>
          <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {t('calculator.title')}
          </h3>
          <p className="mt-2 text-2xs text-muted">
            {t('calculator.subtitle')}
          </p>
        </div>

        {/* Interactive Slider Section */}
        <div className="mt-8 rounded-card border border-line bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <label htmlFor="km-slider" className="font-display text-sm font-semibold text-ink">
              {t('calculator.sliderLabel')}
            </label>
            <div className="flex items-baseline gap-1.5 font-display text-2xl font-bold text-action">
              <span>{weeklyKm.toLocaleString()}</span>
              <span className="text-2xs font-semibold text-muted">km / {t('calculator.week')}</span>
            </div>
          </div>

          <input
            id="km-slider"
            type="range"
            min={200}
            max={2500}
            step={50}
            value={weeklyKm}
            onChange={(e) => setWeeklyKm(Number(e.target.value))}
            className="mt-6 h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-action focus:outline-none"
          />

          <div className="mt-2 flex justify-between text-[0.75rem] font-semibold text-muted">
            <span>200 km ({t('calculator.casual')})</span>
            <span>1 200 km ({t('calculator.proVtc')})</span>
            <span>2 500 km ({t('calculator.intensive')})</span>
          </div>

          {/* Savings Highlight Box */}
          <div className="mt-8 rounded-xl bg-slate-950 p-6 text-white shadow-lg">
            <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                  {t('calculator.monthlySavingsLabel')}
                </p>
                <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-emerald-400 sm:text-4xl">
                  {money(monthlySavings)} <span className="text-xs font-medium text-slate-300">/ {t('calculator.month')}</span>
                </p>
                <p className="mt-1 text-2xs text-slate-400">
                  {t('calculator.annualEstimate')} <strong className="text-white">{money(annualSavings)}</strong> / {t('calculator.year')}
                </p>
              </div>

              <Button to="/vehicules" variant="primary" size="md">
                {t('calculator.cta')}
              </Button>
            </div>

            {/* Visual Comparison Progress Bar */}
            <div className="mt-6 border-t border-slate-800 pt-6">
              <div className="flex justify-between text-2xs font-semibold">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <FuelIcon className="h-3.5 w-3.5" />
                  {t('calculator.gasCost')}: {money(monthlyGasCost)}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ZapIcon className="h-3.5 w-3.5" />
                  {t('calculator.evCost')}: {money(monthlyEvCost)}
                </span>
              </div>

              <div className="mt-2.5 h-3.5 w-full overflow-hidden rounded-full bg-rose-500/20 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${evPercentageOfGas}%` }}
                />
              </div>

              <p className="mt-2 text-center text-[0.7rem] text-slate-400">
                {t('calculator.comparisonNote', { percent: String(100 - evPercentageOfGas) })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
