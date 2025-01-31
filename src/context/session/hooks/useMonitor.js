import { useEffect } from 'react';

export default function useMonitor(
    client,
    uris,
    callback,
    forcePoll = false,
  ) {
    useEffect(
      () => {
        if (uris[0]?.length) {
          const monitor = client.createMonitor(uris, callback, forcePoll);
          return () => client.rmMonitor(monitor);
        }
        return () => {};
      },
      [client, uris[0]],
    );
}