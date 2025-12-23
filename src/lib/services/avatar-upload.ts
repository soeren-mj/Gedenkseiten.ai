import { createClient } from '@/lib/supabase/client'

const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3 MB in bytes
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const BUCKET_NAME = 'avatars'

/**
 * Validates if a file is acceptable for avatar upload
 */
export function validateAvatarFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Ungültiger Dateityp. Bitte verwende JPG, PNG, WebP oder GIF.'
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Datei ist zu groß. Maximale Größe: ${MAX_FILE_SIZE / 1024 / 1024} MB.`
    }
  }

  return { valid: true }
}

/**
 * Generates a unique filename for the avatar
 */
function generateAvatarFilename(userId: string, file: File): string {
  const timestamp = Date.now()
  const extension = file.name.split('.').pop() || 'jpg'
  return `${userId}-${timestamp}.${extension}`
}

/**
 * Extracts the storage path from a full avatar URL
 */
function extractStoragePath(avatarUrl: string): string | null {
  try {
    const url = new URL(avatarUrl)
    // Extract path after /storage/v1/object/public/avatars/
    const match = url.pathname.match(/\/storage\/v1\/object\/public\/avatars\/(.+)/)
    if (match) {
      return match[1]
    }
    return null
  } catch {
    return null
  }
}

/**
 * Uploads an avatar image to Supabase Storage
 * Returns the public URL of the uploaded image
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url: string; error?: string }> {
  const supabase = createClient()

  // Validate file
  const validation = validateAvatarFile(file)
  if (!validation.valid) {
    return { url: '', error: validation.error }
  }

  try {
    // Generate unique filename
    const filename = generateAvatarFilename(userId, file)
    const filePath = filename

    console.log('[Avatar Upload] Uploading avatar:', {
      userId,
      filename,
      size: file.size,
      type: file.type
    })

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false // Don't overwrite existing files
      })

    if (error) {
      console.error('[Avatar Upload] Upload error:', error)
      return {
        url: '',
        error: 'Fehler beim Hochladen des Bildes. Bitte versuche es erneut.'
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    console.log('[Avatar Upload] Upload successful:', publicUrl)

    return { url: publicUrl }
  } catch (error) {
    console.error('[Avatar Upload] Unexpected error:', error)
    return {
      url: '',
      error: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.'
    }
  }
}

/**
 * Deletes an avatar image from Supabase Storage
 */
export async function deleteAvatar(avatarUrl: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  try {
    // Extract storage path from URL
    const storagePath = extractStoragePath(avatarUrl)

    if (!storagePath) {
      console.error('[Avatar Delete] Could not extract storage path from URL:', avatarUrl)
      return {
        success: false,
        error: 'Ungültige Avatar-URL.'
      }
    }

    console.log('[Avatar Delete] Deleting avatar:', storagePath)

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath])

    if (error) {
      console.error('[Avatar Delete] Delete error:', error)
      return {
        success: false,
        error: 'Fehler beim Löschen des Bildes.'
      }
    }

    console.log('[Avatar Delete] Delete successful')

    return { success: true }
  } catch (error) {
    console.error('[Avatar Delete] Unexpected error:', error)
    return {
      success: false,
      error: 'Ein unerwarteter Fehler ist aufgetreten.'
    }
  }
}

/**
 * Replaces the current avatar with a new one
 * Deletes the old avatar and uploads the new one
 */
export async function replaceAvatar(
  userId: string,
  newFile: File,
  currentAvatarUrl: string | null
): Promise<{ url: string; error?: string }> {
  // Upload new avatar
  const uploadResult = await uploadAvatar(userId, newFile)

  if (uploadResult.error || !uploadResult.url) {
    return uploadResult
  }

  // Delete old avatar if it exists
  if (currentAvatarUrl) {
    // Don't wait for deletion to complete, and don't fail if it errors
    deleteAvatar(currentAvatarUrl).catch(err => {
      console.warn('[Avatar Replace] Failed to delete old avatar:', err)
    })
  }

  return uploadResult
}
