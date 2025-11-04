import { uploadPDFLocal, downloadPDFLocal, deletePDFLocal, getPDFUrlLocal } from './local-storage'

const USE_LOCAL_STORAGE = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url'

export async function uploadPDF(file: File, fileName: string) {
  if (USE_LOCAL_STORAGE) {
    return uploadPDFLocal(file, fileName)
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.storage
    .from('temp-pdfs')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error
  return data
}

export async function downloadPDF(fileName: string) {
  if (USE_LOCAL_STORAGE) {
    return downloadPDFLocal(fileName)
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.storage
    .from('temp-pdfs')
    .download(fileName)

  if (error) throw error
  return data
}

export async function deletePDF(fileName: string) {
  if (USE_LOCAL_STORAGE) {
    return deletePDFLocal(fileName)
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await supabase.storage
    .from('temp-pdfs')
    .remove([fileName])

  if (error) throw error
}

export async function getPDFUrl(fileName: string) {
  if (USE_LOCAL_STORAGE) {
    return getPDFUrlLocal(fileName)
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = supabase.storage
    .from('temp-pdfs')
    .getPublicUrl(fileName)

  return data.publicUrl
}
