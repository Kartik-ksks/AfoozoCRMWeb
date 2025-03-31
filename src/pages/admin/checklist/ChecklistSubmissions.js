import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Text,
  DataTable,
  Select,
  DateInput,
  Button,
} from 'grommet';
import { Download } from 'grommet-icons';
import { CoverPage } from '../../../components';
import { SessionContext } from '../../../context/session';

const ChecklistSubmissions = () => {
  const { client } = useContext(SessionContext);
  const [submissions, setSubmissions] = useState([]);
  const [sites, setSites] = useState([]);
  const [filters, setFilters] = useState({
    siteId: '',
    startDate: '',
    endDate: '',
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
      if (filters.endDate) {
        const endDate = new Date(filters.endDate).toISOString().split('T')[0];
        queryParams.append('endDate', endDate);
      }

      const response = await client.get(`/api/checklist/filters?${queryParams}`);

      // Transform the response data to match the new format
      const transformedData = response.map(submission => ({
        id: submission.id || submission.responseId,
        siteName: submission.siteName || 'N/A',
        categoryName: submission.categoryName || 'N/A',
        question: submission.question || 'N/A',
        userName: submission.userName || 'N/A',
        completedDate: submission.completedDate ||
          (submission.responseDate ? new Date(submission.responseDate).toLocaleString() : 'N/A'),
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
      property: 'siteName',
      header: 'Site',
      primary: true,
    },
    {
      property: 'categoryName',
      header: 'Category',
    },
    {
      property: 'question',
      header: 'Question',
    },
    {
      property: 'userName',
      header: 'User',
    },
    {
      property: 'completedDate',
      header: 'Completed Date',
    },
    {
      property: 'status',
      header: 'Status',
      render: datum => (
        <Text color={datum.status === 'completed' ? 'status-ok' : 'status-warning'}>
          {datum.status}
        </Text>
      ),
    },
    {
      property: 'imageUrl',
      header: 'Image',
      render: datum => datum.imageUrl ? (
        <Button
          icon={<Download />}
          onClick={() => window.open(datum.imageUrl, '_blank')}
          tip="View Image"
          plain
        />
      ) : '-',
    },
    {
      property: 'comment',
      header: 'Comment',
      render: datum => datum.comment || '-',
    },
  ];

  return (
    <Box pad="medium" gap="medium">
      <Card background="dark-1">
        <CardHeader pad="medium">
          <Text weight="bold">Filters</Text>
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
              placeholder="Start Date"
            />
            <DateInput
              format="mm/dd/yyyy"
              value={filters.endDate}
              onChange={({ value }) => setFilters(prev => ({ ...prev, endDate: value }))}
              placeholder="End Date"
            />
            <Button
              primary
              label="Search"
              onClick={fetchSubmissions}
              disabled={loading}
            />
          </Box>
        </CardBody>
      </Card>

      <DataTable
        columns={columns}
        data={submissions}
        background={{
          header: 'dark-2',
          body: ['dark-1', 'dark-2'],
        }}
        border
        pad="small"
        placeholder={
          <Box pad="medium" align="center">
            <Text color="text-weak">No submissions found</Text>
          </Box>
        }
      />
    </Box>
  );
};

export default ChecklistSubmissions;