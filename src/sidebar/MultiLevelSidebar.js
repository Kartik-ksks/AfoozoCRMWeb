 import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import MultiLevelMenus from './MultiLevelMenus';
import { MenuContext } from '../context/menu';

const processMenu = (menu) => {
  if (!menu) return null;

  // Add depth
  const addItemDepth = (item, depth) => {
    const newItem = { ...item, depth };
    if (item.items) {
      newItem.items = item.items.map(i => addItemDepth(i, depth + 1));
    }
    return newItem;
  };

  // Add route
  const addRoute = (item, basePath = '') => {
    const newItem = { ...item };
    newItem.route = `${basePath}/${item.path || ''}`.replace(/\/+/g, '/');
    if (item.items) {
      newItem.items = item.items.map(i => addRoute(i, newItem.route));
    }
    return newItem;
  };

  return addRoute(addItemDepth(menu, 0));
};

const MultiLevelSidebar = ({ compact }) => {
  const { menus = [] } = useContext(MenuContext);

  const processedMenus = useMemo(() => {
    if (!Array.isArray(menus)) return [];
    return menus.map(processMenu).filter(Boolean);
  }, [menus]);

  return <MultiLevelMenus menus={processedMenus} compact={compact} />;
};

MultiLevelSidebar.propTypes = {
  compact: PropTypes.bool,
};

export default MultiLevelSidebar;
