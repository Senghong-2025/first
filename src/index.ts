import { Hono } from 'hono'
import { cors } from 'hono/cors'
import telegramRouter from './routes/telegram.routes'
import cloudinaryRouter from './routes/cloudinary.routes'
import githubRouter from './routes/github.routes'
import type { EnvBindings } from './types/bindings'
import { swaggerUI } from '@hono/swagger-ui'
import homeHTML from './views/home.html'
import { apiKeyAuth } from './middleware/apiKey.middleware'
import { TelegramService } from './services/telegram'

const app = new Hono<{ Bindings: EnvBindings }>()

// Enable CORS for all origins
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-cron-token'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 600,
  credentials: true,
}))

// Webhook endpoint for external cron services (defined BEFORE API key middleware)
app.post('/api/cron-webhook', async (c) => {
  console.log("External cron webhook triggered...")

  // Security: Check cron token
  const authToken = c.req.header('x-cron-token')
  const expectedToken = c.env.CRON_SECRET_TOKEN || 'your-secret-token-here'

  if (authToken !== expectedToken) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const result = await handleScheduled(c.env)
    return c.json({
      success: true,
      message: "Scheduled task executed successfully",
      result
    })
  } catch (error) {
    console.error("Failed to execute scheduled task:", error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Apply API key middleware to all API routes (except cron-webhook above)
app.use('/api/*', apiKeyAuth)

// Mount routes BEFORE OpenAPI spec generation
app.route('/api/telegram', telegramRouter)
app.route('/api/github', githubRouter)
app.route('/api', cloudinaryRouter)

// OpenAPI spec endpoint - dynamically sets server URL
app.get('/openapi.json', async (c) => {
  const url = new URL(c.req.url)
  const serverUrl = `${url.protocol}//${url.host}`

  const { generateSpecs } = await import('hono-openapi')
  const specs = await generateSpecs(app, {
    documentation: {
      info: {
        title: 'My API',
        version: '1.0.0',
        description: 'API documentation',
      },
      servers: [
        { url: serverUrl, description: 'Current server' },
        // { url: 'http://localhost:8787', description: 'Local development' },
      ],
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
            description: 'API key for authentication'
          }
        }
      },
      security: [
        {
          ApiKeyAuth: []
        }
      ]
    },
    excludeStaticFile: false,
    includeEmptyPaths: true,
  })

  return c.json(specs)
})

app.get('/swagger', swaggerUI({ url: '/openapi.json' }))

app.get('/', (c) => {
  return c.html(homeHTML)
})

// Manual trigger for testing cron locally
app.get('/api/test-cron', async (c) => {
  console.log("Manual cron test triggered...")

  try {
    const telegram = new TelegramService(c.env.TELEGRAM_BOT_TOKEN)
    const result = await telegram.sendMessage(
      -5093485835,
      'Test message from manual cron trigger.'
    )

    return c.json({
      success: true,
      message: "Cron test executed successfully",
      result
    })
  } catch (error) {
    console.error("Failed to send test message:", error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Scheduled event handler function
async function handleScheduled(env: EnvBindings) {
  console.log("Cron job triggered - sending scheduled message...")

  try {
    const telegram = new TelegramService(env.TELEGRAM_BOT_TOKEN)
    const result = await telegram.sendMessage(
      -5093485835,
      'Scheduled message from cron job every minute.'
    )

    console.log("Message sent successfully:", JSON.stringify(result))
    return result
  } catch (error) {
    console.error("Failed to send scheduled message:", error instanceof Error ? error.message : error)
    throw error
  }
}

export default {
  fetch: app.fetch,
  async scheduled(event: any, env: EnvBindings, ctx: any) {
    // ctx.waitUntil(handleScheduled(env))
  }
}
