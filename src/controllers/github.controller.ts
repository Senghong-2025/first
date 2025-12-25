import type { Context } from 'hono'
import { GitHubService } from '../services/github.service'
import type { EnvBindings } from '../types/bindings'

export class GitHubController {
  private static getGitHubService(c: Context<{ Bindings: EnvBindings }>) {
    const token = c.env.GITHUB_TOKEN
    const owner = c.env.GITHUB_OWNER
    const repo = c.env.GITHUB_REPO

    if (!token) {
      throw new Error('GitHub token not configured')
    }

    return new GitHubService(token, owner, repo)
  }

  static async verifyAccess(c: Context<{ Bindings: EnvBindings }>) {
    try {
      const githubService = this.getGitHubService(c)
      const verification = await githubService.verifyAccess()

      return c.json(verification, verification.authenticated ? 200 : 401)
    } catch (error) {
      if (error instanceof Error && error.message === 'GitHub token not configured') {
        return c.json({ error: error.message }, 500)
      }
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

  static async uploadImage(c: Context<{ Bindings: EnvBindings }>) {
    try {
      const githubService = this.getGitHubService(c)

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
      if (error instanceof Error && error.message === 'GitHub token not configured') {
        return c.json({ error: error.message }, 500)
      }
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

  static async uploadMultipleImages(
    c: Context<{ Bindings: EnvBindings }>
  ) {
    try {
      const githubService = this.getGitHubService(c)

      // Get form data
      const formData = await c.req.formData()
      const files: File[] = []

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
      if (error instanceof Error && error.message === 'GitHub token not configured') {
        return c.json({ error: error.message }, 500)
      }
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


  static async uploadJson(c: Context<{ Bindings: EnvBindings }>) {
    try {
      const githubService = this.getGitHubService(c)

      const body = await c.req.json()
      const { data, path, message, branch } = body

      console.log('Upload JSON request - Path:', path, 'Branch:', branch || 'main')

      if (!data) {
        return c.json({ error: 'No data provided' }, 400)
      }

      if (!path) {
        return c.json({ error: 'Path is required' }, 400)
      }

      const result = await githubService.uploadJson(
        data,
        path,
        message || undefined,
        branch || 'main'
      )

      return c.json(
        {
          success: true,
          message: 'JSON uploaded successfully',
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
      if (error instanceof Error && error.message === 'GitHub token not configured') {
        return c.json({ error: error.message }, 500)
      }
      console.error('GitHub JSON upload error:', error)
      return c.json(
        {
          error: 'JSON upload failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      )
    }
  }

  static async deleteFile(c: Context<{ Bindings: EnvBindings }>) {
    try {
      const githubService = this.getGitHubService(c)

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
      if (error instanceof Error && error.message === 'GitHub token not configured') {
        return c.json({ error: error.message }, 500)
      }
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

  static async listFiles(c: Context<{ Bindings: EnvBindings }>) {
    try {
      const githubService = this.getGitHubService(c)

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
      if (error instanceof Error && error.message === 'GitHub token not configured') {
        return c.json({ error: error.message }, 500)
      }
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
