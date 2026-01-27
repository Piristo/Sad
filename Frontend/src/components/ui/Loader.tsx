import type { HTMLAttributes } from 'react';

import { classNames } from '@/css/classnames.ts';

export function Loader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classNames('ui-loader', className)} {...props} />;
}
