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

All API endpoints require authentication via API key. Provide the API key using one of these methods:
- `x-api-key` header
- `Authorization: Bearer <api_key>` header
- `api_key` query parameter

### GitHub Routes (`/api/github`)

#### Verify Access
```http
GET /api/github/verify
```
Verify GitHub token and repository access.

**Response:**
```json
{
  "authenticated": boolean,
  "user": "username",
  "repoAccess": boolean,
  "permissions": ["push", "pull", "admin"]
}
```

#### Upload Single Image
```http
POST /api/github/upload
Content-Type: multipart/form-data

file: File
path: "folder/filename.jpg" (optional - if omitted, auto-generates filename)
message: "Upload image" (optional, default: "Upload {filename}")
branch: "main" (optional, default: "main")
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "name": "filename.jpg",
    "path": "folder/filename.jpg",
    "url": "https://github.com/owner/repo/blob/main/...",
    "download_url": "https://raw.githubusercontent.com/...",
    "size": 1024,
    "sha": "abc123..."
  }
}
```

**Features:**
- Automatic filename generation with timestamp if path is a directory
- Automatic retry on 409 conflicts (up to 3 attempts)
- SHA conflict resolution

#### Upload Multiple Images
```http
POST /api/github/upload-multiple
Content-Type: multipart/form-data

files: [File, File, ...]
path: "folder/" (required)
message: "Upload images" (optional)
branch: "main" (optional)
```

**Response:** Array of upload responses (same as single upload)

**Features:**
- Sequential uploads to prevent race conditions
- Automatic filename generation for each file

#### Upload JSON
```http
POST /api/github/upload-json
Content-Type: application/json

{
  "data": { /* any JSON object */ },
  "path": "data/config" (optional extension added if needed),
  "message": "Upload JSON config" (optional),
  "branch": "main" (optional)
}
```

**Response:** Same as upload single image

#### Delete File
```http
DELETE /api/github/delete
Content-Type: application/json

{
  "path": "folder/filename.jpg" (required),
  "message": "Delete file" (optional),
  "branch": "main" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

#### List Files
```http
GET /api/github/list?path=folder/
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "file.jpg",
      "path": "folder/file.jpg",
      "type": "file",
      "size": 1024,
      "url": "https://github.com/...",
      "download_url": "https://raw.githubusercontent.com/..."
    }
  ]
}
```

### Cloudinary Routes (`/api`)

#### Upload Single Image
```http
POST /api/upload
Content-Type: multipart/form-data

file: File
```

**Supported formats:** JPEG, PNG, GIF, WebP

**Response:**
```json
{
  "secure_url": "https://res.cloudinary.com/...",
  "public_id": "hono-uploads/filename",
  "format": "jpg",
  "width": 1920,
  "height": 1080,
  "bytes": 102400
}
```

#### Upload Multiple Images
```http
POST /api/upload-multiple
Content-Type: multipart/form-data

files: [File, File, ...]
```

**Response:**
```json
{
  "successful": [
    {
      "fileName": "image1.jpg",
      "url": "https://res.cloudinary.com/...",
      "publicId": "hono-uploads/image1",
      "format": "jpg",
      "width": 1920,
      "height": 1080,
      "size": 102400
    }
  ],
  "failed": [
    {
      "fileName": "invalid.bmp",
      "error": "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed"
    }
  ],
  "totalUploaded": 1,
  "totalFailed": 1,
  "total": 2
}
```

### Telegram Routes (`/api/telegram`)

#### Get Bot Info
```http
GET /api/telegram/me
```

**Response:**
```json
{
  "success": true,
  "bot": {
    "id": 123456789,
    "is_bot": true,
    "first_name": "BotName",
    "username": "my_bot",
    "can_join_groups": true,
    "can_read_all_group_messages": false,
    "supports_inline_queries": false
  }
}
```

#### Get Updates
```http
GET /api/telegram/updates?offset=0&limit=100&timeout=0
```

**Query Parameters:**
- `offset` (optional): Identifier of the first update to be returned
- `limit` (optional, default: 100): Limits the number of updates (1-100)
- `timeout` (optional, default: 0): Long polling timeout in seconds (0-50)

**Response:**
```json
{
  "success": true,
  "count": 2,
  "updates": [
    {
      "update_id": 123456,
      "message": {
        "message_id": 1,
        "date": 1234567890,
        "chat": { "id": 987654 },
        "text": "Hello bot"
      }
    }
  ]
}
```

#### Send Message
```http
POST /api/telegram/send
Content-Type: application/json

{
  "chatId": 123456789,
  "text": "Your message"
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "message_id": 1,
    "date": 1234567890,
    "chat": { "id": 123456789 },
    "text": "Your message"
  }
}
```

## Core Functions

### GitHubService

**Methods:**

- `fileToBase64(file: File): Promise<string>` - Convert file to base64 encoding
- `jsonToBase64(data: any): string` - Convert JSON object to base64 encoding
- `generateFileName(originalName: string): string` - Generate unique filename with timestamp
- `fileExists(path: string): Promise<GitHubFileInfo | null>` - Check if file exists and get its SHA
- `uploadImage(file: File, path: string, message?: string, branch?: string, retries?: number): Promise<GitHubUploadResponse>` - Upload single image with retry logic
- `uploadMultipleImages(files: File[], basePath: string, message?: string, branch?: string): Promise<GitHubUploadResponse[]>` - Upload multiple images sequentially
- `uploadJson(data: any, path: string, message?: string, branch?: string, retries?: number): Promise<GitHubUploadResponse>` - Upload JSON data with retry logic
- `deleteFile(path: string, message?: string, branch?: string): Promise<void>` - Delete file from repository
- `verifyAccess(): Promise<VerificationResult>` - Verify token and repository access
- `listFiles(path?: string): Promise<GitHubFileInfo[]>` - List files in directory

### CloudinaryService

**Methods:**

- `uploadImage(file: File): Promise<any>` - Upload single image to Cloudinary
  - Validates file type (JPEG, PNG, GIF, WebP)
  - Returns upload result with URL and metadata
- `uploadMultipleImages(files: File[]): Promise<UploadResult>` - Upload multiple images
  - Returns successful uploads and failed uploads separately
  - Continues on validation errors without throwing

### TelegramService

**Methods:**

- `getUpdates(offset?: number, limit?: number, timeout?: number): Promise<TelegramUpdate[]>` - Retrieve bot updates using long polling
- `sendMessage(chatId: number, text: string): Promise<any>` - Send text message to chat
- `getMe(): Promise<any>` - Get bot information and permissions

### Middleware

**apiKeyAuth middleware** - Validates API key from:
- `x-api-key` header (recommended)
- `Authorization: Bearer <key>` header
- `api_key` query parameter

Returns 401 Unauthorized if key is invalid or missing.

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
