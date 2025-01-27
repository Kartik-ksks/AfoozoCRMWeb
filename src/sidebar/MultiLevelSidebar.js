import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import MultiLevelMenus from './MultiLevelMenus';
import { MenuContext } from '../context/menu';

const addCommon = (item) => {
  if (item.items && item.common) {
    item.items.forEach((itm) => {
      // itm.items is assigned a cloned copy of item.common
      itm.items = JSON.parse(JSON.stringify(item.common));
    });
  }
};

const addItemDepth = (item, depth) => {
  // eslint-disable-next-line no-param-reassign
  item.depth = depth;

  if (item.items) {
    item.items.map((p) => addItemDepth(p, depth + 1));
  }
};

const addRoute = (item, path) => {
  const refItem = item; // keep eslint happy no-param-reassign
  if (refItem.items) {
    refItem.items.forEach((p) => {
      addRoute(p, `${path}/${item.path}`);
    });
  }
  refItem.route = `${path}/${item.path}`;
  // console.log('addRoute:', refItem.route);
};

// const processCommon = menus => menus.map(menu => addCommon(menu));
// const processDepth = menus => menus.map(menu => addItemDepth(menu, 0));
// const processPath = menus => menus.map(menu => addRoute(menu, ''));

const processMenu = (menu) => {
  addCommon(menu);
  addItemDepth(menu, 0);
  addRoute(menu, '');
};

const processMenus = (menus) => menus.map((menu) => processMenu(menu));

// Recursive debug - dump all to console
// const dumpItem = (item) => {
//   console.log(item.key, item.depth);
//   if (item.items) {
//     item.items.map(item => dumpItem(item));
//   }
// };
// const dumpMenus = menus => menus.map(menu => dumpItem(menu));
// window.menus = menus;
// window.dm = dumpMenus;

const MultiLevelSidebar = ({ compact }) => {
  const { menus } = useContext(MenuContext);
  // console.log('MultiLevelSidebar:', { menus });

  processMenus(menus);

  // menus.map(menu => console.log(menu.path, item.depth)));

  return <MultiLevelMenus menus={menus} compact={compact} />;
};

MultiLevelSidebar.propTypes = {
  compact: PropTypes.bool,
};

MultiLevelSidebar.defaultProps = {
  compact: false,
};

export default MultiLevelSidebar;
