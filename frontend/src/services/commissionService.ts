import api from './api'
import { Commission } from '../types/commission'

export const getCommissions = async (dealerId?: string): Promise<Commission[]> => {
  const url = dealerId ? `/commissions?dealerId=${dealerId}` : '/commissions'
  const response = await api.get(url)
  return response.data.data || response.data || []
}
export const getCommission = async (id: string): Promise<Commission> => (await api.get(`/commissions/${id}`)).data
export const createCommission = (p: Partial<Commission>) => api.post('/commissions', p)
export const updateCommission = (id: string, p: Partial<Commission>) => api.put(`/commissions/${id}`, p)
export const deleteCommission = (id: string) => api.delete(`/commissions/${id}`)
export const markCommissionPaid = (id: string, paymentReference: string = `PAY-${Date.now()}`) => 
  api.post(`/commissions/${id}/mark-paid`, { commissionId: id, paymentReference })
export const exportCommissions = (fromDate?: string, toDate?: string) => {
  const params = new URLSearchParams()
  if (fromDate) params.append('fromDate', fromDate)
  if (toDate) params.append('toDate', toDate)
  return api.get(`/reports/export/commissions?${params}`, { responseType: 'blob' })
}

export default { getCommissions, getCommission, createCommission, updateCommission, deleteCommission, markCommissionPaid, exportCommissions }
