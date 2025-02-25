import React from 'react';
import { Box, Heading } from 'grommet';
import { CoverPage } from '../../../components';
import Summary from './Summary';

const Home = () => {
  return (
    <CoverPage title="Dashboard">
      <Heading level={2} pad="medium">Admin Dashboard</Heading>
      <Box pad="medium" gap="medium">
        <Summary />
      </Box>
    </CoverPage>
  );
};

export default Home;
