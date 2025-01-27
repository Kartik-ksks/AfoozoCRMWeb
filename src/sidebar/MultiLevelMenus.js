import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SessionContext } from '../context/session';
import { Box, DropButton } from 'grommet';
import { FormDown, FormNext } from 'grommet-icons';
import PropTypes from 'prop-types';

// import { SessionContext, useRedfishMonitor } from '../redfish';
import { ResponsiveContext } from '../context/responsive';
import { ButtonIcon, ButtonLabel, RoutedButton } from '../components';
// import { hardware as hardwareInfo, nPar as nParInfo } from '../info';
import { naturalSort } from '../Utils';
import SidebarMenuItem from './SidebarMenuItem';

const MultiLevelMenus = ({ menus, compact }) => {
  const { isBreakSidebar } = useContext(ResponsiveContext);
  const { client } = useContext(SessionContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [npars, setNpars] = useState([]);
  const [chassises, setChassises] = useState([]);

  const menuContent = [];
  const [open, setOpen] = useState([]); // ordered array of opened menu names

  /**
   * Dynamically add newItems as a submenu to an existing menu identified by
   * menuPath.
   *
   * Add newItems as sub-menus to the top-level menu identified by menuPath.
   * E.g. for newly discovered two-nPar system, the newItems array is:
   *   0: { pnum: 0, health: "OK" }
   *   1: { pnum: 1, health: "Warning" }
   *
   * For the newly discovered 2-chassis system, the newItems array is:
   *   0: { geoid: "r001u01", health: "Warning" }
   *   1: { geoid: "r001u06", health: "OK" }
   *
   * The caller identifies the attribute to be used as the menu title, by
   * specifying it in the subMenuAttr parameter. E.g. the nPars caller would set
   * subMenuAttr='pnum', meanwhile the chassis caller would set
   * subMenuAttr='geoid'.
   *
   * @param {string} menuPath     path must match associated <Route> and used as
   *                              menu label
   * @param {[{
   *   [subMenuAttr]: value,
   *   health: redfishHealthStatus
   * }]} newItems                 new subMenu items to be added to menuPath menu
   * @param {string} subMenuAttr  name of attribute to extract from newItems
   * @param {string} labelPrefix  string to prefix the menuPath to display
   *
   */
  const addSubMenu = useCallback(
    (menuPath, newItems, subMenuAttr, info, labelPrefix = '') => {
      if (!newItems || newItems.length === 0) return;

      // find the menu that matches menuPath
      /* eslint no-console: ["warn", { "allow": ["warn", "error"] }] */
      const filtered = menus.filter((menu) => menu.path === menuPath);
      if (!filtered || filtered.length === 0) {
        console.warn(`${menuPath} menu not found in `, menus);
        return;
        // eslint-disable-next-line no-else-return
      } else if (filtered.length !== 1) {
        console.warn(`${menuPath} must be unique in `, menus);
        // continue on, but only the first instance will be updated!
      }

      const targetMenu = filtered[0]; // target first instance of filtered only
      if (!targetMenu) {
        console.warn(`Target menu ${menuPath} non-existent in `, filtered);
      }

      targetMenu.items = []; // rebuild the menu's subMenu from scratch
      newItems.forEach((newItem) => {
        const item = {};
        item.path = newItem[subMenuAttr];
        item.title = labelPrefix + newItem[subMenuAttr];
        item.health = newItem.health;
        // item.key = item.path;
        item.depth = targetMenu.depth + 1;
        item.route = `${targetMenu.route}/${item.path}`;
        item.info = info;
        if (targetMenu.common) {
          item.items = JSON.parse(JSON.stringify(targetMenu.common));
          item.items.forEach((subItem) => {
            /* eslint-disable no-param-reassign */
            subItem.depth = item.depth + 1;
            subItem.route = `${item.route}/${subItem.path}`;
            /* eslint-enable no-param-reassign */
          });
        }
        targetMenu.items.push(item);
      });
    },
    [menus],
  );

  /**
   * Add each discovered npar as a subMenu to the nPars menu.
   *
   * E.g. the list of discovered npar will become a subMenu of npars menu:
   *   0: {pnum: 0, health: "Critical"}
   *   1: {pnum: 1, health: "Warning"}
   *
   * After updating the nPar menu's submenu items[]:
   *   0: { title: "nPar 0", path: "0", items: Array(8), depth: 1 }
   *   1: { title: "nPar 1", path: "1", items: Array(8), depth: 1 }
   *
   * Where the items: Array(8) comes from the nPar 'common' attribute.
   */
  useEffect(() => {
    // console.log('nPars changed:', npars);
    const newItems = npars;
    const menuPath = 'npars';
    const subMenuAttr = 'pnum'; // attribute of newItems
    const labelPrefix = 'nPar ';

    addSubMenu(menuPath, newItems, subMenuAttr, labelPrefix);
  }, [addSubMenu, npars]);

  /**
   * Add each discovered chassis as a subMenu to the hardware menu.
   *
   * E.g. the list of discovered chassis will become a subMenu of hardware menu.
   *   0: {geoid: "r001u01", health: "Warning"}
   *   1: {geoid: "r001u06", health: "OK"}
   *
   * After upating the hardware menu's submenu items[]:
   *   0: { title: "r001u06", path: "r001u06", items: Array(4), depth: 1 }
   *   1: { title: "r001u06", path: "r001u06", items: Array(4), depth: 1 }
   *
   * Where the items: Array(4) comes from the hardware 'common' attribute.
   */
  useEffect(() => {
    // console.log('chassises changed:', chassises);
    const newItems = chassises;
    const menuPath = 'hardware';
    const subMenuAttr = 'geoid'; // attribute of newItems

    addSubMenu(menuPath, newItems, subMenuAttr);
  }, [addSubMenu, chassises]);

  // const systemsUri = '/redfish/v1/Systems?$expand=*';
  // useRedfishMonitor(redfish, [systemsUri], ({ [systemsUri]: collection }) => {
  //   if (!collection) return;
  //   // Extract the info we care about for the tabs (number + health)
  //   setNpars(
  //     naturalSort(
  //       collection.Members.map((npar) => ({
  //         pnum: parseInt(npar.Id.match(/\d+$/)[0], 10),
  //         health: npar.Status.HealthRollup,
  //       })),
  //       (npar) => npar.pnum,
  //     ),
  //   );
  // });

  // const chassisUri = '/redfish/v1/Chassis?$expand=*';
  // useRedfishMonitor(redfish, [chassisUri], ({ [chassisUri]: collection }) => {
  //   if (!collection) return;
  //   setChassises(
  //     naturalSort(
  //       // Only look at Chassis resources that are for a BMC chassis
  //       collection.Members.filter(
  //         (member) => member.ChassisType === 'RackMount',
  //       )
  //         // Extract the info we care about for the tabs (geoid + health)
  //         .map((chassis) => ({
  //           geoid: chassis.Id,
  //           health: chassis.Status.HealthRollup,
  //         })),
  //       (chassis) => chassis.geoid,
  //     ),
  //   );
  // });

  // The "open[]" array represents each menu-level that is opened.
  // E.g. Let's imagine 3-levels of menu system are opened:
  //    ["Hardware", "r001u01", "CPU"]
  // Opening one more sub-menu called "Cores" would produce an array:
  //    ["Hardware", "r001u01", "CPU", "Cores"]
  // Closing the CPU menu would result in:
  //    ["Hardware", "r001u01"]
  const isOpen = (item) => open.includes(item.path);

  // close menu items below this item's depth
  const closeBelow = (item) => {
    // console.log('closeBelow:', item.title, open);
    const updatedOpen = [...open];
    if (open.length) {
      updatedOpen.splice(item.depth, updatedOpen.length - item.depth);
    } else if (item.items) updatedOpen.push(item.path);
    if (open.length !== updatedOpen.length) setOpen(updatedOpen);
  };

  // handle click and hover behaviour
  //  - item: the selected menu item (by hovering or clicking on it)
  const updateOpen = (item) => {
    const updatedOpen = [...open];
    const depth = updatedOpen.findIndex((p) => p === item.path);

    // Same logic for click and hover
    if (depth !== -1) {
      // if found, i.e. menu already opened
      if (!item.items) {
        // if found leaf => close all
        updatedOpen.length = 0; // close all
      } else {
        // close all below me
        updatedOpen.splice(depth, updatedOpen.length - depth);
      }
    } else if (item.depth === 0) {
      // if selected root node
      updatedOpen.length = 0; // close all
    }

    if (updatedOpen.length) {
      // if we have not already closed all
      // only here when hovering over a different item; close all below me
      updatedOpen.splice(item.depth, updatedOpen.length - item.depth);
    }
    if (depth === -1) {
      // if it wasn't open already, open it now
      // only here for click events
      updatedOpen.push(item.path); // open this menu item
    }
    return updatedOpen;
  };

  const closeAllMenus = () => {
    setOpen([]);
  };

  const goToRoute = (item) => {
    // console.log('goToRoute', item.route, item.title);
    navigate(item.route);
    closeAllMenus();
  };

  // TBD: Add RedfishHealthIcon next to label, but only when health is NOT OK.
  //
  // const labelHealth = (label, health) => (
  //   <Box direction="row" gap="xsmall">
  //     <Text>{label}</Text>
  //     {health && health !== 'OK' && <RedfishHealthIcon health={health} />}
  //   </Box>
  // );

  const labelHealth = (label) => <ButtonLabel>{label}</ButtonLabel>;

  // Behaviour of leaf nodes:
  //  Click: close all open menus
  //  MouseEnter: close other menus below this depth
  const MenuLeaf = ({ item, icon, pad, children }) => (
    <RoutedButton
      data-id={`id-leaf-button-${item.path}`}
      key={item.path}
      a11yTitle={item.title}
      label={
        children ? null : labelHealth(`\xa0\u2011 ${item.title}`, 'Warning')
      }
      icon={children ? null : icon}
      onClick={closeAllMenus}
      onMouseEnter={() => closeBelow(item)}
      activeIfRouteMatch
      path={item.route}
    >
      <Box pad={{ top: pad, bottom: pad }}>{children}</Box>
    </RoutedButton>
  );

  MenuLeaf.propTypes = {
    item: PropTypes.shape({
      path: PropTypes.string.isRequired, // path to uniquely identify menu item
      title: PropTypes.string.isRequired, // title to be used as the menu label
      // eslint-disable-next-line react/forbid-prop-types
      items: PropTypes.array, // subMenu items added dynamically or statically
      depth: PropTypes.number.isRequired, // depth of menu; added dynamically
    }).isRequired,
    icon: PropTypes.element,
    pad: PropTypes.string,
    children: PropTypes.node,
  };
  MenuLeaf.defaultProps = {
    icon: null,
    pad: undefined,
    children: null,
  };

  const handleMouseEnter = (item) => {
    // console.log('handleMouseEnter:', item.title);
    setOpen(updateOpen(item));
  };

  // const handleMouseLeave = (item) => {
  //   console.log('handleMouseLeave:', item.title);
  // };

  /**
   * Recursively render a menuNode, that may optionally have sub-menus.
   *
   * Recursion NOTE: converting this recursive function to a recursive
   * React component causes it to flash when displayed!  Keep it as a function,
   * i.e. start with lowercase and call it like a function.
   *
   * Recursively build the menuItem:
   *   A menu item with items will be a DropButton otherwise a MenuLeaf Button.

   * Example of a menu item:
   *  {title: "Logs", path: "logs", Icon: {…}, depth: 0, route: "/logs"}.
   *
   * @param {{
   *    title,
   *    path,
   *    Icon,
   *    depth,
   *    items=null,
   *    common=null,
   *    route}} item display menu item with submenus of items, with each submenu
   *    item having a common sub-submenu.  The depth records this menus depth.
   */
  const menuNode = (item) => {
    let element;

    if (!isBreakSidebar() && item.items && item.items.length) {
      // console.log('Processing items for:', item.title, open);
      // Behaviour of top-level menu:
      //  Click: close menus, open default page for target
      //  MouseEnter: close other content from same depth, open item's drop down
      element = (
        <Box
          data-id={`id-multilevelmenu-node-${item.path}`}
          key={item.path}
        // eslint-disable-next-line max-len
        // direction="row" // MUST NOT BE SET TO ROW - It breaks alignment of dropDown icon
        // border={{ color: 'green', size: 'medium' }}
        >
          <DropButton
            a11yTitle={item.title}
            flex
            onClick={() => goToRoute(item)}
            onClose={() => closeAllMenus()} // handles onClickOutside
            onMouseEnter={() => handleMouseEnter(item)}
            // onMouseLeave={() => handleMouseLeave(item)}
            data-id={`id-dropbutton-${item.path}`}
            key={item.path}
            open={isOpen(item)}
            hoverIndicator
            active={isOpen(item) || location.pathname.search(item.route) === 0}
            dropAlign={{ top: 'top', left: 'right' }}
            dropContent={
              <Box
                data-id={`id-multilevelmenu-dropcontent-${item.path}`}
                margin={{ top: 'small', bottom: 'small' }} // space for focus
              // border={{ style: 'dashed', color: 'gold', size: 'medium' }}
              >
                {(item.items.length === 1 && item.items[0]?.items
                  ? item.items[0].items // skip single item for sub-items
                  : item.items
                ).map((subItem) =>
                  subItem.items ? (
                    // NOTE: Recursing React component causes flashing, use
                    // function recursion
                    menuNode(subItem)
                  ) : (
                    <MenuLeaf item={subItem} key={subItem.path} pad="xxsmall">
                      <SidebarMenuItem
                        compact={compact}
                        Icon={subItem.Icon}
                        name={labelHealth(
                          `\xa0\u2011 ${subItem.title}`,
                          subItem.health,
                        )}
                      />
                    </MenuLeaf>
                  ),
                )}
              </Box>
            }
          >
            <Box
              direction="row"
              pad={
                item.depth === 0
                  ? { top: 'small', bottom: 'small', right: 'medium', left: 'xsmall' }
                  : { top: 'xsmall', bottom: 'xsmall', right: 'medium', left: 'xsmall' }
              }
              align="center"
            // border={{ color: 'purple' }}
            >
              <SidebarMenuItem
                compact={compact}
                Icon={item.Icon}
                name={item.title}
              />
              {item.items && (
                <Box
                  flex
                  align="end"
                // border={{ color: 'darkgreen', size: 'medium' }}
                // background={{ color: 'gold' }}
                >
                  {isOpen(item) ? (
                    <ButtonIcon icon={FormDown} />
                  ) : (
                    <ButtonIcon icon={FormNext} />
                  )}
                </Box>
              )}
            </Box>
          </DropButton>
        </Box>
      );
    } else {
      element = (
        <MenuLeaf
          item={item}
          key={item.path}
          pad={compact ? 'xsmall' : 'small'}
        >
          <Box pad={{ top: 'xsmall', bottom: 'xsmall', right: 'medium', left: 'xsmall' }}>
            <SidebarMenuItem
              compact={compact}
              Icon={item.Icon}
              name={labelHealth(item.title, item.health)}
            />
          </Box>
        </MenuLeaf>
      );
    }
    return element;
  };
  // This propTypes is useless for function-based typechecking.
  // It serves as documentation only!
  menuNode.propTypes = {
    item: PropTypes.shape(
      {
        title: PropTypes.string.isRequired,
        Icon: PropTypes.element,
        items: PropTypes.array,
        depth: PropTypes.number,
      }.isRequired,
    ),
  };

  // build the entire menu by pushing each menuNode into the menuContent array.
  // The menuNode is a React Component and *must* have the 'key' attribute set,
  // so it can be extracted later when we render/return the menuContent.
  // const buildMenu = menu => (menuContent.push(
  //   <Box
  //     flex
  //     // data-id={`id-multilevelmenu-node-${menu.path}`}
  //     // key={menu.path}
  //     border={{ color: 'darkblue', size: 'medium' }}
  //   >
  //     {menuNode(menu)}
  //   </Box>,
  // ));
  const buildMenu = (menu) => menuContent.push(menuNode(menu));

  menus.map((menu) => buildMenu(menu));

  // window.menuContent = menuContent;

  // render the menuContent - the per-menu key was configured in buildMenu
  return (
    <Box
      data-id="id-multilevelmenu"
      direction={isBreakSidebar() ? 'row' : 'column'}
    // Sidebar vertical gap changes with width - tried working around this
    // by changing gap to be constant with all widths. Alas, it's not trivial.
    // Raising a bug in Grommet against the Sidebar component.
    // gap={isNarrow() ? 'medium' : undefined}
    // gap={isNarrow() ? 'medium' : 'small'}
    // border={{ color: 'cyan', size: 'medium' }}
    >
      {menuContent.map((item) => (
        <Box
          key={item.key}
        // eslint-disable-next-line max-len
        // direction="row" // MUST NOT BE SET TO ROW - It breaks alignment of dropDown icon
        // border={{ color: 'red', size: 'medium' }}
        >
          {item}
        </Box>
      ))}
    </Box>
  );
};

MultiLevelMenus.propTypes = {
  /** array of menus, where each menu may contain sub-menus */
  menus: PropTypes.arrayOf(
    PropTypes.shape({
      /** Unique path to route to */
      path: PropTypes.string.isRequired,
      /** Menu label */
      title: PropTypes.string.isRequired,
      /** Menu Icon */
      Icon: PropTypes.element,
      /** sub-menu items, which may themselves be menus with sub-menus */
      // eslint-disable-next-line react/forbid-prop-types
      items: PropTypes.array,
    }),
  ).isRequired,
  compact: PropTypes.bool,
};
MultiLevelMenus.defaultProps = {
  compact: false,
};

export default MultiLevelMenus;
