import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus, ShieldOff, ShieldCheck, AlertTriangle } from 'lucide-react'
import { fetchAdminUsers, inviteAdminUser, updateAdminUser } from '@/services/adminUsers'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TableSkeleton } from '@/components/ui/Skeleton'

// ─── Role badge colour map ────────────────────────────────────────────────────

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

// ─── Invite form schema ───────────────────────────────────────────────────────

const inviteSchema = z.object({
  name: z.string().min(1, 'Required').max(200),
  email: z.string().email('Valid email required').max(320),
  role: z.enum(['catalogue_manager', 'order_manager', 'support_agent', 'seo_editor']),
})
type InviteForm = z.infer<typeof inviteSchema>

const ROLES = [
  { value: 'catalogue_manager', label: 'Catalogue Manager', desc: 'Create & edit products and categories' },
  { value: 'order_manager', label: 'Order Manager', desc: 'View and update orders and fulfilment' },
  { value: 'support_agent', label: 'Support Agent', desc: 'Manage support conversations' },
  { value: 'seo_editor', label: 'SEO / Content Editor', desc: 'Edit content and SEO metadata' },
]

const inputClass = 'rounded border border-border-grey bg-cloud-white px-3 py-2 text-sm text-graphite focus:border-scientific-teal focus:outline-none focus:ring-1 focus:ring-scientific-teal'

// ─── Component ────────────────────────────────────────────────────────────────

export default function UsersSettingsPage() {
  const queryClient = useQueryClient()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAdminUsers,
  })

  const inviteMutation = useMutation({
    mutationFn: inviteAdminUser,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setInviteOpen(false)
      setServerError(null)
      setSuccessMsg(`${user.name} (${user.email}) has been invited. They will receive a link to set their password.`)
      reset()
      setTimeout(() => setSuccessMsg(null), 6000)
    },
    onError: (err: unknown) => {
      setServerError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to send invitation.'
      )
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateAdminUser(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'support_agent' },
  })

  const onInvite = (values: InviteForm) => {
    setServerError(null)
    inviteMutation.mutate(values)
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-midnight-navy">Admin users</h1>
          <p className="mt-1 text-sm text-slate">
            Manage who has access to this dashboard and what they can do.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setInviteOpen(true)}>
          <UserPlus size={14} aria-hidden="true" />
          Invite user
        </Button>
      </div>

      {/* Success message */}
      {successMsg && (
        <div role="status" className="mb-4 flex gap-2 rounded border border-success-green/30 bg-[#e8f5f0] p-3 text-sm text-success-green">
          <ShieldCheck size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          {successMsg}
        </div>
      )}

      {/* Role reference */}
      <div className="mb-5 rounded-lg border border-border-grey bg-pale-ice p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate">Role permissions</p>
        <dl className="grid gap-1.5 sm:grid-cols-2">
          {ROLES.map((r) => (
            <div key={r.value} className="flex items-start gap-2">
              <Badge variant={roleBadge(r.value)}>{r.label}</Badge>
              <span className="text-xs text-slate">{r.desc}</span>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-slate">
          <strong>Owner</strong> — full access. Cannot be assigned via invitation; set directly in the database.
        </p>
      </div>

      {/* Users table */}
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-grey">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-grey bg-pale-ice text-left">
                <th className="px-4 py-3 font-semibold text-midnight-navy">User</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Role</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Status</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy">Joined</th>
                <th className="px-4 py-3 font-semibold text-midnight-navy sr-only">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-grey">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-pale-ice/40">
                  <td className="px-4 py-3">
                    <p className="font-medium text-midnight-navy">{user.name}</p>
                    <p className="text-xs text-slate">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={roleBadge(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {user.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="error">Revoked</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {user.role !== 'owner' && (
                      <button
                        type="button"
                        onClick={() => toggleActiveMutation.mutate({ id: user.id, isActive: !user.is_active })}
                        className={[
                          'flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors',
                          user.is_active
                            ? 'text-error-red hover:bg-[#fde8e8]'
                            : 'text-success-green hover:bg-[#e8f5f0]',
                        ].join(' ')}
                        aria-label={user.is_active ? `Revoke ${user.name}` : `Restore ${user.name}`}
                      >
                        {user.is_active ? (
                          <><ShieldOff size={12} aria-hidden="true" /> Revoke</>
                        ) : (
                          <><ShieldCheck size={12} aria-hidden="true" /> Restore</>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite modal */}
      {inviteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-dialog-title"
        >
          <div className="w-full max-w-md rounded-xl border border-border-grey bg-cloud-white p-6 shadow-modal">
            <h2 id="invite-dialog-title" className="mb-4 font-heading text-lg font-bold text-midnight-navy">
              Invite admin user
            </h2>

            {serverError && (
              <div role="alert" className="mb-4 flex gap-2 rounded border border-error-red/30 bg-[#fde8e8] p-3 text-sm text-error-red">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onInvite)} noValidate className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="inv-name" className="text-sm font-medium text-graphite">
                  Full name <span className="text-error-red">*</span>
                </label>
                <input id="inv-name" type="text" className={inputClass} {...register('name')} />
                {errors.name && <p className="text-xs text-error-red">{errors.name.message}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="inv-email" className="text-sm font-medium text-graphite">
                  Email address <span className="text-error-red">*</span>
                </label>
                <input id="inv-email" type="email" className={inputClass} {...register('email')} />
                {errors.email && <p className="text-xs text-error-red">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="inv-role" className="text-sm font-medium text-graphite">
                  Role <span className="text-error-red">*</span>
                </label>
                <select id="inv-role" className={inputClass} {...register('role')}>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                {errors.role && <p className="text-xs text-error-red">{errors.role.message}</p>}
              </div>

              <p className="text-xs text-slate">
                The user will receive an email to set their password. They can only access the admin dashboard — not the customer storefront.
              </p>

              <div className="flex gap-3 pt-1">
                <Button type="submit" variant="primary" loading={isSubmitting || inviteMutation.isPending}>
                  Send invitation
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setInviteOpen(false); setServerError(null); reset() }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
