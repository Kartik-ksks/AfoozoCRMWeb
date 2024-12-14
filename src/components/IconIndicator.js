import React from 'react';
import PropTypes from 'prop-types';
import { Box, Stack } from 'grommet';
import { StatusGoodSmall } from 'grommet-icons';

const IconIndicator = ({
  icon: Icon,
  iconColor = undefined,
  indicator = false,
  indicatorColor = undefined,
}) => (
  <Box>
    <Stack anchor="top-right">
      <Box margin="xsmall">
        <Icon color={iconColor} />
      </Box>
      {indicator && (
        <Box>
          <StatusGoodSmall color={indicatorColor} size="12px" />
        </Box>
      )}
    </Stack>
  </Box>
);

IconIndicator.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  icon: PropTypes.object.isRequired,
  iconColor: PropTypes.string,
  indicator: PropTypes.bool,
  indicatorColor: PropTypes.string,
};

export default IconIndicator;