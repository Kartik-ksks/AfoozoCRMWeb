import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
  const [data, setData] = useState([]);
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
  const [rawSites, setRawSites] = useState(null);
  const [rawCategories, setRawCategories] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    if (!client) return;
    let isMounted = true;
    setLoading(true);
    setFetchError(null);

    const fetchSites = async () => {
      try {
        console.log("Fetching sites...");
        const sitesData = await client.get('/api/sites');
        console.log("Sites fetched:", sitesData);
        const formattedSites = (Array.isArray(sitesData) ? sitesData : [])
          .filter(site => site && site.SiteId !== undefined && site.SiteName !== undefined)
          .map(site => ({
            value: site.SiteId.toString(),
            label: site.SiteName,
          }));
        if (isMounted) {
          setRawSites(sitesData || []);
          setSites(formattedSites);
        }
      } catch (error) {
        console.error('Error fetching sites:', error);
        if (isMounted) setFetchError("Failed to load sites.");
      }
    };

    fetchSites();

    return () => { isMounted = false; };
  }, [client, reloadTrigger]);

  useEffect(() => {
    if (!client) return;
    let isMounted = true;
    setFetchError(null);

    const fetchCategories = async () => {
      try {
        console.log("Fetching categories...");
        const categoriesData = await client.get('/api/checklist/categories');
        console.log("Categories fetched:", categoriesData);
        if (isMounted) {
          setRawCategories(categoriesData || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        if (isMounted) setFetchError("Failed to load categories.");
      }
    };

    fetchCategories();

    return () => { isMounted = false; };
  }, [client, reloadTrigger]);

  useEffect(() => {
    if (rawSites !== null && rawCategories !== null) {
      try {
        console.log("Processing categories with sites...");
        const sitesMap = Object.fromEntries(
          (Array.isArray(rawSites) ? rawSites : [])
            .filter(site => site && site.SiteId !== undefined && site.SiteName !== undefined)
            .map(site => [site.SiteId.toString(), site.SiteName])
        );

        const transformedCategories = (Array.isArray(rawCategories) ? rawCategories : []).map(category => ({
          ...category,
          SiteNames: (Array.isArray(category.SiteIds) ? category.SiteIds : [])
            .map(siteId => sitesMap[siteId.toString()] || `Unknown (${siteId})`)
            .filter(Boolean)
            .join(', ') || 'No Sites Assigned'
        }));

        console.log("Transformed categories:", transformedCategories);
        setData(transformedCategories);
        setFetchError(null);

      } catch (error) {
        console.error("Failed to process category/site data:", error);
        setFetchError("Failed to process data.");
        setData([]);
      } finally {
        console.log("Processing finished, setting loading false.");
        setLoading(false);
      }
    } else if (fetchError) {
      console.log("Fetch error occurred, setting loading false.");
      setLoading(false);
    }
  }, [rawCategories, rawSites, fetchError]);

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
            value={formValues.SiteIds || []}
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
                  SiteIds: (Array.isArray(datum.SiteIds) ? datum.SiteIds : []).map(String),
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
    console.log("Reload triggered");
    setReloadTrigger(prev => prev + 1);
    setRawSites(null);
    setRawCategories(null);
    setFetchError(null);
  };

  const handleAdd = async () => {
    try {
      const submitData = {
        ...formValues,
        SiteIds: formValues.SiteIds.map(id => parseInt(id, 10))
      };
      return client.post('/api/admin/checklist/categories', submitData);
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const handleEdit = async () => {
    try {
      const submitData = {
        ...formValues,
        SiteIds: formValues.SiteIds.map(id => parseInt(id, 10))
      };
      return client.put(`/api/admin/checklist/categories/${editCategory.CategoryId}`, submitData);
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      return client.delete(`/api/admin/checklist/categories/${deleteCategory.CategoryId}`);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
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
          onSuccess={() => {
            handleReload();
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
          progressLabel={`Adding category ${formValues.CategoryName}...`}
        />
      )}

      {editCategory && (
        <ConfirmOperation
          title="Edit Category"
          text={formContent}
          onConfirm={handleEdit}
          onClose={() => {
            setEditCategory(false);
            setFormValues({
              SiteIds: [],
              CategoryName: '',
              Description: '',
            });
          }}
          onSuccess={() => {
            handleReload();
            setEditCategory(false);
            setFormValues({
              SiteIds: [],
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
          onClose={() => setDeleteCategory(false)}
          yesPrompt="Delete"
          noPrompt="Cancel"
          estimatedTime={5}
          onSuccess={() => {
            handleReload();
            setDeleteCategory(false);
          }}
          progressLabel={`Deleting category ${deleteCategory.CategoryName}...`}
        />
      )}

      {fetchError && (
        <Box background="status-critical" pad="medium" margin={{bottom: "medium"}} round="small">
          <Text color="white">Error: {fetchError}</Text>
        </Box>
      )}
    </Box>
  );
};

CategoryForm.propTypes = {
  title: PropTypes.string.isRequired,
};

export default CategoryForm;