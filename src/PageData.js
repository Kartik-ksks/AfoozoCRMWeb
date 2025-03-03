import React from 'react';
import {
  Cluster,
  Home,
  Network,
  Checkbox,
} from 'grommet-icons';

const mainPageData = [
  {
    name: 'Home',
    Icon: Home,
    path: '',
    roles: ['admin', 'manager'],
    summary: {
      title: 'Dashboard',
      description: 'Overview of system statistics and metrics',
    }
  },
  {
    name: 'Masters',
    Icon: Cluster,
    color: 'lightblue',
    path: 'masters',
    roles: ['admin', 'manager'],
    summary: {
      title: 'Master Data Management',
      description: 'Manage users, sites, and categories',
    },
    items: [
      {
        title: 'Users',
        path: '/masters/users',
        roles: ['admin', 'manager'],
        summary: {
          title: 'User Management',
          description: 'Manage system users and their roles',
        }
      },
      {
        title: 'Site Categories',
        path: '/masters/site-categories',
        roles: ['admin'],
        summary: {
          title: 'Category Management',
          description: 'Manage site categories and classifications',
        }
      },
      {
        title: 'Sites',
        path: '/masters/sites',
        roles: ['admin', 'manager'],
        summary: {
          title: 'Site Management',
          description: 'Manage locations and facilities',
        }
      },
      {
        title: 'Site Questions',
        path: '/masters/site-questions',
        roles: ['admin', 'manager'],
        summary: {
          title: 'Question Management',
          description: 'Manage feedback questions for sites',
        }
      },
    ],
  },
  {
    name: 'Account',
    Icon: Cluster,
    color: 'lightblue',
    path: 'accounts',
    roles: ['user'],
  },
  {
    name: 'Feedback',
    Icon: Network,
    color: 'violet',
    path: 'feedback',
    roles: ['admin', 'manager', 'user'],
    items: [
      {
        title: 'Give Feedback',
        path: '/feedback/write-feedback',
        roles: ['user'],
      },
      {
        title: 'View Feedback',
        path: '/feedback/view-feedback',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    name: 'Checklist',
    Icon: Checkbox,
    color: 'green',
    path: 'checklist',
    roles: ['admin', 'manager', 'user'],
    items: [
      {
        title: 'Daily Checklist',
        path: '/checklist/daily',
        roles: ['user'],
        summary: {
          title: 'Daily Site Checklist',
          description: 'Complete daily site inspection checklist',
        }
      },
      {
        title: 'Checklist Categories',
        path: '/checklist/categories',
        roles: ['admin', 'manager'],
        summary: {
          title: 'Checklist Management',
          description: 'Manage checklist categories and items',
        }
      },
      {
        title: 'Checklists Items',
        path: '/checklist/items',
        roles: ['admin', 'manager'],
        summary: {
          title: 'Checklist Items',
          description: 'Manage checklist items',
        }
      },
      {
        title: 'View Submissions',
        path: '/checklist/submissions',
        roles: ['admin', 'manager'],
        summary: {
          title: 'Checklist Submissions',
          description: 'View and manage checklist submissions',
        }
      },
    ],
  },
];

export default mainPageData;
