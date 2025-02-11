import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Heading } from 'grommet';
// import { SiteTable } from '../sites';


const Masters = () => {
    const { master } = useParams();

    const renderMaster = () =>
        <Box pad="medium">
            <Heading level={2}>Manager Dashboard</Heading>
            {/* Add manager-specific dashboard content */}
        </Box>

    return (
        <Box pad="medium">
            {renderMaster()}
        </Box>
    );
};

export default Masters;