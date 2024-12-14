import React from 'react';
import { Text } from 'grommet';
import PropTypes from 'prop-types';

const ButtonLabel = ({ ...rest }) => (
  <Text {...rest} color="white" weight="bold" />
);

const ButtonIcon = ({ icon: Icon, ...rest }) => (
  <Icon {...rest} color="white" weight="bold" />
);
ButtonIcon.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  icon: PropTypes.object.isRequired,
};

export { ButtonIcon, ButtonLabel };
