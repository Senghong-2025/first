import type { Context } from 'hono'
import { GitHubService } from '../services/github.service'
import type { CloudflareBindings } from '../types/bindings'

export class GitHubController {
  /**
   * Verify GitHub token and repository access
   * GET /github/verify
   */
  static async verifyAccess(c: Context<{ Bindings: CloudflareBindings }>) {
    try {
      const token = "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";
      const owner = 'senghong02'
      const repo = 'Storage'

      if (!token) {
        return c.json({ error: 'GitHub token not configured' }, 500)
      }

      const githubService = new GitHubService(token, owner, repo)
      const verification = await githubService.verifyAccess()

      return c.json(verification, verification.authenticated ? 200 : 401)
    } catch (error) {
      console.error('GitHub verification error:', error)
      return c.json(
        {
          error: 'Verification failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      )
    }
  }

  /**
   * Upload a single image to GitHub repository
   * POST /github/upload
   * Body: multipart/form-data with 'file', 'path', 'message' (optional), 'branch' (optional)
   */
  static async uploadImage(c: Context<{ Bindings: CloudflareBindings }>) {
    try {
      // Get environment variables
      const token = "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";
      const owner = 'senghong02'
      const repo ='Storage'

      if (!token) {
        return c.json({ error: 'GitHub token not configured' }, 500)
      }

      const githubService = new GitHubService(token, owner, repo)

      // Get form data
      const formData = await c.req.formData()
      const file = formData.get('file') as unknown as File
      const path = formData.get('path') as string
      const message = formData.get('message') as string | null
      const branch = formData.get('branch') as string | null

      console.log('Upload request - File:', file?.name, 'Path:', path, 'Branch:', branch || 'main')

      if (!file) {
        return c.json({ error: 'No file provided' }, 400)
      }

      if (!path) {
        return c.json({ error: 'Path is required' }, 400)
      }

      const result = await githubService.uploadImage(
        file,
        path,
        message || undefined,
        branch || 'main'
      )

      return c.json(
        {
          success: true,
          message: 'File uploaded successfully',
          data: {
            name: result.content.name,
            path: result.content.path,
            url: result.content.html_url,
            download_url: result.content.download_url,
            size: result.content.size,
            sha: result.content.sha,
          },
        },
        200
      )
    } catch (error) {
      console.error('GitHub upload error:', error)
      return c.json(
        {
          error: 'Upload failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      )
    }
  }

  /**
   * Upload multiple images to GitHub repository
   * POST /github/upload-multiple
   * Body: multipart/form-data with multiple 'files', 'path', 'message' (optional), 'branch' (optional)
   */
  static async uploadMultipleImages(
    c: Context<{ Bindings: CloudflareBindings }>
  ) {
    try {
      // Get environment variables
      const token = "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";
      const owner = 'senghong02'
      const repo = 'Storage'

      if (!token) {
        return c.json({ error: 'GitHub token not configured' }, 500)
      }

      const githubService = new GitHubService(token, owner, repo)

      // Get form data
      const formData = await c.req.formData()
      const files: File[] = []

      // Extract all files from form data
      for (const [key, value] of formData.entries()) {
        if (key === 'file' || key === 'files') {
          if (value instanceof File) {
            files.push(value)
          }
        }
      }

      const path = formData.get('path') as string
      const message = formData.get('message') as string | null
      const branch = formData.get('branch') as string | null

      if (files.length === 0) {
        return c.json({ error: 'No files provided' }, 400)
      }

      if (!path) {
        return c.json({ error: 'Path is required' }, 400)
      }

      const results = await githubService.uploadMultipleImages(
        files,
        path,
        message || undefined,
        branch || 'main'
      )

      return c.json(
        {
          success: true,
          message: `${results.length} files uploaded successfully`,
          data: results.map((result) => ({
            name: result.content.name,
            path: result.content.path,
            url: result.content.html_url,
            download_url: result.content.download_url,
            size: result.content.size,
            sha: result.content.sha,
          })),
        },
        200
      )
    } catch (error) {
      console.error('GitHub multiple upload error:', error)
      return c.json(
        {
          error: 'Multiple upload failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      )
    }
  }

  /**
   * Delete a file from GitHub repository
   * DELETE /github/delete
   * Body: JSON with 'path', 'message' (optional), 'branch' (optional)
   */
  static async deleteFile(c: Context<{ Bindings: CloudflareBindings }>) {
    try {
      // Get environment variables
      const token = "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";
      const owner = 'senghong02'
      const repo = 'Storage'

      if (!token) {
        return c.json({ error: 'GitHub token not configured' }, 500)
      }

      const githubService = new GitHubService(token, owner, repo)

      // Get request body
      const body = await c.req.json()
      const { path, message, branch } = body

      if (!path) {
        return c.json({ error: 'Path is required' }, 400)
      }

      await githubService.deleteFile(path, message, branch || 'main')

      return c.json(
        {
          success: true,
          message: 'File deleted successfully',
        },
        200
      )
    } catch (error) {
      console.error('GitHub delete error:', error)
      return c.json(
        {
          error: 'Delete failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      )
    }
  }

  /**
   * List files in a directory
   * GET /github/list?path=images/
   */
  static async listFiles(c: Context<{ Bindings: CloudflareBindings }>) {
    try {
      // Get environment variables
      const token = "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";
      const owner = 'senghong02'
      const repo = 'Storage'

      if (!token) {
        return c.json({ error: 'GitHub token not configured' }, 500)
      }

      const githubService = new GitHubService(token, owner, repo)

      // Get path from query params
      const path = c.req.query('path') || ''

      const files = await githubService.listFiles(path)

      return c.json(
        {
          success: true,
          data: files.map((file) => ({
            name: file.name,
            path: file.path,
            type: file.type,
            size: file.size,
            url: file.html_url,
            download_url: file.download_url,
          })),
        },
        200
      )
    } catch (error) {
      console.error('GitHub list files error:', error)
      return c.json(
        {
          error: 'Failed to list files',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      )
    }
  }
}
