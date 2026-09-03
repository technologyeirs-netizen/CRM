
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiDollarSign,
  FiTrendingUp,
  FiTool,
  FiTruck,
  FiUsers,
} from "react-icons/fi";

import { clientService } from "../services/clientService";
import { followUpService } from "../services/followUpService";
import { interactionService } from "../services/interactionService";
import Spinner from "../components/common/Spinner";
import { salesInvoiceService } from "../services/salesInvoiceService";

const DashboardPage = () => {
  const [clientStats, setClientStats] = useState(null);
  const [followStats, setFollowStats] = useState(null);
  const [interStats, setInterStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    const load = async () => {
      // Use allSettled instead of all: if one card's API (e.g.
      // invoices) is slow or fails, the rest (e.g. total clients)
      // should still show up instead of the whole dashboard going blank.
      const [cs, fs, is, invoiceRes] = await Promise.allSettled([
        clientService.getStats(),
        followUpService.getStats(),
        interactionService.getStats(),
        salesInvoiceService.getAll({
          page: 1,
          limit: 1000,
        }),
      ]);

      if (cs.status === "fulfilled") setClientStats(cs.value?.data);
      if (fs.status === "fulfilled") setFollowStats(fs.value?.data);
      if (is.status === "fulfilled") setInterStats(is.value?.data);

      if (invoiceRes.status === "fulfilled") {
        const invoices = invoiceRes.value?.data?.invoices || [];

        const salesAmount = invoices.reduce(
          (sum, invoice) => sum + Number(invoice?.amount || 0),
          0
        );

        setTotalSales(salesAmount);
      }

      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return <Spinner text="Loading dashboard..." />;
  }

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mb-6">

        {/* Accounts */}
        <Link
          to="/account"
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Accounts
              </p>

            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 whitespace-nowrap">
  ₹{totalSales.toLocaleString("en-IN")}
</h3>

              <p className="mt-1 text-xs text-slate-500">
                Total Sales
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white">
              <FiDollarSign size={23} />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm font-medium text-slate-600">
              Account Details
            </span>

            <span className="text-sm font-semibold text-blue-600 transition-transform duration-300 group-hover:translate-x-1">
              View →
            </span>
          </div>
        </Link>

        {/* Sales Team */}
        <Link
          to="/sales-team"
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Sales Team
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {clientStats?.stats?.total ??
                  clientStats?.total ??
                  0}
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Total Clients
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white">
              <FiTrendingUp size={23} />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm font-medium text-slate-600">
              Sales Overview
            </span>

            <span className="text-sm font-semibold text-emerald-600 transition-transform duration-300 group-hover:translate-x-1">
              View →
            </span>
          </div>
        </Link>

        {/* Services Team */}
        <Link
          to="/services-team"
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Services Team
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {interStats?.stats?.resolved ?? 0}
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Resolved Interactions
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white">
              <FiTool size={23} />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm font-medium text-slate-600">
              Service Overview
            </span>

            <span className="text-sm font-semibold text-purple-600 transition-transform duration-300 group-hover:translate-x-1">
              View →
            </span>
          </div>
        </Link>

        {/* Delivery Team */}
        <Link
          to="/delivery-team"
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Delivery Team
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                {followStats?.upcomingToday?.length ?? 0}
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Today's Follow-Ups
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-all duration-300 group-hover:bg-orange-600 group-hover:text-white">
              <FiTruck size={23} />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm font-medium text-slate-600">
              Delivery Overview
            </span>

            <span className="text-sm font-semibold text-orange-600 transition-transform duration-300 group-hover:translate-x-1">
              View →
            </span>
          </div>
        </Link>

        {/* HR */}
        <Link
          to="/hr"
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                HR
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                HR
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                HR Management
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-600 transition-all duration-300 group-hover:bg-pink-600 group-hover:text-white">
              <FiUsers size={23} />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm font-medium text-slate-600">
              HR Overview
            </span>

            <span className="text-sm font-semibold text-pink-600 transition-transform duration-300 group-hover:translate-x-1">
              View →
            </span>
          </div>
        </Link>

      </div>
    </div>
  );
};

export default DashboardPage;
