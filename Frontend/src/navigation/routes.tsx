import type { ComponentType, JSX } from 'react';

import { IndexPage } from '@/pages/IndexPage/IndexPage';
import { Onboarding } from '@/pages/Onboarding/Onboarding';
import { EnterPage } from '@/pages/EnterPage/EnterPage';


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
   
];

