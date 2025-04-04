import React, { useEffect, useState } from 'react';
import { Box, Button, Layer, Text, Heading } from 'grommet';
import { Troubleshoot } from 'grommet-icons';

const PWADebug = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    // Collect debug information
    const info = {
      isHttps: window.location.protocol === 'https:',
      hasServiceWorker: 'serviceWorker' in navigator,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isOnline: navigator.onLine,
    };

    setDebugInfo(info);

    // Check if service worker is registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        setDebugInfo(prev => ({
          ...prev,
          serviceWorkerRegistrations: registrations.length
        }));
      });
    }
  }, []);

  if (!showDebug) {
    return (
      <Button
        icon={<Troubleshoot />}
        onClick={() => setShowDebug(true)}
        style={{ position: 'fixed', bottom: '10px', right: '10px', opacity: 0.5 }}
      />
    );
  }

  return (
    <Layer
      onEsc={() => setShowDebug(false)}
      onClickOutside={() => setShowDebug(false)}
    >
      <Box pad="medium" gap="small" width="large">
        <Heading level={3}>PWA Debug Info</Heading>
        <Box border={{ color: 'border-weak', size: '1px' }} round="small" pad="small">
          {Object.entries(debugInfo).map(([key, value]) => (
            <Text key={key}><strong>{key}:</strong> {JSON.stringify(value)}</Text>
          ))}
        </Box>
        <Button label="Close" onClick={() => setShowDebug(false)} />
      </Box>
    </Layer>
  );
};

export default PWADebug;