import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
  className?: string;
}

export function Accordion({ items, defaultOpenId, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);

  return (
    <div className={cn('divide-y divide-line border-y border-line', className)}>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`panel-${item.id}`}
                id={`accordion-${item.id}`}
                onClick={() => setOpenId(open ? null : item.id)}
                className="flex w-full items-start justify-between gap-4 py-5 text-left transition-colors duration-200 ease-signature hover:text-action">
                
                <span className="text-base font-semibold text-ink">{item.question}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors duration-200',
                    open ? 'border-action bg-action text-white' : 'border-line text-muted'
                  )}>
                  
                  {open ? <MinusIcon className="h-3.5 w-3.5" /> : <PlusIcon className="h-3.5 w-3.5" />}
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {open &&
              <motion.div
                id={`panel-${item.id}`}
                role="region"
                aria-labelledby={`accordion-${item.id}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden">
                
                  <p className="max-w-3xl pb-5 pr-10 text-sm leading-relaxed text-muted">{item.answer}</p>
                </motion.div>
              }
            </AnimatePresence>
          </div>);

      })}
    </div>);

}