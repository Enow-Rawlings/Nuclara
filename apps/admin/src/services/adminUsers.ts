import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'

export interface AdminUserRecord {
  id: string
  auth_user_id: string
  email: string
  name: string
  role: string
  is_active: boolean
  created_at: string
  invited_by: string | null
}

export async function fetchAdminUsers(): Promise<AdminUserRecord[]> {
  const { data } = await api.get<ApiSuccess<AdminUserRecord[]>>('/admin/users')
  return data.data
}

export async function inviteAdminUser(payload: {
  email: string
  name: string
  role: string
}): Promise<AdminUserRecord> {
  const { data } = await api.post<ApiSuccess<AdminUserRecord>>('/admin/users/invite', payload)
  return data.data
}

export async function updateAdminUser(
  id: string,
  payload: { role?: string; isActive?: boolean }
): Promise<AdminUserRecord> {
  const { data } = await api.patch<ApiSuccess<AdminUserRecord>>(`/admin/users/${id}`, payload)
  return data.data
}

export async function revokeAdminUser(id: string): Promise<void> {
  await api.delete(`/admin/users/${id}`)
}
