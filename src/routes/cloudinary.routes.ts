import { Hono } from 'hono'
import { CloudinaryController } from '../controllers/cloudinary.controller'
import type { EnvBindings } from '../types/bindings'

const cloudinaryRouter = new Hono<{ Bindings: EnvBindings }>()

// Upload single image to Cloudinary
cloudinaryRouter.post('/upload', (c) => CloudinaryController.uploadImage(c))

// Upload multiple images to Cloudinary
cloudinaryRouter.post('/upload-multiple', (c) => CloudinaryController.uploadMultipleImages(c))

export default cloudinaryRouter
