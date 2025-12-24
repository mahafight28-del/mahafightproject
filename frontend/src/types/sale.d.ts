export type SaleItem = {
  productId: string
  quantity: number
  unitPrice: number
}

export type Sale = {
  id: string
  saleNumber?: string
  dealerId?: string
  dealerName?: string
  customerName?: string
  saleDate?: string
  totalAmount?: number
  paymentStatus?: string
  items?: SaleItem[]
  total?: number
  soldAt?: string
}
