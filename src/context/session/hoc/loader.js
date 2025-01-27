import React, { useContext, useEffect, useState } from 'react';

import { SessionContext } from '../context';
import { LoadingLayer } from '../components';

export const withLoader = (WrappedComponent) => (props) => {
  const { redfish } = useContext(SessionContext);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    redfish.waitForFetches().then(() => {
      setLoading(false);
    });
  }, [redfish]);

  return loading ? (
    <>
      <WrappedComponent {...props} />
      <LoadingLayer />
    </>
  ) : (
    <WrappedComponent {...props} />
  );
};
