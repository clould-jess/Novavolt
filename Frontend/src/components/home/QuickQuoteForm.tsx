import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { DatePicker } from '../ui/DatePicker';
import { Select } from '../ui/Select';

interface QuickQuoteFormProps {
  className?: string;
}

/** Hero availability form. Feeds the catalogue query string — ready for a real search endpoint. */
export function QuickQuoteForm({ className }: QuickQuoteFormProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [city, setCity] = useState('montreal');
  const [type, setType] = useState('weekly');
  const [start, setStart] = useState('2026-08-21');
  const [end, setEnd] = useState('2026-08-28');

  return (
    <form
      className={cn('rounded-card border border-line bg-white/95 p-4 shadow-card backdrop-blur sm:p-5', className)}
      onSubmit={(event) => {
        event.preventDefault();
        navigate(`/vehicules?ville=${city}&type=${type}&debut=${start}&fin=${end}`);
      }}>
      
      <p className="mb-4 flex items-center gap-2 text-2xs font-semibold text-ink">
        <SearchIcon className="h-4 w-4 text-action" aria-hidden="true" />
        {t('hero.quote.title')}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          id="quote-city"
          label={t('hero.quote.city')}
          value={city}
          onChange={(event) => setCity(event.target.value)}
          options={[
          { value: 'montreal', label: t('cities.montreal') },
          { value: 'toronto', label: t('cities.toronto') },
          { value: 'ottawa', label: t('cities.ottawa') },
          { value: 'vancouver', label: t('cities.vancouver') }]
          } />
        
        <Select
          id="quote-type"
          label={t('hero.quote.type')}
          value={type}
          onChange={(event) => setType(event.target.value)}
          options={[
          { value: 'daily', label: t('hero.quote.typeDaily') },
          { value: 'weekly', label: t('hero.quote.typeWeekly') },
          { value: 'monthly', label: t('hero.quote.typeMonthly') }]
          } />
        
        <DatePicker id="quote-start" label={t('hero.quote.start')} value={start} onChange={setStart} />
        <DatePicker id="quote-end" label={t('hero.quote.end')} value={end} onChange={setEnd} min={start} />
      </div>
      <div className="mt-4">
        <Button type="submit" fullWidth size="lg">
          {t('hero.quote.cta')}
        </Button>
      </div>
    </form>);

}