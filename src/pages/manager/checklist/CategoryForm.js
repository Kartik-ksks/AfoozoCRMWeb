import React, { useContext, useState, useEffect } from 'react';
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
import { SessionContext } from '../../../context/session';
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
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, sitesResponse] = await Promise.all([
          client.get('/api/checklist/categories'),
          client.get('/api/sites')
        ]);

        if (sitesResponse) {
          setSites(sitesResponse.map(site => ({
            SiteId: site.SiteId,
            SiteName: site.SiteName
          })));
        }

        if (categoriesResponse) {
          const transformedCategories = categoriesResponse.map(category => ({
            ...category,
            SiteName: sitesResponse?.find(site => site.SiteId === category.SiteId)?.SiteName || 'Unknown Site'
          }));
          setData(transformedCategories);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [client, reloadTrigger]);

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

  const handleReload = () => {
    setLoading(true);
    setReloadTrigger(prev => prev + 1);
  };

  const handleAdd = async () => {
    try {
      setLoading(true);
      await client.post('/api/admin/checklist/categories', formValues);
      handleReload();
      setAddCategory(false);
      setFormValues({
        SiteId: '',
        CategoryName: '',
        Description: '',
      });
      return true;
    } catch (error) {
      console.error('Error adding category:', error);
      setLoading(false);
      return false;
    }
  };

  const handleEdit = async () => {
    try {
      setLoading(true);
      await client.put(`/api/admin/checklist/categories/${editCategory.CategoryId}`, formValues);
      handleReload();
      setEditCategory(null);
      setFormValues({
        SiteId: '',
        CategoryName: '',
        Description: '',
      });
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      setLoading(false);
      return false;
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await client.delete(`/api/admin/checklist/categories/${deleteCategory.CategoryId}`);
      handleReload();
      setDeleteCategory(null);
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      setLoading(false);
      return false;
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
            disabled={loading}
          />
        </Box>
      </Box>

      <Box>
        <Data data={data}>
          <Toolbar>
            <DataSearch />
            <Box flex />
            <Button
              secondary
              color="status-critical"
              label="Reload"
              onClick={handleReload}
              disabled={loading}
            />
          </Toolbar>
          <DataSummary />
          <FilteredDataTable columns={columns} />
        </Data>
      </Box>

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
          yesPrompt="Save"
          noPrompt="Cancel"
          estimatedTime={5}
          progressLabel={`Editing category ${formValues.CategoryName}...`}
        />
      )}

      {deleteCategory && (
        <ConfirmOperation
          title="Delete Category"
          text={`Are you sure you want to delete "${deleteCategory.CategoryName}"?`}
          onConfirm={handleDelete}
          onClose={() => setDeleteCategory(null)}
          yesPrompt="Delete"
          noPrompt="Cancel"
          estimatedTime={5}
          progressLabel={`Deleting category ${deleteCategory.CategoryName}...`}
        />
      )}
    </Box>
  );
};

export default CategoryForm;