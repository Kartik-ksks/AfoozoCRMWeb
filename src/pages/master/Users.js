import React, { useContext, useState } from 'react';
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
  Menu,
  Layer,
} from 'grommet';

import { LoadingLayer } from '../../components';
import { SessionContext } from '../../context/session';
import { useMonitor } from '../../context/session/hooks';
import { FilteredDataTable, DataTableGroups, SelectedDataTable } from '../../components/dataTable';
import { More, Edit, Trash } from 'grommet-icons';

const UserTable = ({ title, uri }) => {
  const { client } = useContext(SessionContext);
  const [data, setData] = useState();
  const [columns, setColumns] = useState();
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState();
  const [properties, setProperties] = useState();
  const [selected, setSelected] = useState([]);
  const [displaySelected, setDisplaySelected] = useState(false);
  const [groupBy, setGroupBy] = useState();
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  useMonitor(
    client,
    [uri],
    ({ [uri]: collection }) => {
      if (!collection) return;
      setLoading(false);
      setData(collection);

      const renderProperty = (datum, key) => {
        switch (key) {
          case 'CreatedDate':
          case 'LastLoginDate':
            return datum[key] && (
              <Text style={{ whiteSpace: 'nowrap' }}>
                {new Date(datum[key]).toLocaleString()}
              </Text>
            );
          case 'IsActive':
            return datum[key] === 1 ? 'Active' : 'Inactive';
          case 'Password':
            return '••••••••';
          default:
            return datum[key];
        }
      };

      const dataProperties = {
        UserId: { label: 'User ID', search: true },
        Username: { label: 'Username', search: true },
        Email: { label: 'Email', search: true },
        Role: { label: 'Role', search: true },
        IsActive: { label: 'Status', search: true },
        CreatedDate: { label: 'Created Date', search: true },
        LastLoginDate: { label: 'Last Login', search: true },
      };
      setProperties(dataProperties);

      const cols = [
        { property: 'UserId', header: 'User ID', primary: true },
        { property: 'Username', header: 'Username' },
        { property: 'Email', header: 'Email' },
        { property: 'Role', header: 'Role' },
        { property: 'IsActive', header: 'Status' },
        { property: 'CreatedDate', header: 'Created Date' },
        { property: 'LastLoginDate', header: 'Last Login' },
        {
          property: 'actions',
          header: 'Actions',
          render: (datum) => (
            <Menu
              icon={<More />}
              hoverIndicator
              items={[
                {
                  label: 'Edit',
                  icon: <Edit />,
                  onClick: () => setEditUser(datum),
                  disabled: datum.Role !== 'admin' && datum.Role !== 'Admin'
                },
                {
                  label: 'Delete',
                  icon: <Trash />,
                  onClick: () => setDeleteUser(datum),
                  disabled: datum.Role !== 'admin' && datum.Role !== 'Admin'
                }
              ]}
            />
          ),
        }
      ].map(col => ({
        ...col,
        render: col.property === 'actions' ?
          col.render :
          (datum) => renderProperty(datum, col.property),
      }));

      setColumns(cols);
      setOptions(cols.filter(col => col.property !== 'actions').map(({ property, header }) => ({
        property,
        label: header,
      })));
    },
    [setData, setLoading, setColumns, setOptions, setProperties]
  );

  // Add handlers for edit and delete actions
  const handleEdit = (user) => {
    // Implement edit logic
    console.log('Edit user:', user);
    setEditUser(null);
  };

  const handleDelete = (user) => {
    // Implement delete logic
    console.log('Delete user:', user);
    setDeleteUser(null);
  };

  return (
    <Box fill overflow={{ vertical: 'scroll' }} pad="small" gap="large">
      {loading && <LoadingLayer />}
      {displaySelected && selected?.length !== 0 && (
        <SelectedDataTable
          title="Selected Users"
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
          <Heading id='idUsers-table' level={5}>
            {title}
          </Heading>
          <Box direction="row" gap="small" flex={false}>
            {/* <Button
              secondary
              label="View Raw Log"
              onClick={() => setShowRawLog(true)}
            /> */}
            <Button primary label="Reload" onClick={() => setLoading(true)} />
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
                <DataSearch responsive placeholder="Search users" />
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
                  <DataFilter property="IsActive"
                    options={[
                      { label: 'Active', value: 1 },
                      { label: 'Inactive', value: 0 },
                    ]} />
                  <DataFilter property="CreatedDate" />
                  <DataFilter property="LastLoginDate" />
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
                  describedBy='idUsers-table'
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

      {editUser && (
        <Layer
          position="center"
          onClickOutside={() => setEditUser(null)}
          onEsc={() => setEditUser(null)}
        >
          <Box pad="medium" gap="small" width="medium">
            <Heading level={3} margin="none">
              Edit User
            </Heading>
            {/* Add your edit form here */}
            <Button label="Close" onClick={() => setEditUser(null)} />
          </Box>
        </Layer>
      )}

      {deleteUser && (
        <Layer
          position="center"
          onClickOutside={() => setDeleteUser(null)}
          onEsc={() => setDeleteUser(null)}
        >
          <Box pad="medium" gap="small" width="medium">
            <Heading level={3} margin="none">
              Confirm Delete
            </Heading>
            <Text>Are you sure you want to delete {deleteUser.Username}?</Text>
            <Box direction="row" gap="small" justify="end">
              <Button label="Cancel" onClick={() => setDeleteUser(null)} />
              <Button
                primary
                color="status-critical"
                label="Delete"
                onClick={() => handleDelete(deleteUser)}
              />
            </Box>
          </Box>
        </Layer>
      )}
    </Box>
  );
};

UserTable.propTypes = {
  title: PropTypes.string.isRequired,
  uri: PropTypes.string.isRequired,
};

export default UserTable;
