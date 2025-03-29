import React from 'react';
import {
  AppstoreOutlined,
  DatabaseOutlined,
  SettingOutlined,
  ClusterOutlined,
  ContainerOutlined,
} from '@ant-design/icons';

export default {
  route: {
    path: '/',
    routes: [
      {
        path: '/',
        name: 'Dashboard',
        icon: React.createElement(AppstoreOutlined),
        component: './pages/Dashboard',
      },
      {
        path: '/containers',
        name: 'Containers',
        icon: React.createElement(ContainerOutlined),
        component: './pages/Containers',
      },
      {
        path: '/images',
        name: 'Images',
        icon: React.createElement(DatabaseOutlined),
        component: './pages/Images',
      },
      {
        path: '/volumes',
        name: 'Volumes',
        icon: React.createElement(ClusterOutlined),
        component: './pages/Volumes',
      },
      {
        path: '/networks',
        name: 'Networks',
        icon: React.createElement(ClusterOutlined),
        component: './pages/Networks',
      },
      {
        path: '/settings',
        name: 'Settings',
        icon: React.createElement(SettingOutlined),
        component: './pages/Settings',
      },
    ],
  },
  location: {
    pathname: '/dashboard',
  },
};
