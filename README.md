# Hono Cloudflare Workers API

A modern, lightweight API built with Hono framework for Cloudflare Workers. This project provides image upload services integrated with GitHub and Cloudinary, along with Telegram bot functionality.

## Features

- **GitHub Integration**: Upload, manage, and delete files in GitHub repositories
- **Cloudinary Integration**: Upload images to Cloudinary with automatic optimization
- **Telegram Bot**: Send messages and interact with Telegram API
- **Cloudflare Workers**: Fast, globally distributed edge computing
- **TypeScript**: Full type safety with TypeScript

## Tech Stack

- [Hono](https://hono.dev/) - Ultrafast web framework for Cloudflare Workers
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless execution environment
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) - CLI for Cloudflare Workers
- TypeScript - Type-safe development
- GitHub API - File storage and management
- Cloudinary API - Image upload and optimization

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Cloudflare account
- GitHub Personal Access Token (for GitHub integration)
- Cloudinary account (for image uploads)
- Telegram Bot Token (for Telegram integration)

## Installation

```bash
npm install
```

## Development

Start the local development server:

```bash
npm run dev
```

The server will start at `http://localhost:8787`

## Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

## Type Generation

Generate TypeScript types based on your Worker configuration:

```bash
npm run cf-typegen
```

## API Endpoints

### GitHub Routes (`/github`)

#### Verify Access
```http
GET /github/verify
```
Verify GitHub token and repository access.

#### Upload Single Image
```http
POST /github/upload
Content-Type: multipart/form-data

{
  "file": File,
  "path": "folder/filename.jpg",
  "message": "Upload image" (optional),
  "branch": "main" (optional)
}
```

#### Upload Multiple Images
```http
POST /github/upload-multiple
Content-Type: multipart/form-data

{
  "files": [File, File, ...],
  "path": "folder/",
  "message": "Upload images" (optional),
  "branch": "main" (optional)
}
```

**Features:**
- Automatic retry on 409 conflicts (up to 3 attempts)
- Sequential uploads to prevent race conditions
- SHA conflict resolution

#### Delete File
```http
DELETE /github/delete
Content-Type: application/json

{
  "path": "folder/filename.jpg",
  "message": "Delete file" (optional),
  "branch": "main" (optional)
}
```

#### List Files
```http
GET /github/list?path=folder/
```

### Cloudinary Routes

#### Upload Single Image
```http
POST /upload
Content-Type: multipart/form-data

{
  "file": File
}
```

#### Upload Multiple Images
```http
POST /upload-multiple
Content-Type: multipart/form-data

{
  "files": [File, File, ...]
}
```

### Telegram Routes (`/telegram`)

#### Get Bot Info
```http
GET /telegram/me
```

#### Get Updates
```http
GET /telegram/updates
```

#### Send Message
```http
POST /telegram/send
Content-Type: application/json

{
  "chat_id": "123456789",
  "text": "Your message"
}
```

## Configuration

### Environment Variables

Configure your environment variables in the Cloudflare Workers dashboard or `wrangler.toml`:

- `GITHUB_TOKEN` - GitHub Personal Access Token
- `GITHUB_OWNER` - GitHub repository owner
- `GITHUB_REPO` - GitHub repository name
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `TELEGRAM_BOT_TOKEN` - Telegram bot token

### TypeScript Bindings

Pass the `CloudflareBindings` as generics when instantiating Hono:

```ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

## Project Structure

```
.
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── github.controller.ts
│   │   ├── cloudinary.controller.ts
│   │   └── telegram.controller.ts
│   ├── services/          # Business logic
│   │   ├── github.service.ts
│   │   ├── cloudinary.service.ts
│   │   └── telegram.service.ts
│   ├── routes/            # Route definitions
│   │   ├── github.routes.ts
│   │   ├── cloudinary.routes.ts
│   │   └── telegram.routes.ts
│   ├── types/             # TypeScript type definitions
│   │   ├── bindings.ts
│   │   └── github.ts
│   └── index.ts           # Application entry point
├── package.json
├── wrangler.toml          # Cloudflare Workers configuration
└── tsconfig.json          # TypeScript configuration
```

## Error Handling

The API includes comprehensive error handling with retry logic for common issues:

- **409 Conflicts**: Automatic retry with fresh SHA for GitHub uploads
- **Rate Limiting**: Exponential backoff on retries
- **Network Errors**: Graceful error responses with detailed messages

## Recent Updates

- Added automatic retry logic for GitHub 409 conflicts
- Implemented sequential uploads to prevent race conditions
- Enhanced error messages with detailed debugging information
- Fixed SHA mismatch issues when uploading same file multiple times

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

For issues and questions, please open an issue in the GitHub repository.
