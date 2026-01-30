import { emitEvent, isTMA, mockTelegramEnv } from '@tma.js/sdk-react';

export async function setupMockEnv() {
  // Check if we are already in TMA environment
  if (await isTMA('complete')) {
    return;
  }

  const themeParams = {
    accent_text_color: '#6ab2f2',
    bg_color: '#17212b',
    button_color: '#5288c1',
    button_text_color: '#ffffff',
    destructive_text_color: '#ec3942',
    header_bg_color: '#17212b',
    hint_color: '#708499',
    link_color: '#6ab3f3',
    secondary_bg_color: '#232e3c',
    section_bg_color: '#17212b',
    section_header_text_color: '#6ab3f3',
    subtitle_text_color: '#708499',
    text_color: '#f5f5f5',
  } as const;
  
  const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;

  mockTelegramEnv({
    onEvent(e) {
      if (e.name === 'web_app_request_theme') {
        return emitEvent('theme_changed', { theme_params: themeParams });
      }
      if (e.name === 'web_app_request_viewport') {
        return emitEvent('viewport_changed', {
          height: window.innerHeight,
          width: window.innerWidth,
          is_expanded: true,
          is_state_stable: true,
        });
      }
      if (e.name === 'web_app_request_content_safe_area') {
        return emitEvent('content_safe_area_changed', noInsets);
      }
      if (e.name === 'web_app_request_safe_area') {
        return emitEvent('safe_area_changed', noInsets);
      }
    },
    launchParams: new URLSearchParams([
      ['tgWebAppThemeParams', JSON.stringify(themeParams)],
      ['tgWebAppData', new URLSearchParams([
        ['auth_date', (new Date().getTime() / 1000 | 0).toString()],
        ['hash', 'mock-hash'],
        ['signature', 'mock-signature'],
        ['user', JSON.stringify({ id: 12345, first_name: 'Web User', username: 'web_user' })],
      ]).toString()],
      ['tgWebAppVersion', '7.0'],
      ['tgWebAppPlatform', 'web'],
    ]),
  });

  // Add WebApp properties for haptic and cloud storage
  if (typeof window !== 'undefined') {
    (window as any).Telegram = {
      WebApp: {
        HapticFeedback: {
          impactOccurred: () => {},
          notificationOccurred: () => {},
          selectionChanged: () => {},
        },
        CloudStorage: {
          setItem: (_key: string, _value: string, callback?: (error: Error | null, stored: boolean) => void) => {
            if (callback) callback(null, true);
          },
          getItem: (_key: string, callback: (error: Error | null, value: string) => void) => {
            callback(null, '');
          },
          getItems: (_keys: string[], callback: (error: Error | null, values: Record<string, string>) => void) => {
            callback(null, {});
          },
          removeItem: (_key: string, callback?: (error: Error | null, removed: boolean) => void) => {
            if (callback) callback(null, true);
          },
          removeItems: (_keys: string[], callback?: (error: Error | null, removed: boolean) => void) => {
            if (callback) callback(null, true);
          },
        },
      },
    };
  }

  console.info('⚠️ Environment mocked for Web usage');
}
