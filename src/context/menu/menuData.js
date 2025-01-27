/**
 * CONFIDENTIAL (C) Copyright 2020-2021 Hewlett Packard Enterprise Development LP
 *
 * Data structure defining the Multilevel sidebar menu.  Each menu-level may
 * contain sub-menus to form a tree structure of menu nodes.
 *
 * Supports both static and dynamically added content.  E.g. when there is a
 * change in the nPars, the menu is dynamically reconfigured.
 *
 * The menu is structured as an array of trees, each tree being a menu.  Each
 * node within the tree is a menuItem, structured as:
 *
 * {
 *  // STATIC MenuItem Content
 *  title,       // String displayed as the menu item
 *  path,        // *Must* match the path for the defined <Route>
 *  Icon=null,   // Typically, just top-level menus have Icons
 *  items=null,  // Array of submenus (i.e. array of menuItems) below this level
 *  common=null, // For dynamically creating sub-menus per menu item (see below)
 *               // NOTE: JSON compatible content only (no functions, etc)
 *
 *  // DYNAMIC MenuItem Content - added programattically
 *  depth,       // Level of this menuItem, used to control display of menus
 *  route,       // Concated all path attributes by descending the menu tree
 *               // Must match the path in the <Route> for this menu item.
 *  items=null,  // For dynamic content, eg. list of nPars, items may be updated
 * }
 *
 */

import React from 'react';

import mainPageData from '../../PageData';
import { ButtonIcon } from '../../components/ButtonIcon';

const menuData = mainPageData.map((data) => ({
  title: data.name,
  Icon: <ButtonIcon icon={data.Icon} />,
  path: data.path,
  common: data.common,
  info: data.info,
  items: data.items,

  // Dynamically added content
  // depth: <integer>
  // route: <string>
  // items: <array>
}));

export default menuData;
