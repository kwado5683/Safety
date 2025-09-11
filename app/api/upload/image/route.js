/*
DESCRIPTION: API route for uploading images to Supabase Storage.
- Handles file uploads for incident images
- Validates file types and sizes
- Uploads to Supabase Storage bucket
- Returns public URL for the uploaded image

WHAT EACH PART DOES:
1. getAuth() - Clerk function that gets current user information from request
2. FormData parsing - Extracts file and path from request
3. File validation - Checks file type and size
4. Supabase Storage upload - Uploads file to storage bucket
5. Public URL generation - Returns accessible URL for the image

PSEUDOCODE:
- Check if user is authenticated
- Parse form data and extract file
- Validate file type and size
- Upload to Supabase Storage
- Return public URL
*/

import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(request) {
  try {
    // Check authentication
    const { userId } = await getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file')
    const path = formData.get('path')

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabaseServer.storage
      .from('incident-images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseServer.storage
      .from('incident-images')
      .getPublicUrl(data.path)

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      path: data.path 
    })

  } catch (error) {
    console.error('Image upload API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
