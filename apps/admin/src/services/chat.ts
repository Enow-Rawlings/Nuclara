import { api } from '@/lib/api'
import type { ApiSuccess } from 'shared-types'

export interface ChatMessage {
  id: string
  content: string
  sender_type: 'customer' | 'admin' | 'system'
  is_internal: boolean
  is_flagged: boolean
  created_at: string
}

export interface ConversationSummary {
  id: string
  status: 'open' | 'pending' | 'closed'
  tags: string[]
  created_at: string
  updated_at: string
  customer: { id: string; name: string; email: string } | null
  messages: ChatMessage[]
}

export interface ConversationDetail extends ConversationSummary {
  assigned_agent: { id: string; name: string; email: string } | null
}

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const { data } = await api.get<ApiSuccess<ConversationSummary[]>>('/chat/admin/conversations')
  return data.data
}

export async function fetchConversation(id: string): Promise<ConversationDetail> {
  const { data } = await api.get<ApiSuccess<ConversationDetail>>(`/chat/admin/conversations/${id}`)
  return data.data
}

export async function sendAdminMessage(
  conversationId: string,
  content: string,
  isInternal = false
): Promise<ChatMessage> {
  const { data } = await api.post<ApiSuccess<ChatMessage>>(
    `/chat/admin/conversations/${conversationId}/messages`,
    { content, isInternal }
  )
  return data.data
}

export async function updateConversation(
  id: string,
  payload: { status?: string; assignedAgentId?: string | null; tags?: string[] }
): Promise<{ id: string; status: string; updated_at: string }> {
  const { data } = await api.patch<ApiSuccess<{ id: string; status: string; updated_at: string }>>(
    `/chat/admin/conversations/${id}`,
    payload
  )
  return data.data
}
