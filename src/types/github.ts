export interface GitHubUploadRequest {
  message: string
  content: string // Base64 encoded file content
  branch?: string
  sha?: string // Required if updating an existing file
}

export interface GitHubUploadResponse {
  content: {
    name: string
    path: string
    sha: string
    size: number
    url: string
    html_url: string
    git_url: string
    download_url: string
  }
  commit: {
    sha: string
    message: string
    url: string
  }
}

export interface GitHubError {
  message: string
  documentation_url?: string
}

export interface GitHubFileInfo {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: string
}
