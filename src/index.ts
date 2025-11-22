import { Hono } from 'hono'
import telegramRouter from './routes/telegram.routes'
import cloudinaryRouter from './routes/cloudinary.routes'
import githubRouter from './routes/github.routes'
import type { CloudflareBindings } from './types/bindings'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hono App</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 16px;
          padding: 48px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 600px;
          width: 100%;
        }
        h1 {
          color: #333;
          font-size: 2.5rem;
          margin-bottom: 16px;
          text-align: center;
        }
        p {
          color: #666;
          font-size: 1.125rem;
          line-height: 1.6;
          text-align: center;
          margin-bottom: 32px;
        }
        .links {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .link {
          display: inline-block;
          padding: 12px 24px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .link:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
        }
        .link.secondary {
          background: #764ba2;
        }
        .link.secondary:hover {
          box-shadow: 0 8px 16px rgba(118, 75, 162, 0.4);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to Hono</h1>
        <p>Your Cloudflare Workers application is running successfully!</p>
        <div class="links">
          <a href="/telegram" class="link">Telegram Routes</a>
          <a href="https://hono.dev" class="link secondary" target="_blank">Documentation</a>
        </div>
      </div>
    </body>
    </html>
  `)
})

// Mount routes
app.route('/telegram', telegramRouter)
app.route('/github', githubRouter)
app.route('/', cloudinaryRouter)

export default app
