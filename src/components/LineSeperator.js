import React from 'react';
import { Box, Text } from 'grommet';
import PropTypes from 'prop-types';

const LineSeparator = ({ title = null, ...rest }) => (
  <Box direction="row">
    {/* left hr */}
    <Box direction="row" flex border="bottom" margin="small" />
    {title && (
      <>
        <Text {...rest}>{title}</Text>
        {/* right hr */}
        <Box direction="row" flex border="bottom" margin="small" />{' '}
      </>
    )}
  </Box>
);

LineSeparator.propTypes = {
  title: PropTypes.string,
};

export default LineSeparator;