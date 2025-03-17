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
import { SessionContext, useMonitor } from '../../../context/session';

const ChecklistSubmissions = () => {
  const { client } = useContext(SessionContext);
  const [submissions, setSubmissions] = useState([]);
  const [sites, setSites] = useState([]);
  const [filters, setFilters] = useState({
    siteId: '',
    startDate: '',
    endDate: '',
  });
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  useMonitor(
    client,
    ['/api/sites'],
    ({ ['/api/sites']: siteData }) => {
      if (siteData) {
        setSites(siteData.map(site => ({
          label: site.SiteName,
          value: site.SiteId.toString(),
        })));
      }
    },
    [reloadTrigger]
  );

  useEffect(() => {
    fetchSubmissions();
  }, [filters]);

  const fetchSubmissions = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.siteId) queryParams.append('siteId', filters.siteId?.value);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await client.get(`/api/checklist/filters?${queryParams}`);
      console.log(response)
      setSubmissions(response.data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    }
  };

  const exportToPDF = async (submissionId) => {
    try {
      const response = await client.get(`/api/checklist/export/${submissionId}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `checklist-${submissionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  const handleReload = () => {
    setLoading(true);
    setReloadTrigger(prev => prev + 1);
    fetchSubmissions();
  };

  const columns = [
    {
      property: 'siteName',
      header: 'Site',
      primary: true,
    },
    {
      property: 'userName',
      header: 'User',
    },
    {
      property: 'completedDate',
      header: 'Completed Date',
      render: datum => datum.completedDate ? new Date(datum.completedDate).toLocaleString() : '-',
    },
    {
      property: 'status',
      header: 'Status',
      render: datum => (
        <Text color={datum.status === 'completed' ? 'status-ok' : 'status-warning'}>
          {datum.status || 'pending'}
        </Text>
      ),
    },
    {
      property: 'actions',
      header: 'Actions',
      render: datum => (
        <Button
          icon={<Download />}
          onClick={() => exportToPDF(datum.id)}
          tip="Export to PDF"
          plain
          disabled={datum.status !== 'completed'}
        />
      ),
    },
  ];

  return (
    <CoverPage title="Checklist Submissions">
      <Box pad="medium" gap="medium">
        <Card background="dark-1">
          <CardHeader pad="medium">
            <Text weight="bold">Filters</Text>
          </CardHeader>
          <CardBody pad="medium">
            <Box direction="row" gap="medium">
              <Select
                placeholder="Select Site"
                options={sites || []}
                labelKey="label"
                valueKey="value"
                value={filters.siteId}
                onChange={({ value }) => setFilters(prev => ({ ...prev, siteId: value }))}
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
            </Box>
          </CardBody>
        </Card>

        <Box direction="row" justify="end" margin={{ bottom: 'small' }}>
          <Button
            secondary
            color="status-critical"
            label="Reload"
            onClick={handleReload}
            disabled={loading}
          />
        </Box>

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
    </CoverPage>
  );
};

export default ChecklistSubmissions;