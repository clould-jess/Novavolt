import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface RevealProps {
  children: React.ReactNode;
  /** Index inside a grid/list to stagger the entrance (30–60 ms per item). */
  index?: number;
  className?: string;
  as?: 'div' | 'li' | 'section' | 'article';
  distance?: number;
}

/** Fade-in with a small upward move. Used for cards, images, stats and content blocks. */
export function Reveal({ children, index = 0, className, as = 'div', distance = 14 }: RevealProps) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Component
      className={cn(className)}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1], delay: Math.min(index, 6) * 0.045 }}>
      
      {children}
    </Component>);

}