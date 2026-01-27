import { retrieveLaunchParams } from '@tma.js/sdk-react';
import { useMemo } from 'react';

import { Card, Section } from '@/components/ui';

export function EnvUnsupported() {
  const platform = useMemo(() => {
    try {
      const lp = retrieveLaunchParams();
      return lp.tgWebAppPlatform;
    } catch {
      return 'android';
    }
  }, []);

  return (
    <div className="env-unsupported">
      <Section title="Клиент не поддерживается">
        <Card variant="glass">
          <p>Ваш Telegram клиент и платформа: {platform}.</p>
          <p>Обновите приложение Telegram, чтобы открыть этот проект.</p>
        </Card>
      </Section>
    </div>
  );
}
