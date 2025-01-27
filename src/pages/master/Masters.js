import React from 'react';
import { Box, Heading, Markdown, Paragraph, Text } from 'grommet';
import { useParams } from 'react-router-dom';

import { RoutedTabs } from '../../components';
// import { InfoBox } from '../../info';
import Users from './Users';

const Masters = () => {
  const { master } = useParams();

  const renderDefaultTab = () => (
    <Box align="center" pad="small" gap="small">
      <Heading level="2">Overview of Masters</Heading>
      <Paragraph margin={{ top: 'none', bottom: 'none' }}>
        Select a log file from the tabs above. The selected log file will be
        displayed in this browser window for you to examine and search through.
      </Paragraph>
      {/* <InfoBox
        content={
          <Text>
            To access other logs, use the RMC Command:
            <Markdown>* `help show logs`</Markdown>
          </Text>
        }
      /> */}
    </Box>
  );

  const renderTabTitle = (text) => (
    <Box direction="row" gap="xsmall">
      <Text>{text}</Text>
    </Box>
  );

  return (
    <Box fill>
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
                title="Users"
                uri="/api/users/all-users"
              />
            ),
          },
        ]}
      />
    </Box>
  );
};

export default Masters;
