#!/usr/bin/env tsx

/**
 * Cleanup cron job
 *
 * Run this script periodically to clean up old PDF files.
 *
 * Usage:
 *   npx tsx scripts/cleanup-cron.ts
 *
 * Or add to your crontab:
 *   0 * * * * cd /path/to/pdf-editor && npx tsx scripts/cleanup-cron.ts
 */

import { cleanupOldPDFs } from '../lib/cleanup'

async function main() {
  console.log('Starting PDF cleanup...')
  try {
    const result = await cleanupOldPDFs()
    console.log(`Cleanup successful: ${result.deletedCount} files deleted`)
    process.exit(0)
  } catch (error) {
    console.error('Cleanup failed:', error)
    process.exit(1)
  }
}

main()
