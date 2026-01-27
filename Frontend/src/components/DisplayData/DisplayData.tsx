import { isRGB } from '@tma.js/sdk-react';
import type { FC, ReactNode } from 'react';

import { RGB } from '@/components/RGB/RGB.tsx';
import { Link } from '@/components/Link/Link.tsx';
import { bem } from '@/css/bem.ts';
import { Card } from '@/components/ui';

import './DisplayData.css';

const [, e] = bem('display-data');

export type DisplayDataRow =
  & { title: string }
  & (
  | { type: 'link'; value?: string }
  | { value: ReactNode }
  )

export interface DisplayDataProps {
  header?: ReactNode;
  footer?: ReactNode;
  rows: DisplayDataRow[];
}

export const DisplayData: FC<DisplayDataProps> = ({ header, rows }) => (
  <Card variant="glass">
    {header && <div className="display-data__header">{header}</div>}
    {rows.map((item, idx) => {
      let valueNode: ReactNode;

      if (item.value === undefined) {
        valueNode = <i>empty</i>;
      } else {
        if ('type' in item) {
          valueNode = <Link to={item.value}>Open</Link>;
        } else if (typeof item.value === 'string') {
          valueNode = isRGB(item.value)
            ? <RGB color={item.value}/>
            : item.value;
        } else if (typeof item.value === 'boolean') {
          valueNode = item.value ? 'Да' : 'Нет';
        } else {
          valueNode = item.value;
        }
      }

      return (
        <div className={e('line')} key={idx}>
          <div className={e('line-title')}>{item.title}</div>
          <div className={e('line-value')}>{valueNode}</div>
        </div>
      );
    })}
  </Card>
);
