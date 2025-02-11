import React, { createContext, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

export const Context = createContext({
  menus: [],
  lookupMenuItem: () => null,
});

Context.displayName = 'MenuContext';

export const Provider = ({ children, menuData }) => {
  const processedMenus = Array.isArray(menuData) ? menuData : [];

  const searchRoute = useCallback((item, route) => {
    if (item.route?.toLowerCase() === route.toLowerCase()) return item;
    if (!item.items) return null;

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
      for (let menuIdx = 0; !found && menuIdx < processedMenus.length; menuIdx += 1) {
        found = searchRoute(processedMenus[menuIdx], route);
      }
      return found;
    },
    [searchRoute, processedMenus],
  );

  const value = useMemo(
    () => ({
      menus: processedMenus,
      lookupMenuItem,
    }),
    [processedMenus, lookupMenuItem],
  );

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};

export const { Consumer } = Context;

Provider.propTypes = {
  children: PropTypes.node.isRequired,
  menuData: PropTypes.array,
};

Provider.defaultProps = {
  menuData: [],
};
