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
      direction={'column'}
      // wrap={compact}
      align={'start'}
      justify={'start'}
      pad={{ top: 'small' }}
      width="100%"
    >
      {menus.map((menu) => (
        <MultiLevelMenu
          key={menu.path || menu.title}
          menu={menu}
          compact={false}
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
