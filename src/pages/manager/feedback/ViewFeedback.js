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
    Distribution,
    RadioButtonGroup,
} from "grommet";
import { Star, Analytics, Filter, Search, CircleInformation, Group, Location, Help } from "grommet-icons";
import { SessionContext, useMonitor } from "../../../context/session";

const RatingTrendChart = ({ data }) => {
    const [viewMode, setViewMode] = useState('overall');

    if (!data || data.length === 0) return null;

    let chartData;
    if (viewMode === 'overall') {
        // Calculate daily averages
        const dailyAverages = data.reduce((acc, feedback) => {
            const date = new Date(feedback.date).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { total: 0, count: 0 };
            }
            feedback.answers.forEach(answer => {
                if (answer.question.QuestionType === 'rating') {
                    acc[date].total += parseInt(answer.answer);
                    acc[date].count++;
                }
            });
            return acc;
        }, {});

        chartData = Object.entries(dailyAverages).map(([date, stats]) => ({
            value: [new Date(date), stats.total / stats.count],
            label: `Average: ${(stats.total / stats.count).toFixed(1)}`
        }));
    } else {
        // Question-specific trends
        chartData = data.flatMap(feedback =>
            feedback.answers
                .filter(answer => answer.question.QuestionType === 'rating')
                .map(answer => ({
                    value: [new Date(feedback.date), parseInt(answer.answer)],
                    label: answer.question.QuestionText
                }))
        );
    }

    return (
        <Box gap="small">
            <Box direction="row" justify="between" align="center">
                <RadioButtonGroup
                    name="viewMode"
                    options={[
                        { label: 'Overall Trend', value: 'overall' },
                        { label: 'Question-wise', value: 'questions' }
                    ]}
                    value={viewMode}
                    onChange={(event) => setViewMode(event.target.value)}
                />
                <Tip content="Shows rating trends over time">
                    <CircleInformation color="light-3" />
                </Tip>
            </Box>
            <Box height="small">
                <Chart
                    type="line"
                    values={chartData}
                    size={{ width: 'full', height: 'small' }}
                    aria-label="Rating trends"
                    color="status-warning"
                    thickness="xsmall"
                    bounds={[[new Date(data[0]?.date), new Date(data[data.length - 1]?.date)], [0, 5]]}
                    animate
                />
            </Box>
        </Box>
    );
};

const SiteDistribution = ({ data }) => {
    if (!data || data.length === 0) return null;

    const siteData = data.reduce((acc, feedback) => {
        feedback.answers.forEach(answer => {
            answer.question.SiteIds.forEach(siteId => {
                if (!acc[siteId]) {
                    acc[siteId] = { total: 0, count: 0 };
                }
                if (answer.question.QuestionType === 'rating') {
                    acc[siteId].total += parseInt(answer.answer);
                    acc[siteId].count++;
                }
            });
        });
        return acc;
    }, {});

    const distributionData = Object.entries(siteData)
        .map(([site, stats]) => ({
            value: stats.count,
            color: 'status-warning',
            label: `Site ${site} (${(stats.total / stats.count).toFixed(1)}★)`,
        }))
        .sort((a, b) => b.value - a.value);

    return (
        <Box height="small">
            <Distribution
                values={distributionData}
                animate
            />
        </Box>
    );
};

const QuestionRatingCard = ({ question, rating, count }) => (
    <Card background="dark-1" elevation="none">
        <CardBody pad="medium">
            <Box gap="small">
                <Text weight="bold" color="light-1" size="small">{question}</Text>
                <Stack anchor="center">
                    <Meter
                        type="circle"
                        values={[{
                            value: (rating / 5) * 100,
                            color: 'status-warning'
                        }]}
                        size="small"
                        thickness="small"
                        animate
                    />
                    <Box align="center">
                        <Text size="medium" weight="bold" color="light-1">{rating.toFixed(1)}</Text>
                        <Box direction="row" gap="xxsmall">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    color={star <= Math.round(rating) ? 'status-warning' : 'dark-3'}
                                    size="small"
                                />
                            ))}
                        </Box>
                        <Text size="xsmall" color="light-3" margin={{ top: 'xsmall' }}>
                            {count} responses
                        </Text>
                    </Box>
                </Stack>
            </Box>
        </CardBody>
    </Card>
);

// Add this new component for the feedback table
const FeedbackTable = ({ feedbacks, searchText, setSearchText }) => {
    const [sort, setSort] = useState({
        property: 'date',
        direction: 'desc'
    });

    const columns = [
        {
            property: 'date',
            header: <Text color="light-1">Date</Text>,
            render: (datum) => (
                <Text color="dark-4" size="small">
                    {new Date(datum.date).toLocaleString()}
                </Text>
            ),
            sortable: true,
        },
        {
            property: 'user.Username',
            header: <Text color="light-1">User</Text>,
            render: (datum) => (
                <Tip content={datum.user.Email}>
                    <Text color="light-3" size="small">
                        {datum.user.Username}
                    </Text>
                </Tip>
            ),
            sortable: true,
        },
        {
            property: 'answers',
            header: <Text color="light-1">Questions & Ratings</Text>,
            render: (datum) => (
                <Box gap="medium">
                    {datum.answers.map((answer, idx) => (
                        <Box key={idx} gap="xsmall">
                            <Text color="light-1" size="small" weight="bold">
                                {answer.question.QuestionText}
                            </Text>
                            {answer.question.QuestionType === 'rating' ? (
                                <Box direction="row" gap="xxsmall">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            color={star <= parseInt(answer.answer) ? 'status-warning' : 'dark-3'}
                                            size="small"
                                        />
                                    ))}
                                </Box>
                            ) : (
                                <Text color="light-1">{answer.answer}</Text>
                            )}
                        </Box>
                    ))}
                </Box>
            ),
        },
    ];

    const sortData = (data) => {
        return [...data].sort((a, b) => {
            if (sort.property === 'date') {
                return sort.direction === 'asc'
                    ? new Date(a.date) - new Date(b.date)
                    : new Date(b.date) - new Date(a.date);
            }
            if (sort.property === 'user.Username') {
                return sort.direction === 'asc'
                    ? a.user.Username.localeCompare(b.user.Username)
                    : b.user.Username.localeCompare(a.user.Username);
            }
            return 0;
        });
    };

    const filteredData = feedbacks.filter(feedback => {
        if (!searchText) return true;
        const searchLower = searchText.toLowerCase();

        return (
            feedback.user.Username.toLowerCase().includes(searchLower) ||
            feedback.user.Email.toLowerCase().includes(searchLower) ||
            feedback.answers.some(answer =>
                answer.question.QuestionText.toLowerCase().includes(searchLower) ||
                answer.answer.toLowerCase().includes(searchLower)
            ) ||
            new Date(feedback.date).toLocaleString().toLowerCase().includes(searchLower)
        );
    });

    return (
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
                    data={sortData(filteredData)}
                    sort={sort}
                    onSort={setSort}
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
                />
            </CardBody>
        </Card>
    );
};

// Add a summary card component
const SummaryCard = ({ icon: Icon, title, value, subValue, color }) => (
    <Card background="dark-1" elevation="none">
        <CardBody pad="medium">
            <Box direction="row" gap="medium" align="center">
                <Box
                    background={color || 'brand'}
                    pad="medium"
                    round="small"
                    align="center"
                    justify="center"
                >
                    <Icon size="medium" color="light-1" />
                </Box>
                <Box>
                    <Text color="light-3" size="small">{title}</Text>
                    <Text color="light-1" size="xxlarge" weight="bold">{value}</Text>
                    {subValue && (
                        <Text color="light-3" size="small">{subValue}</Text>
                    )}
                </Box>
            </Box>
        </CardBody>
    </Card>
);

// Add overall rating card component
const OverallRatingCard = ({ rating, totalFeedbacks }) => (
    <Card background="dark-1" elevation="none" height={{ min: 'medium' }}>
        <CardHeader pad="medium">
            <Text weight="bold" color="light-1">Overall Rating</Text>
        </CardHeader>
        <CardBody pad={{ horizontal: 'medium', bottom: 'medium' }}>
            <Box gap="medium" align="center" justify="center" fill>
                <Stack anchor="center">
                    <Meter
                        type="circle"
                        values={[{
                            value: (rating / 5) * 100,
                            color: 'status-warning'
                        }]}
                        size="large"
                        thickness="medium"
                        animate
                    />
                    <Box align="center">
                        <Text size="xxlarge" weight="bold" color="light-1">
                            {rating.toFixed(1)}
                        </Text>
                        <Box direction="row" gap="xxsmall">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    color={star <= Math.round(rating) ? 'status-warning' : 'dark-3'}
                                    size="medium"
                                />
                            ))}
                        </Box>
                        <Text size="small" color="light-3" margin={{ top: 'small' }}>
                            Based on {totalFeedbacks} reviews
                        </Text>
                    </Box>
                </Stack>
            </Box>
        </CardBody>
    </Card>
);

const ViewFeedback = () => {
    const { client } = useContext(SessionContext);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(false);
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
            const questionStats = {};
            let totalRating = 0;
            let totalCount = 0;

            response.forEach(feedback => {
                feedback.answers.forEach(answer => {
                    if (answer.question.QuestionType === 'rating') {
                        const rating = parseInt(answer.answer);
                        const questionText = answer.question.QuestionText;

                        if (!questionStats[questionText]) {
                            questionStats[questionText] = { total: 0, count: 0 };
                        }
                        questionStats[questionText].total += rating;
                        questionStats[questionText].count += 1;
                        totalRating += rating;
                        totalCount += 1;
                    }
                });
            });

            setAnalytics({
                overallRating: totalCount > 0 ? totalRating / totalCount : 0,
                questionRatings: Object.entries(questionStats).map(([question, stats]) => ({
                    question,
                    rating: stats.total / stats.count,
                    count: stats.count,
                })),
                trendData: response,
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
            feedback.user.Username.toLowerCase().includes(searchLower) ||
            feedback.user.Email.toLowerCase().includes(searchLower) ||
            feedback.answers.some(answer =>
                answer.question.QuestionText.toLowerCase().includes(searchLower) ||
                answer.answer.toLowerCase().includes(searchLower)
            ) ||
            new Date(feedback.date).toLocaleString().toLowerCase().includes(searchLower)
        );
    };

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
                    {/* Summary Section */}
                    <Grid columns={{ count: 4, size: 'small' }} gap="medium">
                        <SummaryCard
                            icon={Group}
                            title="Total Users"
                            value={new Set(feedbacks.map(f => f.userId)).size}
                            subValue="Unique users"
                            color="brand"
                        />
                        <SummaryCard
                            icon={Location}
                            title="Total Sites"
                            value={new Set(feedbacks.flatMap(f =>
                                f.answers.flatMap(a => a.question.SiteIds)
                            )).size}
                            subValue="Active sites"
                            color="neutral-2"
                        />
                        <SummaryCard
                            icon={Help}
                            title="Total Questions"
                            value={new Set(feedbacks.flatMap(f =>
                                f.answers.map(a => a.question.QuestionText)
                            )).size}
                            subValue="Active questions"
                            color="neutral-3"
                        />
                        <SummaryCard
                            icon={Star}
                            title="Total Ratings"
                            value={feedbacks.reduce((acc, f) =>
                                acc + f.answers.filter(a => a.question.QuestionType === 'rating').length, 0
                            )}
                            subValue="Total responses"
                            color="status-warning"
                        />
                    </Grid>

                    {/* Analytics Section */}
                    <Grid columns={["1/2", "1/2"]} gap="medium">
                        <OverallRatingCard
                            rating={analytics.overallRating}
                            totalFeedbacks={feedbacks.length}
                        />
                        <Card background="dark-1" elevation="none">
                            <CardHeader pad="medium">
                                <Text weight="bold" color="light-1">Rating Trends</Text>
                            </CardHeader>
                            <CardBody pad="medium">
                                <RatingTrendChart data={feedbacks} />
                            </CardBody>
                        </Card>
                    </Grid>

                    {/* Site Distribution */}
                    <Card background="dark-1" elevation="none">
                        <CardHeader pad="medium">
                            <Text weight="bold" color="light-1">Site Distribution</Text>
                        </CardHeader>
                        <CardBody pad="medium">
                            <SiteDistribution data={feedbacks} />
                        </CardBody>
                    </Card>

                    {/* Question-wise Ratings */}
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

                    {/* Feedback Table */}
                    {feedbacks.length > 0 && (
                        <FeedbackTable
                            feedbacks={feedbacks}
                            searchText={searchText}
                            setSearchText={setSearchText}
                        />
                    )}
                </Box>
            )}
        </Box>
    );
};

export default ViewFeedback;