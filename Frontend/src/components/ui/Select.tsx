import type { SelectHTMLAttributes } from 'react';

import { classNames } from '@/css/classnames.ts';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, ...props }: SelectProps) {
  return <select className={classNames('ui-select', className)} {...props} />;
}
