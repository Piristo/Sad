import type { HTMLAttributes, ReactNode } from 'react';

import { classNames } from '@/css/classnames.ts';

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  hint?: ReactNode;
}

export function Section({ title, hint, className, children, ...props }: SectionProps) {
  return (
    <section className={classNames('ui-section', className)} {...props}>
      {(title || hint) && (
        <header className="ui-section__header">
          {title && <h2 className="ui-section__title">{title}</h2>}
          {hint && <p className="ui-section__hint">{hint}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
