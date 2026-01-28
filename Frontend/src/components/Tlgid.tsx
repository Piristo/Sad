// import { initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';
import { initData , useSignal } from '@tma.js/sdk-react';

export const useTlgid = () => {
  const user = useSignal(initData.user);
  const tlgid = user?.id;

  if (tlgid) {
    return tlgid;
  }

  const fallbackId = (window as unknown as { Telegram?: { WebApp?: { initDataUnsafe?: { user?: { id?: number } } } } })
    ?.Telegram
    ?.WebApp
    ?.initDataUnsafe
    ?.user
    ?.id;

  return fallbackId;
};
