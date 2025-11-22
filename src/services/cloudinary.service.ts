import { v2 as cloudinary } from 'cloudinary'

export class CloudinaryService {
  private cloudName: string
  private apiKey: string
  private apiSecret: string

  constructor(cloudName: string, apiKey: string, apiSecret: string) {
    this.cloudName = cloudName
    this.apiKey = apiKey
    this.apiSecret = apiSecret

    this.configure()
  }

  private configure() {
    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
    })
  }

  async uploadImage(file: File): Promise<any> {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'
      )
    }

    // Convert File to base64
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let base64 = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      base64 += String.fromCharCode(bytes[i])
    }
    const dataURI = `data:${file.type};base64,${btoa(base64)}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'hono-uploads',
    })

    return result
  }

  async uploadMultipleImages(files: File[]): Promise<any> {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const uploadResults = []
    const errors = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      try {
        if (!allowedTypes.includes(file.type)) {
          errors.push({
            fileName: file.name,
            error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'
          })
          continue
        }

        // Convert File to base64
        const buffer = await file.arrayBuffer()
        const bytes = new Uint8Array(buffer)
        let base64 = ''
        for (let j = 0; j < bytes.byteLength; j++) {
          base64 += String.fromCharCode(bytes[j])
        }
        const dataURI = `data:${file.type};base64,${btoa(base64)}`

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
          resource_type: 'auto',
          folder: 'hono-uploads',
        })

        uploadResults.push({
          fileName: file.name,
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          size: result.bytes
        })
      } catch (error) {
        errors.push({
          fileName: file.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return {
      successful: uploadResults,
      failed: errors,
      totalUploaded: uploadResults.length,
      totalFailed: errors.length,
      total: files.length
    }
  }
}
