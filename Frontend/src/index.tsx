import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { retrieveLaunchParams } from '@tma.js/sdk-react';

import { Root } from '@/components/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';

import './index.css';

// Import setupMockEnv
import { setupMockEnv } from './mockEnv.ts';

const root = ReactDOM.createRoot(document.getElementById('root')!);

async function bootstrap() {
  try {
    // Try to retrieve launch params. If it fails, we are likely outside of Telegram.
    let launchParams;
    try {
      launchParams = retrieveLaunchParams();
    } catch (e) {
      // If retrieval fails, setup mock environment
      await setupMockEnv();
      launchParams = retrieveLaunchParams();
    }

    const { tgWebAppPlatform: platform } = launchParams;
    const debug = (launchParams.tgWebAppStartParam || '').includes('debug')
      || import.meta.env.DEV;

    // Configure all application dependencies.
    await init({
      debug,
      eruda: debug && ['ios', 'android'].includes(platform),
      mockForMacOS: platform === 'macos',
    });

    root.render(
      <StrictMode>
        <Root/>
      </StrictMode>,
    );
  } catch (e) {
    console.error(e);
    root.render(<EnvUnsupported/>);
  }
}

bootstrap();
