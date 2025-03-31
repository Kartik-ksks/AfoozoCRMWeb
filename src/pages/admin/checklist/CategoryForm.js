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
  SelectMultiple,
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
    SiteIds: [],
    CategoryName: '',
    Description: '',
  });
  const [sites, setSites] = useState([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await client.rawGet('/api/sites');
        const sitesData = await response.json();
        const formattedSites = sitesData.map(site => ({
          value: site.SiteId.toString(),
          label: site.SiteName,
          original: site
        }));
        setSites(formattedSites);
      } catch (error) {
        console.error('Error fetching sites:', error);
      }
    };

    fetchSites();
  }, [client, reloadTrigger]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await client.rawGet('/api/checklist/categories');
        const categories = await response.json();

        const transformedCategories = categories.map(category => ({
          ...category,
          SiteNames: category.SiteIds
            ?.map(siteId => {
              const site = sites.find(s => s.value === siteId.toString());
              return site?.label;
            })
            .filter(Boolean)
            .join(', ') || 'No Sites'
        }));

        setData(transformedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sites.length > 0) {
      fetchCategories();
    }
  }, [client, reloadTrigger, sites]);

  const formContent = (
    <Form
      value={formValues}
      onChange={nextValue => setFormValues(nextValue)}
      onSubmit={({ value }) => console.log(value)}
    >
      <Box gap="medium">
        <FormField name="SiteIds" label="Sites" required>
          <SelectMultiple
            name="SiteIds"
            closeOnChange={false}
            placeholder="Select sites"
            options={sites}
            labelKey="label"
            valueKey={{ key: "value", reduce: true }}
            value={formValues.SiteIds}
            onChange={({ value }) => {
              setFormValues(prev => ({
                ...prev,
                SiteIds: value
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
    { property: 'SiteNames', header: 'Sites' },
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
                  SiteIds: datum.SiteIds || [],
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
    setReloadTrigger(prev => prev + 1);
  };

  const handleAdd = async () => {
    try {
      setLoading(true);
      const submitData = {
        ...formValues,
        SiteIds: formValues.SiteIds.map(id => parseInt(id, 10))
      };
      await client.post('/api/admin/checklist/categories', submitData);
      setReloadTrigger(prev => prev + 1);
      setAddCategory(false);
      setFormValues({
        SiteIds: [],
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
      const submitData = {
        ...formValues,
        SiteIds: formValues.SiteIds.map(id => parseInt(id, 10))
      };
      await client.put(`/api/admin/checklist/categories/${editCategory.CategoryId}`, submitData);
      setReloadTrigger(prev => prev + 1);
      setEditCategory(null);
      setFormValues({
        SiteIds: [],
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
      setReloadTrigger(prev => prev + 1);
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
              SiteIds: [],
              CategoryName: '',
              Description: '',
            });
          }}
          yesPrompt="Add"
          noPrompt="Cancel"
          estimatedTime={5}
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
              SiteIds: [],
              CategoryName: '',
              Description: '',
            });
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
          yesPrompt="Delete"
          noPrompt="Cancel"
          estimatedTime={5}
        />
      )}
    </Box>
  );
};

export default CategoryForm;