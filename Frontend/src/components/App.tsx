import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { useLaunchParams } from '@tma.js/sdk-react';

import { routes } from '@/navigation/routes.tsx';

export function App() {
  const lp = useLaunchParams();

  return (
    <div className="app-root" data-platform={lp.tgWebAppPlatform}>
      <HashRouter>
        <Routes>
          {routes.map((route) => <Route key={route.path} {...route} />)}
          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
      </HashRouter>
    </div>
  );
}
