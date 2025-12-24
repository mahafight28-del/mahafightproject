import api from './api'
import { Product } from '../types/product'

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products')
  return response.data.data || response.data || []
}
export const getProduct = async (id: string): Promise<Product> => (await api.get(`/products/${id}`)).data
export const createProduct = (p: Partial<Product>) => api.post('/products', p)
export const updateProduct = (id: string, p: Partial<Product>) => api.put(`/products/${id}`, p)
export const deleteProduct = (id: string) => api.delete(`/products/${id}`)
export const exportProducts = () => api.get('/products/export', { responseType: 'blob' })

export const uploadProductImage = async (productId: string, file: File, isDefault = false, displayOrder = 0) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('isDefault', isDefault.toString())
  formData.append('displayOrder', displayOrder.toString())
  
  const response = await api.post(`/products/${productId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const deleteProductImage = async (productId: string, imageId: string) => {
  return await api.delete(`/products/${productId}/images/${imageId}`)
}

export default { getProducts, getProduct, createProduct, updateProduct, deleteProduct, exportProducts, uploadProductImage, deleteProductImage }
