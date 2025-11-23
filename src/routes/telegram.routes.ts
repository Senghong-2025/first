import { Hono } from 'hono'
import { TelegramController } from '../controllers/telegram.controller'
import type { EnvBindings } from '../types/bindings'

const telegramRouter = new Hono<{ Bindings: EnvBindings }>()

// Get bot updates
telegramRouter.get('/updates', TelegramController.getUpdates)

// Get bot information
telegramRouter.get('/me', TelegramController.getBotInfo)

// Send a message
telegramRouter.post('/send', TelegramController.sendMessage)

export default telegramRouter
