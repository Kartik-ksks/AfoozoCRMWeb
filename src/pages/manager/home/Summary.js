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
} from 'grommet';
import { Group, Location, List, Help, Star } from 'grommet-icons';
import { SessionContext, useMonitor } from '../../../context/session';
import { useNavigate } from 'react-router-dom';

const SummaryCard = ({ title, value, icon: Icon, color, path }) => {
  const navigate = useNavigate();

  return (
    <Card
      background="light-1"
      onClick={() => navigate(path)}
      hoverIndicator={{ color: 'light-2' }}
      style={{ cursor: 'pointer' }}
    >
      <CardHeader pad="small" background={color}>
        <Box direction="row" align="center" gap="small">
          <Icon color="white" />
          <Text weight="bold" color="white">{title}</Text>
        </Box>
      </CardHeader>
      <CardBody pad="medium" align="center">
        <Text size="xxlarge" weight="bold">{value}</Text>
      </CardBody>
    </Card>
  );
};

const StatusCard = ({ title, active, total, color, path }) => {
  const navigate = useNavigate();

  return (
    <Card
      background="light-1"
      onClick={() => navigate(path)}
      hoverIndicator={{ color: 'light-2' }}
      style={{ cursor: 'pointer' }}
    >
      <CardHeader pad="small">
        <Text weight="bold">{title}</Text>
      </CardHeader>
      <CardBody pad="medium">
        <Stack anchor="center">
          <Meter
            type="circle"
            values={[{
              value: (active / total) * 100,
              color: color
            }]}
            size="small"
            thickness="medium"
          />
          <Box align="center">
            <Text size="small">Active</Text>
            <Text weight="bold">{active}</Text>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  );
};

const OverallRatingCard = ({ rating, totalFeedbacks }) => {
  const navigate = useNavigate();

  return (
    <Card
      background="light-1"
      onClick={() => navigate('/feedback/view-feedback')}
      hoverIndicator={{ color: 'light-2' }}
      style={{ cursor: 'pointer' }}
      height={{ min: 'medium' }}
    >
      <CardHeader pad="medium">
        <Text weight="bold" size="large">Overall Rating</Text>
      </CardHeader>
      <CardBody pad={{ horizontal: 'medium', bottom: 'medium' }}>
        <Box gap="medium" align="center" justify="center" fill>
          <Stack anchor="center">
            <Meter
              type="circle"
              values={[{
                value: (rating / 5) * 100,
                color: 'brand'
              }]}
              size="large"
              thickness="medium"
            />
            <Box align="center">
              <Text size="xxlarge" weight="bold">
                {rating.toFixed(1)}
              </Text>
              <Box direction="row" gap="xxsmall">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    color={star <= Math.round(rating) ? 'brand' : 'light-4'}
                    size="medium"
                  />
                ))}
              </Box>
              <Text size="small" color="dark-6" margin={{ top: 'small' }}>
                Based on {totalFeedbacks} reviews
              </Text>
            </Box>
          </Stack>
        </Box>
      </CardBody>
    </Card>
  );
};

const Summary = () => {
  const { client } = useContext(SessionContext);
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
    ['/api/users', '/api/sites', '/api/site-categories', '/api/questions', '/api/feedback'],
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
    <Box gap="medium">
      <Grid
        columns={{ count: 'fit', size: 'small' }}
        gap="medium"
      >
        <SummaryCard
          title="Total Users"
          value={stats.users}
          icon={Group}
          color="brand"
          path="/masters/users"
        />
        <SummaryCard
          title="Total Sites"
          value={stats.sites}
          icon={Location}
          color="brand"
          path="/masters/sites"
        />
        <SummaryCard
          title="Questions"
          value={stats.questions}
          icon={Help}
          color="brand"
          path="/masters/site-questions"
        />
      </Grid>

      <Box align="center" pad={{ vertical: 'medium' }}>
        <Box width="medium">
          <OverallRatingCard
            rating={stats.overallRating}
            totalFeedbacks={stats.totalFeedbacks}
          />
        </Box>
      </Box>

      <Grid
        columns={{ count: 2, size: 'small' }}
        gap="medium"
      >
        <StatusCard
          title="User Status"
          active={stats.activeUsers}
          total={stats.users}
          color="brand"
          path="/masters/users"
        />
        <StatusCard
          title="Site Status"
          active={stats.activeSites}
          total={stats.sites}
          color="brand"
          path="/masters/sites"
        />
      </Grid>
    </Box>
  );
};

export default Summary;