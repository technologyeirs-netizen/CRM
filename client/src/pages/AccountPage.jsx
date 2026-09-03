
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText,
  FiCreditCard,
  FiTruck,
  FiSettings,
  FiArrowRight,
  FiBarChart2,
  FiClipboard,
} from 'react-icons/fi';

const Account = () => {
  const navigate = useNavigate();

  const accountModules = [
    {
      title: 'Invoice',
      description: 'Create, manage and view your invoices',
      icon: FiFileText,
      path: '/invoice',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Credit Note',
      description: 'Manage customer credit notes and adjustments',
      icon: FiCreditCard,
      path: '/credit-note',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Delivery Challan',
      description: 'Create and manage delivery challans',
      icon: FiTruck,
      path: '/delivery-challan',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Account Settings',
      description: 'Manage your account and sales settings',
      icon: FiSettings,
      path: '/sales-settings',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Converted Quotations',
      description: 'View and manage quotations converted into sales',
      icon: FiClipboard,
      path: '/converted-quotations',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      
      {/* PAGE HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          
          {/* Header Icon */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <FiBarChart2 className="text-2xl" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Account
            </h1>

            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Manage your invoices, credit notes, delivery challans,
              quotations and account settings.
            </p>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

        {/* Invoice */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FiFileText />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Module
              </p>
              <p className="text-sm font-semibold text-slate-900">
                Invoice
              </p>
            </div>
          </div>
        </div>

        {/* Credit Note */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FiCreditCard />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Module
              </p>
              <p className="text-sm font-semibold text-slate-900">
                Credit Note
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Challan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <FiTruck />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Module
              </p>
              <p className="text-sm font-semibold text-slate-900">
                Delivery Challan
              </p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <FiSettings />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Module
              </p>
              <p className="text-sm font-semibold text-slate-900">
                Settings
              </p>
            </div>
          </div>
        </div>

        {/* Converted Quotations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <FiClipboard />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Module
              </p>
              <p className="text-sm font-semibold text-slate-900">
                Quotations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODULE SECTION */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Account Management
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Select a module to continue
        </p>
      </div>

      {/* MODULE CARDS */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {accountModules.map((module) => {
          const Icon = module.icon;

          return (
            <button
              key={module.path}
              type="button"
              onClick={() => navigate(module.path)}
              className="group w-full rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              
              {/* TOP */}
              <div className="flex items-start justify-between">

                {/* ICON */}
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${module.iconBg} ${module.iconColor} transition-transform duration-200 group-hover:scale-110`}
                >
                  <Icon className="text-2xl" />
                </div>

                {/* ARROW */}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all duration-200 group-hover:bg-blue-50 group-hover:text-blue-600">
                  <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* CONTENT */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  {module.title}
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {module.description}
                </p>
              </div>

              {/* FOOTER */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm font-semibold text-blue-600">
                  Open {module.title}
                </span>

                <FiArrowRight className="text-blue-600 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Account;
