import { lazy } from 'react';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Containers = lazy(() => import('@/pages/Containers'));
const Images = lazy(() => import('@/pages/Images'));
const Volumes = lazy(() => import('@/pages/Volumes'));
const Networks = lazy(() => import('@/pages/Networks'));
const Settings = lazy(() => import('@/pages/Settings'));

const routes = [
  {
    path: '/',
    component: Dashboard,
    name: 'Dashboard',
  },
  {
    path: '/containers',
    component: Containers,
    name: 'Containers',
  },
  {
    path: '/images',
    component: Images,
    name: 'Images',
  },
  {
    path: '/volumes',
    component: Volumes,
    name: 'Volumes',
  },
  {
    path: '/networks',
    component: Networks,
    name: 'Networks',
  },
  {
    path: '/settings',
    component: Settings,
    name: 'Settings',
  },
];

export default routes;
