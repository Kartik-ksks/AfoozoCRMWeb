import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Text,
  DataTable,
  DateInput,
  Button,
  Select,
} from 'grommet';
import { Image } from 'grommet-icons';
import { SessionContext } from '../../../context/session';

const ChecklistSubmissions = () => {
  const { client } = useContext(SessionContext);
  const [submissions, setSubmissions] = useState([]);
  const [sites, setSites] = useState([]);
  const [filters, setFilters] = useState({
    siteId: '',
    startDate: '',
  });
  const [loading, setLoading] = useState(false);

  // Fetch sites for dropdown
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await client.get('/api/sites');
        setSites(response.map(site => ({
          label: site.SiteName,
          value: site.SiteId
        })));
      } catch (error) {
        console.error('Error fetching sites:', error);
      }
    };
    fetchSites();
  }, [client]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.siteId) {
        queryParams.append('siteId', filters.siteId.value || filters.siteId);
      }

      if (filters.startDate) {
        const startDate = new Date(filters.startDate).toISOString().split('T')[0];
        queryParams.append('startDate', startDate);
      }

      const response = await client.get(`/api/checklist/filters?${queryParams}`);

      // Transform the response data to match the new format
      const transformedData = response.map(submission => ({
        id: submission.id || submission.responseId,
        siteName: submission.siteName || 'N/A',
        categoryName: submission.categoryName || 'N/A',
        question: submission.question || 'N/A',
        userName: submission.userName || 'N/A',
        completedDate: submission.completedDate
          ? new Date(submission.completedDate).toLocaleDateString()
          : (submission.responseDate ? new Date(submission.responseDate).toLocaleDateString() : 'N/A'),
        status: submission.status || (submission.done ? 'completed' : 'pending'),
        imageUrl: submission.imageUrl || null,
        comment: submission.comment || '',
        // Additional fields
        responseId: submission.responseId,
        itemId: submission.itemId,
        userId: submission.userId,
        done: submission.done,
        responseDate: submission.responseDate
      }));

      setSubmissions(transformedData);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      property: 'question',
      header: <Text weight="bold">Question</Text>,
    },
    {
      property: 'userName',
      header: <Text weight="bold">User</Text>,
    },
    {
      property: 'completedDate',
      header: <Text weight="bold">Date</Text>,
    },
    {
      property: 'status',
      header: <Text weight="bold">Status</Text>,
      render: datum => (
        <Text color={datum.status === 'completed' ? 'status-ok' : 'status-warning'}>
          {datum.status}
        </Text>
      ),
    },
    {
      property: 'imageUrl',
      header: <Text weight="bold">Image</Text>,
      render: datum => datum.imageUrl ? (
        <Button
          icon={<Image color="brand" />}
          onClick={() => window.open(datum.imageUrl, '_blank')}
          tip="View Image"
          plain
        />
      ) : '-',
    },
    {
      property: 'comment',
      header: <Text weight="bold">Comment</Text>,
      render: datum => datum.comment || '-',
    },
  ];

  return (
    <Box pad="medium" gap="medium">
      <Card background="dark-1">
        <CardHeader pad="medium">
          <Text weight="bold">Date Filters</Text>
        </CardHeader>
        <CardBody pad="medium">
          <Box direction="row" gap="medium" align="center">
            <Select
              placeholder="Select Site"
              options={sites}
              labelKey="label"
              valueKey="value"
              value={filters.siteId}
              onChange={({ option }) => setFilters(prev => ({ ...prev, siteId: option.value }))}
              clear
            />
            <DateInput
              format="mm/dd/yyyy"
              value={filters.startDate}
              onChange={({ value }) => setFilters(prev => ({ ...prev, startDate: value }))}
              placeholder="Date"
            />
            <Button
              primary
              color="brand"
              label="Search"
              onClick={fetchSubmissions}
              disabled={loading}
            />
          </Box>
        </CardBody>
      </Card>

      <Card background="dark-1">
        <CardHeader pad="medium">
          <Text weight="bold">Checklist Submissions</Text>
        </CardHeader>
        <CardBody pad={{ horizontal: "small" }}>
          <DataTable
            columns={columns}
            data={submissions}
            step={10}
            paginate
            background={{
              header: { color: 'dark-2', opacity: 'strong' },
              body: ['dark-1', 'dark-2'],
            }}
            border={{ color: 'border', side: 'horizontal', size: '1px' }}
            pad={{ horizontal: "small", vertical: "xsmall" }}
            placeholder={
              submissions.length === 0 ? (
                <Box pad="medium" align="center">
                  <Text color="text-weak">No submissions found. Use the filters above to search.</Text>
                </Box>
              ) : null
            }
            sortable
            resizeable
          />
        </CardBody>
      </Card>
    </Box>
  );
};

export default ChecklistSubmissions;