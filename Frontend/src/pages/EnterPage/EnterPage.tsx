import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from '@/axios';
import { useTlgid } from '@/components/Tlgid';
import { Page } from '@/components/Page';
import { Card, Loader, Section } from '@/components/ui';

export const EnterPage: FC = () => {
  const navigate = useNavigate();
  const tlgid = useTlgid();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tlgid) {
      const timer = window.setTimeout(() => {
        navigate('/index');
      }, 2000);
      return () => window.clearTimeout(timer);
    }

    const fetchEnter = async () => {
      try {
        const response = await axios.post('/enter', { tlgid: tlgid });

        if (!response || response.data.statusBE === 'notOk') {
          setIsLoading(false);
          navigate('/index');
          return;
        }

        const { result } = response.data.userData || {};

        if (result === 'showOnboarding') {
          navigate('/onboarding');
        } else if (result === 'showIndexPage') {
          navigate('/index');
        } else {
          navigate('/index');
        }
      } catch (error) {
        setIsLoading(false);
        navigate('/index');
      }
    };
    fetchEnter();
  }, [tlgid, navigate]);

  return (
    <Page>
      <Section title="Подключаем теплицу">
        <Card variant="glass">
          {isLoading ? (
            <Loader />
          ) : (
            <p>Не удалось подключиться. Попробуйте позже.</p>
          )}
        </Card>
      </Section>
    </Page>
  );
};
