import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { User, Mail, Shield, Check, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

interface AdminProfile {
  id: string
  email: string
  name: string
  role: string
  is_active: boolean
  created_at: string
}

const roleBadge = (role: string) => {
  const map: Record<string, 'info' | 'success' | 'warning' | 'default' | 'purple'> = {
    owner: 'purple',
    catalogue_manager: 'info',
    order_manager: 'success',
    support_agent: 'warning',
    seo_editor: 'default',
  }
  return map[role] ?? 'default'
}

const inputClass = 'rounded border border-border-grey bg-cloud-white px-3 py-2 text-sm text-graphite focus:border-scientific-teal focus:outline-none focus:ring-1 focus:ring-scientific-teal w-full'

export default function ProfilePage() {
  const [nameEdit, setNameEdit] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [nameSaved, setNameSaved] = useState(false)
  const [nameLoading, setNameLoading] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  const [pwEdit, setPwEdit] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSaved, setPwSaved] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: async () => {
      const { data } = await api.get<ApiSuccess<AdminProfile>>('/admin/users/me')
      return data.data
    },
  })

  const handleSaveName = async () => {
    if (!nameValue.trim()) return
    setNameLoading(true)
    setNameError(null)
    try {
      await api.patch('/admin/users/me', { name: nameValue.trim() })
      setNameEdit(false)
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 3000)
    } catch {
      setNameError('Failed to update name.')
    } finally {
      setNameLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setPwError(null)
    if (pwForm.next.length < 8) { setPwError('Password must be at least 8 characters.'); return }
    if (pwForm.next !== pwForm.confirm) { setPwError('Passwords do not match.'); return }
    setPwLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.next })
      if (error) throw error
      setPwEdit(false)
      setPwSaved(true)
      setPwForm({ current: '', next: '', confirm: '' })
      setTimeout(() => setPwSaved(false), 4000)
    } catch (err: unknown) {
      setPwError((err as Error).message ?? 'Failed to update password.')
    } finally {
      setPwLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-lg space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-36 w-full rounded-lg" />
        <Skeleton className="h-28 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-midnight-navy">My profile</h1>
        <p className="mt-1 text-sm text-slate">Manage your name and password.</p>
      </div>

      {/* Profile info */}
      <div className="mb-4 rounded-lg border border-border-grey bg-cloud-white p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f4f5] text-scientific-teal">
            <User size={20} aria-hidden="true" />
          </div>
          <div>
            {nameEdit ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="rounded border border-scientific-teal bg-cloud-white px-2 py-1 text-sm focus:outline-none"
                  aria-label="Edit display name"
                  autoFocus
                />
                <Button size="sm" variant="primary" loading={nameLoading} onClick={handleSaveName}>Save</Button>
                <Button size="sm" variant="secondary" onClick={() => { setNameEdit(false); setNameError(null) }}>Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-medium text-midnight-navy">{profile?.name}</p>
                {nameSaved && <Check size={14} className="text-success-green" aria-hidden="true" />}
                <button
                  type="button"
                  className="text-xs text-scientific-teal hover:underline"
                  onClick={() => { setNameEdit(true); setNameValue(profile?.name ?? '') }}
                >
                  Edit
                </button>
              </div>
            )}
            {nameError && <p className="mt-1 text-xs text-error-red">{nameError}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate">
          <Mail size={16} className="flex-shrink-0 text-slate" aria-hidden="true" />
          {profile?.email}
        </div>

        <div className="flex items-center gap-3">
          <Shield size={16} className="flex-shrink-0 text-slate" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate">Role:</span>
            <Badge variant={roleBadge(profile?.role ?? '')}>
              {(profile?.role ?? '').replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>

        <p className="text-xs text-slate">
          Account created {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
        </p>
      </div>

      {/* Change password */}
      <div className="rounded-lg border border-border-grey bg-cloud-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-heading text-sm font-semibold text-midnight-navy">Password</p>
          {pwSaved && (
            <span className="flex items-center gap-1 text-xs text-success-green">
              <Check size={12} aria-hidden="true" /> Password updated
            </span>
          )}
        </div>

        {pwEdit ? (
          <div className="space-y-3">
            {pwError && (
              <div role="alert" className="flex gap-2 rounded border border-error-red/30 bg-[#fde8e8] p-2.5 text-xs text-error-red">
                <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" aria-hidden="true" />{pwError}
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-medium text-graphite">New password</label>
              <input
                type="password"
                value={pwForm.next}
                onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                className={inputClass}
                placeholder="Minimum 8 characters"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-graphite">Confirm new password</label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="primary" loading={pwLoading} onClick={handleChangePassword}>Update password</Button>
              <Button size="sm" variant="secondary" onClick={() => { setPwEdit(false); setPwError(null) }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate">••••••••••</p>
            <button
              type="button"
              className="text-xs font-medium text-scientific-teal hover:underline"
              onClick={() => setPwEdit(true)}
            >
              Change password
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
