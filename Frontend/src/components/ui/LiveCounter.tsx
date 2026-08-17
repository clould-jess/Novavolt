import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { useI18n } from '../../contexts/I18nContext';

interface LiveCounterProps {
  to: number;
  ratePerSecond?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
  className?: string;
}

/**
 * Counts up from zero upon entering the viewport, then continues ticking in real-time
 * based on `ratePerSecond`. Formats numbers automatically for FR/EN locales.
 */
export function LiveCounter({
  to,
  ratePerSecond = 0,
  decimals = 0,
  suffix = '',
  prefix = '',
  durationMs = 1200,
  className
}: LiveCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion();
  const { locale } = useI18n();

  const [currentValue, setCurrentValue] = useState(reduced ? to : 0);
  const [initialDone, setInitialDone] = useState(reduced);

  // Entrance count-up animation
  useEffect(() => {
    if (!inView || reduced) return undefined;
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      setCurrentValue(eased * to);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setCurrentValue(to);
        setInitialDone(true);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, to, durationMs]);

  // Real-time ticking after initial entrance animation
  useEffect(() => {
    if (!initialDone || ratePerSecond <= 0 || reduced) return undefined;

    const intervalMs = 100;
    const increment = ratePerSecond * (intervalMs / 1000);

    const timer = setInterval(() => {
      setCurrentValue((prev) => prev + increment);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [initialDone, ratePerSecond, reduced]);

  // Format value with exact decimals and locale rules
  const formatted = new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(currentValue);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
