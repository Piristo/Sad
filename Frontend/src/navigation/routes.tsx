import type { ComponentType, JSX } from 'react';

import { IndexPage } from '@/pages/IndexPage/IndexPage';
import { Onboarding } from '@/pages/Onboarding/Onboarding';
import { EnterPage } from '@/pages/EnterPage/EnterPage';
import { ChatPage } from '@/pages/ChatPage/ChatPage';

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: EnterPage },
  { path: '/index', Component: IndexPage },
  { path: '/onboarding', Component: Onboarding },
  { path: '/chat', Component: ChatPage },
];

