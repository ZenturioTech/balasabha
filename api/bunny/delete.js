// API route for deleting Bunny CDN files
// This runs on the server side to avoid CORS and security issues

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { path } = req.query
    
    if (!path) {
      return res.status(400).json({ error: 'Path parameter is required' })
    }

    // Get environment variables
    const apiKey = process.env.VITE_BUNNY_API_KEY
    const storageZone = process.env.VITE_BUNNY_STORAGE_ZONE
    const hostname = process.env.VITE_BUNNY_HOSTNAME

    if (!apiKey || !storageZone || !hostname) {
      return res.status(500).json({ 
        error: 'Missing Bunny CDN configuration. Please set VITE_BUNNY_API_KEY, VITE_BUNNY_STORAGE_ZONE, and VITE_BUNNY_HOSTNAME environment variables.' 
      })
    }

    // Normalize path
    const normalized = path.replace(/^\/+/, '')
    const url = `https://${hostname}/${storageZone}/${normalized}`

    console.log('[API] Bunny delete request:', { path, normalized, url })

    // Make request to Bunny CDN
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'AccessKey': apiKey
      }
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.error('[API] Bunny delete failed:', { 
        status: response.status, 
        statusText: response.statusText, 
        error: errorText 
      })
      return res.status(response.status).json({ 
        error: `Bunny CDN delete failed: ${response.status} ${response.statusText}`,
        details: errorText.slice(0, 200)
      })
    }

    console.log('[API] Bunny delete success:', { path })
    return res.status(200).json({ success: true, message: 'File deleted successfully' })

  } catch (error) {
    console.error('[API] Bunny delete error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}
