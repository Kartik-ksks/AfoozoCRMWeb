import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Grid,
  Stack,
  Text,
  Button,
} from 'grommet';
import { Group, Location, Help, Star, LinkNext } from 'grommet-icons';
import { SessionContext, useMonitor } from '../../../context/session';
import { useNavigate } from 'react-router-dom';
import AnimatedMeter from '../../../components/AnimatedMeter';

const Summary = () => {
  const { client } = useContext(SessionContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
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
        feedbacks.forEach(f => totalRating += parseInt(f.rating));

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
      <Grid columns={{ count: 'fit', size: ['auto', 'small'] }} gap="medium" fill="horizontal">
        {/* Cards for stats */}
        {[
          { label: 'Total Users', icon: <Group />, count: stats.users, path: '/masters/users', bg: 'brand' },
          { label: 'Total Sites', icon: <Location />, count: stats.sites, path: '/masters/sites', bg: 'black' },
          { label: 'Questions', icon: <Help />, count: stats.questions, path: '/masters/site-questions', bg: 'black' },
          { label: 'Total Ratings', icon: <Star />, count: stats.totalFeedbacks, path: '/feedback/view-feedback', bg: 'status-warning' },
        ].map(({ label, icon, count, path, bg }) => (
          <Card key={label} background={bg} elevation="none" height="xsmall">
            <CardHeader pad={{ horizontal: 'medium', vertical: 'small' }}>
              <Box direction="row" justify="between" align="center" fill>
                <Box direction="row" gap="small" align="center">
                  {icon}
                  <Text color="light-1" size="small">{label}</Text>
                </Box>
                <Button plain icon={<LinkNext size="small" color="light-1" />} onClick={() => navigate(path)} />
              </Box>
            </CardHeader>
            <CardBody pad={{ horizontal: 'medium', bottom: 'medium' }}>
              <Text size="xlarge" weight="bold" color="light-1">{count}</Text>
            </CardBody>
          </Card>
        ))}
      </Grid>

      <Grid columns={["2/3", "1/3"]} gap="medium" fill="horizontal">
        {/* Overall Rating */}
        <Card background="dark-1" elevation="none">
          <CardHeader pad={{ horizontal: 'medium', vertical: 'small' }}>
            <Box direction="row" justify="between" align="center" fill>
              <Text color="light-1" weight="bold" size="small">Overall Rating</Text>
              <Button plain icon={<LinkNext size="small" color="light-3" />} onClick={() => navigate('/feedback/view-feedback')} />
            </Box>
          </CardHeader>
          <CardBody pad="medium">
            <Box direction="row-responsive" gap="large" align="center">
              <Stack anchor="center">
                <AnimatedMeter
                  type="pie"
                  size="small"
                  thickness="medium"
                  background="dark-3"
                  color="status-warning"
                  target={(stats.overallRating / 5) * 100}
                />
                <Box align="center">
                  <Text size="xlarge" weight="bold" color="accent-1">{stats.overallRating.toFixed(1)}</Text>
                  <Box direction="row" gap="xxsmall">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} color={star <= Math.round(stats.overallRating) ? 'accent-3' : 'dark-4'} size="small" />
                    ))}
                  </Box>
                </Box>
              </Stack>
              <Text size="medium" color="light-4" margin={{ top: "small" }}>Based on <Text weight="bold">{stats.totalFeedbacks}</Text> reviews</Text>
            </Box>
          </CardBody>
        </Card>

        {/* User & Site Status */}
        <Box gap="medium">
          {[{
            label: 'User Status', active: stats.activeUsers, total: stats.users, color: 'brand', path: '/masters/users'
          }, {
            label: 'Site Status', active: stats.activeSites, total: stats.sites, color: 'yellow', path: '/masters/sites'
          }].map(({ label, active, total, color, path }) => (
            <Card key={label} background="dark-1" elevation="none">
              <CardHeader pad={{ horizontal: 'medium', vertical: 'small' }}>
                <Box direction="row" justify="between" align="center" fill>
                  <Text color="light-1" size="small">{label}</Text>
                  <Button plain icon={<LinkNext size="small" color="light-3" />} onClick={() => navigate(path)} />
                </Box>
              </CardHeader>
              <CardBody pad="medium" align="center">
                <Stack anchor="center">
                  <AnimatedMeter
                    type="pie"
                    size="xsmall"
                    thickness="small"
                    color={color}
                    target={(active / total) * 100 || 0}
                  />
                  <Box align="center">
                    <Text weight="bold" size="medium" color="light-1">{active}</Text>
                    <Text size="xsmall" color="light-3">Active</Text>
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Box>
      </Grid>
    </Box>
  );
};

export default Summary;
