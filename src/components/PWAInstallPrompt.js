import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, Layer, Heading, Text } from 'grommet';
import { Install, AppsRounded } from 'grommet-icons';
import { ResponsiveContext } from '../context/responsive';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { isMobile } = useContext(ResponsiveContext);

  useEffect(() => {
    // Check if the app is already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show our custom prompt only if on mobile
      if (isMobile) {
        setShowPrompt(true);
        console.log('Install prompt was triggered on mobile');
      } else {
        console.log('Install prompt was triggered but suppressed on desktop');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For debugging
    console.log('PWA Install Prompt component mounted, isMobile:', isMobile);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isMobile]);

  const handleInstallClick = () => {
    // Hide our custom prompt
    setShowPrompt(false);

    // Show the install prompt
    if (deferredPrompt) {
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        // Clear the saved prompt since it can't be used again
        setDeferredPrompt(null);
      });
    }
  };

  // If not mobile, already installed, or no prompt available, don't show anything
  if (!isMobile || isStandalone || (!showPrompt && !isIOS)) return null;

  // Show iOS-specific instructions
  if (isIOS) {
    return (
      <Layer
        position="bottom"
        modal={false}
        margin={{ vertical: 'medium', horizontal: 'medium' }}
        responsive={false}
        animation="slide"
      >
        <Box
          pad="medium"
          gap="medium"
          round="small"
          background="dark-1"
          elevation="medium"
        >
          <Box direction="row" gap="medium" align="center">
            <AppsRounded size="medium" color="brand" />
            <Box>
              <Heading level={4} margin="none">Install Afoozo CRM</Heading>
              <Text size="small">
                Tap <Text weight="bold">Share</Text> then <Text weight="bold">Add to Home Screen</Text>
              </Text>
            </Box>
          </Box>
          <Box direction="row" gap="medium" justify="end">
            <Button
              label="Got it"
              onClick={() => setShowPrompt(false)}
              primary
              color="brand"
            />
          </Box>
        </Box>
      </Layer>
    );
  }

  // Show standard prompt for other browsers
  return (
    <Layer
      position="bottom"
      modal={false}
      margin={{ vertical: 'medium', horizontal: 'medium' }}
      responsive={false}
      animation="slide"
    >
      <Box
        pad="medium"
        gap="medium"
        round="small"
        background="dark-1"
        elevation="medium"
      >
        <Box direction="row" gap="medium" align="center">
          <Install size="medium" color="brand" />
          <Box>
            <Heading level={4} margin="none">Install Afoozo CRM</Heading>
            <Text size="small">Add to your home screen for quick access</Text>
          </Box>
        </Box>
        <Box direction="row" gap="medium" justify="end">
          <Button
            label="Not now"
            onClick={() => setShowPrompt(false)}
            plain
          />
          <Button
            primary
            color="brand"
            label="Install"
            onClick={handleInstallClick}
          />
        </Box>
      </Box>
    </Layer>
  );
};

export default PWAInstallPrompt;