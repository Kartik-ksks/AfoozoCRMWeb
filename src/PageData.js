import React from 'react';
import {
  Cluster,
  Group,
  Home,
  Server,
  Shield,
  Sort,
  Network,
  Upgrade,
  Tools,
} from 'grommet-icons';

const mainPageData = [
  {
    name: 'Home',
    Icon: Home,
    path: '',
    roles: ['admin', 'manager', 'user'],
    // info: info.home,
  },
  {
    name: 'Masters',
    Icon: Cluster,
    value: {
      // uri: '/redfish/v1/Systems#/Members@odata.count',
      // units: 'nPartition(s)',
    },
    color: 'lightblue',
    path: 'masters',
    roles: ['admin', 'manager'],
    // info: info.nPar,
    items: [
      {
        title: 'Users',
        path: 'masters/users',
        roles: ['admin'],
        // info: info.logs,
      },
      {
        title: 'Site Categories',
        path: 'masters/site-categories',
        roles: ['admin', 'manager'],
        // info: info.accounts,
      },
      {
        title: 'Sites',
        path: 'masters/sites',
        roles: ['admin', 'manager'],
        // info: info.logsDebug,
      },
      {
        title: 'Site Questions',
        path: 'masters/site-questions',
        roles: ['admin', 'manager'],
        // info: info.logsDebug,
      },
    ],
  },
  {
    name: 'Account',
    Icon: Cluster,
    value: {
      // uri: '/redfish/v1/Systems#/Members@odata.count',
      // units: 'nPartition(s)',
    },
    color: 'lightblue',
    path: 'accounts',
    roles: ['user'],
  },
  // {
  //   name: 'Site Category',
  //   Icon: Group,
  //   value: {
  //     // render: <AccountsSummary />,
  //   },
  //   color: 'violet',
  //   path: 'site-categories',
  //   roles: ['admin', 'manager'],
  //   // info: info.accounts,
  // },
  {
    name: 'Feedback',
    Icon: Network,
    value: {
      // render: <AccountsSummary />,
    },
    color: 'violet',
    path: 'feedback',
    roles: ['admin', 'manager', 'user'],
  },
  // {
  //   name: 'Menu',
  //   Icon: Server,
  //   value: {
  //     // uri: '/redfish/v1/Chassis/RackGroup#/Status/HealthRollup',
  //   },
  //   color: 'orange',
  //   path: 'hardware',
  //   // info: info.hardware,
  //   items: [
  //     {
  //       title: 'Add/Modify',
  //       path: '/',
  //       // info: info.logs,
  //     },
  //     {
  //       title: 'Menu Preview',
  //       path: 'audit',
  //       // info: info.logsAudit,
  //     },
  //     {
  //       title: 'Menu View',
  //       path: 'cae',
  //       // info: info.logsCae,
  //     },
  //     {
  //       title: 'MIS',
  //       path: 'cae',
  //       // info: info.logsCae,
  //     },
  //   ]
  // },
  // {
  //   name: 'Feedback',
  //   Icon: Upgrade,
  //   value: {
  //     // uri: '/redfish/v1/UpdateService/FirmwareInventory/ComplexFW#/Version',
  //   },
  //   color: 'olive',
  //   path: 'firmware',
  //   // info: info.firmware,
  //   items: [
  //     {
  //       title: 'Users',
  //       path: '/',
  //       // info: info.logs,
  //     },
  //     {
  //       title: 'Common Settings',
  //       path: 'audit',
  //       // info: info.logsAudit,
  //     },
  //     {
  //       title: 'Dashboard',
  //       path: 'cae',
  //       // info: info.logsCae,
  //     },
  //     {
  //       title: 'Site',
  //       path: 'debug',
  //       // info: info.logsDebug,
  //     },
  //     {
  //       title: 'Station',
  //       path: 'fwu',
  //       // info: info.logsIel,
  //     },
  //     {
  //       title: 'Menu Category',
  //       path: 'idc',
  //       // info: info.logsIdc,
  //     },
  //     {
  //       title: 'Questions',
  //       path: 'iel',
  //       // info: info.logsIel,
  //     },
  //     {
  //       title: 'Site Questions',
  //       path: 'iel',
  //       // info: info.logsIel,
  //     },
  //     {
  //       title: 'Email Configure',
  //       path: 'iel',
  //       // info: info.logsIel,
  //     },
  //     {
  //       title: 'Coupons',
  //       path: 'iel',
  //       // info: info.logsIel,
  //     },
  //   ],
  // },
  // {
  //   name: 'News',
  //   Icon: Group,
  //   value: {
  //     // render: <AccountsSummary />,
  //   },
  //   color: 'violet',
  //   path: 'accounts',
  //   // info: info.accounts,
  // },
  // {
  //   name: 'Charting',
  //   Icon: Shield,
  //   value: {
  //     // render: <SecuritySummary />,
  //   },
  //   color: 'rgb(204, 102, 0)',
  //   path: 'security',
  //   // info: info.security,
  // },
  // {
  //   name: 'E-Coupons',
  //   Icon: Network,
  //   value: {
  //     // render: <NetworkSummary />,
  //   },
  //   color: 'tan',
  //   path: 'network',
  //   // info: info.network,
  // },
  // {
  //   name: 'Checklist Manager',
  //   Icon: Tools,
  //   path: 'manager',
  //   // info: info.manager,
  //   value: {
  //     // uri: '/redfish/v1/Managers/RMC#/DateTime',
  //     // render: <ManagerSummary />,
  //   },
  // },
  // {
  //   name: 'Logs',
  //   Icon: Sort,
  //   color: 'silver',
  //   path: 'logs',
  //   // info: info.logs,
  //   items: [
  //     {
  //       title: 'Overview',
  //       path: '/',
  //       // info: info.logs,
  //     },
  //     {
  //       title: 'Integrated Events',
  //       path: 'iel',
  //       // info: info.logsIel,
  //     },
  //   ],
  // },
];

export default mainPageData;
