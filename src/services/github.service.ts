import type {
  GitHubUploadRequest,
  GitHubUploadResponse,
  GitHubFileInfo,
} from '../types/github'

export class GitHubService {
  private token: string
  private owner: string
  private repo: string
  private baseUrl = 'https://api.github.com'

  constructor(token: string, owner: string, repo: string) {
    this.token = token
    this.owner = owner
    this.repo = repo
  }

  /**
   * Convert a File object to base64 string
   */
  private async fileToBase64(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * Generate a unique filename with timestamp
   */
  private generateFileName(originalName: string): string {
    const timestamp = Date.now()
    const extension = originalName.split('.').pop()
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
    return `${nameWithoutExt}-${timestamp}.${extension}`
  }

  /**
   * Check if a file exists in the repository
   */
  async fileExists(path: string): Promise<GitHubFileInfo | null> {
    try {
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`
      console.log('Checking if file exists at:', url)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `token ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Hono-Cloudflare-Workers',
        },
      })

      console.log('File check response status:', response.status)

      if (response.status === 404) {
        console.log('File does not exist (404)')
        return null
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('File check error:', errorData)
        throw new Error(
          `GitHub API error: ${response.status} ${response.statusText}. ${errorData.message || ''}`
        )
      }

      const fileData = await response.json()
      console.log('File exists with SHA:', fileData.sha)
      return fileData
    } catch (error) {
      console.error('fileExists caught error:', error)
      if (error instanceof Error && error.message.includes('404')) {
        return null
      }
      throw error
    }
  }

  /**
   * Upload an image to GitHub repository
   */
  async uploadImage(
    file: File,
    path: string,
    message?: string,
    branch: string = 'main',
    retries: number = 3
  ): Promise<GitHubUploadResponse> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Convert file to base64
        const content = await this.fileToBase64(file)

        // Generate filename if path is a directory
        let filePath = path
        if (path.endsWith('/')) {
          const fileName = this.generateFileName(file.name)
          filePath = `${path}${fileName}`
        }

        // Check if file already exists (fetch latest SHA each time)
        let existingFile: GitHubFileInfo | null = null
        try {
          existingFile = await this.fileExists(filePath)
        } catch (error) {
          console.error('Error checking if file exists, assuming it does not exist:', error)
          existingFile = null
        }

        const uploadData: GitHubUploadRequest = {
          message: message || `Upload ${file.name}`,
          content,
          branch,
        }

        // If file exists, include SHA for update
        if (existingFile && existingFile.sha) {
          console.log('File exists, adding SHA:', existingFile.sha)
          uploadData.sha = existingFile.sha
        } else {
          console.log('File does not exist, creating new file at:', filePath)
        }

        const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${filePath}`
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            Authorization: `token ${this.token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Hono-Cloudflare-Workers',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))

          // If it's a 409 conflict (SHA mismatch), retry with fresh SHA
          if (response.status === 409 && attempt < retries - 1) {
            console.log(`409 Conflict on attempt ${attempt + 1}, retrying...`)
            lastError = new Error(
              `Failed to upload to GitHub: ${response.status} ${response.statusText}. ${errorData.message || ''}. FilePath: ${filePath}, HasSHA: ${!!uploadData.sha}, ExistingFile: ${!!existingFile}`
            )
            // Add a small delay before retrying
            await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)))
            continue
          }

          throw new Error(
            `Failed to upload to GitHub: ${response.status} ${response.statusText}. ${errorData.message || ''}. FilePath: ${filePath}, HasSHA: ${!!uploadData.sha}, ExistingFile: ${!!existingFile}`
          )
        }

        return await response.json()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // Only retry on 409 conflicts
        if (error instanceof Error && error.message.includes('409') && attempt < retries - 1) {
          console.log(`Retrying upload (attempt ${attempt + 2}/${retries})...`)
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)))
          continue
        }

        console.error('GitHub upload error:', error)
        throw error
      }
    }

    throw lastError || new Error('Upload failed after retries')
  }

  /**
   * Upload multiple images to GitHub repository
   * Sequential upload to prevent SHA conflicts
   */
  async uploadMultipleImages(
    files: File[],
    basePath: string,
    message?: string,
    branch: string = 'main'
  ): Promise<GitHubUploadResponse[]> {
    const results: GitHubUploadResponse[] = []

    for (const file of files) {
      const fileName = this.generateFileName(file.name)
      const filePath = `${basePath}${basePath.endsWith('/') ? '' : '/'}${fileName}`
      const result = await this.uploadImage(file, filePath, message, branch)
      results.push(result)
    }

    return results
  }

  /**
   * Delete a file from GitHub repository
   */
  async deleteFile(
    path: string,
    message?: string,
    branch: string = 'main'
  ): Promise<void> {
    try {
      // Get file SHA first
      const fileInfo = await this.fileExists(path)
      if (!fileInfo) {
        throw new Error('File not found')
      }

      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `token ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Hono-Cloudflare-Workers',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message || `Delete ${path}`,
          sha: fileInfo.sha,
          branch,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete from GitHub')
      }
    } catch (error) {
      console.error('GitHub delete error:', error)
      throw error
    }
  }

  /**
   * Verify GitHub token and repository access
   */
  async verifyAccess(): Promise<{
    authenticated: boolean
    user?: string
    repoAccess: boolean
    permissions?: string[]
    error?: string
  }> {
    try {
      // Check authentication
      const userResponse = await fetch(`${this.baseUrl}/user`, {
        method: 'GET',
        headers: {
          Authorization: `token ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Hono-Cloudflare-Workers',
        },
      })

      if (!userResponse.ok) {
        const errorBody = await userResponse.text()
        console.error('GitHub auth error response:', errorBody)
        return {
          authenticated: false,
          repoAccess: false,
          error: `Authentication failed: ${userResponse.status} ${userResponse.statusText}. Body: ${errorBody}`,
        }
      }

      const userData = await userResponse.json()

      // Check repository access
      const repoResponse = await fetch(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}`,
        {
          method: 'GET',
          headers: {
            Authorization: `token ${this.token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Hono-Cloudflare-Workers',
          },
        }
      )

      if (!repoResponse.ok) {
        return {
          authenticated: true,
          user: userData.login,
          repoAccess: false,
          error: `Repository access failed: ${repoResponse.status} ${repoResponse.statusText}`,
        }
      }

      const repoData = await repoResponse.json()

      return {
        authenticated: true,
        user: userData.login,
        repoAccess: true,
        permissions: repoData.permissions
          ? Object.keys(repoData.permissions).filter(
              (k) => repoData.permissions[k]
            )
          : [],
      }
    } catch (error) {
      return {
        authenticated: false,
        repoAccess: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(path: string = ''): Promise<GitHubFileInfo[]> {
    try {
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `token ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Hono-Cloudflare-Workers',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to list files from GitHub')
      }

      return await response.json()
    } catch (error) {
      console.error('GitHub list files error:', error)
      throw error
    }
  }
}
