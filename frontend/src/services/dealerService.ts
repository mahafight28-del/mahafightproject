import api from './api'
import { Dealer } from '../types/dealer'

export const getDealers = async (): Promise<Dealer[]> => {
  const res = await api.get('/dealers')
  return res.data.data || res.data || []
}

export const getDealer = async (id: string): Promise<Dealer> => {
  const res = await api.get(`/dealers/${id}`)
  return res.data
}

export const createDealer = async (payload: Partial<Dealer>) => api.post('/dealers', payload)
export const updateDealer = async (id: string, payload: Partial<Dealer>) => api.put(`/dealers/${id}`, payload)
export const deleteDealer = async (id: string) => api.delete(`/dealers/${id}`)

// Registration with KYC (PAN/Aadhaar + photo). Backend expects JSON, not FormData
export const registerDealer = async (dealerData: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  businessName: string
  businessType: string
  registrationNumber: string
  taxId: string
  address: string
  city: string
  state: string
  postalCode: string
  country?: string
}) => {
  const res = await api.post('/dealers/register', dealerData)
  return res.data
}

// Upload KYC document with file
export const uploadKycDocument = async (dealerId: string, documentType: string, documentNumber: string, file: File) => {
  const formData = new FormData()
  formData.append('documentType', documentType)
  formData.append('documentNumber', documentNumber)
  formData.append('documentFile', file)
  
  const res = await api.post(`/dealers/${dealerId}/kyc/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

// Fetch KYC / registration status for a dealer
export const getDealerKycStatus = async (id: string) => {
  // endpoint assumed /dealers/:id/kyc or /dealers/:id/status on backend; adjust if different
  const res = await api.get(`/dealers/${id}/kyc`)
  return res.data
}

export const approveDealerKyc = async (id: string, status: string, notes?: string) => {
  const res = await api.post(`/dealers/${id}/approve`, { status, notes })
  return res.data
}

export const rejectDealerKyc = async (id: string, notes?: string) => {
  const res = await api.post(`/dealers/${id}/approve`, { status: 'Rejected', notes })
  return res.data
}

export const exportDealers = () => api.get('/dealers/export', { responseType: 'blob' })

export const updateSalePaymentStatus = async (saleId: string, paymentStatus: string) => {
  const res = await api.put(`/sales/${saleId}/payment-status`, { paymentStatus })
  return res.data
}

export default { getDealers, getDealer, createDealer, updateDealer, deleteDealer, exportDealers }
