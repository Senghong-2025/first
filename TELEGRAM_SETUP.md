# Telegram Bot Integration

This project includes Telegram Bot API integration for receiving updates and sending messages.

## File Structure

```
src/
├── index.ts                 # Main application with Telegram routes
├── types/
│   └── telegram.ts         # TypeScript types for Telegram API
└── services/
    └── telegram.ts         # Telegram service class
```

## Configuration

### Setting Bot Token for Development

For local development with Wrangler:

```bash
# Create a .dev.vars file
echo "TELEGRAM_BOT_TOKEN=7536731278:AAFSlFQkEK7pB2pBlJzaVe2M07QMs4wgtxw" > .dev.vars
```

### Setting Bot Token for Production

For production deployment:

```bash
wrangler secret put TELEGRAM_BOT_TOKEN
# When prompted, enter: 7536731278:AAFSlFQkEK7pB2pBlJzaVe2M07QMs4wgtxw
```

## API Endpoints

### GET `/telegram/updates`

Get updates from the Telegram Bot API.

**Query Parameters:**
- `offset` (optional): Identifier of the first update to be returned
- `limit` (optional): Limits the number of updates (1-100, default: 100)
- `timeout` (optional): Timeout in seconds for long polling (0-50, default: 0)

**Example:**
```bash
curl http://localhost:8787/telegram/updates
curl http://localhost:8787/telegram/updates?offset=123&limit=10
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "updates": [
    {
      "update_id": 123456789,
      "message": {
        "message_id": 1,
        "from": {
          "id": 123456789,
          "is_bot": false,
          "first_name": "John",
          "username": "johndoe"
        },
        "chat": {
          "id": 123456789,
          "type": "private",
          "first_name": "John"
        },
        "date": 1234567890,
        "text": "Hello bot!"
      }
    }
  ]
}
```

### GET `/telegram/me`

Get information about the bot.

**Example:**
```bash
curl http://localhost:8787/telegram/me
```

**Response:**
```json
{
  "success": true,
  "bot": {
    "id": 7536731278,
    "is_bot": true,
    "first_name": "Your Bot Name",
    "username": "your_bot_username"
  }
}
```

### POST `/telegram/send`

Send a message to a chat.

**Body:**
```json
{
  "chatId": 123456789,
  "text": "Hello from the bot!"
}
```

**Example:**
```bash
curl -X POST http://localhost:8787/telegram/send \
  -H "Content-Type: application/json" \
  -d '{"chatId": 123456789, "text": "Hello from the bot!"}'
```

**Response:**
```json
{
  "success": true,
  "message": {
    "message_id": 2,
    "from": {
      "id": 7536731278,
      "is_bot": true,
      "first_name": "Your Bot Name"
    },
    "chat": {
      "id": 123456789,
      "type": "private"
    },
    "date": 1234567890,
    "text": "Hello from the bot!"
  }
}
```

## TelegramService Methods

The `TelegramService` class provides the following methods:

### `getUpdates(offset?, limit?, timeout?)`

Fetches updates from the Telegram API.

### `sendMessage(chatId, text)`

Sends a text message to a specific chat.

### `getMe()`

Gets information about the bot.

## Development

Run the development server:

```bash
npm run dev
```

## Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

## Testing the Bot

1. Start a chat with your bot on Telegram
2. Send a message to the bot
3. Call the `/telegram/updates` endpoint to see the message
4. Use the `/telegram/send` endpoint to reply

## Direct API Testing

You can also test the Telegram API directly:

```bash
# Get updates
curl https://api.telegram.org/bot7536731278:AAFSlFQkEK7pB2pBlJzaVe2M07QMs4wgtxw/getUpdates

# Get bot info
curl https://api.telegram.org/bot7536731278:AAFSlFQkEK7pB2pBlJzaVe2M07QMs4wgtxw/getMe
```
