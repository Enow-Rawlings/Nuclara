import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireAdminAuth } from '../../middleware/auth.js'
import { chatLimiter } from '../../middleware/rateLimiter.js'
import { validateBody } from '../../middleware/validate.js'
import { ok } from '../../utils/response.js'
import { supabase } from '../../lib/supabase.js'
import { ApiError } from '../../utils/ApiError.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { sendEmail } from '../../lib/resend.js'
import { chatReplyEmail } from '../../lib/emails/index.js'
import { env } from '../../config/env.js'

export const chatRouter = Router()

/** POST /api/v1/chat/conversations — start a new conversation */
chatRouter.post(
  '/conversations',
  chatLimiter,
  requireAuth,
  validateBody(
    z.object({
      initialMessage: z.string().min(1).max(2000),
    })
  ),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const { initialMessage } = req.body as { initialMessage: string }

      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          customer_id: authReq.userId,
          status: 'open',
        })
        .select('id, status, created_at')
        .single()

      if (convError || !conversation) throw new ApiError(500, 'Failed to start conversation')

      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: authReq.userId,
        sender_type: 'customer',
        content: initialMessage,
      })

      ok(res, conversation, 201)
    } catch (err) {
      next(err)
    }
  }
)

/** POST /api/v1/chat/conversations/:id/messages — send a message */
chatRouter.post(
  '/conversations/:id/messages',
  chatLimiter,
  requireAuth,
  validateBody(z.object({ content: z.string().min(1).max(2000) })),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const { id } = req.params
      const { content } = req.body as { content: string }

      // Verify customer owns this conversation
      const { data: conv } = await supabase
        .from('conversations')
        .select('id, status')
        .eq('id', id)
        .eq('customer_id', authReq.userId)
        .single()

      if (!conv) throw new ApiError(404, 'Conversation not found')
      if (conv.status === 'closed') throw new ApiError(400, 'Conversation is closed')

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: id,
          sender_id: authReq.userId,
          sender_type: 'customer',
          content,
        })
        .select('id, content, created_at')
        .single()

      if (error || !message) throw new ApiError(500, 'Failed to send message')
      ok(res, message, 201)
    } catch (err) {
      next(err)
    }
  }
)

/** GET /api/v1/chat/admin/conversations — admin inbox */
chatRouter.get(
  '/admin/conversations',
  requireAuth,
  requireAdminAuth,
  async (_req, res, next) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(
          `id, status, created_at, updated_at,
           customer:customers (name, email),
           messages (content, created_at, sender_type)`
        )
        .order('updated_at', { ascending: false })
        .limit(100)

      if (error) throw new ApiError(500, 'Failed to fetch conversations')
      ok(res, data ?? [])
    } catch (err) {
      next(err)
    }
  }
)

/** GET /api/v1/chat/conversations/my — customer's own conversations */
chatRouter.get(
  '/conversations/my',
  requireAuth,
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest

      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', authReq.userId)
        .single()

      if (!customer) throw new ApiError(404, 'Customer not found')

      const { data, error } = await supabase
        .from('conversations')
        .select(`id, status, created_at, updated_at,
           messages (id, content, sender_type, is_internal, created_at)`)
        .eq('customer_id', customer.id)
        .order('updated_at', { ascending: false })

      if (error) throw new ApiError(500, 'Failed to fetch conversations')
      ok(res, data ?? [])
    } catch (err) {
      next(err)
    }
  }
)

/** GET /api/v1/chat/admin/conversations/:id — full conversation detail */
chatRouter.get(
  '/admin/conversations/:id',
  requireAuth,
  requireAdminAuth,
  async (req, res, next) => {
    try {
      const { id } = req.params

      const { data, error } = await supabase
        .from('conversations')
        .select(
          `id, status, tags, created_at, updated_at,
           customer:customers (id, name, email),
           assigned_agent:admin_users!conversations_assigned_agent_id_fkey (id, name, email),
           messages (id, content, sender_id, sender_type, is_internal, is_flagged, created_at)`
        )
        .eq('id', id)
        .single()

      if (error || !data) throw new ApiError(404, 'Conversation not found')

      // Filter out internal notes — these are only for admins
      // (already returned in full since this is an admin endpoint)
      ok(res, data)
    } catch (err) {
      next(err)
    }
  }
)

/** POST /api/v1/chat/admin/conversations/:id/messages — admin reply */
chatRouter.post(
  '/admin/conversations/:id/messages',
  chatLimiter,
  requireAuth,
  requireAdminAuth,
  validateBody(
    z.object({
      content: z.string().min(1).max(2000),
      isInternal: z.boolean().default(false),
    })
  ),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest
      const { id } = req.params
      const { content, isInternal } = req.body as { content: string; isInternal: boolean }

      const { data: conv } = await supabase
        .from('conversations')
        .select('id, status')
        .eq('id', id)
        .single()

      if (!conv) throw new ApiError(404, 'Conversation not found')
      if (conv.status === 'closed') throw new ApiError(400, 'Conversation is closed')

      // Get admin user id
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_user_id', authReq.userId)
        .single()

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: id,
          sender_id: adminUser?.id ?? authReq.userId,
          sender_type: 'admin',
          content,
          is_internal: isInternal,
        })
        .select('id, content, sender_type, is_internal, created_at')
        .single()

      if (error || !message) throw new ApiError(500, 'Failed to send message')

      // Send email to customer/guest for non-internal replies only
      if (!isInternal) {
        const { data: convDetail } = await supabase
          .from('conversations')
          .select(`id, customer:customers (name, email), messages (content, sender_type, is_internal)`)
          .eq('id', id)
          .single()

        let recipientName = 'there'
        let recipientEmail: string | null = null

        if (convDetail?.customer) {
          // Supabase returns a joined row — cast via unknown to handle array-or-object ambiguity
          const customer = (convDetail.customer as unknown) as { name: string | null; email: string }
          recipientName = customer.name ?? 'there'
          recipientEmail = customer.email
        } else {
          // Guest — extract from system message "Guest enquiry from Name <email>"
          const systemMsg = (convDetail?.messages as Array<{ content: string; sender_type: string; is_internal: boolean }> ?? [])
            .find((m) => m.sender_type === 'system' && m.is_internal)
          if (systemMsg) {
            const match = systemMsg.content.match(/^Guest enquiry from (.+) <(.+)>$/)
            if (match) { recipientName = match[1]; recipientEmail = match[2] }
          }
        }

        if (recipientEmail) {
          await sendEmail({
            to: recipientEmail,
            subject: 'Reply from Nuclara support',
            html: chatReplyEmail({ guestName: recipientName, guestEmail: recipientEmail, replyContent: content, supportEmail: env.EMAIL_SUPPORT }),
            replyTo: env.EMAIL_SUPPORT,
          })
        }
      }

      ok(res, message, 201)
    } catch (err) {
      next(err)
    }
  }
)

/** PATCH /api/v1/chat/admin/conversations/:id — update status, assignment, tags */
chatRouter.patch(
  '/admin/conversations/:id',
  requireAuth,
  requireAdminAuth,
  validateBody(
    z.object({
      status: z.enum(['open', 'pending', 'closed']).optional(),
      assignedAgentId: z.string().uuid().nullable().optional(),
      tags: z.array(z.string().max(50)).max(10).optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const { id } = req.params
      const body = req.body as {
        status?: string
        assignedAgentId?: string | null
        tags?: string[]
      }

      const updates: Record<string, unknown> = {}
      if (body.status !== undefined) updates.status = body.status
      if (body.assignedAgentId !== undefined) updates.assigned_agent_id = body.assignedAgentId
      if (body.tags !== undefined) updates.tags = body.tags

      if (Object.keys(updates).length === 0) throw new ApiError(400, 'No fields to update')

      const { data, error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', id)
        .select('id, status, assigned_agent_id, tags, updated_at')
        .single()

      if (error || !data) throw new ApiError(404, 'Conversation not found')
      ok(res, data)
    } catch (err) {
      next(err)
    }
  }
)

/** POST /api/v1/chat/conversations/guest — start conversation without auth (contact form fallback) */
chatRouter.post(
  '/conversations/guest',
  chatLimiter,
  validateBody(
    z.object({
      name: z.string().min(1).max(200),
      email: z.string().email().max(320),
      message: z.string().min(1).max(2000),
    })
  ),
  async (req, res, next) => {
    try {
      const { name, email, message } = req.body as { name: string; email: string; message: string }

      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          status: 'open',
          tags: ['guest'],
        })
        .select('id, status, created_at')
        .single()

      if (convError || !conversation) throw new ApiError(500, 'Failed to start conversation')

      // Store guest context as the first system message
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_type: 'system',
        content: `Guest enquiry from ${name} <${email}>`,
        is_internal: true,
      })

      // Store the actual message
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_type: 'customer',
        content: message,
      })

      ok(res, {
        id: conversation.id,
        message: 'Your message has been received. We will reply to your email shortly.',
      }, 201)
    } catch (err) {
      next(err)
    }
  }
)
