export type ProductImage = {
  id: string
  fileName: string
  url: string
  isDefault: boolean
  displayOrder: number
}

export type Product = {
  id: string
  name: string
  sku?: string
  description?: string
  category?: string
  brand?: string
  unitPrice?: number
  costPrice?: number
  price?: number
  weight?: number
  dimensions?: string
  stockQuantity?: number
  stock?: number
  minStockLevel?: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  imageUrl?: string
  images?: ProductImage[]
  inStock?: boolean
}
