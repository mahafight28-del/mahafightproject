import api from './api'
import { Sale } from '../types/sale'

export const getSales = async (): Promise<Sale[]> => (await api.get('/sales')).data
export const getSale = async (id: string): Promise<Sale> => (await api.get(`/sales/${id}`)).data
export const createSale = (p: Partial<Sale>) => api.post('/sales', p)
export const updateSale = (id: string, p: Partial<Sale>) => api.put(`/sales/${id}`, p)
export const deleteSale = (id: string) => api.delete(`/sales/${id}`)
export const exportSales = (fromDate?: string, toDate?: string) => {
  const params = new URLSearchParams()
  if (fromDate) params.append('fromDate', fromDate)
  if (toDate) params.append('toDate', toDate)
  return api.get(`/reports/export/sales?${params}`, { responseType: 'blob' })
}

export default { getSales, getSale, createSale, updateSale, deleteSale, exportSales }
