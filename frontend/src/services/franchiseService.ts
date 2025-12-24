import api from './api'
import { Franchise } from '../types/franchise'

export const getFranchises = async (): Promise<Franchise[]> => {
  const res = await api.get('/franchises')
  return res.data
}

export const getFranchise = async (id: string): Promise<Franchise> => {
  const res = await api.get(`/franchises/${id}`)
  return res.data
}

export const createFranchise = async (payload: Partial<Franchise>) => api.post('/franchises', payload)
export const updateFranchise = async (id: string, payload: Partial<Franchise>) => api.put(`/franchises/${id}`, payload)
export const deleteFranchise = async (id: string) => api.delete(`/franchises/${id}`)

// Registration for franchises - send JSON data
export const registerFranchise = async (franchiseData: {
  franchiseName: string
  franchiseCode: string
  ownerId: string
  territory: string
  address: string
  city: string
  state: string
  postalCode: string
  country?: string
  franchiseFee: number
  royaltyRate?: number
  contractStartDate: string
  contractEndDate: string
}) => {
  const res = await api.post('/franchises/register', franchiseData)
  return res.data
}

export const getFranchiseKycStatus = async (id: string) => {
  const res = await api.get(`/franchises/${id}/kyc`)
  return res.data
}

export const approveFranchiseKyc = async (id: string) => {
  const res = await api.post(`/franchises/${id}/kyc/approve`)
  return res.data
}

export const rejectFranchiseKyc = async (id: string, reason?: string) => {
  const res = await api.post(`/franchises/${id}/kyc/reject`, { reason })
  return res.data
}

export default { getFranchises, getFranchise, createFranchise, updateFranchise, deleteFranchise }
