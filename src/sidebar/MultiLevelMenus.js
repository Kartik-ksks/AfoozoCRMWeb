import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'grommet';
import MultiLevelMenu from './MultiLevelMenu';

const MultiLevelMenus = ({ menus = [], compact }) => {
  if (!Array.isArray(menus)) {
    console.warn('MultiLevelMenus: menus prop must be an array');
    return null;
  }

  return (
    <Box
      fill="vertical"
      overflow="auto"
      direction={compact ? 'row' : 'column'}
      wrap={compact}
      align={compact ? 'center' : 'start'}
      justify={compact ? 'center' : 'start'}
      pad={{ left: 'medium', top:'small' }}
    >
      {menus.map((menu) => (
        <MultiLevelMenu
          key={menu.path || menu.title}
          menu={menu}
          compact={compact}
        />
      ))}
    </Box>
  );
};

MultiLevelMenus.propTypes = {
  menus: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
    path: PropTypes.string,
    Icon: PropTypes.node,
      items: PropTypes.array,
  })),
  compact: PropTypes.bool,
};

MultiLevelMenus.defaultProps = {
  menus: [],
  compact: false,
};

export default MultiLevelMenus;
