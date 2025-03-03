import React from 'react';
import { Box, Text, Heading, Paragraph } from 'grommet';
import { useParams } from 'react-router-dom';
import { CoverPage, RoutedTabs } from '../../../components';
import CategoryForm from './CategoryForm';
import ChecklistItemForm from './ChecklistItemForm';
import ChecklistSubmissions from './ChecklistSubmissions';

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

    const renderCategoriesTab = () => (
        <Box pad="medium">
            <CategoryForm />
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
                            key: 'categories',
                            title: renderTabTitle('Categories'),
                            children: renderCategoriesTab(),
                        },
                        {
                            key: 'items',
                            title: renderTabTitle('Checklist Items'),
                            children: (
                                <Box pad="medium">
                                    <ChecklistItemForm />
                                </Box>
                            ),
                        },
                        {
                            key: 'submissions',
                            title: renderTabTitle('Checklist Submissions'),
                            children: <Box pad="medium">
                                <ChecklistSubmissions />
                            </Box>,
                        },
                    ]}
                />
            </Box>
        </CoverPage>
    );
};

export default ChecklistManagement;