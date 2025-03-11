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
} from "grommet";
import { Star, Analytics, Filter } from "grommet-icons";
import { SessionContext, useMonitor } from "../../../context/session";

const RatingChart = ({ data }) => {
    const chartData = data.map(item => ({
        value: [new Date(item.date), item.rating],
        label: item.siteName
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

const SiteRatingCard = ({ siteName, rating, count }) => (
    <Card background="dark-1" elevation="none">
        <CardBody pad="medium">
            <Box gap="small">
                <Text weight="bold" color="light-1">{siteName}</Text>
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
                        <Text size="xsmall" color="light-3">{count} reviews</Text>
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
        siteId: '',
        categoryId: '',
        startDate: '',
        endDate: '',
    });
    const [sites, setSites] = useState([]);
    const [categories, setCategories] = useState([]);
    const [analytics, setAnalytics] = useState({
        overallRating: 0,
        siteRatings: [],
        trendData: [],
    });

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

    const fetchFeedback = async () => {
        setLoading(true);
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });

        try {
            const response = await client.get(`/api/question-feedback/filter?${queryParams.toString()}`);
            setFeedbacks(response);

            // Calculate analytics
            const siteRatings = {};
            const siteCounts = {};
            let totalRating = 0;
            const timelineData = [];

            response.forEach(feedback => {
                totalRating += feedback.rating;

                if (!siteRatings[feedback.siteName]) {
                    siteRatings[feedback.siteName] = 0;
                    siteCounts[feedback.siteName] = 0;
                }
                siteRatings[feedback.siteName] += feedback.rating;
                siteCounts[feedback.siteName]++;

                timelineData.push({
                    date: feedback.created_at,
                    rating: feedback.rating,
                    siteName: feedback.siteName,
                });
            });

            setAnalytics({
                overallRating: totalRating / response.length,
                siteRatings: Object.entries(siteRatings).map(([site, rating]) => ({
                    siteName: site,
                    rating: rating / siteCounts[site],
                    count: siteCounts[site],
                })),
                trendData: timelineData,
            });
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setLoading(false);
        }
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
                            <Text color="light-3">Site</Text>
                            <Select
                                options={sites}
                                value={filters.siteId}
                                onChange={({ value }) => setFilters({ ...filters, siteId: value })}
                                placeholder="All Sites"
                                clear
                            />
                        </Box>
                        <Box gap="small">
                            <Text color="light-3">Category</Text>
                            <Select
                                options={categories}
                                value={filters.categoryId}
                                onChange={({ value }) => setFilters({ ...filters, categoryId: value })}
                                placeholder="All Categories"
                                clear
                            />
                        </Box>
                        <Box gap="small">
                            <Text color="light-3">Start Date</Text>
                            <DateInput
                                format="yyyy-mm-dd"
                                value={filters.startDate}
                                onChange={({ value }) => setFilters({ ...filters, startDate: value })}
                            />
                        </Box>
                        <Box gap="small">
                            <Text color="light-3">End Date</Text>
                            <DateInput
                                format="yyyy-mm-dd"
                                value={filters.endDate}
                                onChange={({ value }) => setFilters({ ...filters, endDate: value })}
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
                        {analytics.siteRatings.map((site, index) => (
                            <SiteRatingCard
                            key={index}
                                siteName={site.siteName}
                                rating={site.rating}
                                count={site.count}
                            />
                        ))}
                    </Grid>

                    <Box gap="medium">
                        {feedbacks.map((feedback, index) => (
                            <Card key={index} background="dark-1" elevation="none">
                                <CardBody pad="medium" gap="small">
                            <Box direction="row" justify="between" align="center">
                                <Box direction="row" gap="xxsmall">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                                    color={star <= feedback.rating ? 'status-warning' : 'dark-3'}
                                            size="small"
                                        />
                                    ))}
                                </Box>
                                        <Text size="small" color="light-3">{feedback.siteName}</Text>
                            </Box>
                                    <Text color="light-1">{feedback.comment}</Text>
                            <Text size="small" color="dark-4">
                                {new Date(feedback.created_at).toLocaleString()}
                            </Text>
                                </CardBody>
                            </Card>
                    ))}
            </Box>
                </Box>
            )}
        </Box>
    );
};

export default ViewFeedback;