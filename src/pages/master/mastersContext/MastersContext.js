/**
 * CONFIDENTIAL (C) Copyright 2023 Hewlett Packard Enterprise Development LP
 *
 * Implement Logs Context.
 *
 */

import React, { createContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

export const Context = createContext({});
Context.displayName = 'MastersContext';

export const Provider = (props) => {
  const { children } = props;

  // Use State to keep the values
  const [groupBy, setGroupBy] = useState();

  // Make the context object:
  const providedContext = useMemo(
    () => ({
      groupBy,
      setGroupBy,
    }),
    [groupBy],
  );

  // pass the value in provider and return
  return (
    <Context.Provider value={providedContext}>{children}</Context.Provider>
  );
};

export const { Consumer } = Context;

Provider.propTypes = {
  children: PropTypes.node,
};

Provider.defaultProps = {
  children: null,
};
