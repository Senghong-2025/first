import { Hono } from 'hono'
import { GitHubController } from '../controllers/github.controller'
import type { EnvBindings } from '../types/bindings'

const githubRouter = new Hono<{ Bindings: EnvBindings }>()

// Verify GitHub access
githubRouter.get('/verify', GitHubController.verifyAccess)

// Upload single image to GitHub
githubRouter.post('/upload', GitHubController.uploadImage)

// Upload multiple images to GitHub
githubRouter.post('/upload-multiple', GitHubController.uploadMultipleImages)

// Upload JSON data to GitHub
githubRouter.post('/upload-json', GitHubController.uploadJson)

// Delete a file from GitHub
githubRouter.delete('/delete', GitHubController.deleteFile)

// List files in a directory
githubRouter.get('/list', GitHubController.listFiles)

export default githubRouter
