import React, { useContext, useState } from 'react';
import {
  Box,
  Button,
  DropButton,
  Text,
  Stack,
  List,
  Card,
  CardHeader,
  CardBody,
} from 'grommet';
import { Notification, Clear } from 'grommet-icons';
import { NotificationContext } from '../context/notification/NotificationContext';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, clearAll } = useContext(NotificationContext);
  const [open, setOpen] = useState(false);

  const NotificationContent = () => (
    <Card width="medium" background="dark-1">
      <CardHeader pad="small" background="dark-2">
        <Box direction="row" justify="between" align="center" fill>
          <Text>Notifications</Text>
          <Button
            icon={<Clear />}
            tip="Clear all"
            onClick={clearAll}
            plain
          />
        </Box>
      </CardHeader>
      <CardBody pad="none" height={{ max: 'medium' }} overflow="auto">
        {notifications.length === 0 ? (
          <Box pad="medium" align="center">
            <Text color="light-5">No notifications</Text>
          </Box>
        ) : (
          <List
            data={notifications}
            pad="none"
            background="none"
            border={false}
            onClickItem={({ item }) => !item.isRead && markAsRead(item.id)}
          >
            {(item) => (
              <Box
                pad="small"
                background={item.isRead ? 'dark-1' : 'dark-2'}
                border={{ side: 'bottom', color: 'border' }}
                hoverIndicator={!item.isRead}
              >
                <Text weight={item.isRead ? undefined : 'bold'}>
                  {item.message}
                </Text>
                <Text size="small" color="light-5">
                  {new Date(item.createdDate).toLocaleString()}
                </Text>
              </Box>
            )}
          </List>
        )}
      </CardBody>
    </Card>
  );

  return (
    <DropButton
      icon={
        <Stack anchor="top-right">
          <Notification />
          {unreadCount > 0 && (
            <Box
              background="status-critical"
              pad={{ horizontal: 'xsmall' }}
              round
              responsive={false}
            >
              <Text size="xsmall">{unreadCount}</Text>
            </Box>
          )}
        </Stack>
      }
      dropContent={<NotificationContent />}
      dropProps={{ align: { top: 'bottom', right: 'right' } }}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
    />
  );
};

export default NotificationBell;