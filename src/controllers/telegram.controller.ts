import type { Context } from 'hono'
import { TelegramService } from '../services/telegram'
import type { CloudflareBindings } from '../types/bindings'

export class TelegramController {
  static async getUpdates(c: Context<{ Bindings: CloudflareBindings }>) {
    try {
      const botToken = c.env.TELEGRAM_BOT_TOKEN
      const telegram = new TelegramService(botToken)

      const offset = c.req.query('offset')
        ? parseInt(c.req.query('offset')!)
        : undefined
      const limit = c.req.query('limit')
        ? parseInt(c.req.query('limit')!)
        : 100
      const timeout = c.req.query('timeout')
        ? parseInt(c.req.query('timeout')!)
        : 0

      const updates = await telegram.getUpdates(offset, limit, timeout)

      return c.json({
        success: true,
        count: updates.length,
        updates: updates,
      })
    } catch (error) {
      console.error('Telegram error:', error)
      return c.json(
        {
          success: false,
          error: 'Failed to get updates',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      )
    }
  }

  static async getBotInfo(c: Context<{ Bindings: CloudflareBindings }>) {
    try {
      const botToken = c.env.TELEGRAM_BOT_TOKEN
      const telegram = new TelegramService(botToken)

      const botInfo = await telegram.getMe()

      return c.json({
        success: true,
        bot: botInfo,
      })
    } catch (error) {
      console.error('Telegram error:', error)
      return c.json(
        {
          success: false,
          error: 'Failed to get bot info',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      )
    }
  }

  static async sendMessage(c: Context<{ Bindings: CloudflareBindings }>) {
    try {
      const botToken = c.env.TELEGRAM_BOT_TOKEN
      const telegram = new TelegramService(botToken)

      const { chatId, text } = await c.req.json()

      if (!chatId || !text) {
        return c.json({ error: 'chatId and text are required' }, 400)
      }

      const result = await telegram.sendMessage(chatId, text)

      return c.json({
        success: true,
        message: result,
      })
    } catch (error) {
      console.error('Telegram error:', error)
      return c.json(
        {
          success: false,
          error: 'Failed to send message',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      )
    }
  }
}
