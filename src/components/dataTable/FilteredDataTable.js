import React from 'react';
import PropTypes from 'prop-types';

import { Box, DataTable, ThemeContext } from 'grommet';

const FilteredDataTable = ({ groupBy, describedBy, columns, selected, setSelected }) => {

  return (
    <Box flex overflow="auto">
      {/*
        FIXME: https://github.com/grommet/grommet/issues/6734
        A bug in Grommet 2.31 can result in black pinned header
      */}
      <ThemeContext.Extend
        value={{
          dataTable: {
            pinned: {
              header: { background: { color: undefined } },
              body: { background: { color: undefined } },
              footer: { background: { color: undefined } },
            },
          },
        }}
      >
        <DataTable
          alignSelf="start"
          aria-describedby={describedBy}
          columns={columns}
          pin
          groupBy={groupBy?.value || groupBy}
          sortable
          onClickRow={() => {}} // provides hover highlighting
          onSelect={setSelected}
          select={selected}
          step={20} // for scrolling responsiveness, use a smaller value
        />
      </ThemeContext.Extend>
    </Box>
  );
};

FilteredDataTable.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  describedBy: PropTypes.string,
  selected: PropTypes.arrayOf(PropTypes.number).isRequired,
  setSelected: PropTypes.func.isRequired,
};

FilteredDataTable.defaultProps = {
  describedBy: undefined,
};

export default FilteredDataTable;
