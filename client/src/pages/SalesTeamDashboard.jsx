
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FiUsers,
  FiCalendar,
  FiMessageSquare,
  FiArrowUpRight,
  FiTrendingUp,
} from "react-icons/fi";

// Services
import { clientService } from "../services/clientService";
import { followUpService } from "../services/followUpService";
import { interactionService } from "../services/interactionService";

const SalesTeamDashboard = () => {
  const [clientStats, setClientStats] = useState(null);
  const [followStats, setFollowStats] = useState(null);
  const [interStats, setInterStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [clients, followups, interactions] = await Promise.all([
          clientService.getStats(),
          followUpService.getStats(),
          interactionService.getStats(),
        ]);

        setClientStats(clients?.data || null);
        setFollowStats(followups?.data || null);
        setInterStats(interactions?.data || null);
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

  // =========================
  // STATS
  // =========================

  const totalClients = clientStats?.stats?.total ?? 0;

  const totalFollowUps =
    followStats?.stats?.total ??
    followStats?.stats?.scheduled ??
    0;

  const totalInteractions =
    interStats?.stats?.total ??
    interStats?.stats?.open ??
    0;

  const stats = [
    {
      title: "Total Clients",
      value: totalClients,
      subtitle: "Total Registered Clients",
      icon: FiUsers,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      glow: "from-blue-500/10",
      link: "/clients",
    },

    {
      title: "Follow-Ups",
      value: totalFollowUps,
      subtitle: "Total Follow-Ups",
      icon: FiCalendar,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      glow: "from-violet-500/10",
      link: "/followups",
    },

    {
      title: "Interactions",
      value: totalInteractions,
      subtitle: "Total Client Interactions",
      icon: FiMessageSquare,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      glow: "from-orange-500/10",
      link: "/interactions",
    },
  ];

  return (
    <div className="min-h-full bg-[#f6f8fc] p-4 md:p-6 lg:p-7">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">

        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-[#6c63ff]">Sales Team</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
            Sales Team{" "}
            <span className="text-[#6c63ff]">Dashboard</span>
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Monitor clients, follow-ups and interactions from one place.
          </p>
        </div>

        {/* Header Right */}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">

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

                {/* Icon + Arrow */}
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

                {/* Stat Content */}
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

    </div>
  );
};

export default SalesTeamDashboard;

