
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  FiTruck,
  FiPackage,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiArrowUpRight,
  FiMapPin,
  FiNavigation,
  FiRefreshCw,
  FiShoppingBag,
  FiFileText,
  FiActivity,
  FiXCircle,
  FiUserCheck,
} from "react-icons/fi";

const DeliveryTeamDashboard = () => {
  const [loading, setLoading] = useState(true);

  /*
    Delivery dashboard data

    Replace these values with your actual
    delivery / distribution / order API response.
  */

  const [deliveryStats, setDeliveryStats] = useState({
    totalDeliveries: 0,
    pendingDeliveries: 0,
    todayDeliveries: 0,
    inTransit: 0,
    delivered: 0,
    failedDeliveries: 0,

    cancelled: 0,
    returned: 0,

    todayDeliveryList: [],
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        /*
          Connect your delivery API here.

          Example:

          const response =
            await deliveryService.getStats();

          setDeliveryStats(response.data);
        */

        await new Promise((resolve) =>
          setTimeout(resolve, 500)
        );
      } catch (error) {
        console.error(
          "Delivery Team Dashboard Error:",
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
        <div className="w-11 h-11 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />

        <p className="mt-4 text-sm font-medium text-slate-500">
          Loading Delivery Dashboard...
        </p>
      </div>
    );
  }

  /*
    PREMIUM DELIVERY STATS
  */

  const stats = [
    {
      title: "Total Deliveries",
      value: deliveryStats.totalDeliveries,
      subtitle: "All Delivery Orders",
      icon: FiTruck,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      link: "/distribution",
    },

    {
      title: "Pending Deliveries",
      value: deliveryStats.pendingDeliveries,
      subtitle: "Waiting for Dispatch",
      icon: FiClock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      link: "/distribution",
    },

    {
      title: "Today's Deliveries",
      value: deliveryStats.todayDeliveries,
      subtitle: "Scheduled Today",
      icon: FiCalendar,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      link: "/distribution",
    },

    {
      title: "In Transit",
      value: deliveryStats.inTransit,
      subtitle: "Currently On The Way",
      icon: FiNavigation,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      link: "/distribution",
    },

    {
      title: "Delivered",
      value: deliveryStats.delivered,
      subtitle: "Successfully Delivered",
      icon: FiCheckCircle,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      link: "/distribution",
    },

    {
      title: "Failed / Returned",
      value: deliveryStats.failedDeliveries,
      subtitle: "Needs Attention",
      icon: FiAlertTriangle,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      link: "/distribution",
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

            <span>
              Dashboard
            </span>

            <span>
              /
            </span>

            <span className="text-blue-600">
              Delivery Team
            </span>

          </div>


          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">

            Delivery Team{" "}

            <span className="text-blue-600">
              Dashboard
            </span>

          </h1>


          <p className="text-sm text-slate-500 mt-2 max-w-2xl">
            Track deliveries, dispatches, shipments and
            delivery performance from one place.
          </p>

        </div>


        {/* =================================================
            HEADER STATUS
        ================================================= */}

        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/90 border border-slate-100 shadow-[0_8px_30px_rgba(32,42,70,0.07)]">

          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
            <FiTruck />
          </div>

          <div>

            <p className="text-sm font-bold text-slate-800">
              Delivery Team
            </p>

            <p className="text-[11px] text-slate-400 mt-0.5">
              Delivery Performance
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

              <div className="absolute -right-12 -bottom-16 w-36 h-36 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent blur-2xl group-hover:w-48 group-hover:h-48 transition-all duration-500" />


              <div className="relative z-10">

                {/* Icon */}

                <div className="flex items-center justify-between">

                  <div
                    className={`w-12 h-12 rounded-[15px] ${stat.iconBg} ${stat.iconColor} flex items-center justify-center text-[22px]`}
                  >
                    <Icon />
                  </div>


                  <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300">
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
          MAIN DELIVERY SECTION
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-5 mb-5">


        {/* =================================================
            TODAY'S DELIVERY
        ================================================= */}

        <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_8px_30px_rgba(32,42,70,0.06)] overflow-hidden">

          <div className="px-5 md:px-6 py-5 border-b border-slate-100 flex items-center justify-between">

            <div>

              <p className="text-[10px] font-extrabold tracking-[1px] text-slate-400">
                DELIVERY ACTIVITY
              </p>

              <h3 className="text-base font-bold text-slate-800 mt-1">
                Today's Deliveries
              </h3>

            </div>


            <Link
              to="/distribution"
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:gap-2 transition-all"
            >
              View All

              <FiArrowUpRight />

            </Link>

          </div>


          <div className="px-5 md:px-6">

            {deliveryStats.todayDeliveryList?.length > 0 ? (

              deliveryStats.todayDeliveryList.map(
                (delivery) => (

                  <div
                    key={delivery._id}
                    className="flex items-center gap-3 py-4 border-b border-slate-100 last:border-0"
                  >

                    {/* Icon */}

                    <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FiPackage />
                    </div>


                    {/* Delivery Details */}

                    <div className="flex-1 min-w-0">

                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {delivery.orderNumber ||
                          delivery.title ||
                          "Delivery Order"}
                      </p>


                      <p className="text-xs text-slate-500 mt-1">
                        {delivery.customerName ||
                          "Customer"}
                      </p>


                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">

                        <FiMapPin />

                        <span className="truncate">
                          {delivery.address ||
                            "Delivery Address"}
                        </span>

                      </div>

                    </div>


                    {/* Delivery Person */}

                    <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">

                      <FiUserCheck className="text-blue-600" />

                      {delivery.deliveryPerson ||
                        "Unassigned"}

                    </div>


                    {/* Status */}

                    <span className="hidden sm:block px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold">

                      {delivery.status ||
                        "Pending"}

                    </span>

                  </div>

                )
              )

            ) : (

              <div className="min-h-[230px] flex flex-col items-center justify-center text-slate-400">

                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl mb-3">
                  <FiTruck />
                </div>


                <p className="text-sm font-semibold text-slate-500">
                  No deliveries scheduled
                </p>


                <p className="text-xs text-slate-400 mt-1">
                  Today's delivery orders will appear here.
                </p>

              </div>

            )}

          </div>

        </div>


        {/* =================================================
            DELIVERY STATUS
        ================================================= */}

        <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_8px_30px_rgba(32,42,70,0.06)] overflow-hidden">

          <div className="px-5 md:px-6 py-5 border-b border-slate-100">

            <p className="text-[10px] font-extrabold tracking-[1px] text-slate-400">
              DELIVERY STATUS
            </p>

            <h3 className="text-base font-bold text-slate-800 mt-1">
              Delivery Overview
            </h3>

          </div>


          <div className="p-5 md:p-6">

            {/* Main Status */}

            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-5 mb-4">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[11px] font-semibold text-slate-500">
                    In Transit
                  </p>

                  <h2 className="text-4xl font-extrabold text-blue-600 mt-1">
                    {deliveryStats.inTransit}
                  </h2>

                </div>


                <div className="w-12 h-12 rounded-xl bg-white/80 text-blue-600 flex items-center justify-center text-xl">
                  <FiNavigation />
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
                {deliveryStats.pendingDeliveries}
              </strong>

            </div>


            {/* In Transit */}

            <div className="flex items-center justify-between py-3 border-b border-slate-100">

              <div className="flex items-center gap-2 text-sm text-slate-600">

                <span className="w-2 h-2 rounded-full bg-blue-500" />

                In Transit

              </div>

              <strong className="text-sm text-slate-800">
                {deliveryStats.inTransit}
              </strong>

            </div>


            {/* Delivered */}

            <div className="flex items-center justify-between py-3 border-b border-slate-100">

              <div className="flex items-center gap-2 text-sm text-slate-600">

                <span className="w-2 h-2 rounded-full bg-emerald-500" />

                Delivered

              </div>

              <strong className="text-sm text-slate-800">
                {deliveryStats.delivered}
              </strong>

            </div>


            {/* Failed */}

            <div className="flex items-center justify-between py-3 border-b border-slate-100">

              <div className="flex items-center gap-2 text-sm text-slate-600">

                <span className="w-2 h-2 rounded-full bg-red-500" />

                Failed

              </div>

              <strong className="text-sm text-slate-800">
                {deliveryStats.failedDeliveries}
              </strong>

            </div>


            {/* Returned */}

            <div className="flex items-center justify-between py-3">

              <div className="flex items-center gap-2 text-sm text-slate-600">

                <span className="w-2 h-2 rounded-full bg-orange-500" />

                Returned

              </div>

              <strong className="text-sm text-slate-800">
                {deliveryStats.returned}
              </strong>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          DELIVERY PERFORMANCE
      ===================================================== */}

      <div className="bg-white rounded-[22px] border border-slate-100 shadow-[0_8px_30px_rgba(32,42,70,0.06)] p-5 md:p-6 mb-5">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

          <div>

            <p className="text-[10px] font-extrabold tracking-[1px] text-slate-400">
              PERFORMANCE
            </p>

            <h3 className="text-base font-bold text-slate-800 mt-1">
              Delivery Performance
            </h3>

          </div>


          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold">

            <FiActivity />

            Live Overview

          </div>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


          {/* Delivered */}

          <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold text-slate-500">
                  Delivered
                </p>

                <h2 className="text-3xl font-extrabold text-emerald-600 mt-1">
                  {deliveryStats.delivered}
                </h2>

              </div>


              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                <FiCheckCircle />
              </div>

            </div>

          </div>


          {/* In Transit */}

          <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold text-slate-500">
                  In Transit
                </p>

                <h2 className="text-3xl font-extrabold text-blue-600 mt-1">
                  {deliveryStats.inTransit}
                </h2>

              </div>


              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                <FiNavigation />
              </div>

            </div>

          </div>


          {/* Failed */}

          <div className="rounded-2xl bg-red-50/70 border border-red-100 p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold text-slate-500">
                  Failed / Returned
                </p>

                <h2 className="text-3xl font-extrabold text-red-500 mt-1">
                  {deliveryStats.failedDeliveries}
                </h2>

              </div>


              <div className="w-11 h-11 rounded-xl bg-red-100 text-red-500 flex items-center justify-center text-xl">
                <FiXCircle />
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          QUICK MANAGEMENT CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">


        {/* Distribution */}

        <Link
          to="/distribution"
          className="group bg-white rounded-[22px] border border-slate-100 p-5 shadow-[0_8px_30px_rgba(32,42,70,0.06)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(32,42,70,0.1)] transition-all"
        >

          <div className="flex items-center justify-between">

            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              <FiTruck />
            </div>

            <FiArrowUpRight className="text-slate-300 group-hover:text-blue-600 transition-colors" />

          </div>


          <h3 className="mt-4 text-sm font-bold text-slate-800">
            Distribution
          </h3>


          <p className="mt-1 text-xs text-slate-400">
            Manage dispatch and delivery operations.
          </p>


          <div className="mt-4 text-xs font-bold text-blue-600">
            Manage Distribution
          </div>

        </Link>


        {/* Delivery Challan */}

        <Link
          to="/delivery-challan"
          className="group bg-white rounded-[22px] border border-slate-100 p-5 shadow-[0_8px_30px_rgba(32,42,70,0.06)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(32,42,70,0.1)] transition-all"
        >

          <div className="flex items-center justify-between">

            <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center text-xl">
              <FiFileText />
            </div>

            <FiArrowUpRight className="text-slate-300 group-hover:text-violet-600 transition-colors" />

          </div>


          <h3 className="mt-4 text-sm font-bold text-slate-800">
            Delivery Challan
          </h3>


          <p className="mt-1 text-xs text-slate-400">
            Create and manage delivery challans.
          </p>


          <div className="mt-4 text-xs font-bold text-violet-600">
            Manage Challans
          </div>

        </Link>


        {/* Orders */}

        <Link
          to="/purchase-history"
          className="group bg-white rounded-[22px] border border-slate-100 p-5 shadow-[0_8px_30px_rgba(32,42,70,0.06)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(32,42,70,0.1)] transition-all"
        >

          <div className="flex items-center justify-between">

            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl">
              <FiShoppingBag />
            </div>

            <FiArrowUpRight className="text-slate-300 group-hover:text-orange-500 transition-colors" />

          </div>


          <h3 className="mt-4 text-sm font-bold text-slate-800">
            Orders
          </h3>


          <p className="mt-1 text-xs text-slate-400">
            Review orders ready for delivery.
          </p>


          <div className="mt-4 text-xs font-bold text-orange-500">
            View Orders
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
            Delivery Team Actions
          </h3>

        </div>


        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">


          <Link
            to="/distribution"
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all text-xs font-bold"
          >
            <FiTruck className="text-base" />
            Distribution
          </Link>


          <Link
            to="/delivery-challan"
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-violet-50 hover:text-violet-600 transition-all text-xs font-bold"
          >
            <FiFileText className="text-base" />
            Challan
          </Link>


          <Link
            to="/purchase-history"
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-all text-xs font-bold"
          >
            <FiShoppingBag className="text-base" />
            Orders
          </Link>


          <Link
            to="/clients"
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all text-xs font-bold"
          >
            <FiUserCheck className="text-base" />
            Clients
          </Link>

        </div>

      </div>

    </div>
  );
};

export default DeliveryTeamDashboard;
