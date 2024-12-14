import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Heading, Layer } from 'grommet';
import { Close } from 'grommet-icons';

const QLayer = ({
  title = '',
  onClose = () => {},
  disableClose = false,
  children,
  full = false,
  ...rest
}) => {
  const tryClose = () => {
    if (!disableClose) onClose();
  };

  return (
    <Layer
      data-id="id-Layer"
      onEsc={tryClose}
      full={full}
      margin={{ top: 'xlarge' }}
      role="dialog"
      aria-labelledby="layer-title"
    >
      <Box
        pad="medium"
        gap="small"
        background="background-contrast"
        overflow={{ vertical: 'auto' }}
        {...rest}
      >
        <Box flex={false} direction="row" justify="between" align="center">
          {title && (
            <Heading
              id="layer-title"
              margin={{ vertical: 'none', right: 'xsmall' }}
              level="2"
              truncate
            >
              {title}
            </Heading>
          )}
          {!disableClose && (
            <Button
              alignSelf="center"
              icon={<Close />}
              onClick={tryClose}
              a11yTitle="Close Layer"
            />
          )}
        </Box>
        {children}
      </Box>
    </Layer>
  );
};

QLayer.propTypes = {
  title: PropTypes.string,
  onClose: PropTypes.func,
  disableClose: PropTypes.bool,
  children: PropTypes.node,
  full: PropTypes.bool,
};

export default QLayer;
