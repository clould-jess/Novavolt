import React, { useId } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface SectionTitleProps {
  as?: 'h1' | 'h2';
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Chooses one of the signature stroke shapes so no two sections match exactly. */
  variant?: 0 | 1 | 2 | 3;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
  size?: 'display' | 'section';
  className?: string;
  id?: string;
}

/** Signature stroke paths: different length, curvature and start point per variant. */
const strokes = [
{ d: 'M2 8C46 2 118 3 186 6', width: 190 },
{ d: 'M4 7C58 12 96 2 148 5', width: 152 },
{ d: 'M2 6C40 6 84 9 124 4', width: 128 },
{ d: 'M3 9C70 1 152 4 218 7', width: 222 }];


export function SectionTitle({
  as = 'h2',
  eyebrow,
  title,
  subtitle,
  variant = 0,
  align = 'left',
  tone = 'dark',
  size = 'section',
  className,
  id
}: SectionTitleProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reduced = useReducedMotion();
  const headingId = useId();
  const stroke = strokes[variant];
  const Heading = as;

  const shouldAnimate = !reduced;
  const active = reduced || inView;

  return (
    <div
      ref={ref}
      id={id}
      className={cn('flex flex-col', align === 'center' ? 'items-center text-center' : 'items-start', className)}>
      
      {eyebrow &&
      <span
        className={cn(
          'mb-3 inline-flex items-center gap-2 text-2xs font-semibold',
          tone === 'dark' ? 'text-action' : 'text-sky-400'
        )}>
        
          <span className={cn('h-px w-6', tone === 'dark' ? 'bg-action' : 'bg-sky-400')} aria-hidden="true" />
          {eyebrow}
        </span>
      }

      <motion.div
        initial={shouldAnimate ? { opacity: 0, y: 16 } : false}
        animate={active ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.42, ease: [0.23, 1, 0.32, 1] }}>
        
        <Heading
          id={headingId}
          className={cn(
            'font-display tracking-[-0.03em]',
            size === 'display' ?
            'text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-[3.75rem]' :
            'text-3xl font-semibold leading-[1.12] sm:text-4xl',
            tone === 'dark' ? 'text-ink' : 'text-white'
          )}>
          
          {title}
        </Heading>
      </motion.div>

      <svg
        viewBox={`0 0 ${stroke.width} 12`}
        width={stroke.width}
        height={12}
        className={cn('mt-3 max-w-full', align === 'center' && 'mx-auto')}
        aria-hidden="true"
        focusable="false">
        
        <motion.path
          d={stroke.d}
          fill="none"
          stroke={tone === 'dark' ? '#38BDF8' : '#7DD3FC'}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
          animate={active ? { pathLength: 1, opacity: 1 } : undefined}
          transition={{ duration: 0.75, delay: 0.14, ease: [0.23, 1, 0.32, 1] }} />
        
      </svg>

      {subtitle &&
      <motion.p
        initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
        animate={active ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.3, delay: 0.18, ease: [0.23, 1, 0.32, 1] }}
        className={cn(
          'mt-4 max-w-2xl text-base leading-relaxed sm:text-[1.0625rem]',
          tone === 'dark' ? 'text-muted' : 'text-sky-100/80'
        )}>
        
          {subtitle}
        </motion.p>
      }
    </div>);

}