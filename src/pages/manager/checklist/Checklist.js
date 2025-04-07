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
import { SessionContext, useMonitor } from '../../../context/session';
import ChecklistItems from './ChecklistItems';

const Checklist = () => {
  const { client } = useContext(SessionContext);
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sites, setSites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checklist, setChecklist] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  // Monitor sites data
  useMonitor(
    client,
    ['/api/sites', '/api/checklist/categories'],
    ({ ['/api/sites']: siteData, ['/api/checklist/categories']: categoryData }) => {
      if (siteData) {
        setSites(siteData.map(site => ({
          label: site.SiteName,
          value: site.SiteId.toString()
        })));
      }
      if (categoryData) {
        setCategories(categoryData.map(category => ({
          label: category.CategoryName,
          value: category.CategoryId.toString()
        })));
      }
    },
    [reloadTrigger]
  );

  // Fetch categories when site is selected
  useEffect(() => {
    if (selectedSite && selectedCategory) {
      // client.get(`/api/checklist/categories`)
      //   .then(response => {
      //     setCategories(response);
      //   })
      //   .catch(error => {
      //     console.error('Error fetching categories:', error);
      //   });

      client.get(`/api/checklist/daily/${selectedSite}`)
        .then(response => {
          setChecklist(response);
        })
        .catch(error => {
          console.error('Error fetching checklist:', error);
        });
    }
  }, [selectedSite, selectedCategory, client]);

  const handleReload = () => {
    setLoading(true);
    setReloadTrigger(prev => prev + 1);
  };

  return (
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
            <Select
              placeholder="Choose a category"
              options={categories}
              labelKey="label"
              valueKey="value"
              value={selectedCategory}
              onChange={({ value }) => setSelectedCategory(value.value)}
            />
          </Box>
        </CardBody>
      </Card>

      {selectedSite && checklist && selectedCategory && (
        <ChecklistItems
          categories={categories}
          checklist={checklist}
          selectedCategory={selectedCategory}
          siteId={selectedSite}
        />
      )}
    </Box>
  );
};

export default Checklist;