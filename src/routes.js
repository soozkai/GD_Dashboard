import React from 'react'
import MessageEditor from './views/message'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Facility = React.lazy(() => import('./views/facility'))
const Message = React.lazy(() => import('./views/message'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/facilities', name: 'Facility', element: Facility },
  { path: '/messages', name: 'MessageEditor', element: MessageEditor },
]

export default routes
