import { cleanupOldPDFs } from '@/lib/cleanup'
import { handleApiError, createSuccessResponse } from '@/lib/api-utils'

/**
 * API endpoint to manually trigger cleanup
 *
 * For production, protect this endpoint with authentication
 * or call it from a scheduled task instead
 */
export async function POST() {
  try {
    const result = await cleanupOldPDFs()

    return createSuccessResponse({
      data: { deletedCount: result.deletedCount },
      message: `Cleaned up ${result.deletedCount} old files`
    })
  } catch (error) {
    return handleApiError(error)
  }
}
