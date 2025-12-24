import api from './api'

export interface ForgotPasswordResponse {
  success: boolean
  message: string
  resendAfterSeconds?: number
}

export const sendOtp = async (identifier: string): Promise<ForgotPasswordResponse> => {
  const response = await api.post('/auth/forgot-password/send-otp', { identifier })
  return response.data
}

export const verifyOtp = async (identifier: string, otp: string): Promise<ForgotPasswordResponse> => {
  const response = await api.post('/auth/forgot-password/verify-otp', { identifier, otp })
  return response.data
}

export const resetPassword = async (identifier: string, otp: string, newPassword: string): Promise<ForgotPasswordResponse> => {
  const response = await api.post('/auth/forgot-password/reset-password', { 
    identifier, 
    otp, 
    newPassword 
  })
  return response.data
}

export default { sendOtp, verifyOtp, resetPassword }