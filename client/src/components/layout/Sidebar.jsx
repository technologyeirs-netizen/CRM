import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiMessageSquare,
  FiUserPlus,
  FiBriefcase,
  FiPackage,
  FiTarget,
  FiFileText,
  FiShoppingBag,
  FiDownload,
  FiMail,
  FiChevronDown,
  FiChevronRight,
  FiLayers ,
  FiTruck,
  FiUserCheck,
} from 'react-icons/fi';

import { useAuth } from '../../context/AuthContext';

const websiteSyncModulesEnabled =
  String(import.meta.env.VITE_ENABLE_WEBSITE_SYNC_MODULES || 'true').toLowerCase() !== 'false';

const getNavItems = (role) => {
  if (role === 'employee') {
    return [
      {
        to: '/employee-dashboard',
        label: 'My Dashboard',
        icon: FiHome,
      },
    ];
  }

  const isAdmin = role === 'admin';

  return [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: FiHome,
    },

    {
      to: '/clients',
      label: 'Clients',
      icon: FiUsers,
    },

    {
      to: '/customer-details',
      label: 'Customer Details',
      icon: FiUsers,
    },

    // SALES DROPDOWN
    {
      label: 'Sales',
      icon: FiShoppingBag,
      children: [
        {
          to: '/invoice',
          label: 'Invoice',
          icon: FiFileText,
        },
        {
          to: '/credit-note',
          label: 'Credit Note',
          icon: FiFileText,
        },
        {
          to: '/delivery-challan',
          label: 'Delivery Challan',
          icon: FiTruck,
        },
        
        {
          to: '/sales-settings',
          label: 'Sales Settings',
          icon: FiPackage,
        },
      ],
    },

    // INVENTORY BELOW SALES
    // INVENTORY DROPDOWN
{
  label: 'Inventory',
  icon: FiPackage,
  children: [
    {
      to: '/inventory/products',
      label: 'Products',
      icon: FiPackage,
    },
    {
      to: '/inventory/godowns',
      label: 'Godowns',
      icon: FiPackage,
    },
    {
      to: '/inventory/categories',
      label: 'Categories',
      icon: FiPackage,
    },
    {
      to: '/inventory/subcategories',
      label: 'Sub Categories',
      icon: FiLayers, // ya FiPackage
    },
  ],
},

    {
      to: '/purchase-history',
      label: 'Purchase History',
      icon: FiShoppingBag,
    },

    {
      to: '/bill-quotation',
      label: 'Bill Quotation',
      icon: FiFileText,
    },

    ...(isAdmin
      ? [
          {
            to: '/saved-quotations',
            label: 'Saved Quotations',
            icon: FiDownload,
          },
        ]
      : []),

    {
      to: '/followups',
      label: 'Follow-Ups',
      icon: FiCalendar,
    },

    {
      to: '/interactions',
      label: 'Interactions',
      icon: FiMessageSquare,
    },

    {
      to: '/service-management',
      label: 'Service Management',
      icon: FiUserPlus,
    },

    {
      to: '/employees',
      label: 'Employees',
      icon: FiBriefcase,
    },

    {
      to: '/fsm-requests',
      label: 'FSM Requests',
      icon: FiUserCheck,
    },

    {
      to: '/distribution',
      label: 'Distribution',
      icon: FiPackage,
    },

    {
      to: '/campaigns',
      label: 'Campaigns',
      icon: FiTarget,
    },

    ...(websiteSyncModulesEnabled
      ? [
          {
            label: 'Website',
            icon: FiUsers,
            children: [
              {
                to: '/website-users',
                label: 'Website Users',
                icon: FiUsers,
              },
              {
                to: '/website-orders',
                label: 'Website Orders',
                icon: FiShoppingBag,
              },
              {
                to: '/website-bookings',
                label: 'Website Bookings',
                icon: FiCalendar,
              },
              {
                to: '/website-contacts',
                label: 'Website Contacts',
                icon: FiMail,
              },
            ],
          },
        ]
      : []),
  ];
};

const SidebarDropdown = ({ item }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="sidebar-dropdown">
      <button
        className="sidebar-dropdown-btn"
        onClick={() => setOpen(!open)}
      >
        <div className="sidebar-dropdown-left">
          <item.icon />
          <span>{item.label}</span>
        </div>

        {open ? <FiChevronDown /> : <FiChevronRight />}
      </button>

      {open && (
        <div className="sidebar-submenu">
          {item.children.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-sublink${isActive ? ' active' : ''}`
              }
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = getNavItems(user?.role);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>EIRS CRM</h2>
        <p>Customer Relationship Management</p>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>

        {navItems.map((item) => {
          // DROPDOWN MENU
          if (item.children) {
            return <SidebarDropdown key={item.label} item={item} />;
          }

          // NORMAL LINK
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
            >
              <Icon />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div
          style={{
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div className="user-avatar">
            {user?.name?.[0]?.toUpperCase()}
          </div>

          <div>
            <div
              style={{
                fontWeight: 600,
                color: '#e2e8f0',
                fontSize: 13,
              }}
            >
              {user?.name}
            </div>

            <div
              style={{
                fontSize: 11,
                color: '#64748b',
                textTransform: 'capitalize',
              }}
            >
              {user?.role}
            </div>
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', marginTop: 4 }}
          onClick={logout}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;