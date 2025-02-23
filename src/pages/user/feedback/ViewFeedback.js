import React, { useState, useContext } from "react";
import {
    Box,
    Text,
    Spinner,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Grid,
    DateInput,
    Select,
    Button,
    Stack,
    Meter,
    Chart,
    TextInput,
    DataTable,
    Tip,
    SelectMultiple,
} from "grommet";
import { Star, Analytics, Filter, Search } from "grommet-icons";
import { SessionContext, useMonitor } from "../../../context/session";

const RatingChart = ({ data }) => {
    const chartData = data.map(item => ({
        value: [new Date(item.date), parseInt(item.answer)],
        label: item.Question.QuestionText
    }));

    return (
        <Box height="small">
            <Chart
                type="line"
                values={chartData}
                size={{ width: 'full', height: 'small' }}
                aria-label="Rating trends"
                color="status-warning"
                thickness="xsmall"
            />
        </Box>
    );
};

const QuestionRatingCard = ({ question, rating, count }) => (
    <Card background="dark-1" elevation="none">
        <CardBody pad="medium">
            <Box gap="small">
                <Text weight="bold" color="light-1">{question}</Text>
                <Stack anchor="center">
                    <Meter
                        type="circle"
                        values={[{
                            value: (rating / 5) * 100,
                            color: 'status-warning'
                        }]}
                        size="small"
                        thickness="small"
                    />
                    <Box align="center">
                        <Text size="small" color="light-1">{rating.toFixed(1)}</Text>
                        <Text size="xsmall" color="light-3">{count} responses</Text>
                    </Box>
                </Stack>
            </Box>
        </CardBody>
    </Card>
);

const ViewFeedback = () => {
    const { client } = useContext(SessionContext);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        siteId: [],
        categoryId: [],
        startDate: '',
        endDate: '',
    });
    const [sites, setSites] = useState([]);
    const [categories, setCategories] = useState([]);
    const [analytics, setAnalytics] = useState({
        overallRating: 0,
        questionRatings: [],
        trendData: [],
    });
    const [searchText, setSearchText] = useState('');

    useMonitor(
        client,
        ['/api/sites', '/api/site-categories'],
        ({ ['/api/sites']: siteData, ['/api/site-categories']: categoryData }) => {
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
        }
    );

    const formatDate = (dateValue) => {
        if (!dateValue) return '';
        // Handle array/string date values from DateInput
        const date = Array.isArray(dateValue) ? dateValue[0] : dateValue;
        return new Date(date).toISOString().split('T')[0];
    };

    const fetchFeedback = async () => {
        setLoading(true);
        const queryParams = new URLSearchParams();

        // Handle multiple siteIds
        if (filters.siteId?.length > 0) {
            filters.siteId.forEach(site => {
                queryParams.append('siteId', site.value);
            });
        }

        // Handle multiple categoryIds
        if (filters.categoryId?.length > 0) {
            filters.categoryId.forEach(category => {
                queryParams.append('categoryId', category.value);
            });
        }

        // Handle dates
        if (filters.startDate) {
            queryParams.append('startDate', formatDate(filters.startDate));
        }
        if (filters.endDate) {
            queryParams.append('endDate', formatDate(filters.endDate));
        }

        try {
            const response = await client.get(`/api/question-feedback/filter?${queryParams.toString()}`);
            setFeedbacks(response);

            // Calculate analytics
            const questionRatings = {};
            const questionCounts = {};
            let totalRating = 0;
            let totalCount = 0;

            response.forEach(feedback => {
                const rating = parseInt(feedback.answer);
                const questionText = feedback.Question.QuestionText;

                if (feedback.Question.QuestionType === 'rating') {
                    totalRating += rating;
                    totalCount++;

                    if (!questionRatings[questionText]) {
                        questionRatings[questionText] = 0;
                        questionCounts[questionText] = 0;
                    }
                    questionRatings[questionText] += rating;
                    questionCounts[questionText]++;
                }
            });

            setAnalytics({
                overallRating: totalCount > 0 ? totalRating / totalCount : 0,
                questionRatings: Object.entries(questionRatings).map(([question, rating]) => ({
                    question,
                    rating: rating / questionCounts[question],
                    count: questionCounts[question],
                })),
                trendData: response
                    .filter(f => f.Question.QuestionType === 'rating')
                    .sort((a, b) => new Date(a.date) - new Date(b.date)),
            });
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add search filter function
    const filterFeedback = (feedback) => {
        if (!searchText) return true;

        const searchLower = searchText.toLowerCase();
        return (
            feedback.Question.QuestionText.toLowerCase().includes(searchLower) ||
            feedback.User.Username.toLowerCase().includes(searchLower) ||
            feedback.answer.toLowerCase().includes(searchLower) ||
            new Date(feedback.date).toLocaleString().toLowerCase().includes(searchLower)
        );
    };

    const columns = [
        {
            property: 'Question.QuestionText',
            header: <Text color="light-1">Question</Text>,
            render: (datum) => (
                <Text color="light-1" weight="bold">
                    {datum.Question.QuestionText}
                </Text>
            ),
        },
        {
            property: 'answer',
            header: <Text color="light-1">Response</Text>,
            render: (datum) => (
                datum.Question.QuestionType === 'rating' ? (
                    <Box direction="row" gap="xxsmall">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                color={star <= parseInt(datum.answer) ? 'status-warning' : 'dark-3'}
                                size="small"
                            />
                        ))}
                    </Box>
                ) : (
                    <Text color="light-1">{datum.answer}</Text>
                )
            ),
        },
        {
            property: 'User.Username',
            header: <Text color="light-1">User</Text>,
            render: (datum) => (
                <Tip content={datum.User.Email}>
                    <Text color="light-3" size="small">
                        {datum.User.Username}
                    </Text>
                </Tip>
            ),
        },
        {
            property: 'date',
            header: <Text color="light-1">Date</Text>,
            render: (datum) => (
                <Text color="dark-4" size="small">
                    {new Date(datum.date).toLocaleString()}
                </Text>
            ),
        },
    ];

    return (
        <Box fill overflow={{ vertical: 'auto' }} pad="medium" gap="medium">
            <Card background="dark-1" elevation="none">
                <CardHeader pad="medium">
                    <Box direction="row" justify="between" align="center" fill>
                        <Box direction="row" gap="small" align="center">
                            <Analytics color="light-1" />
                            <Heading level={3} margin="none" color="light-1">
                                Feedback Analytics
                            </Heading>
                        </Box>
                        <Button
                            icon={<Filter />}
                            onClick={fetchFeedback}
                            primary
                            color="status-warning"
                        />
                    </Box>
                </CardHeader>
                <CardBody pad="medium">
                    <Grid columns="small" gap="medium">
                        <Box gap="small">
                            <Text color="light-3">Sites</Text>
                            <SelectMultiple
                                options={sites}
                                value={filters.siteId || []}
                                onChange={({ value: nextValue }) =>
                                    setFilters(prev => ({ ...prev, siteId: nextValue }))
                                }
                                placeholder="All Sites"
                                labelKey="label"
                                valueKey={{ key: 'value', reduce: false }}
                                clear
                            />
                        </Box>
                        <Box gap="small">
                            <Text color="light-3">Categories</Text>
                            <SelectMultiple
                                options={categories}
                                value={filters.categoryId || []}
                                onChange={({ value: nextValue }) =>
                                    setFilters(prev => ({ ...prev, categoryId: nextValue }))
                                }
                                placeholder="All Categories"
                                labelKey="label"
                                valueKey={{ key: 'value', reduce: false }}
                                clear
                            />
                        </Box>
                        <Box gap="small">
                            <Text color="light-3">Start Date</Text>
                            <DateInput
                                format="yyyy-mm-dd"
                                value={filters.startDate}
                                onChange={({ value }) => setFilters({ ...filters, startDate: value })}
                                calendarProps={{
                                    bounds: ['2020-01-01', '2025-12-31']
                                }}
                            />
                        </Box>
                        <Box gap="small">
                            <Text color="light-3">End Date</Text>
                            <DateInput
                                format="yyyy-mm-dd"
                                value={filters.endDate}
                                onChange={({ value }) => setFilters({ ...filters, endDate: value })}
                                calendarProps={{
                                    bounds: ['2020-01-01', '2025-12-31']
                                }}
                            />
                        </Box>
                    </Grid>
                </CardBody>
            </Card>

            {loading ? (
                <Box pad="medium" align="center">
                    <Spinner />
                </Box>
            ) : (
                <Box gap="medium">
                    <Card background="dark-1" elevation="none">
                        <CardHeader pad="medium">
                            <Text color="light-1" weight="bold">Rating Trends</Text>
                        </CardHeader>
                        <CardBody pad="medium">
                            <RatingChart data={analytics.trendData} />
                        </CardBody>
                    </Card>

                    <Grid columns={{ count: 'fit', size: 'small' }} gap="medium">
                        {analytics.questionRatings.map((item, index) => (
                            <QuestionRatingCard
                                key={index}
                                question={item.question}
                                rating={item.rating}
                                count={item.count}
                            />
                        ))}
                    </Grid>

                    <Card background="dark-1" elevation="none">
                        <CardHeader pad="medium">
                            <Box direction="row" justify="between" align="center" fill>
                                <Text color="light-1" weight="bold">Feedback List</Text>
                                <Box width="medium">
                                    <TextInput
                                        placeholder="Search feedback..."
                                        value={searchText}
                                        onChange={(event) => setSearchText(event.target.value)}
                                        icon={<Search color="light-3" />}
                                    />
                                </Box>
                            </Box>
                        </CardHeader>
                        <CardBody>
                            <DataTable
                                columns={columns}
                                data={feedbacks.filter(filterFeedback)}
                                step={10}
                                paginate
                                background={{
                                    header: { color: 'dark-2' },
                                    body: ['dark-1', 'dark-2'],
                                }}
                                border={{
                                    header: { side: 'bottom', color: 'border' },
                                    body: { side: 'bottom', color: 'border' },
                                }}
                                sort={{
                                    property: 'date',
                                    direction: 'desc'
                                }}
                                onSort={({ property, direction }) => {
                                    const sortedFeedbacks = [...feedbacks].sort((a, b) => {
                                        if (property === 'date') {
                                            return direction === 'asc'
                                                ? new Date(a.date) - new Date(b.date)
                                                : new Date(b.date) - new Date(a.date);
                                        }
                                        return direction === 'asc'
                                            ? a[property] > b[property] ? 1 : -1
                                            : b[property] > a[property] ? 1 : -1;
                                    });
                                    setFeedbacks(sortedFeedbacks);
                                }}
                            />
                        </CardBody>
                    </Card>
                </Box>
            )}
        </Box>
    );
};

export default ViewFeedback;