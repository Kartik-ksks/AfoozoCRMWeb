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
  CheckBox,
  Select,
} from 'grommet';
import { More, Edit, Trash, Add } from 'grommet-icons';
import { ConfirmOperation, LoadingLayer } from '../../../components';
import { SessionContext, useMonitor } from '../../../context/session';
import { FilteredDataTable } from '../../../components/dataTable';

const ChecklistItemForm = ({ title }) => {
  const { client } = useContext(SessionContext);
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [addItem, setAddItem] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [formValues, setFormValues] = useState({
    CategoryId: '',
    Question: '',
    IsRequired: false,
    RequireImage: false,
  });
  const [categories, setCategories] = useState([]);

  // Update monitor paths to match backend routes
  useMonitor(
    client,
    ['/api/checklist/items', '/api/checklist/categories'],
    ({
      ['/api/checklist/items']: items,
      ['/api/checklist/categories']: categoryData,
    }) => {
      if (items) {
        const transformedItems = items.map(item => ({
          ...item,
          CategoryName: categoryData?.find(cat => cat.CategoryId === item.CategoryId)?.CategoryName || 'Unknown Category'
        }));
        setData(transformedItems);
      }
      if (categoryData) {
        setCategories(categoryData.map(category => ({
          CategoryId: category.CategoryId,
          CategoryName: category.CategoryName
        })));
      }
      if (items && categoryData) {
        setLoading(false);
      }
    }
  );

  const formContent = (
    <Form value={formValues} onChange={setFormValues}>
      <Box gap="medium">
        <FormField name="CategoryId" label="Category" required>
          <Select
            name="CategoryId"
            options={categories}
            labelKey="CategoryName"
            valueKey="CategoryId"
            value={formValues.CategoryId}
            onChange={({ value }) => {
              setFormValues(prev => ({
                ...prev,
                CategoryId: value.CategoryId
              }));
            }}
          />
        </FormField>
        <FormField name="Question" label="Question" required>
          <TextInput
            name="Question"
            value={formValues.Question}
          />
        </FormField>
        <FormField name="IsRequired">
          <CheckBox
            name="IsRequired"
            label="Required"
            checked={formValues.IsRequired}
            onChange={event => {
              setFormValues(prev => ({
                ...prev,
                IsRequired: event.target.checked
              }));
            }}
          />
        </FormField>
        <FormField name="RequireImage">
          <CheckBox
            name="RequireImage"
            label="Require Image"
            checked={formValues.RequireImage}
            onChange={event => {
              setFormValues(prev => ({
                ...prev,
                RequireImage: event.target.checked
              }));
            }}
          />
        </FormField>
      </Box>
    </Form>
  );

  const columns = [
    { property: 'ItemId', header: 'ID', primary: true },
    { property: 'Question', header: 'Question' },
    {
      property: 'CategoryName',
      header: 'Category',
    },
    {
      property: 'IsRequired',
      header: 'Required',
      render: datum => datum.IsRequired ? 'Yes' : 'No',
    },
    {
      property: 'RequireImage',
      header: 'Image Required',
      render: datum => datum.RequireImage ? 'Yes' : 'No',
    },
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
                setEditItem(datum);
                setFormValues({
                  CategoryId: datum.CategoryId,
                  Question: datum.Question,
                  IsRequired: datum.IsRequired,
                  RequireImage: datum.RequireImage,
                });
              },
            },
            {
              label: 'Delete',
              icon: <Trash />,
              onClick: () => setDeleteItem(datum),
            }
          ]}
        />
      ),
    }
  ];

  // Update CRUD operation endpoints
  const handleAdd = async () => {
    try {
      // const payload = {
      //   ...formValues,
      //   CategoryId: parseInt(formValues.CategoryId, 10),
      // };
      setLoading(true);
      setAddItem(false);
      return client.post('/api/admin/checklist/items', formValues);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleEdit = async () => {
    try {
        // const payload = {
        //   ...formValues,
        //   CategoryId: parseInt(formValues.CategoryId, 10),
        // };
      setLoading(true);
      setEditItem(null);
      return client.put(`/api/admin/checklist/items/${editItem.ItemId}`, formValues);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setDeleteItem(null);
      return client.delete(`/api/admin/checklist/items/${deleteItem.ItemId}`);
    } catch (error) {
      console.error('Error deleting item:', error);
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
            label="New Item"
            onClick={() => setAddItem(true)}
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

      {addItem && (
        <ConfirmOperation
          title="Add Checklist Item"
          text={formContent}
          onConfirm={handleAdd}
          onClose={() => {
            setAddItem(false);
            setFormValues({
              CategoryId: '',
              Question: '',
              IsRequired: false,
              RequireImage: false,
            });
          }}
          yesPrompt="Add"
          noPrompt="Cancel"
          estimatedTime={5}
        />
      )}

      {editItem && (
        <ConfirmOperation
          title="Edit Checklist Item"
          text={formContent}
          onConfirm={handleEdit}
          onClose={() => {
            setEditItem(null);
            setFormValues({
              CategoryId: '',
              Question: '',
              IsRequired: false,
              RequireImage: false,
            });
          }}
          yesPrompt="Save"
          noPrompt="Cancel"
          estimatedTime={5}
        />
      )}

      {deleteItem && (
        <ConfirmOperation
          title="Delete Checklist Item"
          text={`Are you sure you want to delete "${deleteItem.Question}"?`}
          onConfirm={handleDelete}
          onClose={() => setDeleteItem(null)}
          yesPrompt="Delete"
          noPrompt="Cancel"
          estimatedTime={5}
        />
      )}
    </Box>
  );
};

export default ChecklistItemForm;