// API route for listing Bunny CDN directory contents
// This runs on the server side to avoid CORS and security issues

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { path = '' } = req.query
    
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
    const normalizedPath = path ? path.replace(/^\/+|\/+$/g, '') + '/' : ''
    const url = `https://${hostname}/${storageZone}/${normalizedPath}`

    console.log('[API] Bunny list request:', { path, normalizedPath, url })

    // Make request to Bunny CDN
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'AccessKey': apiKey,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.error('[API] Bunny list failed:', { 
        status: response.status, 
        statusText: response.statusText, 
        error: errorText 
      })
      return res.status(response.status).json({ 
        error: `Bunny CDN API error: ${response.status} ${response.statusText}`,
        details: errorText.slice(0, 200)
      })
    }

    const data = await response.json()
    
    // Transform data to match expected format
    const transformedData = (data || []).map((e) => ({
      guid: e.Guid,
      path: e.Path,
      objectName: e.ObjectName,
      isDirectory: Boolean(e.IsDirectory),
      size: Number(e.Length || 0),
      lastChanged: e.LastChanged,
    }))

    console.log('[API] Bunny list success:', { count: transformedData.length })
    return res.status(200).json(transformedData)

  } catch (error) {
    console.error('[API] Bunny list error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}
