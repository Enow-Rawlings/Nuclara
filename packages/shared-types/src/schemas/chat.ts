import { z } from 'zod'

export const messageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  senderId: z.string().uuid().nullable(),
  senderType: z.enum(['customer', 'admin', 'system']),
  content: z.string().min(1).max(2000),
  isInternal: z.boolean().default(false), // admin-only notes
  createdAt: z.string().datetime(),
})

export type Message = z.infer<typeof messageSchema>

export const conversationSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid().nullable(),
  assignedAgentId: z.string().uuid().nullable(),
  status: z.enum(['open', 'pending', 'closed']),
  messages: z.array(messageSchema).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Conversation = z.infer<typeof conversationSchema>

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
