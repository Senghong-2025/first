import { Hono } from 'hono'
import { GitHubController } from '../controllers/github.controller'
import type { EnvBindings } from '../types/bindings'

const githubRouter = new Hono<{ Bindings: EnvBindings }>()

// Verify GitHub access
githubRouter.get('/verify', (c) => GitHubController.verifyAccess(c))

// Upload single image to GitHub
githubRouter.post('/upload', (c) => GitHubController.uploadImage(c))

// Upload multiple images to GitHub
githubRouter.post('/upload-multiple', (c) => GitHubController.uploadMultipleImages(c))

// Upload JSON data to GitHub
githubRouter.post('/upload-json', (c) => GitHubController.uploadJson(c))

// Delete a file from GitHub
githubRouter.delete('/delete', (c) => GitHubController.deleteFile(c))

// List files in a directory
githubRouter.get('/list', (c) => GitHubController.listFiles(c))

export default githubRouter
