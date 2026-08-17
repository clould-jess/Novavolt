import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'inverse';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

type ButtonProps = BaseProps &
Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & {
  to?: string;
  href?: string;
};

const base =
'inline-flex items-center justify-center gap-2 rounded-pill font-semibold whitespace-nowrap transition-[background-color,color,box-shadow,transform,border-color] duration-200 ease-signature disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-action text-white hover:bg-action-dark hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0',
  secondary: 'bg-white text-ink border border-line hover:border-sky-400 hover:text-action hover:shadow-xs',
  ghost: 'bg-transparent text-action hover:bg-sky-50',
  danger: 'bg-bad text-white hover:bg-[#b91c1c]',
  inverse: 'bg-white text-ink hover:bg-sky-100'
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-2xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-base'
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  children,
  className,
  to,
  href,
  disabled,
  ...rest
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className);

  const content =
  <>
      {loading ? <Loader2Icon className="h-4 w-4 animate-spin-slow" aria-hidden="true" /> : iconLeft}
      <span>{children}</span>
      {!loading && iconRight}
    </>;


  if (to) {
    return (
      <Link to={to} className={classes} aria-disabled={disabled}>
        {content}
      </Link>);

  }

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>);

  }

  return (
    <button type="button" className={classes} disabled={disabled || loading} aria-busy={loading} {...rest}>
      {content}
    </button>);

}

/** Named aliases kept for design-system readability. */
export const PrimaryButton = (props: Omit<ButtonProps, 'variant'>) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props: Omit<ButtonProps, 'variant'>) => <Button variant="secondary" {...props} />;
export const GhostButton = (props: Omit<ButtonProps, 'variant'>) => <Button variant="ghost" {...props} />;