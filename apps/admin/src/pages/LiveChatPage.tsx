import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Send, Lock, Unlock, RefreshCw, Tag, User } from 'lucide-react'
import {
  fetchConversations,
  fetchConversation,
  sendAdminMessage,
  updateConversation,
  type ConversationSummary,
} from '@/services/chat'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

// ─── Status badge ─────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  const map: Record<string, 'success' | 'warning' | 'default'> = {
    open: 'success',
    pending: 'warning',
    closed: 'default',
  }
  return map[status] ?? 'default'
}

// ─── Conversation list item ───────────────────────────────────────────────────

function ConversationItem({
  conv,
  isActive,
  onClick,
}: {
  conv: ConversationSummary
  isActive: boolean
  onClick: () => void
}) {
  const lastMsg = [...(conv.messages ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0]

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full text-left px-4 py-3 border-b border-border-grey transition-colors hover:bg-pale-ice',
        isActive ? 'bg-pale-ice border-l-2 border-l-scientific-teal' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-midnight-navy">
            {conv.customer?.name ?? 'Guest'}
          </p>
          <p className="truncate text-xs text-slate">{conv.customer?.email ?? ''}</p>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <Badge variant={statusBadge(conv.status)}>{conv.status}</Badge>
          <span className="text-[10px] text-slate">
            {new Date(conv.updated_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      {lastMsg && !lastMsg.is_internal && (
        <p className="mt-1 truncate text-xs text-slate">{lastMsg.content}</p>
      )}
    </button>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: { content: string; sender_type: string; is_internal: boolean; created_at: string } }) {
  const isAdmin = msg.sender_type === 'admin'
  const isSystem = msg.sender_type === 'system'

  if (isSystem && !msg.is_internal) return null

  if (isSystem) {
    return (
      <div className="my-2 flex justify-center">
        <span className="rounded-full bg-pale-ice px-3 py-1 text-xs text-slate">{msg.content}</span>
      </div>
    )
  }

  return (
    <div className={['flex mb-3', isAdmin ? 'justify-end' : 'justify-start'].join(' ')}>
      <div
        className={[
          'max-w-[75%] rounded-lg px-3 py-2 text-sm',
          msg.is_internal
            ? 'border border-dashed border-warning-amber bg-[#fef9ec] text-graphite italic'
            : isAdmin
            ? 'bg-midnight-navy text-pale-ice'
            : 'border border-border-grey bg-cloud-white text-graphite',
        ].join(' ')}
      >
        {msg.is_internal && (
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-warning-amber">
            Internal note
          </span>
        )}
        <p className="leading-relaxed">{msg.content}</p>
        <p className={['mt-1 text-[10px]', isAdmin && !msg.is_internal ? 'text-pale-ice/60' : 'text-slate'].join(' ')}>
          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LiveChatPage() {
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'pending' | 'closed'>('open')

  // Conversation list — poll every 15s
  const { data: conversations = [], isLoading: listLoading } = useQuery({
    queryKey: ['admin-conversations'],
    queryFn: fetchConversations,
    refetchInterval: 15_000,
  })

  // Active conversation — poll every 5s while open
  const { data: active, isLoading: activeLoading } = useQuery({
    queryKey: ['admin-conversation', activeId],
    queryFn: () => fetchConversation(activeId!),
    enabled: Boolean(activeId),
    refetchInterval: 5_000,
  })

  const sendMutation = useMutation({
    mutationFn: () => sendAdminMessage(activeId!, replyText.trim(), isInternal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-conversation', activeId] })
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] })
      setReplyText('')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateConversation>[1]) =>
      updateConversation(activeId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-conversation', activeId] })
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] })
    },
  })

  const filteredConvs = statusFilter === 'all'
    ? conversations
    : conversations.filter((c) => c.status === statusFilter)

  const handleSend = () => {
    if (!replyText.trim() || !activeId) return
    sendMutation.mutate()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend()
  }

  return (
    <div className="flex h-[calc(100vh-56px-48px)] overflow-hidden rounded-lg border border-border-grey">

      {/* ── Conversation list ─────────────────────────────────────────────── */}
      <aside className="flex w-72 flex-shrink-0 flex-col border-r border-border-grey">
        <div className="border-b border-border-grey px-4 py-3">
          <h1 className="font-heading text-base font-bold text-midnight-navy">Live chat</h1>
          <div className="mt-2 flex gap-1">
            {(['open', 'pending', 'closed', 'all'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={[
                  'rounded px-2 py-0.5 text-xs font-medium transition-colors capitalize',
                  statusFilter === s
                    ? 'bg-midnight-navy text-white'
                    : 'text-slate hover:bg-pale-ice',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {listLoading ? (
            <div className="space-y-0 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="mb-2 h-16 w-full" />
              ))}
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center px-4">
              <MessageSquare size={28} className="text-border-grey" aria-hidden="true" />
              <p className="text-sm text-slate">No {statusFilter !== 'all' ? statusFilter : ''} conversations.</p>
            </div>
          ) : (
            filteredConvs.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeId}
                onClick={() => setActiveId(conv.id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── Conversation thread ───────────────────────────────────────────── */}
      {!activeId ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <MessageSquare size={36} className="text-border-grey" aria-hidden="true" />
          <p className="text-slate">Select a conversation to view the thread.</p>
        </div>
      ) : activeLoading ? (
        <div className="flex flex-1 flex-col gap-3 p-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-full w-full" />
        </div>
      ) : active ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Thread header */}
          <div className="flex items-center justify-between gap-3 border-b border-border-grey px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pale-ice text-slate">
                <User size={14} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-midnight-navy">
                  {active.customer?.name ?? 'Guest'}
                </p>
                <p className="text-xs text-slate">{active.customer?.email ?? ''}</p>
              </div>
              <Badge variant={statusBadge(active.status)} className="ml-2">
                {active.status}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-conversation', activeId] })}
                aria-label="Refresh"
                className="rounded p-1.5 text-slate hover:bg-pale-ice"
              >
                <RefreshCw size={14} aria-hidden="true" />
              </button>
              {active.status !== 'closed' ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => updateMutation.mutate({ status: 'closed' })}
                  loading={updateMutation.isPending}
                >
                  <Lock size={12} aria-hidden="true" />
                  Close
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => updateMutation.mutate({ status: 'open' })}
                  loading={updateMutation.isPending}
                >
                  <Unlock size={12} aria-hidden="true" />
                  Reopen
                </Button>
              )}
            </div>
          </div>

          {/* Tags */}
          {active.tags?.length > 0 && (
            <div className="flex items-center gap-1.5 border-b border-border-grey px-5 py-2">
              <Tag size={12} className="text-slate" aria-hidden="true" />
              {active.tags.map((tag) => (
                <span key={tag} className="rounded bg-pale-ice px-2 py-0.5 text-xs text-slate">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {[...active.messages]
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
          </div>

          {/* Reply box */}
          {active.status !== 'closed' ? (
            <div className="border-t border-border-grey p-4">
              {/* Internal note toggle */}
              <div className="mb-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsInternal((v) => !v)}
                  className={[
                    'flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors',
                    isInternal
                      ? 'bg-[#fef9ec] text-warning-amber'
                      : 'text-slate hover:bg-pale-ice',
                  ].join(' ')}
                >
                  <Lock size={11} aria-hidden="true" />
                  {isInternal ? 'Internal note (not sent to customer)' : 'Reply to customer'}
                </button>
              </div>

              <div className="flex gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isInternal ? 'Add an internal note…' : 'Type a reply… (Ctrl+Enter to send)'}
                  rows={3}
                  className={[
                    'flex-1 resize-none rounded border px-3 py-2 text-sm text-graphite focus:outline-none focus:ring-1',
                    isInternal
                      ? 'border-warning-amber/50 bg-[#fef9ec] focus:ring-warning-amber'
                      : 'border-border-grey bg-cloud-white focus:border-scientific-teal focus:ring-scientific-teal',
                  ].join(' ')}
                  aria-label={isInternal ? 'Internal note' : 'Reply to customer'}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSend}
                  disabled={!replyText.trim()}
                  loading={sendMutation.isPending}
                  className="self-end"
                >
                  <Send size={14} aria-hidden="true" />
                  {isInternal ? 'Note' : 'Send'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-t border-border-grey bg-pale-ice px-5 py-3 text-center text-sm text-slate">
              This conversation is closed.{' '}
              <button
                type="button"
                onClick={() => updateMutation.mutate({ status: 'open' })}
                className="font-medium text-scientific-teal hover:underline"
              >
                Reopen
              </button>{' '}
              to reply.
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
