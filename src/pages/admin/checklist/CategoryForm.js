import React, { useContext, useState } from 'react';
import {
  Box,
  Button,
  Data,
  DataSearch,
  DataSummary,
  Heading,
  Text,
  Toolbar,
  Menu,
  Form,
  FormField,
  TextInput,
  TextArea,
  Select,
} from 'grommet';
import { More, Edit, Trash, Add } from 'grommet-icons';
import { ConfirmOperation, LoadingLayer } from '../../../components';
import { SessionContext, useMonitor } from '../../../context/session';
import { FilteredDataTable } from '../../../components/dataTable';

const CategoryForm = ({ title }) => {
  const { client } = useContext(SessionContext);
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [addCategory, setAddCategory] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [formValues, setFormValues] = useState({
    SiteId: '',
    CategoryName: '',
    Description: '',
  });
  const [sites, setSites] = useState([]);

  useMonitor(
    client,
    ['/api/checklist/categories', '/api/sites'],
    ({
      ['/api/checklist/categories']: categories,
      ['/api/sites']: siteData,
    }) => {
      if (categories) {
        const transformedCategories = categories.map(category => ({
          ...category,
          SiteName: siteData?.find(site => site.SiteId === category.SiteId)?.SiteName || 'Unknown Site'
        }));
        setData(transformedCategories);
      }
      if (siteData) {
        setSites(siteData.map(site => ({
          SiteId: site.SiteId,
          SiteName: site.SiteName
        })));
      }
      if (categories && siteData) {
        setLoading(false);
      }
    }
  );

  const formContent = (
    <Form value={formValues} onChange={setFormValues}>
      <Box gap="medium">
        <FormField name="SiteId" label="Site" required>
          <Select
            name="SiteId"
            options={sites}
            labelKey="SiteName"
            valueKey="SiteId"
            value={formValues.SiteId}
            onChange={({ value }) => {
              setFormValues(prev => ({
                ...prev,
                SiteId: value.SiteId
              }));
            }}
          />
        </FormField>
        <FormField name="CategoryName" label="Category Name" required>
          <TextInput
            name="CategoryName"
            value={formValues.CategoryName}
          />
        </FormField>
        <FormField name="Description" label="Description">
          <TextArea
            name="Description"
            value={formValues.Description}
          />
        </FormField>
      </Box>
    </Form>
  );

  const columns = [
    { property: 'CategoryId', header: 'ID', primary: true },
    { property: 'CategoryName', header: 'Category Name' },
    { property: 'Description', header: 'Description' },
    { property: 'SiteName', header: 'Site' },
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
              onClick: () => {
                setEditCategory(datum);
                setFormValues({
                  SiteId: datum.SiteId,
                  CategoryName: datum.CategoryName,
                  Description: datum.Description,
                });
              },
            },
            {
              label: 'Delete',
              icon: <Trash />,
              onClick: () => setDeleteCategory(datum),
            }
          ]}
        />
      ),
    }
  ];

  const handleAdd = async () => {
    try {
      // const payload = {
      //   ...formValues,
      //   SiteId: parseInt(formValues.SiteId, 10),
      // };
      setLoading(true);
      setAddCategory(false);
      return client.post('/api/admin/checklist/categories', formValues);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleEdit = async () => {
    try {
      // const payload = {
      //   ...formValues,
      //   SiteId: parseInt(formValues.SiteId, 10),
      // };
      setLoading(true);
      setEditCategory(null);
      return client.put(`/api/admin/checklist/categories/${editCategory.CategoryId}`, formValues);
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setDeleteCategory(null);
      return client.delete(`/admin/checklist/categories/${deleteCategory.CategoryId}`);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

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
          <Heading level={2} margin={{ top: 'medium', bottom: 'large' }}>
            {title}
          </Heading>
          <Button
            icon={<Add />}
            label="New Category"
            onClick={() => setAddCategory(true)}
            primary
            color="status-critical"
          />
        </Box>
      </Box>

      {loading ? (
        <LoadingLayer />
      ) : (
        <Box>
          <Data data={data}>
            <Toolbar>
              <DataSearch />
              <Box flex />
              <Button
                secondary
                color="status-critical"
                label="Reload"
                onClick={() => setLoading(true)}
              />
            </Toolbar>
            <DataSummary />
            <FilteredDataTable columns={columns} />
          </Data>
        </Box>
      )}

      {addCategory && (
        <ConfirmOperation
          title="Add Category"
          text={formContent}
          onConfirm={handleAdd}
          onClose={() => {
            setAddCategory(false);
            setFormValues({
              SiteId: '',
              CategoryName: '',
              Description: '',
            });
          }}
          onSuccess={() => {
            setLoading(true);
            setAddCategory(false);
          }}
          yesPrompt="Add"
          noPrompt="Cancel"
          estimatedTime={5}
          progressLabel="Adding new Checklist Category"
        />
      )}

      {editCategory && (
        <ConfirmOperation
          title="Edit Category"
          text={formContent}
          onConfirm={handleEdit}
          onClose={() => {
            setEditCategory(null);
            setFormValues({
              SiteId: '',
              CategoryName: '',
              Description: '',
            });
          }}
          onSuccess={() => {
            setLoading(true);
            setEditCategory(null);
          }}
          yesPrompt="Save"
          noPrompt="Cancel"
          estimatedTime={5}
        />
      )}

      {deleteCategory && (
        <ConfirmOperation
          title="Delete Category"
          text={`Are you sure you want to delete "${deleteCategory.CategoryName}"?`}
          onConfirm={handleDelete}
          onClose={() => setDeleteCategory(null)}
          onSuccess={() => {
            setLoading(true);
            setDeleteCategory(null);
          }}
          yesPrompt="Delete"
          noPrompt="Cancel"
          estimatedTime={5}
        />
      )}
    </Box>
  );
};

export default CategoryForm;