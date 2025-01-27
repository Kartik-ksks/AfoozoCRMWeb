import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { Select } from 'grommet';
import { List } from 'grommet-icons';
import { MastersContext } from '../../pages/master/mastersContext';

const DataTableGroups = ({ groups, setGroupBy, ...rest }) => {
  return (
    <Select
      a11yTitle="Open group selector"
      placeholder="Group by"
      icon={<List />}
      clear
      options={groups}
      labelKey="label"
      valueKey={{ key: 'property', reduce: true }}
      onChange={(selection) => setGroupBy(selection.value)}
      {...rest}
    />
  );
};

DataTableGroups.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string, property: PropTypes.string }),
  ).isRequired,
};

export default DataTableGroups;
