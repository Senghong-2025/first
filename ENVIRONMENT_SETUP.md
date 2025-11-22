# Environment Setup Guide

## Environment Variables

This project uses the following environment variables:

### Cloudinary
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

### Telegram
- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token

## Local Development

For local development with Wrangler, the environment variables are stored in `.dev.vars`:

```bash
# .dev.vars (already configured with your values)
CLOUDINARY_CLOUD_NAME=deevrlkam
CLOUDINARY_API_KEY=122646178581684
CLOUDINARY_API_SECRET=RipBjiRWJaLSqmXbDuDyE0iFdxI
TELEGRAM_BOT_TOKEN=7536731278:AAFSlFQkEK7pB2pBlJzaVe2M07QMs4wgtxw
```

**Note:** The `.dev.vars` file is already in `.gitignore` and won't be committed to version control.

## Production Deployment

For production on Cloudflare Workers, set secrets using Wrangler CLI:

```bash
# Set Cloudinary credentials
wrangler secret put CLOUDINARY_CLOUD_NAME
wrangler secret put CLOUDINARY_API_KEY
wrangler secret put CLOUDINARY_API_SECRET

# Set Telegram bot token
wrangler secret put TELEGRAM_BOT_TOKEN
```

## Running the Project

### Development
```bash
npm run dev
```

The server will start at `http://localhost:8787`

### Deployment
```bash
npm run deploy
```

## Testing Endpoints

### Cloudinary Upload
```bash
curl -X POST http://localhost:8787/upload \
  -F "file=@/path/to/image.jpg"
```

### Telegram - Get Updates
```bash
curl http://localhost:8787/telegram/updates
```

### Telegram - Get Bot Info
```bash
curl http://localhost:8787/telegram/me
```

### Telegram - Send Message
```bash
curl -X POST http://localhost:8787/telegram/send \
  -H "Content-Type: application/json" \
  -d '{"chatId": 123456789, "text": "Hello!"}'
```

## File Reference

- Configuration: [.dev.vars](.dev.vars) (local development)
- Environment template: [.env.example](.env.example)
- Wrangler config: [wrangler.toml](wrangler.toml)
- Type definitions: [src/types/bindings.ts](src/types/bindings.ts)
