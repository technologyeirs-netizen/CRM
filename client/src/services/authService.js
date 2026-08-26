import API from '../api/axios';

export const authService = {
  // Step 1: send OTP to the given email for password reset
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  // Step 2: verify OTP and set a new password
  resetPassword: ({ email, otp, newPassword }) =>
    API.post('/auth/reset-password', { email, otp, newPassword }),
};
