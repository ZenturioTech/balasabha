// BunnyCDN storage upload helper
// Expects Vite envs: VITE_BUNNY_API_KEY, VITE_BUNNY_STORAGE_ZONE, VITE_BUNNY_PULL_ZONE, VITE_BUNNY_HOSTNAME

type UploadParams = {
  file: File
  district: string
  blockOrUlb: string
  areaType: 'block' | 'ulb'
  panchayath?: string
}

export async function uploadToBunny({ file, district, blockOrUlb, areaType, panchayath }: UploadParams): Promise<{ storagePath: string; publicUrl: string }>{
  const apiKey = String(import.meta.env.VITE_BUNNY_API_KEY || '').trim()
  const storageZone = String(import.meta.env.VITE_BUNNY_STORAGE_ZONE || '').trim()
  const pullZone = String(import.meta.env.VITE_BUNNY_PULL_ZONE || '').trim()
  const hostname = String(import.meta.env.VITE_BUNNY_HOSTNAME || '').trim()

  if (!apiKey || !storageZone || !pullZone || !hostname) {
    throw new Error('Missing Bunny env configuration')
  }

  const safeDistrict = district.trim().replace(/[^a-z0-9\-_]/gi, '-').toLowerCase()
  const safeBlockOrUlb = blockOrUlb.trim().replace(/[^a-z0-9\-_]/gi, '-').toLowerCase()
  const safePanchayath = (panchayath || '').trim().replace(/[^a-z0-9\-_]/gi, '-').toLowerCase()
  const safeName = file.name.replace(/[^a-z0-9\._\-]/gi, '-')
  const pathParts = [storageZone, safeDistrict, safeBlockOrUlb]
  if (areaType === 'block' && safePanchayath) pathParts.push(safePanchayath)
  const storagePath = pathParts.concat([safeName]).join('/')

  const url = `https://${hostname}/${storagePath}`

  try {
    console.debug('[Bunny] Upload init', {
      mode: import.meta.env.MODE,
      host: hostname,
      storageZone,
      path: `/${pathParts.slice(1).join('/')}/${safeName}`,
      url,
      apiKeyLength: apiKey.length,
      // Do NOT log the API key
    })
  } catch {}

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      AccessKey: apiKey,
      'Content-Type': file.type || 'application/octet-stream',
    } as any,
    body: file,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    try { console.debug('[Bunny] Upload failed', { status: res.status, statusText: res.statusText, body: text?.slice(0, 300) }) } catch {}
    throw new Error(`Bunny upload failed: ${res.status} ${text}`)
  }

  const publicUrl = `https://${pullZone}/${pathParts.slice(1).join('/')}/${safeName}`
  return { storagePath, publicUrl }
}


export type BunnyEntry = {
  guid?: string
  path: string
  objectName: string
  isDirectory: boolean
  size: number
  lastChanged?: string
}

// List directory contents from Bunny Storage (root or nested). Use empty path for root.
export async function listBunnyDirectory(path: string = ''): Promise<BunnyEntry[]> {
  const url = `/api/bunny/list?path=${encodeURIComponent(path || '')}`
  
  try {
    console.debug('[Bunny] List directory via API', { path, url })
  } catch {}
  
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
  
  if (!res.ok) {
    let errorData
    try {
      errorData = await res.json()
    } catch {
      const text = await res.text().catch(() => '')
      throw new Error(`Bunny API error: ${res.status} ${res.statusText}. ${text ? `Response: ${text.slice(0, 100)}` : ''}`)
    }
    
    console.error('[Bunny] List failed', { 
      status: res.status, 
      statusText: res.statusText, 
      error: errorData 
    })
    
    throw new Error(errorData.error || `Bunny API error: ${res.status} ${res.statusText}`)
  }
  
  const data = await res.json()
  
  if (!Array.isArray(data)) {
    console.error('[Bunny] Invalid response format', { data })
    throw new Error('Invalid response format from Bunny API')
  }
  
  return data
}

// Delete a file at the given path (relative to storage zone). Example: "district/file.jpg"
export async function deleteBunnyPath(path: string): Promise<void> {
  const url = `/api/bunny/delete?path=${encodeURIComponent(path)}`
  
  try {
    console.debug('[Bunny] Delete file via API', { path, url })
  } catch {}
  
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json'
    }
  })
  
  if (!res.ok) {
    let errorData
    try {
      errorData = await res.json()
    } catch {
      const text = await res.text().catch(() => '')
      throw new Error(`Bunny API error: ${res.status} ${res.statusText}. ${text ? `Response: ${text.slice(0, 100)}` : ''}`)
    }
    
    console.error('[Bunny] Delete failed', { 
      status: res.status, 
      statusText: res.statusText, 
      error: errorData 
    })
    
    throw new Error(errorData.error || `Bunny API error: ${res.status} ${res.statusText}`)
  }
  
  const data = await res.json()
  console.debug('[Bunny] Delete success', { path, data })
}

export function toPublicUrl(storageRelativePath: string): string {
  const pullZone = String(import.meta.env.VITE_BUNNY_PULL_ZONE || '').trim()
  const normalized = storageRelativePath.replace(/^\/+/, '')
  return `https://${pullZone}/${normalized}`
}


// Expose a safe debug snapshot for comparing localhost vs deployment in DevTools
export function getBunnyDebugInfo(): {
  mode: string
  host: string
  storageZone: string
  pullZoneSet: boolean
} {
  try {
    const mode = String(import.meta.env.MODE)
    const host = String(import.meta.env.VITE_BUNNY_HOSTNAME || '')
    const storageZone = String(import.meta.env.VITE_BUNNY_STORAGE_ZONE || '')
    const pullZoneSet = Boolean(import.meta.env.VITE_BUNNY_PULL_ZONE)
    return { mode, host, storageZone, pullZoneSet }
  } catch {
    return { mode: 'unknown', host: '', storageZone: '', pullZoneSet: false }
  }
}


