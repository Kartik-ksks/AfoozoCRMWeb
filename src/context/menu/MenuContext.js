/**
 * CONFIDENTIAL (C) Copyright 2020-2021 Hewlett Packard Enterprise Development LP
 *
 * Implement a custom menu and make it available as Context.
 *
 * NOTE: The menu data structure is exported.
 */

import React, { createContext, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import menus from './menuData';

// window.menus = menus;

export const Context = createContext({});
Context.displayName = 'MenuContext'; // for devTools

export const Provider = (props) => {
  // console.log('[MenuContext] Provider', props);

  const { children } = props;

  const searchRoute = useCallback((item, route) => {
    // console.log('searchRoute:', item, { route });

    if (item.route?.toLowerCase() === route.toLowerCase()) return item;
    if (!item.items) return null;

    // perform recursive search of items array
    let found = null;
    for (let idx = 0; !found && idx < item.items.length; idx += 1) {
      found = searchRoute(item.items[idx], route);
    }
    return found;
  }, []);

  const lookupMenuItem = useCallback(
    (route) => {
      if (!route) return null;
      let found = null;
      for (let menuIdx = 0; !found && menuIdx < menus.length; menuIdx += 1) {
        found = searchRoute(menus[menuIdx], route);
      }
      return found;
    },
    [searchRoute],
  );

  // Make the context object:
  const providedContext = useMemo(
    () => ({
      lookupMenuItem,
      menus,
    }),
    [lookupMenuItem],
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
