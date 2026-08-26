import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiPackage,
  FiLayers,
  FiGrid,
  FiShoppingBag,
  FiTool,
  FiCalendar,
  FiStar,
  FiImage,
} from 'react-icons/fi';

const sections = [
  {
    to: '/inventory/products',
    label: 'Products',
    icon: FiPackage,
    desc: 'Add/edit/delete products — shows on website + app instantly.',
  },
  {
    to: '/inventory/categories',
    label: 'Categories',
    icon: FiGrid,
    desc: 'Top-level product categories, shared with website + app.',
  },
  {
    to: '/inventory/subcategories',
    label: 'Sub Categories',
    icon: FiLayers,
    desc: 'Sub categories under each category.',
  },
  {
    to: '/b2c/orders',
    label: 'Orders',
    icon: FiShoppingBag,
    desc: 'Live orders placed from the website and the app.',
  },
  {
    to: '/b2c/services',
    label: 'Services',
    icon: FiTool,
    desc: 'Manage bookable services shown on website + app.',
  },
  {
    to: '/b2c/service-bookings',
    label: 'Service Bookings',
    icon: FiCalendar,
    desc: 'Bookings customers made for a service.',
  },
  {
    to: '/b2c/reviews',
    label: 'Reviews',
    icon: FiStar,
    desc: 'Moderate product reviews left by customers.',
  },
  {
    to: '/b2c/banners',
    label: 'App Banners / Carousel',
    icon: FiImage,
    desc: 'App-only home screen carousel & promo banners.',
  },
];

const B2CHubPage = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>B2C — Website &amp; App</h1>
          <p>
            Manage the customer-facing catalog, orders and app content in one
            place. Products / Categories / Sub Categories / Orders / Services
            are the same live data used by the website and the mobile app.
            Banners are app-only.
          </p>
        </div>
      </div>

      <div
        className="stats-grid"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
      >
        {sections.map(({ to, label, icon: Icon, desc }) => (
          <Link
            key={to}
            to={to}
            className="card"
            style={{ display: 'block', padding: 20, textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div
                className="stat-icon"
                style={{ background: 'var(--primary-light)' }}
              >
                <Icon color="var(--primary)" />
              </div>
              <h3 style={{ margin: 0 }}>{label}</h3>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13 }}>{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default B2CHubPage;
