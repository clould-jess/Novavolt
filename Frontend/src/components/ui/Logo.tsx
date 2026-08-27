import { Link } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import { cn } from '../../utils/cn';

interface LogoProps {
  tone?: 'dark' | 'light';
  className?: string;
  to?: string;
  compact?: boolean;
  transparent?: boolean;
  variant?: 'default' | 'transparent' | 'footer';
}

/**
 * Official Novavolt logo.
 *
 * Both supplied assets are square and contain space around a horizontal mark.
 * This viewport crops that space visually while keeping the source files
 * untouched and the logo legible in every layout.
 */
export function Logo({
  className,
  to = '/',
  compact = false,
  transparent = false,
  variant,
}: LogoProps) {
  const { t } = useI18n();
  const src =
    variant === 'footer'
      ? '/logo_foot.png'
      : transparent
        ? '/logo2.png'
        : '/logo.jpeg';
  const width = variant === 'footer' ? 512 : transparent ? 512 : 1254;
  const height = width;

  return (
    <Link
      to={to}
      className={cn(
        'block shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2',
        className
      )}
      aria-label={`${t('common.brand')} — ${t('common.tagline')}`}
    >
      <span
        className={cn(
          'relative block overflow-hidden',
          compact ? 'h-10 w-24' : 'h-12 w-32 sm:w-36'
        )}
      >
        <img
          src={src}
          alt={t('common.logoAlt')}
          width={width}
          height={height}
          className="absolute left-0 top-1/2 h-auto w-full -translate-y-1/2 select-none object-contain"
          draggable={false}
        />
      </span>
    </Link>
  );
}
