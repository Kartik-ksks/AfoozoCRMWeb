import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useMatch } from 'react-router-dom';
import { Box, Button } from 'grommet';
import { ResponsiveContext } from '../context/responsive';

const RoutedButton = ({
  path,
  activeIfRouteMatch = false,
  label = null,
  Icon = null,
  children = null,
  ...rest
}) => {
  const { isBreakSidebar } = useContext(ResponsiveContext);
  const routeMatch = useMatch(path);
  const match = Boolean(routeMatch);

  return (
    // Button with children gets "plain" styling, so must set hoverIndicator
    <Button
      href={`#${path}`}
      active={activeIfRouteMatch && match ? true : null}
      hoverIndicator
      {...rest}
    >
      <Box pad={isBreakSidebar() ? 'small' : undefined} gap="small">
        {Icon}
        {label}
        {children}
      </Box>
    </Button>
  );
};

RoutedButton.propTypes = {
  path: PropTypes.string.isRequired,
  activeIfRouteMatch: PropTypes.bool,
  Icon: PropTypes.element,
  label: PropTypes.node,
  children: PropTypes.node,
};

export default RoutedButton;
