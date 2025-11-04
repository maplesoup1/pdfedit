import fs from 'fs/promises'
import path from 'path'

const STORAGE_DIR = path.join(process.cwd(), 'local-storage', 'temp-pdfs')

export async function uploadPDFLocal(file: File, fileName: string) {
  const filePath = path.join(STORAGE_DIR, fileName)
  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(filePath, buffer)
  return { path: fileName }
}

export async function downloadPDFLocal(fileName: string) {
  const filePath = path.join(STORAGE_DIR, fileName)
  const buffer = await fs.readFile(filePath)
  return new Blob([buffer], { type: 'application/pdf' })
}

export async function deletePDFLocal(fileName: string) {
  const filePath = path.join(STORAGE_DIR, fileName)
  await fs.unlink(filePath)
}

export async function getPDFUrlLocal(fileName: string) {
  return `/api/pdf/download?fileName=${fileName}`
}
