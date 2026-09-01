
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiCalendar,
  FiMessageSquare,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiArrowUpRight,
  FiPhoneCall,
} from "react-icons/fi";
// Services
import { clientService } from "../services/clientService";
import { followUpService } from "../services/followUpService";
import { interactionService } from "../services/interactionService";
import { salesInvoiceService } from "../services/salesInvoiceService";

const SalesTeamDashboard = () => {
  const [clientStats, setClientStats] = useState(null);
  const [followStats, setFollowStats] = useState(null);
  const [interStats, setInterStats] = useState(null);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [clients, followups, interactions, invoices] =
          await Promise.all([
            clientService.getStats(),
            followUpService.getStats(),
            interactionService.getStats(),
            salesInvoiceService.getAll({
              page: 1,
              limit: 1000,
            }),
          ]);

        setClientStats(clients?.data || null);
        setFollowStats(followups?.data || null);
        setInterStats(interactions?.data || null);

        const invoiceList = invoices?.data?.invoices || [];

        const sales = invoiceList.reduce(
          (sum, invoice) => sum + Number(invoice.amount || 0),
          0
        );

        setTotalSales(sales);
      } catch (error) {
        console.error("Sales Team Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center bg-[#f6f8fc]">
        <div className="w-10 h-10 rounded-full border-4 border-[#e8e5ff] border-t-[#6c63ff] animate-spin" />
        <p className="mt-4 text-sm text-slate-500 font-medium">
          Loading Sales Dashboard...
        </p>
      </div>
    );
  }

  const totalClients = clientStats?.stats?.total ?? 0;
  const activeClients = clientStats?.stats?.active ?? 0;

  const scheduledFollowups =
    followStats?.stats?.scheduled ?? 0;

  const completedFollowups =
    followStats?.stats?.completed ?? 0;

  const overdueFollowups =
    followStats?.stats?.overdue ?? 0;

  const openInteractions =
    interStats?.stats?.open ?? 0;

  const resolvedInteractions =
    interStats?.stats?.resolved ?? 0;

  const escalatedInteractions =
    interStats?.stats?.escalated ?? 0;

  const stats = [
    {
      title: "Total Clients",
      value: totalClients,
      subtitle: `${activeClients} Active Clients`,
      icon: FiUsers,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      glow: "from-blue-500/10",
      link: "/clients",
    },
    {
      title: "Follow-Ups",
      value: scheduledFollowups,
      subtitle: "Scheduled Follow-Ups",
      icon: FiCalendar,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      glow: "from-violet-500/10",
      link: "/followups",
    },
    {
      title: "Interactions",
      value: openInteractions,
      subtitle: `${resolvedInteractions} Resolved`,
      icon: FiMessageSquare,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      glow: "from-orange-500/10",
      link: "/interactions",
    },
    {
      title: "Completed",
      value: completedFollowups,
      subtitle: "Completed Follow-Ups",
      icon: FiCheckCircle,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      glow: "from-emerald-500/10",
      link: "/followups",
    },
    {
      title: "Overdue",
      value: overdueFollowups,
      subtitle: "Needs Attention",
      icon: FiClock,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      glow: "from-red-500/10",
      link: "/followups",
    },
    {
      title: "Total Sales",
      value: `₹ ${totalSales.toLocaleString("en-IN")}`,
      subtitle: "Invoice Sales",
      icon: FiDollarSign,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      glow: "from-amber-500/10",
      link: "/invoice",
    },
  ];

  return (
    <div className="min-h-full bg-[#f6f8fc] p-4 md:p-6 lg:p-7">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-[#6c63ff]">Sales Team</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
            Sales Team{" "}
            <span className="text-[#6c63ff]">Dashboard</span>
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Monitor clients, follow-ups, interactions and sales
            performance from one place.
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/80 border border-slate-100 shadow-[0_8px_30px_rgba(32,42,70,0.07)]">
          <div className="w-11 h-11 rounded-xl bg-violet-50 text-[#6c63ff] flex items-center justify-center text-xl">
            <FiTrendingUp />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              Sales Team
            </p>

            <p className="text-[11px] text-slate-400 mt-0.5">
              Performance Overview
            </p>
          </div>
        </div>
      </div>

      {/* ================= PREMIUM STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mb-6">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link
              key={stat.title}
              to={stat.link}
              className="group relative overflow-hidden rounded-[22px] bg-white border border-slate-100 p-5 md:p-6 shadow-[0_8px_30px_rgba(32,42,70,0.06)] hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(32,42,70,0.12)] transition-all duration-300"
            >

              {/* Background Glow */}
              <div
                className={`absolute -right-12 -bottom-16 w-36 h-36 rounded-full bg-gradient-to-br ${stat.glow} to-transparent blur-2xl group-hover:w-44 group-hover:h-44 transition-all duration-500`}
              />

              <div className="relative z-10">

                <div className="flex items-center justify-between">

                  <div
                    className={`w-12 h-12 rounded-[15px] ${stat.iconBg} ${stat.iconColor} flex items-center justify-center text-[22px]`}
                  >
                    <Icon />
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-violet-50 group-hover:text-[#6c63ff] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300">
                    <FiArrowUpRight />
                  </div>
                </div>

                <div className="mt-5">

                  <p className="text-[11px] uppercase tracking-[0.8px] font-bold text-slate-400">
                    {stat.title}
                  </p>

                  <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 mt-1">
                    {stat.value}
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    {stat.subtitle}
                  </p>

                </div>

              </div>
            </Link>
          );
        })}

      </div>

      {/* ================= BOTTOM GRID ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-5">

        {/* ================= TODAY FOLLOW UPS ================= */}
        <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_8px_30px_rgba(32,42,70,0.06)] overflow-hidden">

          <div className="px-5 md:px-6 py-5 border-b border-slate-100 flex items-center justify-between">

            <div>
              <p className="text-[10px] font-extrabold tracking-[1px] text-slate-400">
                SALES ACTIVITY
              </p>

              <h3 className="text-base font-bold text-slate-800 mt-1">
                Today's Follow-Ups
              </h3>
            </div>

            <Link
              to="/followups"
              className="flex items-center gap-1 text-xs font-bold text-[#6c63ff] hover:gap-2 transition-all"
            >
              View All
              <FiArrowUpRight />
            </Link>

          </div>

          <div className="px-5 md:px-6">

            {followStats?.upcomingToday?.length ? (

              followStats.upcomingToday.map((followup) => (

                <div
                  key={followup._id}
                  className="flex items-center gap-3 py-4 border-b border-slate-100 last:border-0"
                >

                  <div className="w-10 h-10 shrink-0 rounded-xl bg-violet-50 text-[#6c63ff] flex items-center justify-center">
                    <FiPhoneCall />
                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {followup.title}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {followup.client?.firstName}{" "}
                      {followup.client?.lastName}
                    </p>

                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {followup.client?.phone || "No phone"}
                    </p>

                  </div>

                  <span className="hidden sm:block px-2.5 py-1.5 rounded-lg bg-violet-50 text-[#6c63ff] text-[10px] font-bold">
                    {followup.label}
                  </span>

                </div>

              ))

            ) : (

              <div className="min-h-[190px] flex flex-col items-center justify-center text-slate-400">

                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl mb-3">
                  <FiCalendar />
                </div>

                <p className="text-xs">
                  No follow-ups scheduled for today
                </p>

              </div>

            )}

          </div>
        </div>

        {/* ================= INTERACTION OVERVIEW ================= */}
        <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_8px_30px_rgba(32,42,70,0.06)] overflow-hidden">

          <div className="px-5 md:px-6 py-5 border-b border-slate-100 flex items-center justify-between">

            <div>
              <p className="text-[10px] font-extrabold tracking-[1px] text-slate-400">
                CUSTOMER ENGAGEMENT
              </p>

              <h3 className="text-base font-bold text-slate-800 mt-1">
                Interaction Overview
              </h3>
            </div>

            <Link
              to="/interactions"
              className="text-xs font-bold text-[#6c63ff]"
            >
              View All
            </Link>

          </div>

          <div className="p-5 md:p-6">

            {/* Main Number */}
            <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 p-5 mb-4">

              <p className="text-[11px] font-semibold text-slate-500">
                Open Interactions
              </p>

              <h2 className="text-4xl font-extrabold text-[#6c63ff] mt-1">
                {openInteractions}
              </h2>

            </div>

            {/* Open */}
            <div className="flex items-center justify-between py-3 border-b border-slate-100">

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Open
              </div>

              <strong className="text-sm text-slate-800">
                {openInteractions}
              </strong>

            </div>

            {/* Resolved */}
            <div className="flex items-center justify-between py-3 border-b border-slate-100">

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Resolved
              </div>

              <strong className="text-sm text-slate-800">
                {resolvedInteractions}
              </strong>

            </div>

            {/* Escalated */}
            <div className="flex items-center justify-between py-3">

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Escalated
              </div>

              <strong className="text-sm text-slate-800">
                {escalatedInteractions}
              </strong>

            </div>

          </div>
        </div>
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div className="mt-5 bg-white rounded-[22px] border border-slate-100 shadow-[0_8px_30px_rgba(32,42,70,0.06)] p-5 md:p-6">

        <div className="mb-4">
          <p className="text-[10px] font-extrabold tracking-[1px] text-slate-400">
            QUICK ACTIONS
          </p>

          <h3 className="text-base font-bold text-slate-800 mt-1">
            Sales Team Actions
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          <Link
            to="/clients"
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all text-xs font-bold"
          >
            <FiUsers className="text-base" />
            Clients
          </Link>

          <Link
            to="/followups"
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-violet-50 hover:text-violet-600 transition-all text-xs font-bold"
          >
            <FiCalendar className="text-base" />
            Follow-Ups
          </Link>

          <Link
            to="/interactions"
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-all text-xs font-bold"
          >
            <FiMessageSquare className="text-base" />
            Interactions
          </Link>

          <Link
            to="/invoice"
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-all text-xs font-bold"
          >
            <FiDollarSign className="text-base" />
            Invoices
          </Link>

        </div>
      </div>

    </div>
  );
};

export default SalesTeamDashboard;
