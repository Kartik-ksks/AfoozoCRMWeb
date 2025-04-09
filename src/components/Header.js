import { Apps } from 'grommet-icons';
import { useState, useEffect } from 'react';
import { Button } from 'grommet';

const Header = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobile);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      // Only process prompt on mobile devices
      if (mobile) {
        setDeferredPrompt(e);
        console.log('Install prompt available in header (mobile)');
      } else {
        console.log('Install prompt available in header, but ignored (desktop)');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

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