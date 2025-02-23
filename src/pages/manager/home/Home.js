import React from 'react';
import { Box } from 'grommet';
import { CoverPage } from '../../../components';
import Summary from './Summary';

const Home = () => {
  return (
    <CoverPage title="Dashboard">
      <Box pad="medium" gap="medium">
        <Summary />
      </Box>
    </CoverPage>
  );
};

export default Home;
