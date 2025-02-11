import React, { useContext, useState, useEffect } from 'react';
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
  Form,
  FormField,
  TextInput,
  Select,
  CheckBoxGroup,
  SelectMultiple,
} from 'grommet';
import { More, Edit, Trash } from 'grommet-icons';
import { ConfirmOperation, LoadingLayer, QLayer } from '../../../components';
import { SessionContext } from '../../../context/session';
import { useMonitor } from '../../../context/session/hooks';
import { FilteredDataTable, DataTableGroups, SelectedDataTable } from '../../../components/dataTable';

const ROLES = ['admin', 'manager', 'user'];

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
  const [addUser, setAddUser] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    Username: '',
    Email: '',
    Password: '',
    Role: 'user',
    SiteIds: [],
  });
  const [sites, setSites] = useState([]);

  useMonitor(
    client,
    ['/api/sites'],
    ({ ['/api/sites']: sites }) => {
      if (sites) {
        setSites(sites.map(site => ({
          label: site.SiteName,
          value: site.SiteId.toString(),
        })));
        setLoading(false);
      }
    }
  );

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

  const formContent = (
    <Form value={formValues} onChange={setFormValues}>
      <Box gap="medium">
        <FormField
          name="Username"
          label="Username"
          required
        >
          <TextInput name="Username" />
        </FormField>

        <FormField
          name="Email"
          label="Email"
          required
        >
          <TextInput name="Email" type="email" />
        </FormField>

        <FormField
          name="Password"
          label={editUser ? "New Password (leave blank to keep current)" : "Password"}
          required={!editUser}
        >
          <TextInput name="Password" type="password" />
        </FormField>

        <FormField
          name="Role"
          label="Role"
          required
        >
          <Select
            name="Role"
            options={ROLES}
          />
        </FormField>

        <FormField
          name="SiteIds"
          label="Sites"
        >
          <SelectMultiple
            name="SiteIds"
            closeOnChange={false}
            placeholder="Select sites"
            options={sites}
            onChange={({ value }) => setFormValues(prev => ({ ...prev, SiteIds: value }))}
            labelKey="label"
            valueKey={{ key: "value", reduce: true }}
            value={formValues.SiteIds}
          />
        </FormField>
      </Box>
    </Form>
  );

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
            <Button
              primary
              color="status-critical"
              label="Add User"
              onClick={() => setAddUser(true)}
            />
          </Box>
        </Box>
      </Box>
      {data && (
        <Box>
          <Grid
            height={{ min: 'medium' }}
          >
            <Data data={data} properties={properties}>
              <Toolbar align="center" gap="medium">
                <DataSearch responsive placeholder="Search users" />
                <DataTableGroups
                  groups={options.filter(
                    (option) =>
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
                <Box flex />
                <Box direction="row" gap="small" flex={false}>
                  {selected?.length !== 0 && (
                    <Button
                      secondary
                      label="Clear Selected"
                      onClick={() => setSelected([])}
                    />
                  )}
                  <Button secondary color="status-critical" label="Reload" onClick={() => setLoading(true)} />
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

      {addUser && (
        <ConfirmOperation
          onClose={() => {
            setAddUser(false);
            setFormValues({
              Username: '',
              Email: '',
              Password: '',
              Role: 'user',
              SiteIds: [],
            });
          }}
          title="Add New User"
          onConfirm={() => client.post('/api/auth/register', formValues)}
          yesPrompt="Add User"
          noPrompt="Cancel"
          estimatedTime={5}
          text={formContent}
          onSuccess={() => {
            setLoading(true);
            setAddUser(false);
          }}
          progressLabel={`Adding user ${formValues.Username}...`}
        />

      )}

      {editUser && (
        <ConfirmOperation
          onClose={() => {
            setEditUser(null);
            setFormValues({
              Username: '',
              Email: '',
              Password: '',
              Role: 'user',
              SiteIds: [],
            });
          }}
          title="Edit User"
          onConfirm={() => {
            const updateData = { ...formValues };
            if (!updateData.Password) {
              delete updateData.Password;
            }
            return client.put(`/api/users/${editUser.UserId}`, updateData);
          }}
          yesPrompt="Save Changes"
          noPrompt="Cancel"
          estimatedTime={5}
          text={formContent}
          onSuccess={() => setLoading(true)}
        />
      )}

      {deleteUser && (
        <ConfirmOperation
          onClose={() => setDeleteUser(null)}
          title="Delete User"
          text={`Are you sure you want to delete user "${deleteUser.Username}"?`}
          onConfirm={() => client.delete(`/api/users/${deleteUser.UserId}`)}
          yesPrompt="Delete"
          noPrompt="Cancel"
          estimatedTime={5}
          onSuccess={() => setLoading(true)}
        />
      )}
    </Box>
  );
};

UserTable.propTypes = {
  title: PropTypes.string.isRequired,
  uri: PropTypes.string.isRequired,
};

export default UserTable;
