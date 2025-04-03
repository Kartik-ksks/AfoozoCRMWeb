import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Box, Avatar, Text, TextEmphasis, Button, Layer } from 'grommet';
import { Close } from 'grommet-icons';
import { ResponsiveContext } from '../context/responsive';
import { SessionContext } from '../context/session';
import MultiLevelSidebar from './MultiLevelSidebar';

const Sidebar = ({ showSidebar, background, setShowSidebar, isMobile }) => {
  const { isBreakSidebar, size } = useContext(ResponsiveContext);
  const { userRole, client } = useContext(SessionContext);
  const isBreak = isBreakSidebar();

  if (!showSidebar || !userRole) return null;

  const sidebarContent = (
    <Box
      flex={false}
      background={background || 'neutral-2'}
      elevation="large"
      direction={isBreak ? 'column' : 'column'}
      width={isBreak ? '85vw' : !['xsmall', 'small'].includes(size) ? 'medium' : undefined}
      height={isBreak ? '100vh' : 'full'}
      overflow="visible"
    >
      {isMobile && setShowSidebar && (
        <Box 
          align="end" 
          pad="small"
          flex={false}
          background={background || 'neutral-2'}
        >
          <Button 
            icon={<Close />} 
            onClick={() => setShowSidebar(false)}
            a11yTitle="Close sidebar" 
          />
        </Box>
      )}
      <Box
        fill
        overflow="auto"
        className="scroll-enabled"
        height="full"
      >
        {!isBreak && <SidebarHeader
          name={client?.session?.username}
          email={client?.session?.email}
          role={client?.session?.role}
        />}
        <MultiLevelSidebar compact={isBreak} />
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Layer
        position="left"
        full="vertical"
        modal={true}
        onClickOutside={() => setShowSidebar(false)}
        onEsc={() => setShowSidebar(false)}
        animation="slide"
      >
        {sidebarContent}
      </Layer>
    );
  }

  return sidebarContent;
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
  setShowSidebar: PropTypes.func,
  isMobile: PropTypes.bool
};

export default Sidebar;
