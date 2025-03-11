import React, { useContext, useState } from 'react';
import {
    Box,
    Card,
    CardHeader,
    CardBody,
    Select,
    Button,
    CheckBox,
    Text,
} from 'grommet';
import { SessionContext, useMonitor } from '../../../context/session';
import QuestionLayer from './QuestionLayer';

const SiteFeedbackCard = () => {
    const { client } = useContext(SessionContext);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSite, setSelectedSite] = useState('');
    const [showAll, setShowAll] = useState(false);
    const [sites, setSites] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState(null);
    const [reloadTrigger, setReloadTrigger] = useState(0);

    // Monitor sites and categories
    useMonitor(
        client,
        ['/api/sites', '/api/site-categories'],
        ({
            ['/api/sites']: siteData,
            ['/api/site-categories']: categoryData,
        }) => {
            if (siteData) {
                setSites(siteData.map(site => ({
                    label: site.SiteName,
                    value: site.SiteId.toString(),
                })));
            }
            if (categoryData) {
                setCategories(categoryData.map(category => ({
                    label: category.CategoryName,
                    value: category.CategoryId.toString(),
                })));
            }
            if (siteData && categoryData) {
                setLoading(false);
            }
        },
        [reloadTrigger]
    );

    const handleReload = () => {
        setLoading(true);
        setReloadTrigger(prev => prev + 1);
    };

    const handleSearch = async () => {
        const queryParams = new URLSearchParams();
        if (selectedCategory) {
            queryParams.append('categoryId', selectedCategory);
        }
        if (selectedSite) {
            queryParams.append('siteId', selectedSite);
        }
        if (showAll) {
            queryParams.append('showAll', 'true');
        }

        const response = await client.get(`/api/questions/filter?${queryParams.toString()}`);
        console.log(response);
        if (response) {
            setQuestions(response);
        }
    };

    const handleSubmitAnswers = async (formData) => {
        try {
            const response = await client.post('/api/question-feedback', formData);
            if (response.ok) {
                setQuestions(null); // Close the layer
                // Maybe show a success message
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    return (
    <>
            <Box gap="medium">
                <Box gap="small">
                    <Text>Feedback Category</Text>
                    <Select
                        placeholder="--Select--"
                        options={categories}
                        labelKey="label"
                        valueKey="value"
                        value={selectedCategory}
                        onChange={({ value }) => setSelectedCategory(value.value)}
                    />
                </Box>

                <Box gap="small">
                    <Text>Site Name</Text>
                    <Select
                        placeholder="--Select--"
                        options={sites}
                        labelKey="label"
                        valueKey="value"
                        value={selectedSite}
                        onChange={({ value }) => setSelectedSite(value.value)}
                    />
                </Box>

                <Box direction="row" justify="between" align="center">
                    {/* <Box direction="row" align="center" gap="small">
                        <CheckBox
                            checked={showAll}
                            onChange={e => setShowAll(e.target.checked)}
                            label="Show All Questions"
                        />
                    </Box> */}
                    <Box direction="row" gap="small">
                        <Button
                            primary
                            color="brand"
                            label="Go"
                            onClick={handleSearch}
                            disabled={!selectedCategory && !selectedSite}
                        />
                        {/* <Button
                            primary
                            color="brand"
                            label="Save"
                        />
                        <Button
                            primary
                            color="brand"
                            label="Export to Excel"
                        /> */}
                    </Box>
                </Box>

                <Box direction="row" justify="end" margin={{ bottom: 'small' }}>
                    <Button
                        secondary
                        color="status-critical"
                        label="Reload"
                        onClick={handleReload}
                        disabled={loading}
                    />
                </Box>

                {questions && (
                    <QuestionLayer
                        questions={questions}
                        onClose={() => setQuestions(null)}
                        onSubmit={handleSubmitAnswers}
                    />
                )}
            </Box>
            </>
            );
};

            export default SiteFeedbackCard;