import { Hono } from 'hono'
import { CloudinaryController } from '../controllers/cloudinary.controller'
import type { CloudflareBindings } from '../types/bindings'

const cloudinaryRouter = new Hono<{ Bindings: CloudflareBindings }>()

// Upload single image to Cloudinary
cloudinaryRouter.post('/upload', CloudinaryController.uploadImage)

// Upload multiple images to Cloudinary
cloudinaryRouter.post('/upload-multiple', CloudinaryController.uploadMultipleImages)

export default cloudinaryRouter
