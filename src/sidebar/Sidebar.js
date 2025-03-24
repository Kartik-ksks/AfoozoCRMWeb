import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Box, Avatar, Text, TextEmphasis, Button } from 'grommet';
import { ResponsiveContext } from '../context/responsive';
import { SessionContext } from '../context/session';
import MultiLevelSidebar from './MultiLevelSidebar';

const Sidebar = ({ showSidebar, background }) => {
  const { isBreakSidebar, size } = useContext(ResponsiveContext);
  const { userRole, client } = useContext(SessionContext);
  const isMobile = isBreakSidebar();

  if (!showSidebar || !userRole) return null;

  return (
    <Box
      flex={false}
      background={background || 'neutral-2'}
      elevation="large"
      direction={isMobile ? 'row' : 'column'}
      width={isMobile ? 'full' : !['xsmall', 'small'].includes(size) ? 'medium' : undefined}
      height={isMobile ? 'auto' : 'full'}
      overflow="visible"
      style={{
        position: isMobile ? 'fixed' : 'relative',
        bottom: isMobile ? 0 : 'auto',
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <Box
        fill
        overflow={isMobile ? 'visible' : 'auto'}
        height={isMobile ? 'auto' : 'full'}
      >
        {!isMobile && <SidebarHeader
          name={client?.session?.username}
          email={client?.session?.email}
          role={client?.session?.role}
        />}
        <MultiLevelSidebar compact={isMobile} />
      </Box>
    </Box>
  );
};

const SidebarHeader = ({ email, name, role }) => (
  <Box
    align="start"
    border={{ color: 'border-weak', side: 'bottom' }}
    pad={{ top: 'small', bottom: 'medium' }}
    gap="medium"
    flex={false}
  >
    <Box gap="xsmall" pad="medium">
      <Avatar
        background="status-unknown"
        flex={false}
        margin={{ bottom: 'xsmall' }}
      >
        <Text size="large">A</Text>
      </Avatar>
      <Text size="large">Name: {name}</Text>
      <Text size="small">Role: {role}</Text>
      <Text size="small">Email: {email}</Text>
    </Box>
  </Box>
);

Sidebar.propTypes = {
  showSidebar: PropTypes.bool,
  background: PropTypes.string,
};

export default Sidebar;
