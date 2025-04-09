import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Service worker registration
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/serviceWorker.js')
        .then(registration => {
          console.log('Service Worker registered successfully:', registration.scope);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, refresh the page
                if (window.confirm('New version available! Click OK to refresh.')) {
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }
};

// Register the service worker
registerServiceWorker();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);