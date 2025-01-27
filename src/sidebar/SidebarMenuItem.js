import React, { useContext } from 'react';
import { Box } from 'grommet';
import PropTypes from 'prop-types';

import { ResponsiveContext } from '../context/responsive';
import { ButtonLabel } from '../components';

const SidebarMenuItem = ({ compact, Icon, name, children }) => {
  const { isBreakSidebar } = useContext(ResponsiveContext);
  const gap = compact ? undefined : 'small';
  const size = compact ? 'xsmall' : 'medium';
  const direction = compact ? 'column' : 'row';

  return (
    <Box
      direction={direction}
      gap={gap}
      margin={{ left: 'small', right: 'xsmall' }}
    >
      {Icon}
      {children}
      {!isBreakSidebar() && <ButtonLabel size={size}>{name}</ButtonLabel>}
    </Box>
  );
};

SidebarMenuItem.propTypes = {
  compact: PropTypes.bool,
  Icon: PropTypes.element,
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node,
};

SidebarMenuItem.defaultProps = {
  compact: false,
  Icon: null,
  name: null,
  children: null,
};

export default SidebarMenuItem;
