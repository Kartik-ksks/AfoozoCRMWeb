import React, { useState, useContext } from 'react';
import {
  Box,
  Form,
  FormField,
  TextInput,
  Button,
} from 'grommet';
import { SessionContext, useMonitor } from '../context/session';
import { LoadingLayer } from './index';

const CategoryForm = () => {
  const { client } = useContext(SessionContext);
  const [loading, setLoading] = useState(true);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [categories, setCategories] = useState([]);
  const [formValues, setFormValues] = useState({
    CategoryName: '',
    Description: '',
  });

  useMonitor(
    client,
    ['/api/site-categories'],
    ({ ['/api/site-categories']: categoryData }) => {
      if (categoryData) {
        setCategories(categoryData);
        setLoading(false);
      }
    },
    [reloadTrigger]
  );

  const handleReload = () => {
    setLoading(true);
    setReloadTrigger(prev => prev + 1);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await client.post('/api/site-categories', values);
      handleReload();
      setFormValues({
        CategoryName: '',
        Description: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setLoading(false);
    }
  };

  return (
    <Box fill pad="medium" gap="medium">
      {loading && <LoadingLayer />}

      <Form
        value={formValues}
        onChange={setFormValues}
        onSubmit={({ value }) => handleSubmit(value)}
      >
        <Box gap="medium">
          <FormField
            name="CategoryName"
            label="Category Name"
            required
          >
            <TextInput
              name="CategoryName"
              placeholder="Enter category name"
            />
          </FormField>

          <FormField
            name="Description"
            label="Description"
          >
            <TextInput
              name="Description"
              placeholder="Enter category description"
            />
          </FormField>

          <Box direction="row" gap="small" justify="end">
            <Button
              type="submit"
              primary
              label="Submit"
              disabled={loading}
            />
            <Button
              secondary
              color="status-critical"
              label="Reload"
              onClick={handleReload}
              disabled={loading}
            />
          </Box>
        </Box>
      </Form>

      {/* You can display categories list here if needed */}
      <Box>
        {categories.map(category => (
          <Box key={category.CategoryId} pad="small">
            <Text>{category.CategoryName}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CategoryForm;