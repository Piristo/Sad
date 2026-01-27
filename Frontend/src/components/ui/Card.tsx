import type { HTMLAttributes, ReactNode } from 'react';

import { classNames } from '@/css/classnames.ts';

export type CardVariant = 'default' | 'glass' | 'accent';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  subtitle?: ReactNode;
  variant?: CardVariant;
}

export function Card({
  title,
  subtitle,
  variant = 'default',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={classNames('ui-card', `ui-card--${variant}`, className)}
      {...props}
    >
      {(title || subtitle) && (
        <header className="ui-card__header">
          {title && <h3 className="ui-card__title">{title}</h3>}
          {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
        </header>
      )}
      {children}
    </div>
  );
}
