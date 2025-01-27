import React, { useEffect, useState } from 'react';
import { Grommet } from 'grommet';
import theme from './Theme';
import { HashRouter } from 'react-router-dom';
import { ResponsiveProvider } from './context/responsive';
import MenuApp from './MenuApp';
import { SessionProvider } from './context/session';

if (!window.matchMedia) {
  // undefined when running jest tests
  window.devModeEnabled = true;
}

const mqlDarkScheme = window.matchMedia // undefined when running jest tests
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : (window.matchMedia = () => ({
    matches: false,
  }));

const App = () => {
  const [systemThemeMode, setSystemThemeMode] = useState(
    mqlDarkScheme.matches ? 'dark' : 'light',
  );
  let initialThemeMode = window.localStorage.getItem('themeMode');
  if (!['light', 'dark'].includes(initialThemeMode))
    initialThemeMode = systemThemeMode;
  const [themeMode, setThemeMode] = useState(initialThemeMode);

  useEffect(() => {
    if (themeMode === systemThemeMode)
      window.localStorage.removeItem('themeMode');
    else window.localStorage.setItem('themeMode', themeMode);
  }, [systemThemeMode, themeMode]); // do not fire when systemThemeMode changes

  const toggleThemeMode = () => {
    setThemeMode((p) => (p === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    if (!mqlDarkScheme.addEventListener) return; // for jest

    mqlDarkScheme.addEventListener('change', (e) => {
      if (e.matches) {
        setSystemThemeMode('dark');
        setThemeMode('dark');
      } else {
        setSystemThemeMode('light');
        setThemeMode('light');
      }
    });
  }, []);

  return (
    <React.StrictMode>
      <Grommet theme={theme} themeMode={themeMode} full>
        <SessionProvider>
          <HashRouter>
            <ResponsiveProvider>
              <MenuApp themeMode={themeMode} toggleThemeMode={toggleThemeMode} />
            </ResponsiveProvider>
          </HashRouter>
        </SessionProvider>
      </Grommet>
    </React.StrictMode>
  );
};

export default App;
