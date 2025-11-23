import type { Context } from 'hono'
import { CloudinaryService } from '../services/cloudinary.service'
import type { EnvBindings } from '../types/bindings'

export class CloudinaryController {
  static async uploadImage(c: Context<{ Bindings: EnvBindings }>) {
    try {
      // Get environment variables
      const cloudName = c.env.CLOUDINARY_CLOUD_NAME
      const apiKey = c.env.CLOUDINARY_API_KEY
      const apiSecret = c.env.CLOUDINARY_API_SECRET

      const cloudinaryService = new CloudinaryService(
        cloudName,
        apiKey,
        apiSecret
      )

      // Get form data
      const formData = await c.req.formData()
      const file = formData.get('file') as unknown as File

      if (!file) {
        return c.json({ error: 'No file provided' }, 400)
      }

      const result = await cloudinaryService.uploadImage(file)

      return c.json(result, 200)
    } catch (error) {
      console.error('Upload error:', error)
      return c.json(
        {
          error: 'Upload failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      )
    }
  }

  static async uploadMultipleImages(c: Context<{ Bindings: EnvBindings }>) {
    try {
      // Get environment variables
      const cloudName = c.env.CLOUDINARY_CLOUD_NAME
      const apiKey = c.env.CLOUDINARY_API_KEY
      const apiSecret = c.env.CLOUDINARY_API_SECRET

      const cloudinaryService = new CloudinaryService(
        cloudName,
        apiKey,
        apiSecret
      )

      // Get form data
      const formData = await c.req.formData()
      const files: File[] = []

      // Extract all files from form data
      for (const [, value] of formData.entries()) {
        if (value instanceof File) {
          files.push(value)
        }
      }

      if (files.length === 0) {
        return c.json({ error: 'No files provided' }, 400)
      }

      const result = await cloudinaryService.uploadMultipleImages(files)

      return c.json(result, 200)
    } catch (error) {
      console.error('Multiple upload error:', error)
      return c.json(
        {
          error: 'Multiple upload failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      )
    }
  }
}
