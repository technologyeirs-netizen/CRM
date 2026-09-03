
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiTool,
  FiCalendar,
  FiArrowRight,
  FiUsers,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { fsmAdminService } from "../services/fsmAdminService";

const HRDashboard = () => {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    technicianRequests: 0,
    leaveRequests: 0,
  });

  const loadHRStats = async () => {
    setLoading(true);

    try {
      // Get technician requests + leave requests together
      const [technicianRes, leaveRes] = await Promise.all([
        fsmAdminService.getAll(),
        fsmAdminService.getLeaves(),
      ]);

      // -----------------------------
      // TECHNICIAN REQUESTS
      // -----------------------------
      const technicianRequests = Array.isArray(
        technicianRes?.data?.data
      )
        ? technicianRes.data.data
        : [];

      // Sirf pending technician requests
      const pendingTechnicianRequests = technicianRequests.filter(
        (request) => request?.status === "pending"
      ).length;

      // -----------------------------
      // LEAVE REQUESTS
      // -----------------------------
      const leaveRequests = Array.isArray(leaveRes?.data?.data)
        ? leaveRes.data.data
        : [];

      // Total submitted leave requests
      const totalLeaveRequests = leaveRequests.length;

      // -----------------------------
      // SET STATS
      // -----------------------------
      setStats({
        technicianRequests: pendingTechnicianRequests,
        leaveRequests: totalLeaveRequests,
      });
    } catch (error) {
      console.error("HR Dashboard Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load HR dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHRStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />

          <p className="text-sm text-slate-500 font-medium">
            Loading HR Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FiUsers size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              HR Dashboard
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Manage technician and employee leave requests
            </p>
          </div>
        </div>

        {/* REFRESH */}
        <button
          type="button"
          onClick={loadHRStats}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:shadow"
        >
          <FiRefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* TECHNICIAN REQUESTS */}
        <Link
          to="/fsm-requests"
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          {/* Background Decoration */}
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-50 opacity-70 transition-all duration-500 group-hover:scale-150" />

          <div className="relative">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Technician Requests
                </p>

                <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                  {stats.technicianRequests}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Pending Technician Requests
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white">
                <FiTool size={25} />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">

              <span className="text-sm font-medium text-slate-600">
                Review Requests
              </span>

              <span className="flex items-center gap-1 text-sm font-semibold text-purple-600 transition-all duration-300 group-hover:translate-x-1">
                View
                <FiArrowRight size={16} />
              </span>

            </div>
          </div>
        </Link>

        {/* LEAVE REQUESTS */}
        <Link
          to="/fsm-leaves"
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          {/* Background Decoration */}
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-50 opacity-70 transition-all duration-500 group-hover:scale-150" />

          <div className="relative">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Leave Requests
                </p>

                <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                  {stats.leaveRequests}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Total Leave Requests
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition-all duration-300 group-hover:bg-orange-600 group-hover:text-white">
                <FiCalendar size={25} />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">

              <span className="text-sm font-medium text-slate-600">
                Leave Management
              </span>

              <span className="flex items-center gap-1 text-sm font-semibold text-orange-600 transition-all duration-300 group-hover:translate-x-1">
                View
                <FiArrowRight size={16} />
              </span>

            </div>
          </div>
        </Link>

      </div>
    </div>
  );
};

export default HRDashboard;
