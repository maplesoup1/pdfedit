import fs from 'fs/promises'
import path from 'path'

const STORAGE_DIR = path.join(process.cwd(), 'local-storage', 'temp-pdfs')
const MAX_FILE_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Clean up old PDF files that exceed the maximum age
 * This should be called periodically (e.g., via cron job or scheduled task)
 */
export async function cleanupOldPDFs() {
  try {
    const files = await fs.readdir(STORAGE_DIR)
    const now = Date.now()
    let deletedCount = 0

    for (const fileName of files) {
      const filePath = path.join(STORAGE_DIR, fileName)
      try {
        const stats = await fs.stat(filePath)
        const fileAge = now - stats.mtimeMs

        if (fileAge > MAX_FILE_AGE_MS) {
          await fs.unlink(filePath)
          deletedCount++
          console.log(`Deleted old file: ${fileName}`)
        }
      } catch (err) {
        console.warn(`Failed to process file ${fileName}:`, err)
      }
    }

    console.log(`Cleanup completed. Deleted ${deletedCount} files.`)
    return { deletedCount }
  } catch (error) {
    console.error('Cleanup failed:', error)
    throw error
  }
}

/**
 * For Supabase storage, you can implement a similar cleanup using:
 * - Supabase Storage policies with automatic expiration
 * - Or a scheduled function to delete old files from the bucket
 */
export async function cleanupOldPDFsSupabase() {
  // This would require @supabase/supabase-js
  // Implementation depends on your Supabase bucket configuration
  // Example structure:
  /*
  const supabase = createClient(...)
  const { data: files } = await supabase.storage
    .from('temp-pdfs')
    .list()

  const now = Date.now()
  const filesToDelete = files.filter(file => {
    const fileAge = now - new Date(file.created_at).getTime()
    return fileAge > MAX_FILE_AGE_MS
  })

  for (const file of filesToDelete) {
    await supabase.storage.from('temp-pdfs').remove([file.name])
  }
  */
}
