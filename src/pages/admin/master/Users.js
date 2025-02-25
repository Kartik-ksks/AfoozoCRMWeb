import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Cards,
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
  Card,
  CheckBox,
} from 'grommet';
import { More, Edit, Trash, Search, Filter } from 'grommet-icons';
import { ResponsiveContext } from 'grommet';
import { ConfirmOperation, LoadingLayer, QLayer, CoverPage } from '../../../components';
import { SessionContext, useMonitor } from '../../../context/session';
import { FilteredDataTable, DataTableGroups, SelectedDataTable } from '../../../components/dataTable';

const ROLES = ['admin', 'manager', 'user'];

const UserCard = ({ user, onEdit, onDelete }) => {
  const breakpoint = useContext(ResponsiveContext);

  return (
    <Card elevation="small">
      <Box pad="medium" gap="small">
        <Box direction="row" justify="between" align="center">
          <Box>
            <Text weight="bold">{user.Username}</Text>
            <Text size="small" color={user.IsActive === 1 ? "status-ok" : "status-unknown"}>
              ● {user.IsActive === 1 ? 'Online' : 'Offline'}
            </Text>
          </Box>
          <Menu
            icon={<More />}
            items={[
              {
                label: 'Edit',
                icon: <Edit />,
                onClick: () => onEdit(user),
              },
              {
                label: 'Delete',
                icon: <Trash />,
                onClick: () => onDelete(user),
              },
            ]}
          />
        </Box>
        <Box gap="xsmall">
          <Text size="small" color="dark-3">{user.Email}</Text>
          <Text size="small">Role: {user.Role}</Text>
          <Text size="small" color="dark-4">{user.SiteIds.join(', ')}</Text>
        </Box>
      </Box>
    </Card>
  );
};

const FilterLayer = ({ onClose, filters, setFilters }) => (
  <Layer fill position="right" onClickOutside={onClose} onEsc={onClose}>
    <Box pad="medium" gap="medium" width="medium">
      <Text weight="bold">Filters</Text>
      <Form value={filters} onChange={setFilters}>
        <Box gap="medium">
          <FormField label="Role">
            <Select
              name="role"
              options={ROLES}
              placeholder="Select role"
              value={filters.role}
              clear
            />
          </FormField>
          <FormField label="Status">
            <Select
              name="status"
              options={[
                { label: 'Online', value: 1 },
                { label: 'Offline', value: 0 }
              ]}
              labelKey="label"
              valueKey="value"
              placeholder="Select status"
              value={filters.status}
              clear
            />
          </FormField>
          <FormField>
            <CheckBox
              name="showInactive"
              label="Show Inactive Users"
              checked={filters.showInactive}
            />
          </FormField>
        </Box>
      </Form>
      <Box direction="row" justify="end" gap="small">
        <Button label="Clear" onClick={() => setFilters({})} />
        <Button primary label="Apply" onClick={onClose} />
      </Box>
    </Box>
  </Layer>
);

const UserTable = ({ title }) => {
  const { client } = useContext(SessionContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [addUser, setAddUser] = useState(false);
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
    [
      '/api/users',
      '/api/sites'
    ],
    ({ ['/api/users']: userData,
      ['/api/sites']: siteData }) => {
      if (!userData || !siteData) return;

      const sitesMap = Object.fromEntries(
        siteData.map(site => [site.SiteId.toString(), site.SiteName])
      );

      const transformedUsers = userData.map(user => ({
        ...user,
        SiteIds: user.SiteIds.map(siteId => sitesMap[siteId.toString()]
          || 'Unknown Site')
      }));

      setUsers(transformedUsers);
      setSites(siteData.map(site => ({
        label: site.SiteName,
        value: site.SiteId.toString(),
      })));
      setLoading(false);
    }
  );

  const filteredUsers = users.filter(user => {
    // Text search
    const matchesSearch =
      user.Username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.Email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.Role.toLowerCase().includes(searchText.toLowerCase());

    // Role filter
    const matchesRole = !filters.role || user.Role === filters.role;

    // Status filter
    const matchesStatus = filters.status === undefined || user.IsActive === filters.status;

    // Active/Inactive filter
    const matchesActive = filters.showInactive || user.IsActive === 1;

    return matchesSearch && matchesRole && matchesStatus && matchesActive;
  });

  const formContent = (
    <Form value={formValues} onChange={setFormValues}>
      <Box gap="medium">
        <FormField name="Username" label="Username" required>
          <TextInput name="Username" />
        </FormField>

        <FormField name="Email" label="Email" required>
          <TextInput name="Email" type="email" />
        </FormField>

        <FormField
          name="Password"
          label={editUser ? "New Password (leave blank to keep current)" : "Password"}
          required={!editUser}
        >
          <TextInput name="Password" type="password" />
        </FormField>

        <FormField name="Role" label="Role" required>
          <Select name="Role" options={ROLES} />
        </FormField>

        <FormField name="SiteIds" label="Sites">
          <SelectMultiple
            name="SiteIds"
            closeOnChange={false}
            placeholder="Select sites"
            options={sites}
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
      <Box>
        <Box
          direction="row"
          align="center"
          justify="between"
          gap="small"
          margin={{ top: 'medium', bottom: 'large' }}
        >
          <Heading level={2}>{title}</Heading>
        </Box>
      </Box>

      <Box direction="row" justify="between" align="center">
        <Box direction="row" gap="small" align="center">
          <Box width="medium">
            <TextInput
              icon={<Search />}
              placeholder="Search users..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </Box>
          <Button
            icon={<Filter />}
            onClick={() => setShowFilters(true)}
            badge={Object.keys(filters).length || undefined}
          />
        </Box>
        <Button
          primary
          color="status-critical"
          label="Add User"
          onClick={() => setAddUser(true)}
        />
      </Box>

      <Grid
        height={{ min: 'small' }}
        columns={{ count: 'fit', size: 'small' }}
        gap="medium"
      >
        {filteredUsers.map(user => (
          <UserCard
            key={user.UserId}
            user={user}
            onEdit={setEditUser}
            onDelete={setDeleteUser}
          />
        ))}
      </Grid>

      {showFilters && (
        <FilterLayer
          onClose={() => setShowFilters(false)}
          filters={filters}
          setFilters={setFilters}
        />
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
};

export default UserTable;
