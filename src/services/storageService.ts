import { supabase } from '@/lib/supabaseClient'

export const uploadComicImage = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error('No file provided')
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB')
  }

  try {
    // Get current user ID (you might need to adjust this based on your auth setup)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Create unique file path
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${file.name}`
    const filePath = `public/${user.id}/${fileName}`

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('comic-covers')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data } = supabase.storage
      .from('comic-covers')
      .getPublicUrl(filePath)

    if (!data?.publicUrl) {
      throw new Error('Failed to get public URL')
    }

    return data.publicUrl
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Unknown error occurred during upload')
  }
}

export const deleteComicImage = async (url: string): Promise<void> => {
  if (!url) {
    return
  }

  try {
    // Extract file path from URL
    const urlParts = url.split('comic-covers/')
    if (urlParts.length !== 2) {
      throw new Error('Invalid image URL')
    }
    
    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from('comic-covers')
      .remove([filePath])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
  } catch (error) {
    console.error('Error deleting image:', error)
    // Don't throw error for delete operations to avoid blocking other operations
  }
}