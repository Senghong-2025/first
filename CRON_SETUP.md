# Cron Job Setup Guide

## Problem: Cloudflare Workers Cron Triggers Require Paid Plan

Cloudflare Workers cron triggers (the `scheduled` export) only work on **paid plans** ($5/month minimum). The cron configuration shows in deployment but won't execute on the free tier.

## Solution: Use External Cron Service (Free)

Your worker now has a webhook endpoint that can be called by external cron services.

## Setup Instructions

### Option 1: Using cron-job.org (Recommended - Free & Easy)

1. **Go to https://cron-job.org and create a free account**

2. **Create a new cron job:**
   - Title: `Telegram Scheduled Message`
   - URL: `https://first.senghong-learning.workers.dev/api/cron-webhook`
   - Schedule: `* * * * *` (every minute) or your preferred schedule
   - Request Method: `POST`
   - Request Headers: Add `x-cron-token: your-secret-token-here`

3. **Set the secret token in Cloudflare:**
   ```bash
   wrangler secret put CRON_SECRET_TOKEN
   # Enter your secret token when prompted
   ```

4. **Enable the cron job** on cron-job.org

### Option 2: Using GitHub Actions (Free for public repos)

Create `.github/workflows/cron.yml`:

```yaml
name: Trigger Cron Job
on:
  schedule:
    - cron: '* * * * *'  # Every minute
  workflow_dispatch:  # Allow manual trigger

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Call webhook
        run: |
          curl -X POST https://first.senghong-learning.workers.dev/api/cron-webhook \
            -H "x-cron-token: ${{ secrets.CRON_SECRET_TOKEN }}"
```

Add `CRON_SECRET_TOKEN` to GitHub Secrets in your repo settings.

### Option 3: Using EasyCron (Free Tier Available)

1. Sign up at https://www.easycron.com
2. Create new cron job with:
   - URL: `https://first.senghong-learning.workers.dev/api/cron-webhook`
   - Cron Expression: `* * * * *`
   - Custom Header: `x-cron-token: your-secret-token-here`

## Testing

### Test locally:
```bash
curl http://localhost:8787/api/test-cron
```

### Test the webhook endpoint:
```bash
curl -X POST https://first.senghong-learning.workers.dev/api/cron-webhook \
  -H "x-cron-token: your-secret-token-here"
```

## Available Endpoints

- `GET /api/test-cron` - Manual test (no auth required)
- `POST /api/cron-webhook` - Webhook for external cron services (requires `x-cron-token` header)

## If You Upgrade to Paid Plan

If you later upgrade to a Cloudflare Workers paid plan, the native cron trigger in `wrangler.toml` will automatically work, and you can remove the external cron service.

## Security Note

The webhook is protected by the `x-cron-token` header. Make sure to:
1. Set a strong secret token
2. Keep it secret (use environment variables)
3. Never commit it to git
