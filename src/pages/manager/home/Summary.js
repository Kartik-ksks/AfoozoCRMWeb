import React, { useContext } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Grid,
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
    <Box fill pad={{ horizontal: "medium", vertical: "small" }} gap="medium">
      {/* Top Stats Cards - Responsive grid with better spacing */}
      <Grid
        columns={{
          count: 'fit',
          size: ['auto', 'small']
        }}
        rows="auto"
        gap="medium"
        fill="horizontal"
        margin={{ bottom: "medium" }}
      >
        {/* Total Users Card */}
        <Card background="brand" elevation="none" height="xsmall">
          <CardHeader pad={{ horizontal: 'medium', vertical: 'small' }}>
            <Box direction="row" justify="between" align="center" fill>
              <Box direction="row" gap="small" align="center">
                <Group color="light-1" />
                <Text color="light-1" size="small">Total Users</Text>
              </Box>
              <Button
                plain
                icon={<LinkNext size="small" color="light-1" />}
                onClick={() => navigate('/masters/users')}
              />
            </Box>
          </CardHeader>
          <CardBody pad={{ horizontal: 'medium', bottom: 'medium' }}>
            <Text size="xlarge" weight="bold" color="light-1">
              {stats.users}
            </Text>
          </CardBody>
        </Card>

        {/* Total Sites Card */}
        <Card background="black" elevation="none" height="xsmall">
          <CardHeader pad={{ horizontal: 'medium', vertical: 'small' }}>
            <Box direction="row" justify="between" align="center" fill>
              <Box direction="row" gap="small" align="center">
                <Location color="light-1" />
                <Text color="light-1" size="small">Total Sites</Text>
              </Box>
              <Button
                plain
                icon={<LinkNext size="small" color="light-1" />}
                onClick={() => navigate('/masters/sites')}
              />
            </Box>
          </CardHeader>
          <CardBody pad={{ horizontal: 'medium', bottom: 'medium' }}>
            <Text size="xlarge" weight="bold" color="light-1">
              {stats.sites}
            </Text>
          </CardBody>
        </Card>

        {/* Questions Card */}
        <Card background="black" elevation="none" height="xsmall">
          <CardHeader pad={{ horizontal: 'medium', vertical: 'small' }}>
            <Box direction="row" justify="between" align="center" fill>
              <Box direction="row" gap="small" align="center">
                <Help color="light-1" />
                <Text color="light-1" size="small">Questions</Text>
              </Box>
              <Button
                plain
                icon={<LinkNext size="small" color="light-1" />}
                onClick={() => navigate('/masters/site-questions')}
              />
            </Box>
          </CardHeader>
          <CardBody pad={{ horizontal: 'medium', bottom: 'medium' }}>
            <Text size="xlarge" weight="bold" color="light-1">
              {stats.questions}
            </Text>
          </CardBody>
        </Card>

        {/* Total Ratings Card */}
        <Card background="status-warning" elevation="none" height="xsmall">
          <CardHeader pad={{ horizontal: 'medium', vertical: 'small' }}>
            <Box direction="row" justify="between" align="center" fill>
              <Box direction="row" gap="small" align="center">
                <Star color="light-1" />
                <Text color="light-1" size="small">Total Ratings</Text>
              </Box>
              <Button
                plain
                icon={<LinkNext size="small" color="light-1" />}
                onClick={() => navigate('/feedback/view-feedback')}
              />
            </Box>
          </CardHeader>
          <CardBody pad={{ horizontal: 'medium', bottom: 'medium' }}>
            <Text size="xlarge" weight="bold" color="light-1">
              {stats.totalFeedbacks}
            </Text>
          </CardBody>
        </Card>
      </Grid>

      {/* Bottom Section - Better layout for details */}
      <Grid
        columns={["2/3", "1/3"]}
        gap="medium"
        fill="horizontal"
      >
        {/* Overall Rating Card */}
        <Card background="dark-1" elevation="none">
          <CardHeader pad={{ horizontal: 'medium', vertical: 'small' }}>
            <Box direction="row" justify="between" align="center" fill>
              <Text color="light-1" weight="bold" size="small">Overall Rating</Text>
              <Button
                plain
                icon={<LinkNext size="small" color="light-3" />}
                onClick={() => navigate('/feedback/view-feedback')}
              />
            </Box>
          </CardHeader>
          <CardBody pad="medium">
            <Box
              direction="row-responsive"
              gap="large"
              align="center"
              justify="start"
              height={{ min: "small" }}
            >
              <Stack anchor="center">
                <Meter
                  type="circle"
                  size="small"
                  thickness="small"
                  values={[{
                    value: (stats.overallRating / 5) * 100,
                    color: 'status-warning'
                  }]}
                />
                <Box align="center">
                  <Text size="large" weight="bold" color="light-1">
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

        {/* Status Cards */}
        <Box gap="medium">
          {/* User Status Card */}
          <Card background="dark-1" elevation="none">
            <CardHeader pad={{ horizontal: 'medium', vertical: 'small' }}>
              <Box direction="row" justify="between" align="center" fill>
                <Text color="light-1" size="small">User Status</Text>
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
                  size="xsmall"
                  thickness="small"
                  values={[{
                    value: (stats.activeUsers / stats.users) * 100,
                    color: 'brand'
                  }]}
                />
                <Box align="center">
                  <Text weight="bold" size="medium" color="light-1">
                    {stats.activeUsers}
                  </Text>
                  <Text size="xsmall" color="light-3">Active</Text>
                </Box>
              </Stack>
            </CardBody>
          </Card>

          {/* Site Status Card */}
          <Card background="dark-1" elevation="none">
            <CardHeader pad={{ horizontal: 'medium', vertical: 'small' }}>
              <Box direction="row" justify="between" align="center" fill>
                <Text color="light-1" size="small">Site Status</Text>
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
                  size="xsmall"
                  thickness="small"
                  values={[{
                    value: (stats.activeSites / stats.sites) * 100,
                    color: 'neutral-2'
                  }]}
                />
                <Box align="center">
                  <Text weight="bold" size="medium" color="light-1">
                    {stats.activeSites}
                  </Text>
                  <Text size="xsmall" color="light-3">Active</Text>
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