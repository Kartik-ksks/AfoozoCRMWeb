export const useMonitor = (
    redfish,
    uris,
    callback,
    forcePoll = false,
  ) => {
    useEffect(
      () => {
        // rules of hooks requires this check to be placed here, since we cannot
        // conditinally call useRedfishMonitor()
        if (uris[0]?.length) {
          const monitor = redfish.createMonitor(uris, callback, forcePoll);
          return () => redfish.rmMonitor(monitor);
        }
        return () => {};
      },
      // The dependency array is incomplete because callers are not careful
      // about ensuring invariant variables and memoized callbacks. Specifically,
      // 'uris' array is often dynamically created on each render as is the
      // 'callback'. If these are included in the dependency array, it results in
      // it results in an infinite loop.
      // One day, we may fix the callers, which would also provide a small
      // performance benefit.
      [redfish, uris[0]], // eslint-disable-line react-hooks/exhaustive-deps
    );
  };