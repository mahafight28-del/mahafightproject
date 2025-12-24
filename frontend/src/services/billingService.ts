import api from './api'

export const createBilling = async (billingData: {
  dealerId: string
  items: Array<{
    productId: string
    quantity: number
    unitPrice?: number
  }>
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  paymentMethod?: string
}) => {
  // Create sale and auto-generate invoice
  const res = await api.post('/invoices', billingData)
  return res.data
}

export const getBillingHistory = async (dealerId?: string) => {
  const url = dealerId ? `/invoices?dealerId=${dealerId}` : '/invoices'
  const res = await api.get(url)
  return res.data
}

export default { createBilling, getBillingHistory }