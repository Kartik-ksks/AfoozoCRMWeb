import React from 'react';
import { Box, Text, Heading, Paragraph } from 'grommet';
import { useParams } from 'react-router-dom';
import { CoverPage, RoutedTabs } from '../../../components';
import Checklist from './Checklist';

const ChecklistManagement = () => {
    const { checklistType } = useParams();

    const renderTabTitle = (title) => <Text size="small">{title}</Text>;

    const renderDefaultTab = () => (
        <Box align="center" pad="small" gap="small">
            <Heading level="2">Overview of Checklist Management</Heading>
            <Paragraph margin={{ top: 'none', bottom: 'none' }}>
                Manage checklist categories and items from the tabs above.
            </Paragraph>
        </Box>
    );

    return (
        <CoverPage title="Checklist Management">
            <Box pad="medium" gap="medium">
                <RoutedTabs
                    path="/checklist"
                    selected={checklistType || ''}
                    items={[
                        {
                            key: '',
                            title: renderTabTitle('Overview'),
                            children: renderDefaultTab(),
                        },
                        {
                            key: 'daily',
                            title: renderTabTitle('Daily Checklist'),
                            children: <Checklist />,
                        },
                    ]}
                />
            </Box>
        </CoverPage>
    );
};

export default ChecklistManagement;