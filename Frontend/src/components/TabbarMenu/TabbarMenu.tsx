import type { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo, useCallback } from 'react';

import { Button } from '@/components/ui';
import { ROUTES } from '@/constants/routes.ts';

export const TabbarMenu: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = useMemo(
    () => [
      {
        id: 1,
        text: 'Главная',
        path: ROUTES.ENTER,
      },
      {
        id: 3,
        text: 'Ассистент',
        path: ROUTES.CHAT,
      },
      {
        id: 2,
        text: 'Профиль',
        path: ROUTES.MY_ACCOUNT,
      },
    ],
    []
  );

  const getInitialTab = useCallback(() => {
    const currentTab = tabs.find((tab) => tab.path === location.pathname);
    return currentTab ? currentTab.id : tabs[0].id;
  }, [tabs, location.pathname]);

  const [currentTab, setCurrentTab] = useState(getInitialTab());

  useEffect(() => {
    const currentTab = tabs.find((tab) => tab.path === location.pathname);
    if (currentTab) {
      setCurrentTab(currentTab.id);
    }
  }, [location.pathname, tabs]);

  const changePage = useCallback(
    (id: number) => {
      const tab = tabs.find((t) => t.id === id);
      if (tab) {
        setCurrentTab(id);
        navigate(tab.path);
      }
    },
    [tabs, navigate]
  );

  return (
    <div className="assistant__chips">
      {tabs.map(({ id, text }) => (
        <Button
          key={id}
          variant={id === currentTab ? 'primary' : 'chip'}
          onClick={() => changePage(id)}
        >
          {text}
        </Button>
      ))}
    </div>
  );
};
