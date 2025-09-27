import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../services/supabaseClient'

type MetadataRow = {
  id: number
  created_at: string
  metadata: any
  district: string | null
  username: string | null
  block_ulb: string | null
  panchayath: string | null
}

type Filters = {
  district: string
  mediaType: '' | 'image' | 'video'
  areaType: '' | 'block' | 'ulb'
}

export default function SuperAdmin() {
  const [rows, setRows] = useState<MetadataRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({ district: '', mediaType: '', areaType: '' })

  useEffect(() => {
    let isMounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data, error: err } = await supabase
          .from('metadata')
          .select('*')
          .order('created_at', { ascending: false })
        if (err) throw err
        if (!isMounted) return
        setRows((data as any[]) as MetadataRow[])
      } catch (e: any) {
        if (!isMounted) return
        setError(e.message || 'Failed to load dashboard data')
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  const districts = useMemo(() => {
    const set = new Set<string>()
    rows.forEach((r) => { const d = (r.district || r.metadata?.district || '').trim(); if (d) set.add(d) })
    return Array.from(set).sort()
  }, [rows])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const d = (r.district || r.metadata?.district || '').trim()
      const media = (r.metadata?.mediaType || '').trim()
      const area = (r.metadata?.areaType || '').trim()
      if (filters.district && d !== filters.district) return false
      if (filters.mediaType && media !== filters.mediaType) return false
      if (filters.areaType && area !== filters.areaType) return false
      return true
    })
  }, [rows, filters])

  const kpis = useMemo(() => {
    const total = filtered.length
    let images = 0, videos = 0
    const userSet = new Set<string>()
    const districtSet = new Set<string>()
    filtered.forEach((r) => {
      const mt = r.metadata?.mediaType
      if (mt === 'image') images++
      else if (mt === 'video') videos++
      if (r.username) userSet.add(r.username)
      const d = (r.district || r.metadata?.district || '').trim(); if (d) districtSet.add(d)
    })
    return { total, images, videos, users: userSet.size, districts: districtSet.size }
  }, [filtered])

  const topByDistrict = useMemo(() => {
    const map = new Map<string, number>()
    filtered.forEach((r) => {
      const d = (r.district || r.metadata?.district || '').trim() || 'Unknown'
      map.set(d, (map.get(d) || 0) + 1)
    })
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10)
  }, [filtered])

  const last14Days = useMemo(() => {
    const days: { label: string; dateKey: string; count: number }[] = []
    const now = new Date()
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const label = `${d.getMonth() + 1}/${d.getDate()}`
      const dateKey = d.toISOString().slice(0, 10)
      days.push({ label, dateKey, count: 0 })
    }
    const byDay = new Map(days.map((d) => [d.dateKey, d]))
    filtered.forEach((r) => {
      const key = (r.created_at || '').slice(0, 10)
      const entry = byDay.get(key)
      if (entry) entry.count++
    })
    return days
  }, [filtered])

  const recent = useMemo(() => filtered.slice(0, 20), [filtered])

  return (
    <div className="container cms-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem' }}>
        <h1 className="title" style={{ margin: 0 }}>Dashboard</h1>
      </div>
      <p className="subtitle">Analysis and monitoring of uploaded entries.</p>

      <div className="dash-filters">
        <label className="field">
          <span>District</span>
          <select value={filters.district} onChange={(e) => setFilters({ ...filters, district: e.target.value })}>
            <option value="">All districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Media Type</span>
          <select value={filters.mediaType} onChange={(e) => setFilters({ ...filters, mediaType: e.target.value as Filters['mediaType'] })}>
            <option value="">All types</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </label>
        <label className="field">
          <span>Area Type</span>
          <select value={filters.areaType} onChange={(e) => setFilters({ ...filters, areaType: e.target.value as Filters['areaType'] })}>
            <option value="">All</option>
            <option value="block">Block / Panchayath</option>
            <option value="ulb">Urban Local Body (ULB)</option>
          </select>
        </label>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="kpi-grid">
        <KpiCard label="Total Entries" value={kpis.total} />
        <KpiCard label="Images" value={kpis.images} />
        <KpiCard label="Videos" value={kpis.videos} />
        <KpiCard label="Contributors" value={kpis.users} />
        <KpiCard label="Districts Covered" value={kpis.districts} />
      </div>

      <div className="chart-grid">
        <div className="card">
          <h3 className="card-title">Top Districts</h3>
          {loading ? (
            <div className="center-cell">Loading…</div>
          ) : topByDistrict.length === 0 ? (
            <div className="center-cell">No data</div>
          ) : (
            <BarChart data={topByDistrict} />
          )}
        </div>
        <div className="card">
          <h3 className="card-title">Submissions - Last 14 Days</h3>
          {loading ? (
            <div className="center-cell">Loading…</div>
          ) : (
            <Sparkline data={last14Days.map((d) => d.count)} labels={last14Days.map((d) => d.label)} />
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Recent Entries</h3>
        <div className="table-responsive">
          <table className="store-table recent-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>District</th>
                <th>Area</th>
                <th>Media</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => {
                const d = (r.district || r.metadata?.district || '')
                const area = r.metadata?.areaType === 'ulb' ? (r.metadata?.ulb || r.block_ulb || '') : (r.metadata?.panchayath || r.panchayath || '')
                const media = r.metadata?.mediaType || ''
                const date = new Date(r.created_at)
                return (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{date.toLocaleString()}</td>
                    <td><span className="trunc-mobile" title={d || ''}>{d || '—'}</span></td>
                    <td><span className="trunc-mobile" title={area || ''}>{area || '—'}</span></td>
                    <td><span className="trunc-mobile" title={media}>{media}</span></td>
                    <td><span className="trunc-mobile" title={r.username || ''}>{r.username || '—'}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="kpi-card">
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  )
}

function BarChart({ data }: { data: [string, number][] }) {
  const max = Math.max(1, ...data.map(([, v]) => v))
  return (
    <div className="bar-chart">
      {data.map(([label, value]) => {
        const widthPct = (value / max) * 100
        return (
          <div className="bar-row" key={label}>
            <div className="bar-label" title={label}>{label}</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${widthPct}%` }} />
            </div>
            <div className="bar-value">{value}</div>
          </div>
        )
      })}
    </div>
  )
}

function Sparkline({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(1, ...data)
  return (
    <div className="sparkline">
      {data.map((v, i) => {
        const h = (v / max) * 60
        return <div className="spark-col" key={i} title={`${labels[i]}: ${v}`} style={{ height: `${h}px` }} />
      })}
    </div>
  )
}

