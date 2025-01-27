import React, { useContext } from 'react';
import {
  Box,
  Button,
  Collapsible,
  Nav,
  Sidebar as GrommetSidebar,
} from 'grommet';
import { Moon, Sun } from 'grommet-icons';
import PropTypes from 'prop-types';
import { ResponsiveContext } from '../context/responsive';
import MultiLevelSidebar from './MultiLevelSidebar';

export const Sidebar = ({
  background,
  showSidebar,
  // themeMode,
  // toggleThemeMode,
}) => {
  const { isBreakSidebar } = useContext(ResponsiveContext);

  return (
    <Box
      overflow={{ vertical: 'auto' }}
      flex={false}
      elevation="medium"
      background={background}
    >
      <Collapsible
        direction={isBreakSidebar() ? 'vertical' : 'horizontal'}
        open={showSidebar}
      >
        <GrommetSidebar
          direction={isBreakSidebar() ? 'row' : 'column'}
          responsive={false}
        >
          <Box
            margin={{ top: 'small' }}
            flex={false}
            // border={{ color: 'red' }}
            direction={isBreakSidebar() ? 'row' : 'column'}
          >
            <Nav responsive={false}>
              <MultiLevelSidebar />
            </Nav>
            {/* Until footer is fixed, hardcode the footer here */}
            <Box flex />
            <Button
              data-id="id-sidebar-theme-mode"
              margin={isBreakSidebar() ? '0' : { top: 'large' }}
              onClick={() => {}}
              // label={
              //   !isBreakSidebar() &&
              //   (themeMode === 'light' ? 'Dark Mode' : 'Light Mode')
              // }
              // icon={themeMode === 'light' ? <Moon /> : <Sun />}
            />
          </Box>
        </GrommetSidebar>
      </Collapsible>
    </Box>
  );
};

Sidebar.propTypes = {
  background: PropTypes.string.isRequired,
  showSidebar: PropTypes.bool.isRequired,
  themeMode: PropTypes.string.isRequired,
  toggleThemeMode: PropTypes.func.isRequired,
};
