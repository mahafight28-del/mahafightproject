import api from './api'
import { User } from '../types/user'

export const getUsers = async (): Promise<User[]> => (await api.get('/users')).data
export const getUser = async (id: string): Promise<User> => (await api.get(`/users/${id}`)).data
export const createUser = (userData: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role?: string
}) => api.post('/users', userData)
export const updateUser = (id: string, userData: Partial<User>) => api.put(`/users/${id}`, userData)
export const deleteUser = (id: string) => api.delete(`/users/${id}`)

export default { getUsers, getUser, createUser, updateUser, deleteUser }
