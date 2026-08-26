import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { prefetchPostLoginRoutes } from '../utils/routePrefetch';
import Modal from '../components/common/Modal';
import { authService } from '../services/authService';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  // ----- Forgot Password (OTP based) -----
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter otp + new password
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
      toast.error(error.response?.data?.message || 'Failed to send OTP');
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
      toast.success(data?.message || 'Password reset successfully. Please login.');
      setShowForgotModal(false);
      setForm((prev) => ({ ...prev, email: forgotEmail, password: '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
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
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <h1>EIRS CRM</h1>
          <p>Customer Relationship Management System</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-control"
              type="email"
              placeholder="admin@eirs.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-control"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              required
            />
          </div>
          <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 8 }}>
            <button
              type="button"
              onClick={openForgotModal}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'var(--primary)',
                fontSize: 13,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Forgot password?
            </button>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '11px', marginTop: 8, fontSize: 15 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
          EIRS CRM &copy; {new Date().getFullYear()} — All rights reserved
        </p>
      </div>

      <Modal
        isOpen={showForgotModal}
        onClose={closeForgotModal}
        title={forgotStep === 1 ? 'Forgot Password' : 'Reset Password'}
        size="sm"
        footer={
          forgotStep === 1 ? (
            <>
              <button type="button" className="btn btn-secondary" onClick={closeForgotModal}>Cancel</button>
              <button type="submit" form="forgot-password-form" className="btn btn-primary" disabled={sendingOtp}>
                {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-secondary" onClick={closeForgotModal}>Cancel</button>
              <button type="submit" form="reset-password-form" className="btn btn-primary" disabled={resettingPassword}>
                {resettingPassword ? 'Resetting...' : 'Reset Password'}
              </button>
            </>
          )
        }
      >
        {forgotStep === 1 ? (
          <form id="forgot-password-form" onSubmit={handleSendOtp}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Enter your registered email address. We'll send you a One-Time Password (OTP) to reset your password.
            </p>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-control"
                type="email"
                placeholder="you@eirs.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </form>
        ) : (
          <form id="reset-password-form" onSubmit={handleResetPassword}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Enter the OTP sent to <strong>{forgotEmail}</strong> along with your new password.
            </p>
            <div className="form-group">
              <label className="form-label">OTP</label>
              <input
                className="form-control"
                type="text"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={sendingOtp}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--primary)',
                  fontSize: 12,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {sendingOtp ? 'Resending...' : "Didn't get OTP? Resend"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default LoginPage;
