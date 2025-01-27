import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  Button,
  Data,
  DataFilter,
  DataFilters,
  DataSearch,
  DataSummary,
  DataTableColumns,
  Grid,
  Heading,
  Text,
  Toolbar,
} from 'grommet';

import { LoadingLayer } from '../../components';
import { SessionContext } from '../../context/session';
import { isNumeric, statusIcon } from '../../Utils';
import { FilteredDataTable, DataTableGroups, SelectedDataTable } from '../../components/dataTable';
import { MastersProvider } from './mastersContext';

const UserTable = ({ title, uri }) => {
  const { client } = useContext(SessionContext);
  const [data, setData] = useState();
  const [columns, setColumns] = useState();
  const [loading, setLoading] = useState(true);
  const [triggerReload, setTriggerReload] = useState(false);
  const [options, setOptions] = useState();
  const [properties, setProperties] = useState();
  const [selected, setSelected] = useState([]);
  const [displaySelected, setDisplaySelected] = useState(false);
  const [groupBy, setGroupBy] = useState();

  useEffect(() => {
    client.rawGet(uri).then((res) => {
      if (res.status !== 200) {
        console.log('ERROR: Failed to load.');
        setData('ERROR: Failed to load.');
        setLoading(false);
      } else {
        res.json().then((resJson) => {
          setLoading(false);
          setData(resJson);

          const renderProperty = (datum, key) => {
            switch (key) {
              case 'CreatedDate':
              case 'ModifiedDate':
              case 'LastLoginDate':
                return datum[key] && (
                  <Text style={{ whiteSpace: 'nowrap' }}>{new Date(datum[key]).toLocaleString()}</Text>
                );
              case 'IsActive':
                return datum[key] === "1" || datum[key] === true ? 'Active' : 'Inactive';
              case 'Password':
                return '••••••••';
              case 'ResetToken':
              case 'ResetTokenExpiry':
                return datum[key] || '-';
              default:
                return datum[key];
            }
          };

          // Update DataFilters section
          const dataProperties = {
            UserId: { label: 'User ID', search: true },
            Username: { label: 'Username', search: true },
            Email: { label: 'Email', search: true },
            Role: { label: 'Role', search: true },
            IsActive: { label: 'Status', search: true },
            CreatedDate: { label: 'Created Date', search: true },
            ModifiedDate: { label: 'Modified Date', search: true },
            LastLoginDate: { label: 'Last Login', search: true },
            FailedLoginAttempts: { label: 'Failed Attempts', search: true },
          };
          setProperties(dataProperties);

          const cols = [
            { property: 'UserId', header: 'User ID', primary: true },
            { property: 'Username', header: 'Username' },
            { property: 'Email', header: 'Email' },
            { property: 'Role', header: 'Role' },
            { property: 'IsActive', header: 'Status' },
            { property: 'CreatedDate', header: 'Created Date' },
            { property: 'ModifiedDate', header: 'Modified Date' },
            { property: 'LastLoginDate', header: 'Last Login' },
            { property: 'FailedLoginAttempts', header: 'Failed Attempts' },
          ].map(col => ({
            ...col,
            render: (datum) => renderProperty(datum, col.property),
          }));

          setColumns(cols);
          setOptions(cols.map(({ property, header }) => ({
            property,
            label: header,
          })));
        })
          .catch(() => {
            setLoading(false);
            console.warn('ERROR: Failed to parse or error in "then" block.');
          });
      }
    });
  }, [client, triggerReload, uri]);

  const handleReload = () => {
    setTriggerReload((prev) => !prev);
    setLoading(true);
  };

  const id = title.replaceAll(' ', '-');

  return (
    <Box fill overflow={{ vertical: 'scroll' }} pad="small" gap="large">
      {loading && <LoadingLayer />}
      {displaySelected && selected?.length !== 0 && (
        <SelectedDataTable
          title="Selected Integrated Events"
          data={data.filter((datum) => selected.includes(datum.UserId))}
          columns={columns}
          onClose={() => setDisplaySelected(false)}
        />
      )}
      <Box>
        <Box
          direction="row"
          align="center"
          justify="between"
          gap="small"
          margin={{ top: 'medium', bottom: 'large' }}
        >
          <Heading id={id} level={2}>
            {title}
          </Heading>
          <Box direction="row" gap="small" flex={false}>
            {/* <Button
              secondary
              label="View Raw Log"
              onClick={() => setShowRawLog(true)}
            /> */}
            <Button primary label="Reload" onClick={handleReload} />
          </Box>
        </Box>
      </Box>
      {data && (
        <Box>
          <Grid
            // Use Grid with height for sticky header and scrollable results
            height={{ min: 'medium' }}
          >
            <Data data={data} properties={properties}>
              <Toolbar align="center" gap="medium">
                <DataSearch responsive placeholder="Search events" />
                <DataTableGroups
                  groups={options.filter(
                    (option) =>
                      // Bug: 'level' has 0 values, see Grommet issue #6744
                      !['UserId', 'status', 'level'].includes(option.property),
                  )}
                  setGroupBy={setGroupBy}
                />
                {options && (
                  <DataTableColumns
                    drop
                    tip="Configure columns"
                    options={options}
                  />
                )}
                <DataFilters layer>
                  <DataFilter property="UserId" />
                  <DataFilter property="Username" />
                  <DataFilter property="Email" />
                  <DataFilter property="Role" />
                  <DataFilter property="IsActive" options={[
                    { label: 'Active', value: "1" },
                    { label: 'Inactive', value: "0" },
                  ]} />
                  <DataFilter property="CreatedDate" />
                  <DataFilter property="ModifiedDate" />
                  <DataFilter property="LastLoginDate" />
                  <DataFilter property="FailedLoginAttempts" />
                </DataFilters>
                {/* Flex Box added for spacing between Button */}
                <Box flex />
                <Box direction="row" gap="small" flex={false}>
                  {selected?.length !== 0 && (
                    <Button
                      secondary
                      label="Clear Selected"
                      onClick={() => setSelected([])}
                    />
                  )}
                  <Button
                    secondary
                    label="Display Selected"
                    onClick={() =>
                      selected?.length !== 0 && setDisplaySelected(true)
                    }
                  />
                </Box>
              </Toolbar>
              <Box direction="row" gap="xsmall" align="center">
                <DataSummary />
                {selected?.length !== 0 && (
                  <Text>{`${selected.length} selected`}</Text>
                )}
              </Box>
              {columns && (
                <FilteredDataTable
                  describedBy={id}
                  columns={columns}
                  selected={selected}
                  setSelected={setSelected}
                  groupBy={groupBy}
                />
              )}
            </Data>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

UserTable.propTypes = {
  title: PropTypes.string.isRequired,
  uri: PropTypes.string.isRequired,
};

export default UserTable;
