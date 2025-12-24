export type InvoiceItem = {
  productId: string
  productName?: string
  quantity: number
  unitPrice: number
  lineTotal?: number
}

export type Invoice = {
  id: string
  invoiceNumber?: string
  number?: string
  saleId?: string
  dealerId?: string
  dealerName?: string
  invoiceDate?: string
  dueDate?: string
  subtotal?: number
  taxAmount?: number
  totalAmount?: number
  paidAmount?: number
  balanceAmount?: number
  status?: string
  paymentTerms?: string
  items?: InvoiceItem[]
  total?: number
  issuedAt?: string
  createdAt?: string
}
