import React from 'react';
import { Box, Heading, Markdown, Paragraph, Text } from 'grommet';
import { useParams } from 'react-router-dom';

import { CoverPage, RoutedTabs } from '../../../components';
// import { InfoBox } from '../../info';

import Users from './Users';
import { SiteTable } from './sites';
import { CategoryTable } from './sitecategories';
import { QuestionsTable } from './siteQuestions';

const UsersUri = '/api/users';
const SitesUri = '/api/sites';

const Masters = () => {
  const { master } = useParams();

  const renderDefaultTab = () => (
    <Box align="center" pad="small" gap="small">
      <Heading level="2">Overview of Masters</Heading>
      <Paragraph margin={{ top: 'none', bottom: 'none' }}>
        Manage users and roles from the tabs above.
      </Paragraph>
    </Box>
  );

  const renderTabTitle = (text) => (
    <Box direction="row" gap="xsmall">
      <Text>{text}</Text>
    </Box>
  );

  return (
    <Box fill>
      <CoverPage title="Masters">
        <RoutedTabs
          path="/masters"
          selected={master || ''}
          items={[
            {
              key: '',
              title: renderTabTitle('Overview'),
              children: renderDefaultTab(),
            },
            {
              key: 'users',
              title: renderTabTitle('Users'),
              children: (
                <Users
                  title={renderTabTitle('Users')}
                  uri={UsersUri}
                />
              ),
            },
            {
              key: 'site-categories',
              title: renderTabTitle('Site Categories'),
              children: (
                <CategoryTable
                  title='Site Categories'
                  uri={SitesUri} />
              )
            },
            {
              key: 'sites',
              title: renderTabTitle('Sites'),
              children: (
                <SiteTable
                  title={renderTabTitle('Sites')}
                  uri={SitesUri} />
              )
            },
            {
              key: 'site-questions',
              title: renderTabTitle('Site Questions'),
              children: (
                <QuestionsTable
                  title={renderTabTitle('Site Questions')}
                  uri={SitesUri} />
              )

            },
          ]}
        />
      </CoverPage>
    </Box>
  );
};

export default Masters;
