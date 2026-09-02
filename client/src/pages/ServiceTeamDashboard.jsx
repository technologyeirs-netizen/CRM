
import React, { useEffect, useState } from "react";
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
  FiMapPin,
  FiRefreshCw,
} from "react-icons/fi";

const ServicesTeamDashboard = () => {
  const [loading, setLoading] = useState(true);

  /*
    Later replace these values with your actual
    service-management / FSM API data.
  */
  const [serviceStats, setServiceStats] = useState({
    totalClients: 0,
    serviceRequests: 0,
    scheduledServices: 0,
    completedServices: 0,
    pendingServices: 0,
    urgentServices: 0,

    inProgress: 0,
    cancelled: 0,

    todayServices: [],
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        /*
          TODO:
          Connect your service-management API here.

          Example:

          const response = await serviceManagementService.getStats();

          setServiceStats(response.data);
        */

        await new Promise((resolve) =>
          setTimeout(resolve, 500)
        );
      } catch (error) {
        console.error(
          "Services Team Dashboard Error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

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

  const stats = [
    {
      title: "Total Clients",
      value: serviceStats.totalClients,
      subtitle: "Service Clients",
      icon: FiUsers,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      hoverBg: "group-hover:bg-blue-50",
      link: "/clients",
    },

    {
      title: "Service Requests",
      value: serviceStats.serviceRequests,
      subtitle: "Total Service Requests",
      icon: FiTool,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      hoverBg: "group-hover:bg-violet-50",
      link: "/service-management",
    },

    {
      title: "Scheduled Services",
      value: serviceStats.scheduledServices,
      subtitle: "Scheduled Services",
      icon: FiCalendar,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      hoverBg: "group-hover:bg-orange-50",
      link: "/service-management",
    },

    {
      title: "Completed Services",
      value: serviceStats.completedServices,
      subtitle: "Successfully Completed",
      icon: FiCheckCircle,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      hoverBg: "group-hover:bg-emerald-50",
      link: "/service-management",
    },

    {
      title: "Pending Services",
      value: serviceStats.pendingServices,
      subtitle: "Waiting for Action",
      icon: FiClock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      hoverBg: "group-hover:bg-amber-50",
      link: "/service-management",
    },

    {
      title: "Urgent Requests",
      value: serviceStats.urgentServices,
      subtitle: "Needs Immediate Attention",
      icon: FiAlertTriangle,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      hoverBg: "group-hover:bg-red-50",
      link: "/service-management",
    },
  ];

  return (
    <div className="min-h-full bg-[#f6f8fc] p-4 md:p-6 lg:p-7">

      {/* =====================================================
          HEADER
      ===================================================== */}

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
            Manage service requests, technicians, schedules
            and service performance from one powerful dashboard.
          </p>

        </div>


        {/* Header Badge */}

        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/90 border border-slate-100 shadow-[0_8px_30px_rgba(32,42,70,0.07)]">

          <div className="w-11 h-11 rounded-xl bg-violet-50 text-[#6c63ff] flex items-center justify-center text-xl">
            <FiTool />
          </div>

          <div>

            <p className="text-sm font-bold text-slate-800">
              Services Team
            </p>

            <p className="text-[11px] text-slate-400 mt-0.5">
              Service Performance
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          PREMIUM STATS
      ===================================================== */}

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

              <div className="absolute -right-12 -bottom-16 w-36 h-36 rounded-full bg-gradient-to-br from-violet-500/10 to-transparent blur-2xl group-hover:w-48 group-hover:h-48 transition-all duration-500" />


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


                {/* Content */}

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


      {/* =====================================================
          SERVICE ACTIVITY GRID
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-5 mb-5">


        {/* =================================================
            TODAY'S SERVICES
        ================================================= */}

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
              className="flex items-center gap-1 text-xs font-bold text-[#6c63ff] hover:gap-2 transition-all"
            >
              View All
              <FiArrowUpRight />
            </Link>

          </div>


          <div className="px-5 md:px-6">

            {serviceStats.todayServices?.length > 0 ? (

              serviceStats.todayServices.map((service) => (

                <div
                  key={service._id}
                  className="flex items-center gap-3 py-4 border-b border-slate-100 last:border-0"
                >

                  {/* Service Icon */}

                  <div className="w-10 h-10 shrink-0 rounded-xl bg-violet-50 text-[#6c63ff] flex items-center justify-center">
                    <FiTool />
                  </div>


                  {/* Details */}

                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {service.title || "Service Request"}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {service.clientName || "Client"}
                    </p>

                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {service.phone || "No phone"}
                    </p>

                  </div>


                  {/* Technician */}

                  <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">

                    <FiUserCheck className="text-[#6c63ff]" />

                    {service.technicianName ||
                      "Unassigned"}

                  </div>


                  {/* Status */}

                  <span className="hidden sm:block px-2.5 py-1.5 rounded-lg bg-violet-50 text-[#6c63ff] text-[10px] font-bold">
                    {service.status || "Pending"}
                  </span>

                </div>

              ))

            ) : (

              <div className="min-h-[230px] flex flex-col items-center justify-center text-slate-400">

                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl mb-3">
                  <FiTool />
                </div>

                <p className="text-sm font-semibold text-slate-500">
                  No services scheduled
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Today's service requests will appear here.
                </p>

              </div>

            )}

          </div>

        </div>


        {/* =================================================
            SERVICE STATUS
        ================================================= */}

        <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_8px_30px_rgba(32,42,70,0.06)] overflow-hidden">

          <div className="px-5 md:px-6 py-5 border-b border-slate-100">

            <p className="text-[10px] font-extrabold tracking-[1px] text-slate-400">
              SERVICE STATUS
            </p>

            <h3 className="text-base font-bold text-slate-800 mt-1">
              Service Overview
            </h3>

          </div>


          <div className="p-5 md:p-6">

            {/* Main Status */}

            <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 p-5 mb-4">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[11px] font-semibold text-slate-500">
                    Active Services
                  </p>

                  <h2 className="text-4xl font-extrabold text-[#6c63ff] mt-1">
                    {serviceStats.inProgress}
                  </h2>

                </div>

                <div className="w-12 h-12 rounded-xl bg-white/80 text-[#6c63ff] flex items-center justify-center text-xl">
                  <FiActivity />
                </div>

              </div>

            </div>


            {/* Pending */}

            <div className="flex items-center justify-between py-3 border-b border-slate-100">

              <div className="flex items-center gap-2 text-sm text-slate-600">

                <span className="w-2 h-2 rounded-full bg-amber-500" />

                Pending

              </div>

              <strong className="text-sm text-slate-800">
                {serviceStats.pendingServices}
              </strong>

            </div>


            {/* In Progress */}

            <div className="flex items-center justify-between py-3 border-b border-slate-100">

              <div className="flex items-center gap-2 text-sm text-slate-600">

                <span className="w-2 h-2 rounded-full bg-violet-500" />

                In Progress

              </div>

              <strong className="text-sm text-slate-800">
                {serviceStats.inProgress}
              </strong>

            </div>


            {/* Completed */}

            <div className="flex items-center justify-between py-3 border-b border-slate-100">

              <div className="flex items-center gap-2 text-sm text-slate-600">

                <span className="w-2 h-2 rounded-full bg-emerald-500" />

                Completed

              </div>

              <strong className="text-sm text-slate-800">
                {serviceStats.completedServices}
              </strong>

            </div>


            {/* Cancelled */}

            <div className="flex items-center justify-between py-3">

              <div className="flex items-center gap-2 text-sm text-slate-600">

                <span className="w-2 h-2 rounded-full bg-red-500" />

                Cancelled

              </div>

              <strong className="text-sm text-slate-800">
                {serviceStats.cancelled}
              </strong>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          TECHNICIAN / FSM SECTION
      ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">


        {/* Technician Requests */}

        <Link
          to="/fsm-requests"
          className="group bg-white rounded-[22px] border border-slate-100 p-5 shadow-[0_8px_30px_rgba(32,42,70,0.06)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(32,42,70,0.1)] transition-all"
        >

          <div className="flex items-center justify-between">

            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              <FiUserCheck />
            </div>

            <FiArrowUpRight className="text-slate-300 group-hover:text-[#6c63ff] transition-colors" />

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


        {/* Job Requests */}

        <Link
          to="/fsm-jobs"
          className="group bg-white rounded-[22px] border border-slate-100 p-5 shadow-[0_8px_30px_rgba(32,42,70,0.06)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(32,42,70,0.1)] transition-all"
        >

          <div className="flex items-center justify-between">

            <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center text-xl">
              <FiBriefcase />
            </div>

            <FiArrowUpRight className="text-slate-300 group-hover:text-[#6c63ff] transition-colors" />

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


        {/* Leave Requests */}

        <Link
          to="/fsm-leaves"
          className="group bg-white rounded-[22px] border border-slate-100 p-5 shadow-[0_8px_30px_rgba(32,42,70,0.06)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(32,42,70,0.1)] transition-all"
        >

          <div className="flex items-center justify-between">

            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl">
              <FiCalendar />
            </div>

            <FiArrowUpRight className="text-slate-300 group-hover:text-[#6c63ff] transition-colors" />

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


      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

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
            <FiTool className="text-base" />
            Services
          </Link>


          <Link
            to="/fsm-requests"
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all text-xs font-bold"
          >
            <FiUserCheck className="text-base" />
            Technicians
          </Link>


          <Link
            to="/fsm-jobs"
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all text-xs font-bold"
          >
            <FiBriefcase className="text-base" />
            Jobs
          </Link>


          <Link
            to="/clients"
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-all text-xs font-bold"
          >
            <FiUsers className="text-base" />
            Clients
          </Link>

        </div>

      </div>

    </div>
  );
};

export default ServicesTeamDashboard;

