import React, { useContext, useState } from 'react';
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
  Form,
  FormField,
  TextInput,
  Select,
  SelectMultiple,
  CheckBox,
} from 'grommet';
import { More, Edit, Trash, Add } from 'grommet-icons';
import { ConfirmOperation, LoadingLayer } from '../../../../components';
import { SessionContext, useMonitor } from '../../../../context/session';
import { FilteredDataTable } from '../../../../components/dataTable';

const QuestionsTable = ({ title }) => {
  const { client } = useContext(SessionContext);
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [addQuestion, setAddQuestion] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);
  const [deleteQuestion, setDeleteQuestion] = useState(null);
  const [formValues, setFormValues] = useState({
    QuestionText: '',
    QuestionType: 'rating',
    CategoryIds: [],
    SiteIds: [],
    IsActive: 1,
  });
  const [sites, setSites] = useState([]);
  const [categories, setCategories] = useState([]);

  // Monitor questions, sites and categories
  useMonitor(
    client,
    ['/api/questions', '/api/sites', '/api/site-categories'],
    ({
      ['/api/questions']: questions,
      ['/api/sites']: siteData,
      ['/api/site-categories']: categoryData,
    }) => {
      if (questions) {
        setData(questions);
        setLoading(false);
      }
      if (siteData) {
        setSites(siteData.map(site => ({
          label: site.SiteName,
          value: site.SiteId.toString(),
        })));
      }
      if (categoryData) {
        setCategories(categoryData.map(category => ({
          label: category.CategoryName,
          value: category.CategoryId.toString(),
        })));
      }
    }
  );

  const formContent = (
    <Form value={formValues} onChange={setFormValues}>
      <Box gap="medium">
        <FormField
          name="QuestionText"
          label="Question"
          required
        >
          <TextInput
            name="QuestionText"
            placeholder="Enter your question"
          />
        </FormField>

        <FormField
          name="QuestionType"
          label="Question Type"
          required
        >
          <Select
            name="QuestionType"
            options={['rating', 'text', 'boolean']}
            value={formValues.QuestionType}
          />
        </FormField>

        <FormField
          name="CategoryIds"
          label="Categories"
        >
          <SelectMultiple
            name="CategoryIds"
            placeholder="Select categories"
            value={formValues.CategoryIds}
            options={categories}
            labelKey="label"
            valueKey={{ key: "value", reduce: true }}
          />
        </FormField>

        <FormField
          name="SiteIds"
          label="Sites"
        >
          <SelectMultiple
            name="SiteIds"
            placeholder="Select sites"
            value={formValues.SiteIds}
            options={sites}
            labelKey="label"
            valueKey={{ key: "value", reduce: true }}
          />
        </FormField>

        <FormField name="IsActive">
          <CheckBox
            name="IsActive"
            label="Active"
            checked={formValues.IsActive === 1}
            onChange={(e) => setFormValues({
              ...formValues,
              IsActive: e.target.checked ? 1 : 0
            })}
          />
        </FormField>
      </Box>
    </Form>
  );

  const columns = [
    { property: 'QuestionId', header: 'ID', primary: true },
    { property: 'QuestionText', header: 'Question' },
    {
      property: 'Categories',
      header: 'Categories',
      render: datum => datum.Categories?.map(cat => cat.CategoryName).join(', ')
    },
    {
      property: 'Sites',
      header: 'Sites',
      render: datum => datum.Sites?.map(site => site.SiteName).join(', ')
    },
    {
      property: 'IsActive',
      header: 'Status',
      render: datum => datum.IsActive === 1 ? 'Active' : 'Inactive'
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
                setEditQuestion(datum);
                setFormValues({
                  QuestionText: datum.QuestionText,
                  QuestionType: datum.QuestionType,
                  CategoryIds: datum.Categories?.map(cat => cat.CategoryId.toString()) || [],
                  SiteIds: datum.Sites?.map(site => site.SiteId.toString()) || [],
                  IsActive: datum.IsActive,
                });
              },
            },
            {
              label: 'Delete',
              icon: <Trash />,
              onClick: () => setDeleteQuestion(datum),
            }
          ]}
        />
      ),
    }
  ];

  return (
    <Box fill overflow={{ vertical: 'auto' }} pad="small" gap="medium">
      <Box direction="row" justify="between" align="center">
        <Heading level={2} margin="none">
          {title}
        </Heading>
        <Button
          icon={<Add />}
          label="New Question"
          onClick={() => setAddQuestion(true)}
          primary
          color="status-critical"
        />
      </Box>

      {loading ? (
        <LoadingLayer />
      ) : (
        <Box>
          <Data data={data}>
            <Toolbar>
              <DataSearch />
              <DataFilters>
                <DataFilter property="QuestionText" />
                <DataFilter property="IsActive" />
              </DataFilters>
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

      {addQuestion && (
        <ConfirmOperation
          title="Add Question"
          text={formContent}
          onConfirm={() => client.post('/api/questions', formValues)}
          onClose={() => {
            setAddQuestion(false);
            setFormValues({
              QuestionText: '',
              QuestionType: 'rating',
              CategoryIds: [],
              SiteIds: [],
              IsActive: 1,
            });
          }}
          yesPrompt="Add"
          noPrompt="Cancel"
          estimatedTime={5}
          onSuccess={() => {
            setLoading(true);
            setAddQuestion(false);
          }}
        />
      )}

      {editQuestion && (
        <ConfirmOperation
          title="Edit Question"
          text={formContent}
          onConfirm={() => client.put(`/api/questions/${editQuestion.QuestionId}`, formValues)}
          onClose={() => {
            setEditQuestion(null);
            setFormValues({
              QuestionText: '',
              QuestionType: 'rating',
              CategoryIds: [],
              SiteIds: [],
              IsActive: 1,
            });
          }}
          yesPrompt="Save"
          noPrompt="Cancel"
          estimatedTime={5}
          onSuccess={() => {
            setLoading(true);
            setEditQuestion(null);
          }}
        />
      )}

      {deleteQuestion && (
        <ConfirmOperation
          title="Delete Question"
          text={`Are you sure you want to delete "${deleteQuestion.QuestionText}"?`}
          onConfirm={() => client.delete(`/api/questions/${deleteQuestion.QuestionId}`)}
          onClose={() => setDeleteQuestion(null)}
          yesPrompt="Delete"
          noPrompt="Cancel"
          estimatedTime={5}
          onSuccess={() => {
            setLoading(true);
            setDeleteQuestion(null);
          }}
        />
      )}
    </Box>
  );
};

export default QuestionsTable;
