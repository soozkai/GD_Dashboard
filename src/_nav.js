import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilRoom,
  cilTag,
  cilStar,
  cilDescription,
  cilEnvelopeOpen,
  cilBuilding,
  cilCommentSquare
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavItem,
    name: 'Room Details',
    to: '/room-details',
    icon: <CIcon icon={cilRoom} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Offers Information',
    to: '/offers-information',
    icon: <CIcon icon={cilTag} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Message',
    to: '/messages',
    icon: <CIcon icon={cilEnvelopeOpen} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Facility',
    to: '/facilities',
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Feedback',
    to: '/feedback',
    icon: <CIcon icon={cilCommentSquare} customClassName="nav-icon" />,
  },
]

export default _nav
