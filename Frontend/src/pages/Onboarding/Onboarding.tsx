import type { FC } from 'react';

import { Page } from '@/components/Page.tsx';
import { Card, Section, Button } from '@/components/ui';

export const Onboarding: FC = () => {
  return (
    <Page back={false}>
      <Section title="Добро пожаловать">
        <Card variant="accent">
          <p>
            Здесь вы сможете планировать посадки и уход за растениями с опорой
            на традиции лунного календаря.
          </p>
          <Button variant="primary">Начать</Button>
        </Card>
      </Section>
    </Page>
  );
};
