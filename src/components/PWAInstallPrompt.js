import React, { useState, useEffect } from 'react';
import { Box, Button, Layer, Heading, Text } from 'grommet';
import { Install } from 'grommet-icons';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the prompt to the user
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    // Hide the prompt
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

  if (!showPrompt) return null;

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