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
  Pagination,
} from 'grommet';
import { More, Edit, Trash, Add } from 'grommet-icons';
import { ConfirmOperation } from '../../../../components';
import { SessionContext, useMonitor } from '../../../../context/session';
import { FilteredDataTable, DataTableGroups } from '../../../../components/dataTable';

const QuestionsTable = ({ title }) => {
  const { client } = useContext(SessionContext);
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [addQuestion, setAddQuestion] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);
  const [deleteQuestion, setDeleteQuestion] = useState(null);
  const [formValues, setFormValues] = useState({
    QuestionText: '',
    QuestionType: 'rating',
    CategoryIds: [],
    SiteIds: [],
    IsActive: true,
  });
  const [sites, setSites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [step, setStep] = useState(10); // Items per page
  const [page, setPage] = useState(1); // Current page
  const [options, setOptions] = useState();
  const [properties, setProperties] = useState();
  const [groupBy, setGroupBy] = useState();

  useMonitor(
    client,
    ['/api/questions', '/api/sites', '/api/site-categories'],
    ({
      ['/api/questions']: questions,
      ['/api/sites']: siteData,
      ['/api/site-categories']: categoryData,
    }) => {
      setLoading(true);
      if (questions && siteData && categoryData) {
        try {
          const sitesMap = Object.fromEntries(
            siteData.map(site => [site.SiteId.toString(), site.SiteName])
          );
          const categoriesMap = Object.fromEntries(
            categoryData.map(category => [category.CategoryId.toString(), category.CategoryName])
          );

          const transformedQuestions = questions.map(question => ({
            ...question,
            SiteIds: question.SiteIds.map(siteId => sitesMap[siteId] || 'Unknown Site'),
            CategoryIds: question.CategoryIds.map(catId => categoriesMap[catId] || 'Unknown Category'),
            CategoryNames: question.CategoryIds.map(catId => categoriesMap[catId] || 'Unknown Category').join(', '),
            SiteNames: question.SiteIds.map(siteId => sitesMap[siteId] || 'Unknown Site').join(', ')
          }));

          setData(transformedQuestions);

          // Setup properties for filtering and search
          const dataProperties = {
            QuestionId: { label: 'ID', search: true },
            QuestionText: { label: 'Question', search: true },
            QuestionType: {
              label: 'Type',
              search: true,
              options: ['rating', 'text', 'boolean']
            },
            CategoryNames: {
              label: 'Categories',
              search: true,
              options: Array.from(new Set(transformedQuestions.flatMap(q => q.CategoryIds || [])))
            },
            SiteNames: {
              label: 'Sites',
              search: true,
              options: Array.from(new Set(transformedQuestions.flatMap(q => q.SiteIds || [])))
            },
            IsActive: {
              label: 'Status',
              search: true,
              options: ['Active', 'Inactive']
            }
          };
          setProperties(dataProperties);

          // Setup options for column configuration
          setOptions(
            Object.keys(dataProperties).map(property => ({
              property,
              label: dataProperties[property].label,
              options: dataProperties[property].options,
            }))
          );

        } catch (error) {
          console.error('Error transforming data:', error);
        } finally {
          setLoading(false);
        }
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
    },
    [reloadTrigger]
  );

  const handleReload = () => {
    setLoading(true);
    setReloadTrigger(prev => prev + 1);
  };

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
            checked={formValues.IsActive}
            onChange={(e) => setFormValues({
              ...formValues,
              IsActive: e.target.checked
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
      render: datum => datum.CategoryIds
    },
    {
      property: 'Sites',
      header: 'Sites',
      render: datum => Array.isArray(datum.SiteIds)
        ? datum.SiteIds.map(site => site || '').join(', ')
        : ''
    },
    {
      property: 'IsActive',
      header: 'Status',
      render: datum => datum.IsActive? 'Active' : 'Inactive'
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
    <Box fill overflow={{ vertical: 'scroll' }} pad="small" gap="large">
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
            label="New Question"
            onClick={() => setAddQuestion(true)}
            primary
            color="status-critical"
          />
        </Box>
      </Box>

      {loading ? (
        <Box pad="medium" align="center">
          <Text>Loading questions...</Text>
        </Box>
      ) : (
        <Box>
          <Data
            data={data}
            properties={properties}
            paginate={{
              step,
              page,
              onStepChange: setStep,
              onPageChange: setPage
            }}
          >
            <Toolbar>
              <DataSearch />
              {/* <DataTableGroups
                groups={options?.filter(
                  (option) => ['QuestionType', 'IsActive'].includes(option.property)
                )}
                setGroupBy={setGroupBy}
              /> */}
              <DataTableColumns
                drop
                options={options}
              />
              <DataFilters layer>
                <DataFilter property="QuestionId" />
                <DataFilter property="QuestionText" />
                <DataFilter property="QuestionType" />
                <DataFilter property="CategoryNames" />
                <DataFilter property="SiteNames" />
                <DataFilter property="IsActive" />
              </DataFilters>
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
            <FilteredDataTable
              columns={columns}
              pad={{ horizontal: 'small', vertical: 'xsmall' }}
              background={{
                header: 'dark-2',
                body: ['dark-1', 'dark-2'],
              }}
              border
              groupBy={groupBy}
            />
            <Box align="center" margin={{ top: 'medium' }}>
              <Pagination
              />
            </Box>
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
              IsActive: true,
            });
          }}
          yesPrompt="Add"
          noPrompt="Cancel"
          estimatedTime={5}
          onSuccess={() => {
            handleReload();
            setAddQuestion(false);
          }}
          progressLabel={`Adding question ${formValues.QuestionText}...`}
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
              IsActive: true,
            });
          }}
          yesPrompt="Save"
          noPrompt="Cancel"
          estimatedTime={5}
          onSuccess={() => {
            handleReload();
            setEditQuestion(null);
          }}
          progressLabel={`Editing question ${formValues.QuestionText}...`}
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
            handleReload();
            setDeleteQuestion(null);
          }}
          progressLabel={`Deleting question ${deleteQuestion.QuestionText}...`}
        />
      )}
    </Box>
  );
};

export default QuestionsTable;
