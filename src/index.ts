import { Hono } from 'hono'
import { cors } from 'hono/cors'
import telegramRouter from './routes/telegram.routes'
import cloudinaryRouter from './routes/cloudinary.routes'
import githubRouter from './routes/github.routes'
import type { EnvBindings } from './types/bindings'
import { swaggerUI } from '@hono/swagger-ui'
import homeHTML from './views/home.html'
import { apiKeyAuth } from './middleware/apiKey.middleware'

const app = new Hono<{ Bindings: EnvBindings }>()

// Enable CORS for all origins
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 600,
  credentials: true,
}))

// Apply API key middleware to all API routes
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

export default app
