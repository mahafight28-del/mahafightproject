import api from './api'

export const getDashboardStats = async () => {
  const res = await api.get('/reports/dashboard-stats')
  return res.data
}

export const getSalesSummary = async (fromDate?: string, toDate?: string, dealerId?: string) => {
  const params = new URLSearchParams()
  if (fromDate) params.append('fromDate', fromDate)
  if (toDate) params.append('toDate', toDate)
  if (dealerId) params.append('dealerId', dealerId)
  
  const res = await api.get(`/reports/sales-summary?${params}`)
  return res.data
}

export const getCommissionSummary = async (fromDate?: string, toDate?: string, dealerId?: string) => {
  const params = new URLSearchParams()
  if (fromDate) params.append('fromDate', fromDate)
  if (toDate) params.append('toDate', toDate)
  if (dealerId) params.append('dealerId', dealerId)
  
  const res = await api.get(`/reports/commission-summary?${params}`)
  return res.data
}

export const getLowStockProducts = async () => {
  const res = await api.get('/reports/low-stock')
  return res.data
}

export default { 
  getDashboardStats, 
  getSalesSummary, 
  getCommissionSummary, 
  getLowStockProducts 
}