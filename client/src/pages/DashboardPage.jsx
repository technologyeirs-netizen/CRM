import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FiDollarSign,
  FiTrendingUp,
  FiTool,
  FiTruck,
} from "react-icons/fi";
import { clientService } from "../services/clientService";
import { followUpService } from "../services/followUpService";
import { interactionService } from "../services/interactionService";
import Spinner from "../components/common/Spinner";
import StatusBadge from "../components/common/StatusBadge";
import { format } from "date-fns";
import { salesInvoiceService } from "../services/salesInvoiceService";

const DashboardPage = () => {
  const [clientStats, setClientStats] = useState(null);
  const [followStats, setFollowStats] = useState(null);
  const [interStats, setInterStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [cs, fs, is, invoiceRes] = await Promise.all([
          clientService.getStats(),
          followUpService.getStats(),
          interactionService.getStats(),
          salesInvoiceService.getAll({
            page: 1,
            limit: 1000,
          }),
        ]);
        setClientStats(cs.data);
        setFollowStats(fs.data);
        setInterStats(is.data);
        const invoices = invoiceRes?.data?.invoices || [];

        const salesAmount = invoices.reduce(
          (sum, invoice) => sum + Number(invoice.amount || 0),
          0,
        );

        setTotalSales(salesAmount);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Spinner text="Loading dashboard..." />;

  return (
    <div>
      {/* Summary Stats */}
{/* Summary Stats */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

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

        <h3 className="mt-2 text-2xl font-bold text-slate-900">
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
          {clientStats?.stats?.total ?? clientStats?.total ?? 0}
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

</div>

      <div className="dashboard-grid">
        {/* Recent Clients */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Clients</h3>
            <Link to="/clients" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {clientStats?.recentClients?.length ? (
                  clientStats.recentClients.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <Link
                          to={`/clients/${c._id}`}
                          style={{
                            color: "var(--primary)",
                            textDecoration: "none",
                            fontWeight: 500,
                          }}
                        >
                          {c.firstName} {c.lastName}
                        </Link>
                        <div
                          style={{ fontSize: 12, color: "var(--text-muted)" }}
                        >
                          {c.email}
                        </div>
                      </td>
                      <td>
                        <StatusBadge value={c.status} />
                      </td>
                      <td
                        style={{ fontSize: 12, color: "var(--text-secondary)" }}
                      >
                        {format(new Date(c.createdAt), "dd MMM yyyy")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        textAlign: "center",
                        color: "var(--text-muted)",
                        padding: 24,
                      }}
                    >
                      No clients yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Follow-Ups */}
        <div className="card">
          <div className="card-header">
            <h3>Today's Follow-Ups</h3>
            <Link to="/followups" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>
          <div className="card-body" style={{ padding: "0 20px" }}>
            {followStats?.upcomingToday?.length ? (
              followStats.upcomingToday.map((f) => (
                <div
                  key={f._id}
                  style={{
                    padding: "14px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{f.title}</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      marginTop: 4,
                    }}
                  >
                    {f.client?.firstName} {f.client?.lastName} &bull;{" "}
                    {f.client?.phone}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span
                      className={`label-tag label-${f.label === "Payment Due" ? "payment" : f.label === "Scheduled Call" ? "call" : f.label === "Market Follow-up" ? "market" : "general"}`}
                    >
                      {f.label}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "32px 0",
                  textAlign: "center",
                  color: "var(--text-muted)",
                }}
              >
                No follow-ups scheduled for today
              </div>
            )}
          </div>
        </div>

        {/* Follow-Up Label Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3>Follow-Up Labels</h3>
          </div>
          <div className="card-body">
            {followStats?.byLabel?.length ? (
              followStats.byLabel.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--text-primary)" }}>
                    {item._id}
                  </span>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 6,
                        borderRadius: 3,
                        background: "var(--border)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min((item.count / (followStats.byLabel[0]?.count || 1)) * 100, 100)}%`,
                          height: "100%",
                          background: "var(--primary)",
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        minWidth: 20,
                      }}
                    >
                      {item.count}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
                No data yet
              </p>
            )}
          </div>
        </div>

        {/* Interaction Stats */}
        <div className="card">
          <div className="card-header">
            <h3>Interactions by Type</h3>
            <Link to="/interactions" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>
          <div className="card-body">
            {interStats?.byType?.length ? (
              interStats.byType.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ textTransform: "capitalize", fontSize: 13 }}>
                    {item._id}
                  </span>
                  <span className="badge badge-primary">{item.count}</span>
                </div>
              ))
            ) : (
              <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
                No interactions yet
              </p>
            )}
            <div
              style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: "1px solid var(--border)",
              }}
            >
              <div
                style={{ display: "flex", gap: 8, justifyContent: "center" }}
              >
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--danger)",
                    }}
                  >
                    {interStats?.stats?.open ?? 0}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Open
                  </div>
                </div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--success)",
                    }}
                  >
                    {interStats?.stats?.resolved ?? 0}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Resolved
                  </div>
                </div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--warning)",
                    }}
                  >
                    {interStats?.stats?.escalated ?? 0}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Escalated
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
