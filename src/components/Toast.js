import React, { useEffect } from 'react';
import { Box, Layer, Text } from 'grommet';
import { StatusCritical, StatusGood, StatusWarning } from 'grommet-icons';

const Toast = ({ message, status = 'normal', onClose, position = 'bottom' }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (status) {
      case 'critical':
        return <StatusCritical color="status-critical" />;
      case 'warning':
        return <StatusWarning color="status-warning" />;
      default:
        return <StatusGood color="status-ok" />;
    }
  };

  const getBackground = () => {
    switch (status) {
      case 'critical':
        return 'status-critical';
      case 'warning':
        return 'status-warning';
      default:
        return 'status-ok';
    }
  };

  return (
    <Layer
      position={position}
      modal={false}
      margin="small"
      responsive={false}
      plain
    >
      <Box
        direction="row"
        gap="small"
        align="center"
        background={getBackground()}
        pad={{ vertical: 'small', horizontal: 'medium' }}
        round="small"
      >
        {getIcon()}
        <Text>{message}</Text>
      </Box>
    </Layer>
  );
};

export default Toast;