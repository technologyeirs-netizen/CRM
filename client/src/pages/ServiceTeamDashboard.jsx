import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  FiTool,
  FiUsers,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiArrowUpRight,
  FiUserCheck,
  FiBriefcase,
  FiActivity,
  FiPhoneCall,
  FiRefreshCw,
  FiTrendingUp,
  FiXCircle,
  FiFileText,
  FiDollarSign,
} from "react-icons/fi";

import toast from "react-hot-toast";
import { prospectService } from "../services/prospectService";

const STAGES = [
  "new",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

const STAGE_CONFIG = {
  new: {
    label: "New",
    icon: FiFileText,
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-500",
  },
  qualified: {
    label: "Qualified",
    icon: FiUserCheck,
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
  },
  proposal: {
    label: "Proposal",
    icon: FiTrendingUp,
    bg: "bg-purple-50",
    text: "text-purple-600",
    dot: "bg-purple-500",
  },
  negotiation: {
    label: "Negotiation",
    icon: FiActivity,
    bg: "bg-orange-50",
    text: "text-orange-600",
    dot: "bg-orange-500",
  },
  won: {
    label: "Won",
    icon: FiCheckCircle,
    bg: "bg-green-50",
    text: "text-green-600",
    dot: "bg-green-500",
  },
  lost: {
    label: "Lost",
    icon: FiXCircle,
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
  },
};

const normalizeStage = (stage) => {
  if (!stage) return "new";

  const value = String(stage).toLowerCase().trim();

  if (STAGES.includes(value)) return value;

  return "new";
};

const formatStage = (stage) => {
  if (!stage) return "New";

  return String(stage)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getClientName = (item) => {
  const fullName = `${item?.firstName || ""} ${
    item?.lastName || ""
  }`.trim();

  return (
    fullName ||
    item?.clientName ||
    item?.customerName ||
    item?.name ||
    item?.company ||
    "Unknown Client"
  );
};

const getPhone = (item) => {
  return (
    item?.phone ||
    item?.mobile ||
    item?.contactNumber ||
    item?.customerPhone ||
    "No phone"
  );
};

const getEmail = (item) => {
  return item?.email || item?.customerEmail || "";
};

const getDate = (item) => {
  return (
    item?.scheduledDate ||
    item?.serviceDate ||
    item?.appointmentDate ||
    item?.createdAt ||
    item?.updatedAt ||
    null
  );
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isToday = (date) => {
  if (!date) return false;

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return false;

  const today = new Date();

  return (
    parsed.getDate() === today.getDate() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getFullYear() === today.getFullYear()
  );
};

const isScheduled = (item) => {
  return Boolean(
    item?.scheduledDate ||
      item?.serviceDate ||
      item?.appointmentDate ||
      item?.scheduleDate ||
      item?.scheduledAt
  );
};

const isCompleted = (item) => {
  const value = String(
    item?.status ||
      item?.serviceStatus ||
      item?.jobStatus ||
      item?.completionStatus ||
      ""
  ).toLowerCase();

  return [
    "completed",
    "complete",
    "done",
    "closed",
    "resolved",
  ].includes(value);
};

const isCancelled = (item) => {
  const value = String(
    item?.status ||
      item?.serviceStatus ||
      item?.jobStatus ||
      ""
  ).toLowerCase();

  return [
    "cancelled",
    "canceled",
    "rejected",
  ].includes(value);
};

const isInProgress = (item) => {
  const value = String(
    item?.status ||
      item?.serviceStatus ||
      item?.jobStatus ||
      ""
  ).toLowerCase();

  return [
    "in_progress",
    "in progress",
    "assigned",
    "accepted",
    "ongoing",
    "processing",
    "working",
  ].includes(value);
};

const isUrgent = (item) => {
  if (item?.urgent === true || item?.isUrgent === true) {
    return true;
  }

  const priority = String(
    item?.priority || item?.servicePriority || ""
  ).toLowerCase();

  return ["urgent", "high", "critical"].includes(priority);
};

const ServicesTeamDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [prospects, setProspects] = useState([]);
  const [backendStats, setBackendStats] = useState(null);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      /*
       * We intentionally request a large page so the dashboard can
       * calculate real stage/client/service information from the
       * actual records instead of displaying dummy numbers.
       */
      const [listResponse, statsResponse] = await Promise.all([
        prospectService.getAll({
          search: "",
          stage: "",
          source: "",
          page: 1,
          limit: 10000,
        }),
        prospectService.getStats(),
      ]);

      const listData = listResponse?.data || {};

      const records = Array.isArray(listData?.prospects)
        ? listData.prospects
        : Array.isArray(listData?.data)
        ? listData.data
        : Array.isArray(listData)
        ? listData
        : [];

      setProspects(records);

      setBackendStats(
        statsResponse?.data?.stats ||
          statsResponse?.data ||
          null
      );

      if (isRefresh) {
        toast.success("Dashboard refreshed");
      }
    } catch (error) {
      console.error("Services Team Dashboard Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /*
   * ============================================================
   * REAL DASHBOARD CALCULATIONS
   * ============================================================
   */

  const dashboard = useMemo(() => {
    const records = Array.isArray(prospects)
      ? prospects
      : [];

    const stageCounts = STAGES.reduce((acc, stage) => {
      acc[stage] = 0;
      return acc;
    }, {});

    records.forEach((item) => {
      const stage = normalizeStage(item?.stage);
      stageCounts[stage] += 1;
    });

    /*
     * Unique clients are calculated using phone/email/name.
     * This avoids counting the same customer multiple times.
     */
    const uniqueClients = new Set();

    records.forEach((item) => {
      const phone = String(getPhone(item))
        .replace(/\D/g, "");

      const email = String(getEmail(item))
        .toLowerCase()
        .trim();

      const name = getClientName(item)
        .toLowerCase()
        .trim();

      const key =
        phone ||
        email ||
        name ||
        item?._id;

      if (key) {
        uniqueClients.add(key);
      }
    });

    const scheduledServices = records.filter(isScheduled);

    const completedServices = records.filter(isCompleted);

    const cancelledServices = records.filter(isCancelled);

    const inProgressServices = records.filter(isInProgress);

    /*
     * Pending = records which are not completed/cancelled.
     */
    const pendingServices = records.filter((item) => {
      return !isCompleted(item) && !isCancelled(item);
    });

    const urgentServices = records.filter(isUrgent);

    const todayServices = records
      .filter((item) => isToday(getDate(item)))
      .sort((a, b) => {
        const dateA = new Date(getDate(a) || 0).getTime();
        const dateB = new Date(getDate(b) || 0).getTime();

        return dateB - dateA;
      })
      .slice(0, 10);

    const estimatedValue = records.reduce(
      (total, item) =>
        total + Number(item?.estimatedValue || 0),
      0
    );

    const wonValue = records
      .filter(
        (item) => normalizeStage(item?.stage) === "won"
      )
      .reduce(
        (total, item) =>
          total + Number(item?.estimatedValue || 0),
        0
      );

    return {
      totalClients: uniqueClients.size,

      serviceRequests: Number(
        backendStats?.total ?? records.length
      ),

      scheduledServices: scheduledServices.length,

      completedServices: completedServices.length,

      pendingServices: pendingServices.length,

      urgentServices: urgentServices.length,

      inProgress: inProgressServices.length,

      cancelled: cancelledServices.length,

      todayServices,

      stageCounts,

      estimatedValue,

      wonValue,
    };
  }, [prospects, backendStats]);

  /*
   * ============================================================
   * STATS CARDS
   * ============================================================
   */

  const stats = [
    {
      title: "Total Clients",
      value: dashboard.totalClients,
      subtitle: "Unique service clients",
      icon: FiUsers,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      link: "/clients",
    },
    {
      title: "Service Requests",
      value: dashboard.serviceRequests,
      subtitle: "All service requests",
      icon: FiTool,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      link: "/service-management",
    },
    {
      title: "Scheduled Services",
      value: dashboard.scheduledServices,
      subtitle: "Services with schedule",
      icon: FiCalendar,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      link: "/service-management",
    },
    {
      title: "Completed Services",
      value: dashboard.completedServices,
      subtitle: "Completed / closed",
      icon: FiCheckCircle,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      link: "/service-management",
    },
    {
      title: "Pending Services",
      value: dashboard.pendingServices,
      subtitle: "Waiting for action",
      icon: FiClock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      link: "/service-management",
    },
    {
      title: "Urgent Requests",
      value: dashboard.urgentServices,
      subtitle: "High priority requests",
      icon: FiAlertTriangle,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      link: "/service-management",
    },
  ];

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="min-h-[500px] bg-[#f6f8fc] flex flex-col items-center justify-center">
        <div className="w-11 h-11 rounded-full border-4 border-violet-100 border-t-[#6c63ff] animate-spin" />

        <p className="mt-4 text-sm font-medium text-slate-500">
          Loading Services Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f6f8fc] p-4 md:p-6 lg:p-7">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <span>Dashboard</span>
            <span>/</span>

            <span className="text-[#6c63ff]">
              Services Team
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
            Services Team{" "}
            <span className="text-[#6c63ff]">
              Dashboard
            </span>
          </h1>

          <p className="text-sm text-slate-500 mt-2 max-w-2xl">
            Complete service overview with clients,
            requests, schedules, pipeline stages and
            service activity.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgba(32,42,70,0.07)] text-sm font-bold text-slate-600 hover:text-[#6c63ff] transition-all disabled:opacity-60"
          >
            <FiRefreshCw
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgba(32,42,70,0.07)]">

            <div className="w-11 h-11 rounded-xl bg-violet-50 text-[#6c63ff] flex items-center justify-center text-xl">
              <FiTool />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Services Team
              </p>

              <p className="text-[11px] text-slate-400 mt-0.5">
                Live Service Data
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* ======================================================
          MAIN STATS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mb-6">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link
              key={stat.title}
              to={stat.link}
              className="group relative overflow-hidden rounded-[22px] bg-white border border-slate-100 p-5 md:p-6 shadow-[0_8px_30px_rgba(32,42,70,0.06)] hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(32,42,70,0.12)] transition-all duration-300"
            >

              <div className="absolute -right-12 -bottom-16 w-36 h-36 rounded-full bg-gradient-to-br from-violet-500/10 to-transparent blur-2xl group-hover:w-48 group-hover:h-48 transition-all duration-500" />

              <div className="relative z-10">

                <div className="flex items-center justify-between">

                  <div
                    className={`w-12 h-12 rounded-[15px] ${stat.iconBg} ${stat.iconColor} flex items-center justify-center text-[22px]`}
                  >
                    <Icon />
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-violet-50 group-hover:text-[#6c63ff] transition-all">
                    <FiArrowUpRight />
                  </div>

                </div>

                <div className="mt-5">

                  <p className="text-[11px] uppercase tracking-[0.8px] font-bold text-slate-400">
                    {stat.title}
                  </p>

                  <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 mt-1">
                    {stat.value.toLocaleString()}
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

      {/* ======================================================
          PIPELINE STAGES
      ====================================================== */}

      <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_8px_30px_rgba(32,42,70,0.06)] overflow-hidden mb-5">

        <div className="px-5 md:px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">

          <div>
            <p className="text-[10px] font-extrabold tracking-[1px] text-slate-400">
              SERVICE PIPELINE
            </p>

            <h3 className="text-base font-bold text-slate-800 mt-1">
              All Service Stages
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Real request count by current pipeline stage
            </p>
          </div>

          <Link
            to="/service-management"
            className="flex items-center gap-1 text-xs font-bold text-[#6c63ff]"
          >
            Manage Services
            <FiArrowUpRight />
          </Link>

        </div>

        <div className="p-5 md:p-6">

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">

            {STAGES.map((stage) => {

              const config = STAGE_CONFIG[stage];
              const Icon = config.icon;
              const count =
                dashboard.stageCounts[stage] || 0;

              return (
                <Link
                  key={stage}
                  to={`/service-management?stage=${stage}`}
                  className="group rounded-2xl border border-slate-100 p-4 hover:-translate-y-1 hover:shadow-lg transition-all"
                >

                  <div className="flex items-center justify-between">

                    <div
                      className={`w-10 h-10 rounded-xl ${config.bg} ${config.text} flex items-center justify-center`}
                    >
                      <Icon />
                    </div>

                    <FiArrowUpRight className="text-slate-300 group-hover:text-[#6c63ff]" />

                  </div>

                  <p className="text-xs font-bold text-slate-500 mt-4">
                    {config.label}
                  </p>

                  <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
                    {count.toLocaleString()}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-2">

                    <span
                      className={`w-1.5 h-1.5 rounded-full ${config.dot}`}
                    />

                    <span className="text-[10px] text-slate-400">
                      Service Requests
                    </span>

                  </div>

                </Link>
              );
            })}

          </div>

        </div>
      </div>

      {/* ======================================================
          VALUE + STATUS
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">

        {/* TOTAL VALUE */}

        <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_8px_30px_rgba(32,42,70,0.06)] p-5 md:p-6">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-[10px] font-extrabold tracking-[1px] text-slate-400">
                SERVICE VALUE
              </p>

              <h3 className="text-base font-bold text-slate-800 mt-1">
                Estimated Pipeline
              </h3>
            </div>

            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              <FiDollarSign />
            </div>

          </div>

          <h2 className="text-3xl font-extrabold text-slate-800 mt-6">
            ₹{dashboard.estimatedValue.toLocaleString("en-IN")}
          </h2>

          <p className="text-xs text-slate-400 mt-2">
            Total estimated value of service requests
          </p>

          <div className="mt-5 pt-4 border-t border-slate-100">

            <div className="flex items-center justify-between">

              <span className="text-xs text-slate-500">
                Won Value
              </span>

              <strong className="text-sm text-emerald-600">
                ₹{dashboard.wonValue.toLocaleString("en-IN")}
              </strong>

            </div>

          </div>

        </div>

        {/* SERVICE STATUS */}

        <div className="xl:col-span-2 bg-white rounded-[22px] border border-slate-100 shadow-[0_8px_30px_rgba(32,42,70,0.06)] overflow-hidden">

          <div className="px-5 md:px-6 py-5 border-b border-slate-100">

            <p className="text-[10px] font-extrabold tracking-[1px] text-slate-400">
              SERVICE STATUS
            </p>

            <h3 className="text-base font-bold text-slate-800 mt-1">
              Service Overview
            </h3>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4">

            <div className="p-5 border-b md:border-b-0 md:border-r border-slate-100">

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Pending
              </div>

              <h2 className="text-2xl font-extrabold text-slate-800 mt-3">
                {dashboard.pendingServices}
              </h2>

            </div>

            <div className="p-5 border-b md:border-b-0 md:border-r border-slate-100">

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                In Progress
              </div>

              <h2 className="text-2xl font-extrabold text-slate-800 mt-3">
                {dashboard.inProgress}
              </h2>

            </div>

            <div className="p-5 border-r border-slate-100">

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Completed
              </div>

              <h2 className="text-2xl font-extrabold text-slate-800 mt-3">
                {dashboard.completedServices}
              </h2>

            </div>

            <div className="p-5">

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Cancelled
              </div>

              <h2 className="text-2xl font-extrabold text-slate-800 mt-3">
                {dashboard.cancelled}
              </h2>

            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          TODAY'S SERVICES
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-5 mb-5">

        <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_8px_30px_rgba(32,42,70,0.06)] overflow-hidden">

          <div className="px-5 md:px-6 py-5 border-b border-slate-100 flex items-center justify-between">

            <div>
              <p className="text-[10px] font-extrabold tracking-[1px] text-slate-400">
                SERVICE ACTIVITY
              </p>

              <h3 className="text-base font-bold text-slate-800 mt-1">
                Today's Services
              </h3>
            </div>

            <Link
              to="/service-management"
              className="flex items-center gap-1 text-xs font-bold text-[#6c63ff]"
            >
              View All
              <FiArrowUpRight />
            </Link>

          </div>

          <div className="px-5 md:px-6">

            {dashboard.todayServices.length > 0 ? (

              dashboard.todayServices.map((service) => {

                const stage =
                  normalizeStage(service?.stage);

                const stageConfig =
                  STAGE_CONFIG[stage];

                return (
                  <div
                    key={service?._id}
                    className="flex items-center gap-3 py-4 border-b border-slate-100 last:border-0"
                  >

                    <div
                      className={`w-10 h-10 shrink-0 rounded-xl ${stageConfig.bg} ${stageConfig.text} flex items-center justify-center`}
                    >
                      <FiTool />
                    </div>

                    <div className="flex-1 min-w-0">

                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {getClientName(service)}
                      </p>

                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {service?.company ||
                          service?.serviceType ||
                          "Service Request"}
                      </p>

                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {getPhone(service)}
                      </p>

                    </div>

                    <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
                      <FiCalendar />
                      {formatDate(getDate(service))}
                    </div>

                    <span
                      className={`hidden sm:block px-2.5 py-1.5 rounded-lg ${stageConfig.bg} ${stageConfig.text} text-[10px] font-bold`}
                    >
                      {formatStage(service?.stage)}
                    </span>

                  </div>
                );
              })

            ) : (

              <div className="min-h-[230px] flex flex-col items-center justify-center text-slate-400">

                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl mb-3">
                  <FiCalendar />
                </div>

                <p className="text-sm font-semibold text-slate-500">
                  No services for today
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Scheduled services will appear here.
                </p>

              </div>

            )}

          </div>

        </div>

        {/* CLIENT SUMMARY */}

        <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_8px_30px_rgba(32,42,70,0.06)] overflow-hidden">

          <div className="px-5 md:px-6 py-5 border-b border-slate-100">

            <p className="text-[10px] font-extrabold tracking-[1px] text-slate-400">
              CLIENT OVERVIEW
            </p>

            <h3 className="text-base font-bold text-slate-800 mt-1">
              Client Summary
            </h3>

          </div>

          <div className="p-5 md:p-6">

            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-5">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Total Unique Clients
                  </p>

                  <h2 className="text-4xl font-extrabold text-blue-600 mt-1">
                    {dashboard.totalClients}
                  </h2>
                </div>

                <div className="w-12 h-12 rounded-xl bg-white/80 text-blue-600 flex items-center justify-center text-xl">
                  <FiUsers />
                </div>

              </div>

            </div>

            <div className="mt-4">

              <div className="flex items-center justify-between py-3 border-b border-slate-100">

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FiTool className="text-violet-500" />
                  Service Requests
                </div>

                <strong className="text-sm text-slate-800">
                  {dashboard.serviceRequests}
                </strong>

              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-100">

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FiPhoneCall className="text-blue-500" />
                  Active Clients
                </div>

                <strong className="text-sm text-slate-800">
                  {
                    recordsActiveClients(
                      prospects
                    )
                  }
                </strong>

              </div>

              <div className="flex items-center justify-between py-3">

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FiAlertTriangle className="text-red-500" />
                  Urgent
                </div>

                <strong className="text-sm text-red-500">
                  {dashboard.urgentServices}
                </strong>

              </div>

            </div>

            <Link
              to="/clients"
              className="mt-4 flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all text-xs font-bold"
            >
              <FiUsers />
              View Clients
              <FiArrowUpRight />
            </Link>

          </div>

        </div>

      </div>

      {/* ======================================================
          FSM SECTION
      ====================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">

        <Link
          to="/fsm-requests"
          className="group bg-white rounded-[22px] border border-slate-100 p-5 shadow-[0_8px_30px_rgba(32,42,70,0.06)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(32,42,70,0.1)] transition-all"
        >

          <div className="flex items-center justify-between">

            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              <FiUserCheck />
            </div>

            <FiArrowUpRight className="text-slate-300 group-hover:text-[#6c63ff]" />

          </div>

          <h3 className="mt-4 text-sm font-bold text-slate-800">
            Technician Requests
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Manage technician requests and assignments.
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#6c63ff]">
            Open Requests
          </div>

        </Link>

        <Link
          to="/fsm-jobs"
          className="group bg-white rounded-[22px] border border-slate-100 p-5 shadow-[0_8px_30px_rgba(32,42,70,0.06)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(32,42,70,0.1)] transition-all"
        >

          <div className="flex items-center justify-between">

            <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center text-xl">
              <FiBriefcase />
            </div>

            <FiArrowUpRight className="text-slate-300 group-hover:text-[#6c63ff]" />

          </div>

          <h3 className="mt-4 text-sm font-bold text-slate-800">
            Job Requests
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            View and manage service job assignments.
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#6c63ff]">
            Manage Jobs
          </div>

        </Link>

        <Link
          to="/fsm-leaves"
          className="group bg-white rounded-[22px] border border-slate-100 p-5 shadow-[0_8px_30px_rgba(32,42,70,0.06)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(32,42,70,0.1)] transition-all"
        >

          <div className="flex items-center justify-between">

            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl">
              <FiCalendar />
            </div>

            <FiArrowUpRight className="text-slate-300 group-hover:text-[#6c63ff]" />

          </div>

          <h3 className="mt-4 text-sm font-bold text-slate-800">
            Technician Leaves
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Monitor technician leave requests.
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#6c63ff]">
            View Requests
          </div>

        </Link>

      </div>

      {/* ======================================================
          QUICK ACTIONS
      ====================================================== */}

      <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_8px_30px_rgba(32,42,70,0.06)] p-5 md:p-6">

        <div className="mb-4">

          <p className="text-[10px] font-extrabold tracking-[1px] text-slate-400">
            QUICK ACTIONS
          </p>

          <h3 className="text-base font-bold text-slate-800 mt-1">
            Services Team Actions
          </h3>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          <Link
            to="/service-management"
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-violet-50 hover:text-violet-600 transition-all text-xs font-bold"
          >
            <FiTool />
            Services
          </Link>

          <Link
            to="/fsm-requests"
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all text-xs font-bold"
          >
            <FiUserCheck />
            Technicians
          </Link>

          <Link
            to="/fsm-jobs"
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all text-xs font-bold"
          >
            <FiBriefcase />
            Jobs
          </Link>

          <Link
            to="/clients"
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-all text-xs font-bold"
          >
            <FiUsers />
            Clients
          </Link>

        </div>

      </div>

    </div>
  );
};

/*
 * ============================================================
 * ACTIVE CLIENT CALCULATION
 * ============================================================
 *
 * A client is considered active when their request is not
 * completed, cancelled or lost.
 *
 * This uses the real loaded records.
 */
function recordsActiveClients(records) {
  const unique = new Set();

  (Array.isArray(records) ? records : []).forEach((item) => {

    const stage = normalizeStage(item?.stage);

    const status = String(
      item?.status ||
        item?.serviceStatus ||
        item?.jobStatus ||
        ""
    ).toLowerCase();

    if (
      stage === "lost" ||
      stage === "won" ||
      status === "completed" ||
      status === "cancelled" ||
      status === "canceled"
    ) {
      return;
    }

    const phone = String(
      item?.phone ||
        item?.mobile ||
        item?.contactNumber ||
        ""
    ).replace(/\D/g, "");

    const email = String(
      item?.email ||
        ""
    ).toLowerCase().trim();

    const name =
      `${item?.firstName || ""} ${
        item?.lastName || ""
      }`
        .trim()
        .toLowerCase();

    const key =
      phone ||
      email ||
      name ||
      item?._id;

    if (key) {
      unique.add(key);
    }
  });

  return unique.size;
}

export default ServicesTeamDashboard;