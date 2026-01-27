import type { ButtonHTMLAttributes } from 'react';

import { classNames } from '@/css/classnames.ts';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'chip';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classNames('ui-button', `ui-button--${variant}`, className)}
      {...props}
    />
  );
}
