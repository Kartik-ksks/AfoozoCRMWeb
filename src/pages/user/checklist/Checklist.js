import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Select,
  Button,
  Grid,
} from 'grommet';
import { CoverPage } from '../../../components';
import { SessionContext, useMonitor } from '../../../context/session';
import ChecklistItems from './ChecklistItems';

const Checklist = () => {
  const { client } = useContext(SessionContext);
  const [selectedSite, setSelectedSite] = useState('');
  const [sites, setSites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checklist, setChecklist] = useState(null);

  // Monitor sites data
  useMonitor(client, ['/api/sites'], ({ ['/api/sites']: siteData }) => {
    if (siteData) {
      setSites(siteData.map(site => ({
        label: site.SiteName,
        value: site.SiteId.toString()
      })));
    }
  });

  // Fetch categories when site is selected
  useEffect(() => {
    if (selectedSite) {
      client.get(`/api/checklist/categories/${selectedSite}`)
        .then(response => {
          setCategories(response);
        })
        .catch(error => {
          console.error('Error fetching categories:', error);
        });

      client.get(`/api/checklist/daily/${selectedSite}`)
        .then(response => {
          setChecklist(response);
        })
        .catch(error => {
          console.error('Error fetching checklist:', error);
        });
    }
  }, [selectedSite, client]);

  return (
    <CoverPage title="Daily Checklist">
      <Box pad="medium" gap="medium">
        <Card background="dark-1">
          <CardHeader pad="medium">
            <Heading level={3} margin="none">Select Site</Heading>
          </CardHeader>
          <CardBody pad="medium">
            <Box width="medium">
              <Select
                placeholder="Choose a site"
                options={sites}
                labelKey="label"
                valueKey="value"
                value={selectedSite}
                onChange={({ value }) => setSelectedSite(value.value)}
              />
            </Box>
          </CardBody>
        </Card>

        {selectedSite && checklist && (
          <ChecklistItems
            checklist={checklist}
            categories={categories}
            siteId={selectedSite}
          />
        )}
      </Box>
    </CoverPage>
  );
};

export default Checklist;