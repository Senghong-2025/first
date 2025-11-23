import { Hono } from 'hono'
import { TelegramController } from '../controllers/telegram.controller'
import type { EnvBindings } from '../types/bindings'

const telegramRouter = new Hono<{ Bindings: EnvBindings }>()

// Get bot updates
telegramRouter.get('/updates', (c) => TelegramController.getUpdates(c))

// Get bot information
telegramRouter.get('/me', (c) => TelegramController.getBotInfo(c))

// Send a message
telegramRouter.post('/send', (c) => TelegramController.sendMessage(c))

export default telegramRouter
