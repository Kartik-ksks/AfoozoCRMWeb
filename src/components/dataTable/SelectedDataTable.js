import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  DataTable,
  Heading,
  Layer,
  Text,
  ThemeContext,
} from 'grommet';
import { Close, Contract, Expand } from 'grommet-icons';

import { SaveAsMenu } from '../../components';

const SelectedDataTable = ({ title, data, columns, onClose }) => {
  const [full, setFull] = useState(false);

  return (
    <Layer full={full} onEsc={onClose}>
      <Box pad="medium" gap="small" overflow={{ vertical: 'auto' }}>
        <Box flex={false} direction="row" justify="between">
          <Box direction="row">
            <Heading
              alignSelf="start"
              margin={{ vertical: 'none', right: 'xsmall' }}
              level="3"
              truncate
            >
              {title}
            </Heading>
          </Box>
          <Box direction="row" gap="small" align="center">
            <SaveAsMenu
              filename={title.replaceAll(' ', '')}
              data={data}
              fieldnames={columns.map((col) => col.property)}
            />
            <Button
              icon={full ? <Contract /> : <Expand />}
              onClick={() => setFull((p) => !p)}
            />
            <Button icon={<Close />} onClick={onClose} />
          </Box>
        </Box>
        {data?.length !== 0 && <Text>{`${data.length} selected`}</Text>}
        <Box height={full ? undefined : 'medium'} flex overflow="auto">
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
              verticalAlign="top"
              data={data}
              columns={columns}
              pin
              sortable
              step={20}
              onClickRow={() => {}}
            />
          </ThemeContext.Extend>
        </Box>
      </Box>
    </Layer>
  );
};

SelectedDataTable.propTypes = {
  title: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      property: PropTypes.string,
      // eslint-disable-next-line react/forbid-prop-types
      header: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    }),
  ).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.any.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SelectedDataTable;
