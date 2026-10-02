import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { prefetchPostLoginRoutes } from '../utils/routePrefetch';
import Modal from '../components/common/Modal';
import { authService } from '../services/authService';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  // ----- Forgot Password (OTP based) -----
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(form.email, form.password);

    if (result.success) {
      prefetchPostLoginRoutes();
      navigate(result.redirectTo || '/dashboard');
    }
  };

  const openForgotModal = () => {
    setForgotStep(1);
    setForgotEmail(form.email || '');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setShowForgotModal(true);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    const normalizedEmail = String(forgotEmail || '').trim();

    if (!normalizedEmail) {
      toast.error('Please enter your email');
      return;
    }

    setSendingOtp(true);

    try {
      const { data } = await authService.forgotPassword(normalizedEmail);

      toast.success(data?.message || 'OTP sent to your email');
      setForgotStep(2);
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to send OTP'
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error('Please enter the OTP sent to your email');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    setResettingPassword(true);

    try {
      const { data } = await authService.resetPassword({
        email: forgotEmail,
        otp: otp.trim(),
        newPassword,
      });

      toast.success(
        data?.message || 'Password reset successfully. Please login.'
      );

      setShowForgotModal(false);

      setForm((prev) => ({
        ...prev,
        email: forgotEmail,
        password: '',
      }));
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to reset password'
      );
    } finally {
      setResettingPassword(false);
    }
  };

  const handleResendOtp = async () => {
    setSendingOtp(true);

    try {
      const { data } = await authService.forgotPassword(forgotEmail);

      toast.success(data?.message || 'OTP resent to your email');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to resend OTP'
      );
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center px-4 py-8">

      {/* ========================================================= */}
      {/* BACKGROUND */}
      {/* ========================================================= */}

      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)',
          backgroundSize: '45px 45px',
        }}
      />

      {/* ========================================================= */}
      {/* MAIN CARD */}
      {/* ========================================================= */}

      <div className="relative z-10 w-full max-w-5xl">

        <div className="grid overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/40 backdrop-blur-2xl lg:grid-cols-2">

          {/* ===================================================== */}
          {/* LEFT BRAND PANEL */}
          {/* ===================================================== */}

          <div className="hidden lg:flex relative flex-col justify-between overflow-hidden p-10 xl:p-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700">

            {/* Decorative circles */}
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/10" />
            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/5" />

            <div className="relative z-10">

              {/* Logo */}
              <div className="mb-10 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xl">
                  <span className="text-xl font-black text-indigo-600">
                    E
                  </span>
                </div>

                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    EIRS CRM
                  </h1>
                  <p className="text-xs text-white/70">
                    Business Management Platform
                  </p>
                </div>
              </div>

              {/* Heading */}
              <div className="max-w-md">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                  <Sparkles size={13} />
                  Smart Business Management
                </div>

                <h2 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                  Manage your business.
                  <span className="block text-white/70">
                    Grow with confidence.
                  </span>
                </h2>

                <p className="mt-6 max-w-sm text-sm leading-7 text-white/70">
                  A powerful CRM platform designed to help your team manage
                  customers, services, requests and daily operations from
                  one place.
                </p>
              </div>
            </div>

            {/* Bottom features */}
            <div className="relative z-10 mt-12 space-y-3">

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <ShieldCheck size={18} className="text-white" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Secure & Reliable
                  </p>
                  <p className="text-xs text-white/60">
                    Your business data stays protected
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <LockKeyhole size={18} className="text-white" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Role Based Access
                  </p>
                  <p className="text-xs text-white/60">
                    Access the right information
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* ===================================================== */}
          {/* LOGIN PANEL */}
          {/* ===================================================== */}

          <div className="bg-white px-6 py-8 sm:px-10 sm:py-12 lg:px-12">

            {/* Mobile Logo */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <span className="text-lg font-black text-white">E</span>
              </div>

              <div>
                <h1 className="font-bold text-slate-900">
                  EIRS CRM
                </h1>
                <p className="text-xs text-slate-500">
                  Business Management Platform
                </p>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to access your CRM dashboard and manage your
                business.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <div className="group relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                  />

                  <input
                    type="email"
                    placeholder="admin@eirs.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        email: e.target.value,
                      }))
                    }
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={openForgotModal}
                    className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="group relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                  />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        password: e.target.value,
                      }))
                    }
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember / Security */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-500">
                    Secure login
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck size={14} />
                  Protected
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-10 border-t border-slate-100 pt-6 text-center">
              <p className="text-xs text-slate-400">
                EIRS CRM © {new Date().getFullYear()} — All rights reserved
              </p>

              <p className="mt-2 text-[11px] text-slate-400">
                Secure • Professional • Reliable
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* FORGOT PASSWORD MODAL */}
      {/* ========================================================= */}

      <Modal
        isOpen={showForgotModal}
        onClose={closeForgotModal}
        title={forgotStep === 1 ? 'Forgot Password' : 'Reset Password'}
        size="sm"
        footer={
          forgotStep === 1 ? (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeForgotModal}
              >
                Cancel
              </button>

              <button
                type="submit"
                form="forgot-password-form"
                className="btn btn-primary"
                disabled={sendingOtp}
              >
                {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeForgotModal}
              >
                Cancel
              </button>

              <button
                type="submit"
                form="reset-password-form"
                className="btn btn-primary"
                disabled={resettingPassword}
              >
                {resettingPassword
                  ? 'Resetting...'
                  : 'Reset Password'}
              </button>
            </>
          )
        }
      >
        {forgotStep === 1 ? (
          <form
            id="forgot-password-form"
            onSubmit={handleSendOtp}
            className="space-y-5"
          >
            <div className="rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-700">
              Enter your registered email address. We'll send you a
              One-Time Password (OTP) to reset your password.
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  type="email"
                  placeholder="you@eirs.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
          </form>
        ) : (
          <form
            id="reset-password-form"
            onSubmit={handleResetPassword}
            className="space-y-5"
          >
            <div className="rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
              OTP sent to{' '}
              <strong className="break-all">
                {forgotEmail}
              </strong>
              . Enter the OTP and create your new password.
            </div>

            {/* OTP */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                OTP
              </label>

              <input
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-center text-lg font-bold tracking-[0.4em] outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                type="text"
                placeholder="••••••"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ''))
                }
                maxLength={6}
                required
                autoFocus
              />
            </div>

            {/* New Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                New Password
              </label>

              <input
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Confirm New Password
              </label>

              <input
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                required
              />
            </div>

            {/* Resend */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={sendingOtp}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
              >
                {sendingOtp
                  ? 'Resending...'
                  : "Didn't get OTP? Resend"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default LoginPage;