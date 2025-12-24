import api from './api'
import { Invoice } from '../types/invoice'

export const getInvoices = async (dealerId?: string): Promise<Invoice[]> => {
  const url = dealerId ? `/invoices?dealerId=${dealerId}` : '/invoices'
  return (await api.get(url)).data
}
export const getInvoice = async (id: string): Promise<Invoice> => (await api.get(`/invoices/${id}`)).data
export const createInvoice = async (p: Partial<Invoice>) => (await api.post('/invoices', p)).data
export const updateInvoice = (id: string, p: Partial<Invoice>) => api.put(`/invoices/${id}`, p)
export const deleteInvoice = (id: string) => api.delete(`/invoices/${id}`)
export const downloadInvoicePdf = (invoiceId: string) => api.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' })

export const updateInvoiceStatus = (invoiceId: string, data: { status: string, paidAmount?: number }) => api.put(`/invoices/${invoiceId}/status`, data)

export default { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, downloadInvoicePdf, updateInvoiceStatus }
