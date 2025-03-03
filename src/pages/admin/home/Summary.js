import React, { useContext } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Grid,
  Heading,
  Meter,
  Stack,
  Text,
  Button,
} from 'grommet';
import { Group, Location, Help, Star, LinkNext } from 'grommet-icons';
import { SessionContext, useMonitor } from '../../../context/session';
import { useNavigate } from 'react-router-dom';

const Summary = () => {
  const { client } = useContext(SessionContext);
  const navigate = useNavigate();
  const [stats, setStats] = React.useState({
    users: 0,
    sites: 0,
    categories: 0,
    questions: 0,
    activeUsers: 0,
    activeSites: 0,
    overallRating: 0,
    totalFeedbacks: 0,
  });

  useMonitor(
    client,
    [
      '/api/users',
      '/api/sites',
      '/api/site-categories',
      '/api/questions',
      '/api/feedback'
    ],
    ({
      ['/api/users']: users,
      ['/api/sites']: sites,
      ['/api/site-categories']: categories,
      ['/api/questions']: questions,
      ['/api/feedback']: feedbacks,
    }) => {
      if (users && sites && categories && questions && feedbacks) {
        let totalRating = 0;
        feedbacks.forEach(feedback => {
          totalRating += parseInt(feedback.rating);
        });

        setStats({
          users: users.length,
          sites: sites.length,
          categories: categories.length,
          questions: questions.length,
          activeUsers: users.filter(u => u.IsActive === 1).length,
          activeSites: sites.filter(s => s.IsActive === 1).length,
          overallRating: feedbacks.length > 0 ? totalRating / feedbacks.length : 0,
          totalFeedbacks: feedbacks.length,
        });
      }
    }
  );

  return (
    <Box fill pad="medium" gap="medium">
      {/* Top Stats Cards */}
      <Grid columns={{ count: 4, size: 'auto' }} gap="medium">
        <Card background="brand" elevation="none">
          <CardHeader pad={{ horizontal: 'medium', top: 'medium' }}>
            <Box direction="row" justify="between" align="center" fill>
              <Box direction="row" gap="small" align="center">
                <Group color="light-1" />
                <Text color="light-1">Total Users</Text>
              </Box>
              <Button
                plain
                icon={<LinkNext size="small" color="light-1" />}
                onClick={() => navigate('/masters/users')}
              />
            </Box>
          </CardHeader>
          <CardBody pad={{ horizontal: 'medium', vertical: 'small' }}>
            <Text size="xxlarge" weight="bold" color="light-1">
              {stats.users}
            </Text>
          </CardBody>
        </Card>

        <Card background="black" elevation="none">
          <CardHeader pad={{ horizontal: 'medium', top: 'medium' }}>
            <Box direction="row" justify="between" align="center" fill>
              <Box direction="row" gap="small" align="center">
                <Location color="light-1" />
                <Text color="light-1">Total Sites</Text>
              </Box>
              <Button
                plain
                icon={<LinkNext size="small" color="light-1" />}
                onClick={() => navigate('/masters/sites')}
              />
            </Box>
          </CardHeader>
          <CardBody pad={{ horizontal: 'medium', vertical: 'small' }}>
            <Text size="xxlarge" weight="bold" color="light-1">
              {stats.sites}
            </Text>
          </CardBody>
        </Card>

        <Card background="black" elevation="none">
          <CardHeader pad={{ horizontal: 'medium', top: 'medium' }}>
            <Box direction="row" justify="between" align="center" fill>
              <Box direction="row" gap="small" align="center">
                <Help color="light-1" />
                <Text color="light-1">Questions</Text>
              </Box>
              <Button
                plain
                icon={<LinkNext size="small" color="light-1" />}
                onClick={() => navigate('/masters/site-questions')}
              />
            </Box>
          </CardHeader>
          <CardBody pad={{ horizontal: 'medium', vertical: 'small' }}>
            <Text size="xxlarge" weight="bold" color="light-1">
              {stats.questions}
            </Text>
          </CardBody>
        </Card>

        <Card background="status-warning" elevation="none">
          <CardHeader pad={{ horizontal: 'medium', top: 'medium' }}>
            <Box direction="row" justify="between" align="center" fill>
              <Box direction="row" gap="small" align="center">
                <Star color="light-1" />
                <Text color="light-1">Total Ratings</Text>
              </Box>
              <Button
                plain
                icon={<LinkNext size="small" color="light-1" />}
                onClick={() => navigate('/feedback/view-feedback')}
              />
            </Box>
          </CardHeader>
          <CardBody pad={{ horizontal: 'medium', vertical: 'small' }}>
            <Text size="xxlarge" weight="bold" color="light-1">
              {stats.totalFeedbacks}
            </Text>
          </CardBody>
        </Card>
      </Grid>

      <Grid columns={["2/3", "1/3"]} gap="medium">
        {/* Overall Rating - Now in a 2/3 column */}
        <Card background="dark-1" elevation="none">
          <CardHeader pad="medium">
            <Box direction="row" justify="between" align="center" fill>
              <Text color="light-1" weight="bold">Overall Rating</Text>
              <Button
                plain
                icon={<LinkNext size="small" color="light-3" />}
                onClick={() => navigate('/feedback/view-feedback')}
              />
            </Box>
          </CardHeader>
          <CardBody pad="medium">
            <Box direction="row" gap="large" align="center">
              <Stack anchor="center">
                <Meter
                  type="circle"
                  size="medium"
                  thickness="small"
                  values={[{
                    value: (stats.overallRating / 5) * 100,
                    color: 'status-warning'
                  }]}
                />
                <Box align="center">
                  <Text size="xlarge" weight="bold" color="light-1">
                    {stats.overallRating.toFixed(1)}
                  </Text>
                  <Box direction="row" gap="xxsmall">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        color={star <= Math.round(stats.overallRating) ? 'status-warning' : 'dark-3'}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              </Stack>
              <Box>
                <Text size="small" color="light-3">
                  Based on {stats.totalFeedbacks} reviews
                </Text>
              </Box>
            </Box>
          </CardBody>
        </Card>

        {/* Status Rings - Now in a 1/3 column */}
        <Box gap="medium">
          <Card background="dark-1" elevation="none">
            <CardHeader pad="medium">
              <Box direction="row" justify="between" align="center" fill>
                <Text color="light-1">User Status</Text>
                <Button
                  plain
                  icon={<LinkNext size="small" color="light-3" />}
                  onClick={() => navigate('/masters/users')}
                />
              </Box>
            </CardHeader>
            <CardBody pad="medium" align="center">
              <Stack anchor="center">
                <Meter
                  type="circle"
                  size="small"
                  thickness="small"
                  values={[{
                    value: (stats.activeUsers / stats.users) * 100,
                    color: 'brand'
                  }]}
                />
                <Box align="center">
                  <Text weight="bold" size="large" color="light-1">
                    {stats.activeUsers}
                  </Text>
                  <Text size="small" color="light-3">Active</Text>
                </Box>
              </Stack>
            </CardBody>
          </Card>

          <Card background="dark-1" elevation="none">
            <CardHeader pad="medium">
              <Box direction="row" justify="between" align="center" fill>
                <Text color="light-1">Site Status</Text>
                <Button
                  plain
                  icon={<LinkNext size="small" color="light-3" />}
                  onClick={() => navigate('/masters/sites')}
                />
              </Box>
            </CardHeader>
            <CardBody pad="medium" align="center">
              <Stack anchor="center">
                <Meter
                  type="circle"
                  size="small"
                  thickness="small"
                  values={[{
                    value: (stats.activeSites / stats.sites) * 100,
                    color: 'neutral-2'
                  }]}
                />
                <Box align="center">
                  <Text weight="bold" size="large" color="light-1">
                    {stats.activeSites}
                  </Text>
                  <Text size="small" color="light-3">Active</Text>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        </Box>
      </Grid>
    </Box>
  );
};

export default Summary;