import { useEffect, useState } from 'react'
import { deleteBunnyPath, listBunnyDirectory, toPublicUrl } from '../lib/bunny'
import type { BunnyEntry } from '../lib/bunny'

export default function BunnyExplorer() {
  const [path, setPath] = useState<string>('')
  const [entries, setEntries] = useState<BunnyEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  async function load(p: string) {
    setLoading(true)
    setError(null)
    try {
      try { console.debug('[BunnyExplorer] Loading path', p) } catch {}
      const data = await listBunnyDirectory(p)
      setEntries(data)
    } catch (e: any) {
      setError(e.message || 'Failed to load directory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(path)
  }, [path])

  function goInto(entry: BunnyEntry) {
    if (!entry.isDirectory) return
    const next = (path ? path.replace(/^\/+|\/+$/g, '') + '/' : '') + entry.objectName
    try { console.debug('[BunnyExplorer] Go into', { from: path, to: next }) } catch {}
    setPath(next)
  }

  function goUp() {
    if (!path) return
    const parts = path.replace(/^\/+|\/+$/g, '').split('/')
    parts.pop()
    try { console.debug('[BunnyExplorer] Go up', { from: path, to: parts.join('/') }) } catch {}
    setPath(parts.join('/'))
  }

  async function handleDelete(entry: BunnyEntry) {
    if (entry.isDirectory) return
    const rel = (path ? path.replace(/^\/+|\/+$/g, '') + '/' : '') + entry.objectName
    const ok = confirm(`Delete ${rel}? This cannot be undone.`)
    if (!ok) return
    try {
      await deleteBunnyPath(rel)
      await load(path)
    } catch (e: any) {
      alert(e.message || 'Delete failed')
    }
  }

  const readablePath = '/' + (path ? path.replace(/^\/+|\/+$/g, '') + '/' : '')

  return (
    <div className="container cms-page">
      <h1 className="title">File Explorer</h1>
      <p className="subtitle">Browse and manage files. Current: {readablePath || '/'}</p>
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.5rem', flexWrap: 'wrap' }}>
        <button className="open-btn" onClick={goUp} disabled={!path}>Up</button>
        <button className="open-btn" onClick={() => load(path)} disabled={loading}>Refresh</button>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="storage-grid">
          {loading ? (
            <div className="center-cell">Loading…</div>
          ) : entries.length === 0 ? (
            <div className="center-cell">Empty</div>
          ) : (
            entries.map((e) => {
              const rel = (path ? path.replace(/^\/+|\/+$/g, '') + '/' : '') + e.objectName
              const isDir = e.isDirectory
              return (
                <div className="storage-card" key={(e.guid || '') + rel}>
                  <div className={`badge ${isDir ? 'folder' : 'file'}`}>{isDir ? 'Folder' : 'File'}</div>
                  <div className="card-title" title={e.objectName}>{e.objectName}</div>
                  <div className="card-meta">{isDir ? '—' : formatBytes(e.size)}</div>
                  <div className="card-actions">
                    {isDir ? (
                      <button className="open-btn btn-sm" onClick={() => goInto(e)}>Open</button>
                    ) : (
                      <>
                        <a className="open-btn btn-sm" href={toPublicUrl(rel)} target="_blank" rel="noreferrer">Open</a>
                        <button className="save-btn btn-sm" onClick={() => handleDelete(e)}>Delete</button>
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
      </div>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let num = bytes
  while (num >= 1024 && i < units.length - 1) {
    num /= 1024
    i++
  }
  return `${num.toFixed(1)} ${units[i]}`
}


