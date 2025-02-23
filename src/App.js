import React from 'react';
import { Grommet } from 'grommet';
import theme from './Theme';
import { HashRouter } from 'react-router-dom';
import { ResponsiveProvider } from './context/responsive';
import { SessionProvider } from './context/session';
import { MenuProvider } from './context/menu';
import MenuApp from './MenuApp';

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
  const systemThemeMode = mqlDarkScheme.matches ? 'dark' : 'light';
  let initialThemeMode = localStorage.getItem('themeMode');
  if (!initialThemeMode)
    initialThemeMode = systemThemeMode;
  const [themeMode, setThemeMode] = React.useState(initialThemeMode);

  React.useEffect(() => {
    const handler = (e) => {
      const mode = e.matches ? 'dark' : 'light';
      if (!localStorage.getItem('themeMode')) {
        setThemeMode(mode);
      }
    };
    mqlDarkScheme.addListener(handler);
    return () => {
      mqlDarkScheme.removeListener(handler);
    };
  }, []);

  const toggleThemeMode = () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    localStorage.setItem('themeMode', newMode);
    setThemeMode(newMode);
  };

  return (
    <React.StrictMode>
      <Grommet theme={theme} themeMode={themeMode} full>
        <HashRouter>
          <SessionProvider>
            <MenuProvider>
              <ResponsiveProvider>
                <MenuApp
                  themeMode={themeMode}
                  toggleThemeMode={toggleThemeMode}
                />
              </ResponsiveProvider>
            </MenuProvider>
          </SessionProvider>
        </HashRouter>
      </Grommet>
    </React.StrictMode>
  );
};

export default App;
