import type { InputHTMLAttributes } from 'react';

import { classNames } from '@/css/classnames.ts';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return <input className={classNames('ui-input', className)} {...props} />;
}
