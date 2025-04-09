import { Apps } from 'grommet-icons';
import { useState, useEffect, useContext } from 'react';
import { ResponsiveContext } from '../context/responsive';
import { Button } from 'grommet';

const Header = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const { isMobile } = useContext(ResponsiveContext);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      // Only save prompt for mobile devices
      if (isMobile) {
        setDeferredPrompt(e);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isMobile]);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
    });
  };

  return (
    <div>
      {deferredPrompt && isMobile && (
        <Button
          icon={<Apps color="brand" />}
          onClick={handleInstallClick}
          tip="Install App"
        />
      )}
    </div>
  );
};

export default Header;