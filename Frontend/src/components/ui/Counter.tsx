import React, { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { useI18n } from '../../contexts/I18nContext';

interface CounterProps {
  to: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
  className?: string;
}

/** Counts from zero once the section enters the viewport. */
export function Counter({ to, suffix, prefix, durationMs = 1100, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion();
  const { num } = useI18n();
  const [value, setValue] = useState(reduced ? to : 0);

  useEffect(() => {
    if (!inView || reduced) return undefined;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * to));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, to, durationMs]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {num(value)}
      {suffix}
    </span>);

}