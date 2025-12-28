import api from './api';

export interface SendOtpRequest {
  email: string;
  purpose: 'LOGIN' | 'RESET_PASSWORD';
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  purpose: 'LOGIN' | 'RESET_PASSWORD';
}

export interface LoginWithOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  token?: string;
}

export const otpService = {
  sendOtp: async (request: SendOtpRequest): Promise<OtpResponse> => {
    const response = await api.post('/auth/send-otp', request);
    return response.data;
  },

  verifyOtp: async (request: VerifyOtpRequest): Promise<OtpResponse> => {
    const response = await api.post('/auth/verify-otp', request);
    return response.data;
  },

  loginWithOtp: async (request: LoginWithOtpRequest): Promise<any> => {
    const response = await api.post('/auth/login-with-otp', request);
    return response.data;
  },

  resetPassword: async (request: ResetPasswordRequest): Promise<OtpResponse> => {
    const response = await api.post('/auth/reset-password', request);
    return response.data;
  }
};