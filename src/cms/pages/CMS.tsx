import React, { useEffect, useState } from 'react'
import { useI18n } from '../lib/i18n'
import { uploadToBunny } from '../lib/bunny'
import { supabase } from '../../../services/supabaseClient'

type CmsForm = {
  name: string
  district: string
  block: string
  areaType: 'block' | 'ulb'
  ulb: string
  panchayath: string
  ward: string
  mediaType: 'image' | 'video' | 'story' | 'poem' | 'pdf'
  imageFile: File | null
  thumbFile: File | null
  videoFile: File | null
  storyImages: File[]
  pdfFile: File | null
}

export default function CMS() {
  const { t } = useI18n()
  const [form, setForm] = useState<CmsForm>({
    name: '',
    district: '',
    block: '',
    areaType: 'block',
    ulb: '',
    panchayath: '',
    ward: '',
    mediaType: 'image',
    imageFile: null,
    thumbFile: null,
    videoFile: null,
    storyImages: [],
    pdfFile: null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successVisible, setSuccessVisible] = useState(false)
  const [loadingUserMeta, setLoadingUserMeta] = useState(true)
  const [userMeta, setUserMeta] = useState<{ district: string; blockName: string | null } | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [districtToBlocks, setDistrictToBlocks] = useState<Record<string, string[]>>({})
  const [districtOptions, setDistrictOptions] = useState<string[]>([])
  const [blockOptions, setBlockOptions] = useState<string[]>([])
  const [blockToPanchayaths, setBlockToPanchayaths] = useState<Record<string, string[]>>({})
  const [panchayathOptions, setPanchayathOptions] = useState<string[]>([])
  const [districtToUlbs, setDistrictToUlbs] = useState<Record<string, { name: string; type: string }[]>>({})
  const [ulbOptions, setUlbOptions] = useState<{ name: string; type: string }[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [singleImagePreview, setSingleImagePreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [pdfPreview, setPdfPreview] = useState<string | null>(null)

  // Generate single image preview when image file changes
  useEffect(() => {
    if (form.imageFile) {
      const objectUrl = URL.createObjectURL(form.imageFile)
      setSingleImagePreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    } else {
      setSingleImagePreview(null)
    }
  }, [form.imageFile])

  // Generate video preview when video file changes
  useEffect(() => {
    if (form.videoFile) {
      const objectUrl = URL.createObjectURL(form.videoFile)
      setVideoPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    } else {
      setVideoPreview(null)
    }
  }, [form.videoFile])

  // Generate thumbnail preview when thumbnail file changes
  useEffect(() => {
    if (form.thumbFile) {
      const objectUrl = URL.createObjectURL(form.thumbFile)
      setThumbnailPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    } else {
      setThumbnailPreview(null)
    }
  }, [form.thumbFile])

  // Generate PDF preview when PDF file changes
  useEffect(() => {
    if (form.pdfFile) {
      const objectUrl = URL.createObjectURL(form.pdfFile)
      setPdfPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    } else {
      setPdfPreview(null)
    }
  }, [form.pdfFile])

  // Generate image previews when story images change
  useEffect(() => {
    let revoked: string[] = [];
    if (form.storyImages.length > 0) {
      const previews: string[] = form.storyImages.map((file) => {
        const objectUrl = URL.createObjectURL(file);
        revoked.push(objectUrl);
        return objectUrl;
      });
      setImagePreviews(previews);
    } else {
      setImagePreviews([]);
    }
    // Cleanup object URLs when component unmounts or images change
    return () => {
      revoked.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [form.storyImages]);

  // Function to reorder images
  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...form.storyImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setForm({ ...form, storyImages: newImages });
    // imagePreviews will update automatically via useEffect
  };

  // Function to remove an image
  const removeImage = (index: number) => {
    const newImages = form.storyImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setForm({ ...form, storyImages: newImages })
    setImagePreviews(newPreviews)
  }

  useEffect(() => {
    let isMounted = true
    async function loadUserMeta() {
      try {
        console.debug('[CMS] Loading user meta from CSV…')
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (userErr) throw userErr
        const email = userData.user?.email
        if (!email) throw new Error('Not signed in')
        const emailTrim = email.trim()
        const emailLower = emailTrim.toLowerCase()
        console.debug('[CMS] Auth user email:', emailTrim)
        setUsername(emailTrim)

        const superAdminEmail = (import.meta.env.VITE_SUPERADMIN_EMAIL as string | undefined)?.toLowerCase()
        const superAdmin = !!superAdminEmail && emailLower === superAdminEmail
        setIsSuperAdmin(superAdmin)

        const resp = await fetch('/block-username.csv', { cache: 'no-store' })
        if (!resp.ok) throw new Error(`Failed to load CSV: ${resp.status}`)
        const csvText = await resp.text()
        console.debug('[CMS] CSV length:', csvText.length)

        const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0)
        if (lines.length < 2) throw new Error('CSV has no data rows')
        const header = lines[0].split(',').map((h) => h.trim())
        const idxDistrict = header.indexOf('District')
        const idxBlock = header.indexOf('Block Name')
        const idxUsername = header.indexOf('username')
        if (idxDistrict === -1 || idxBlock === -1 || idxUsername === -1) {
          throw new Error('CSV header missing required columns')
        }

        // districtToBlocks will be built from panchayath.csv below

        // Load Panchayath list and build Block -> Panchayaths map
        const panchResp = await fetch('/panchayath.csv', { cache: 'no-store' })
        if (!panchResp.ok) throw new Error(`Failed to load Panchayath CSV: ${panchResp.status}`)
        const panchCsv = await panchResp.text()
        const pLines = panchCsv.split(/\r?\n/).filter((l) => l.trim().length > 0)
        if (pLines.length >= 2) {
          const pHeader = pLines[0].split(',').map((h) => h.trim())
          const idxPanch = pHeader.indexOf('Panchayaths')
          const idxBlockP = pHeader.indexOf('Block')
          const idxDistrictP = pHeader.indexOf('District')
          if (idxPanch !== -1 && idxBlockP !== -1 && idxDistrictP !== -1) {
            const b2p: Record<string, Set<string>> = {}
            const d2b: Record<string, Set<string>> = {}
            for (let i = 1; i < pLines.length; i++) {
              const row = pLines[i]
              const parts = row.split(',')
              if (parts.length < pHeader.length) continue
              const panch = (parts[idxPanch] || '').trim()
              const blk = (parts[idxBlockP] || '').trim()
              const dist = (parts[idxDistrictP] || '').trim()
              if (!panch || !blk) continue
              if (!b2p[blk]) b2p[blk] = new Set<string>()
              b2p[blk].add(panch)
              if (dist) {
                if (!d2b[dist]) d2b[dist] = new Set<string>()
                d2b[dist].add(blk)
              }
            }
            const b2pObj: Record<string, string[]> = {}
            Object.keys(b2p).forEach((b) => { b2pObj[b] = Array.from(b2p[b]).sort() })
            const d2bObj: Record<string, string[]> = {}
            Object.keys(d2b).forEach((d) => { d2bObj[d] = Array.from(d2b[d]).sort() })
            if (isMounted) {
              setBlockToPanchayaths(b2pObj)
              setDistrictToBlocks(d2bObj)
              setDistrictOptions(Object.keys(d2bObj).sort())
            }
          }
        }

        // Load ULB list and build District -> ULBs map
        const ulbResp = await fetch('/ulb.csv', { cache: 'no-store' })
        if (!ulbResp.ok) throw new Error(`Failed to load ULB CSV: ${ulbResp.status}`)
        const ulbCsv = await ulbResp.text()
        const uLines = ulbCsv.split(/\r?\n/).filter((l) => l.trim().length > 0)
        if (uLines.length >= 2) {
          const uHeader = uLines[0].split(',').map((h) => h.trim())
          const idxUlbName = uHeader.indexOf('ULB')
          const idxUlbType = uHeader.indexOf('ULB Type')
          const idxUlbDistrict = uHeader.indexOf('District')
          if (idxUlbName !== -1 && idxUlbType !== -1 && idxUlbDistrict !== -1) {
            const d2u: Record<string, { name: string; type: string }[]> = {}
            const ulbFolderToDistrictAndName: Record<string, { district: string; name: string }> = {}
            for (let i = 1; i < uLines.length; i++) {
              const row = uLines[i]
              const parts = row.split(',')
              if (parts.length < uHeader.length) continue
              const name = (parts[idxUlbName] || '').trim()
              const type = (parts[idxUlbType] || '').trim()
              const district = (parts[idxUlbDistrict] || '').trim()
              if (!name || !district) continue
              if (!d2u[district]) d2u[district] = []
              d2u[district].push({ name, type })
              // Build reverse lookup using folder normalization convention
              const folder = name
                .toLowerCase()
                .replace(/[^a-z0-9]/gi, '')
                .concat('ulb')
              ulbFolderToDistrictAndName[folder] = { district, name }
            }
            Object.keys(d2u).forEach((d) => { d2u[d].sort((a, b) => a.name.localeCompare(b.name)) })
            if (isMounted) setDistrictToUlbs(d2u)

            // If user is not super admin and appears to be a ULB login (local part ends with 'ulb'),
            // auto-detect district and ULB from email local-part.
            if (!superAdmin) {
              const localPart = emailLower.split('@')[0] || ''
              if (localPart.endsWith('ulb')) {
                const hit = ulbFolderToDistrictAndName[localPart]
                if (hit && isMounted) {
                  // Prefill district and ULB; mark area type as ULB
                  setUserMeta({ district: hit.district, blockName: null })
                  setForm((prev) => ({
                    ...prev,
                    district: hit.district,
                    areaType: 'ulb',
                    ulb: hit.name,
                  }))
                }
              }
            }
          }
        }

        // For non-super admin, locate user match and autofill
        let match: { districtName: string; blockName: string; username: string } | null = null
        if (!superAdmin) {
          for (let i = 1; i < lines.length; i++) {
            const row = lines[i]
            const parts = row.split(',')
            if (parts.length < header.length) continue
            const uname = (parts[idxUsername] || '').trim()
            if (!uname) continue
            if (uname.toLowerCase() === emailLower) {
              match = {
                districtName: (parts[idxDistrict] || '').trim(),
                blockName: (parts[idxBlock] || '').trim(),
                username: uname,
              }
              break
            }
          }
        }

        console.debug('[CMS] CSV match:', match)
        if (superAdmin) {
          console.debug('[CMS] Super admin detected; district/block will be selected manually')
        } else {
          // If block CSV match exists, use it; otherwise rely on ULB auto-detect (if it happened above)
          if (match) {
            const meta = { district: match.districtName, blockName: match.blockName }
            if (!isMounted) return
            setUserMeta(meta)
            setForm((prev) => ({ ...prev, district: meta.district || '', block: meta.blockName || '', areaType: (meta.blockName ? 'block' : 'ulb') }))
            console.debug('[CMS] Set userMeta and form.district from CSV:', meta)
          } else {
            // If neither block match nor ULB auto-detect populated district, warn and exit gracefully
            // Check via current form/userMeta state values that we set above
            // If district is still empty, log a warning
            if (!((userMeta?.district) || (typeof form.district === 'string' && form.district))) {
              console.warn('[CMS] No CSV row and no ULB auto-detect found for user')
              return
            }
          }
        }
      } catch (e: any) {
        if (!isMounted) return
        setError(e.message || 'Failed to load user details')
        console.error('[CMS] Failed to load user meta:', e)
      } finally {
        if (!isMounted) return
        setLoadingUserMeta(false)
        console.debug('[CMS] Finished loading user meta')
      }
    }
    loadUserMeta()
    return () => {
      isMounted = false
    }
  }, [])

  // Lock area type for normal users based on whether they have a block assignment
  useEffect(() => {
    if (isSuperAdmin) return
    const shouldBe: 'block' | 'ulb' = (userMeta?.blockName ? 'block' : 'ulb')
    if (form.areaType !== shouldBe) {
      setForm((prev) => ({ ...prev, areaType: shouldBe }))
    }
  }, [userMeta, isSuperAdmin])

  // Update Panchayath and ULB options when selections/maps change
  useEffect(() => {
    const currentBlock = (isSuperAdmin ? form.block : (userMeta?.blockName || '')) || ''
    const options = currentBlock ? (blockToPanchayaths[currentBlock] || []) : []
    setPanchayathOptions(options)
    // If current selected panchayath is not in options, clear it
    if (form.panchayath && options.length && !options.includes(form.panchayath)) {
      setForm((prev) => ({ ...prev, panchayath: '' }))
    }
    const currentDistrict = form.district || userMeta?.district || ''
    const ulbs = currentDistrict ? (districtToUlbs[currentDistrict] || []) : []
    setUlbOptions(ulbs)
    if (form.ulb && ulbs.length && !ulbs.some((u) => u.name === form.ulb)) {
      setForm((prev) => ({ ...prev, ulb: '' }))
    }
  }, [form.block, form.district, userMeta, isSuperAdmin, blockToPanchayaths, districtToUlbs])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      console.debug('[CMS] Submitting with form and userMeta:', { form, userMeta })
      if (isSuperAdmin) {
        if (!form.district) throw new Error('Please select a district')
        if (form.areaType === 'block' && !form.block) throw new Error('Please select a block')
        if (form.areaType === 'ulb' && !form.ulb) throw new Error('Please select a ULB')
      } else {
        if (!userMeta?.district) throw new Error('Your district is not set')
        if (form.areaType === 'ulb' && !form.ulb) throw new Error('Please select a ULB')
      }
      if (!form.name.trim()) throw new Error('Please enter your name')
      if (form.areaType === 'block' && !form.panchayath.trim()) throw new Error('Please select/enter Panchayath')
      if (!form.ward.trim()) throw new Error('Please enter Ward number')

      let imageUrl: string | null = null
      let thumbUrl: string | null = null
      let videoUrl: string | null = null
      let pdfUrl: string | null = null
      // Determine target location strings
      const currentDistrict = form.district || userMeta?.district || ''
      // For ULB area type, folder should be district/<municipalityname + 'ulb'> e.g., aluvaulb
      const ulbFolder = (form.areaType === 'ulb')
        ? (form.ulb || '')
            .toLowerCase()
            .replace(/[^a-z0-9]/gi, '')
            .concat('ulb')
        : (form.ulb || '')

      if (form.mediaType === 'image') {
        if (!form.imageFile) throw new Error('Please select an image')
        const targetBlockOrUlb = form.areaType === 'ulb' ? ulbFolder : (isSuperAdmin ? form.block : (userMeta?.blockName || ''))
        const uploaded = await uploadToBunny({ file: form.imageFile, district: currentDistrict, blockOrUlb: targetBlockOrUlb, areaType: form.areaType, panchayath: form.areaType === 'block' ? form.panchayath : undefined })
        imageUrl = uploaded.publicUrl
      } else if (form.mediaType === 'video') {
        if (!form.thumbFile) throw new Error('Please select a thumbnail image')
        if (!form.videoFile) throw new Error('Please select a video')
        const targetBlockOrUlb = form.areaType === 'ulb' ? ulbFolder : (isSuperAdmin ? form.block : (userMeta?.blockName || ''))
        const upThumb = await uploadToBunny({ file: form.thumbFile, district: currentDistrict, blockOrUlb: targetBlockOrUlb, areaType: form.areaType, panchayath: form.areaType === 'block' ? form.panchayath : undefined })
        const upVideo = await uploadToBunny({ file: form.videoFile, district: currentDistrict, blockOrUlb: targetBlockOrUlb, areaType: form.areaType, panchayath: form.areaType === 'block' ? form.panchayath : undefined })
        thumbUrl = upThumb.publicUrl
        videoUrl = upVideo.publicUrl
      } else if (form.mediaType === 'story' || form.mediaType === 'poem') {
        if (form.storyImages.length === 0) throw new Error('Please upload at least one image for your story or poem')
        // For story/poem, we'll store only images in metadata
        // Multiple images will be handled in metadata preparation below
      } else if (form.mediaType === 'pdf') {
        if (!form.pdfFile) throw new Error('Please select a PDF file')
        const targetBlockOrUlb = form.areaType === 'ulb' ? ulbFolder : (isSuperAdmin ? form.block : (userMeta?.blockName || ''))
        const uploaded = await uploadToBunny({ file: form.pdfFile, district: currentDistrict, blockOrUlb: targetBlockOrUlb, areaType: form.areaType, panchayath: form.areaType === 'block' ? form.panchayath : undefined })
        pdfUrl = uploaded.publicUrl
      }

      // Prepare story images metadata
      let storyImagesMetadata: { page: number; url: string; filename: string }[] | undefined
      if ((form.mediaType === 'story' || form.mediaType === 'poem') && form.storyImages.length > 0) {
        console.debug('[CMS] Uploading story/poem images:', form.storyImages.length)
        const targetBlockOrUlb = form.areaType === 'ulb' ? ulbFolder : (isSuperAdmin ? form.block : (userMeta?.blockName || ''))
        storyImagesMetadata = []
        for (let i = 0; i < form.storyImages.length; i++) {
          console.debug(`[CMS] Uploading image ${i + 1}/${form.storyImages.length}:`, form.storyImages[i].name)
          const uploaded = await uploadToBunny({ 
            file: form.storyImages[i], 
            district: currentDistrict, 
            blockOrUlb: targetBlockOrUlb, 
            areaType: form.areaType, 
            panchayath: form.areaType === 'block' ? form.panchayath : undefined 
          })
          console.debug(`[CMS] Image ${i + 1} uploaded successfully:`, uploaded.publicUrl)
          storyImagesMetadata.push({
            page: i + 1,
            url: uploaded.publicUrl,
            filename: form.storyImages[i].name
          })
          // Use first image as main image
          if (i === 0) {
            imageUrl = uploaded.publicUrl
          }
        }
        console.debug('[CMS] All story/poem images uploaded successfully')
      }

      const metadata = {
        name: form.name,
        district: form.district,
        block: form.block,
        panchayath: form.panchayath,
        ward: form.ward,
        mediaType: form.mediaType,
        imageUrl: imageUrl ?? undefined,
        thumbnailUrl: thumbUrl ?? undefined,
        videoUrl: videoUrl ?? undefined,
        pdfUrl: pdfUrl ?? undefined,
        storyText: undefined,
        storyLanguage: undefined,
        storyImages: storyImagesMetadata,
        createdAt: new Date().toISOString(),
      }

      // Save metadata to DB
      const finalDistrict = currentDistrict
      const finalBlockOrUlb = form.areaType === 'ulb' ? ulbFolder : (form.block || userMeta?.blockName || '')
      const finalPanchayath = form.areaType === 'ulb' ? '' : (form.panchayath || '')
      // Add ULB info in metadata for clarity
      const metadataWithUlb = {
        ...metadata,
        ulb: form.areaType === 'ulb' ? (form.ulb || '') : undefined,
        ulbFolder: form.areaType === 'ulb' ? finalBlockOrUlb : undefined,
        areaType: form.areaType,
      }
      const dbPayload = { metadata: metadataWithUlb, district: finalDistrict, username, block_ulb: finalBlockOrUlb, panchayath: finalPanchayath }
      console.debug('[CMS] Inserting metadata row:', dbPayload)
      const { error: dbInsertError } = await supabase
        .from('metadata')
        .insert(dbPayload)
      if (dbInsertError) throw new Error(dbInsertError.message || 'Failed to save metadata to DB')

      console.debug('[CMS] Upload and DB insert succeeded for media type:', form.mediaType)
      
      // Reset form after successful upload, but preserve location and areaType selections
      setForm((prev) => ({
        ...prev,
        name: '',
        ward: '',
        mediaType: 'image',
        imageFile: null,
        thumbFile: null,
        videoFile: null,
        storyImages: [],
        // For block users, require panchayath selection again; irrelevant for ULB
        panchayath: prev.areaType === 'block' ? '' : '',
      }))
      
      setSuccessVisible(true)
      console.debug('[CMS] Success popup should be visible now')
      setTimeout(() => {
        setSuccessVisible(false)
        console.debug('[CMS] Success popup hidden')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
      console.error('[CMS] Submit failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container cms-page">
      <h1 className="title">{t('cms_title')}</h1>
      <p className="subtitle">{t('cms_subtitle')}</p>

      <form className="cms-form" onSubmit={handleSubmit}>
        {isSuperAdmin ? (
          <>
            <label className="field half">
              <span>District</span>
              <select
                required
                value={form.district}
                onChange={(e) => {
                  const nextDistrict = e.target.value
                  const nextBlocks = districtToBlocks[nextDistrict] || []
                  setForm({ ...form, district: nextDistrict, block: '', ulb: '' })
                  setBlockOptions(nextBlocks)
                }}
              >
                <option value="" disabled>Select District</option>
                {districtOptions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="field half">
              <span>Area Type</span>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'inline-flex', gap: '.5rem', alignItems: 'center' }}>
                  <input type="radio" name="areaType" checked={form.areaType === 'block'} onChange={() => setForm({ ...form, areaType: 'block', ulb: '' })} />
                  Block / Panchayath
                </label>
                <label style={{ display: 'inline-flex', gap: '.5rem', alignItems: 'center' }}>
                  <input type="radio" name="areaType" checked={form.areaType === 'ulb'} onChange={() => setForm({ ...form, areaType: 'ulb', block: '', panchayath: '' })} />
                  Urban Local Body (ULB)
                </label>
              </div>
            </label>
            {form.areaType === 'block' ? (
              <label className="field half">
                <span>Block</span>
                <select
                  required
                  value={form.block}
                  onChange={(e) => setForm({ ...form, block: e.target.value, panchayath: '' })}
                  disabled={!form.district}
                >
                  <option value="" disabled>{form.district ? 'Select Block' : 'Select District first'}</option>
                  {blockOptions.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="field half">
                <span>Municipality / Corporation</span>
                <select
                  required
                  value={form.ulb}
                  onChange={(e) => setForm({ ...form, ulb: e.target.value })}
                  disabled={!form.district}
                >
                  <option value="" disabled>{form.district ? 'Select ULB' : 'Select District first'}</option>
                  {ulbOptions.map((u) => (
                    <option key={u.name} value={u.name}>{u.name} ({u.type})</option>
                  ))}
                </select>
              </label>
            )}
          </>
        ) : (
          <>
            <label className="field half">
              <span>District</span>
              <input
                type="text"
                value={userMeta?.district ?? ''}
                disabled
                placeholder={loadingUserMeta ? 'Loading…' : 'District not set'}
              />
            </label>
            <label className="field half">
              <span>Area Type</span>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'inline-flex', gap: '.5rem', alignItems: 'center' }}>
                  <input type="radio" name="areaType_locked" checked={form.areaType === 'block'} disabled />
                  Block / Panchayath
                </label>
                <label style={{ display: 'inline-flex', gap: '.5rem', alignItems: 'center' }}>
                  <input type="radio" name="areaType_locked" checked={form.areaType === 'ulb'} disabled />
                  Urban Local Body (ULB)
                </label>
              </div>
            </label>
            <label className="field half">
              <span>{form.areaType === 'block' ? 'Block' : 'Municipality / Corporation'}</span>
              {form.areaType === 'block' ? (
                <input
                  type="text"
                  value={userMeta?.blockName ?? ''}
                  disabled
                  placeholder={loadingUserMeta ? 'Loading…' : '—'}
                />
              ) : (
                <select
                  required
                  value={form.ulb}
                  onChange={(e) => setForm({ ...form, ulb: e.target.value })}
                  disabled={!userMeta?.district || (!!userMeta && !userMeta.blockName)}
                >
                  <option value="" disabled>{userMeta?.district ? 'Select ULB' : 'District not set'}</option>
                  {ulbOptions.map((u) => (
                    <option key={u.name} value={u.name}>{u.name} ({u.type})</option>
                  ))}
                </select>
              )}
            </label>
          </>
        )}
        {form.areaType === 'block' && (
          <label className="field half">
            <span>Panchayath</span>
            <select
              required
              value={form.panchayath}
              onChange={(e) => setForm({ ...form, panchayath: e.target.value })}
              disabled={panchayathOptions.length === 0}
            >
              <option value="" disabled>{panchayathOptions.length ? 'Select Panchayath' : 'Select Block first'}</option>
              {panchayathOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
        )}
        
        <label className="field half">
          <span>Ward</span>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            value={form.ward}
            onChange={(e) => setForm({ ...form, ward: e.target.value.replace(/[^0-9]/g, '') })}
            placeholder="Ward number"
          />
        </label>
        <label className="field half">
          <span>Name</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
          />
        </label>
        <label className="field">
          <span>{t('cms_media_type')}</span>
          <div className="media-type-options" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <label style={{ display: 'inline-flex', gap: '.5rem', alignItems: 'center' }}>
              <input type="radio" name="mediaType" checked={form.mediaType === 'image'} onChange={() => setForm({ ...form, mediaType: 'image', thumbFile: null, videoFile: null })} />
              {t('cms_image')}
            </label>
            <label style={{ display: 'inline-flex', gap: '.5rem', alignItems: 'center' }}>
              <input type="radio" name="mediaType" checked={form.mediaType === 'video'} onChange={() => setForm({ ...form, mediaType: 'video', imageFile: null })} />
              {t('cms_video')}
            </label>
            <label style={{ display: 'inline-flex', gap: '.5rem', alignItems: 'center' }}>
              <input type="radio" name="mediaType" checked={form.mediaType === 'story'} onChange={() => setForm({ ...form, mediaType: 'story', imageFile: null, thumbFile: null, videoFile: null, storyImages: [] })} />
              {t('cms_story')}
            </label>
            <label style={{ display: 'inline-flex', gap: '.5rem', alignItems: 'center' }}>
              <input type="radio" name="mediaType" checked={form.mediaType === 'poem'} onChange={() => setForm({ ...form, mediaType: 'poem', imageFile: null, thumbFile: null, videoFile: null, storyImages: [], pdfFile: null })} />
              {t('cms_poem')}
            </label>
            <label style={{ display: 'inline-flex', gap: '.5rem', alignItems: 'center' }}>
              <input type="radio" name="mediaType" checked={form.mediaType === 'pdf'} onChange={() => setForm({ ...form, mediaType: 'pdf', imageFile: null, thumbFile: null, videoFile: null, storyImages: [] })} />
              PDF
            </label>
          </div>
        </label>
        {form.mediaType === 'image' ? (
          <label className="field">
            <span>{t('cms_image')}</span>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] ?? null })}
            />
            {singleImagePreview && (
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                  Selected Image:
                </p>
                <div style={{ 
                  position: 'relative',
                  background: 'var(--glass-bg)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: 'var(--glass-shadow)',
                  maxWidth: '300px'
                }}>
                  <img 
                    src={singleImagePreview} 
                    alt="Selected image"
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      console.error('Image preview failed to load')
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div style={{ padding: '0.5rem' }}>
                    <p style={{ 
                      margin: '0', 
                      fontSize: '0.8rem', 
                      color: 'var(--color-muted)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {form.imageFile?.name}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </label>
        ) : form.mediaType === 'video' ? (
          <>
            <label className="field">
              <span>{t('cms_thumbnail')}</span>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setForm({ ...form, thumbFile: e.target.files?.[0] ?? null })}
              />
              {thumbnailPreview && (
                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                    Selected Thumbnail:
                  </p>
                  <div style={{ 
                    position: 'relative',
                    background: 'var(--glass-bg)', 
                    border: '1px solid var(--glass-border)', 
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: 'var(--glass-shadow)',
                    maxWidth: '300px'
                  }}>
                    <img 
                      src={thumbnailPreview} 
                      alt="Selected thumbnail"
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => {
                        console.error('Thumbnail preview failed to load')
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <div style={{ padding: '0.5rem' }}>
                      <p style={{ 
                        margin: '0', 
                        fontSize: '0.8rem', 
                        color: 'var(--color-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {form.thumbFile?.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </label>
            <label className="field">
              <span>{t('cms_video')}</span>
              <input
                type="file"
                accept="video/*"
                required
                onChange={(e) => setForm({ ...form, videoFile: e.target.files?.[0] ?? null })}
              />
              {videoPreview && (
                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                    Selected Video:
                  </p>
                  <div style={{ 
                    position: 'relative',
                    background: 'var(--glass-bg)', 
                    border: '1px solid var(--glass-border)', 
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: 'var(--glass-shadow)',
                    maxWidth: '300px'
                  }}>
                    <video 
                      src={videoPreview} 
                      controls
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => {
                        console.error('Video preview failed to load')
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <div style={{ padding: '0.5rem' }}>
                      <p style={{ 
                        margin: '0', 
                        fontSize: '0.8rem', 
                        color: 'var(--color-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {form.videoFile?.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </label>
          </>
        ) : (form.mediaType === 'story' || form.mediaType === 'poem') ? (
          <label className="field">
            <span>{form.mediaType === 'story' ? t('cms_story_images') : t('cms_poem_images')}</span>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', margin: '0.25rem 0 0.5rem 0' }}>
              {form.mediaType === 'story' ? t('cms_story_images_help') : t('cms_poem_images_help')}
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              required
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                setForm({ ...form, storyImages: files })
              }}
            />
            {form.storyImages.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                  Selected Images ({form.storyImages.length}) - Drag to reorder:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {form.storyImages.map((file, index) => (
                    <div key={index} style={{ 
                      position: 'relative',
                      background: 'var(--glass-bg)', 
                      border: '1px solid var(--glass-border)', 
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: 'var(--glass-shadow)'
                    }}>
                      {/* Page number badge */}
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        left: '0.5rem',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        zIndex: 1
                      }}>
                        {t('cms_page')} {index + 1}
                      </div>
                      
                      {/* Image preview */}
                      {imagePreviews[index] ? (
                        <img 
                          key={`preview-${index}-${form.storyImages[index]?.name || ''}`}
                          src={imagePreviews[index]} 
                          alt={`Page ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                          onError={(e) => {
                            console.error('Image preview failed to load:', imagePreviews[index])
                            // Hide the image if it fails to load
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '150px',
                          background: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#64748b',
                          fontSize: '0.8rem'
                        }}>
                          Loading preview...
                        </div>
                      )}
                      
                      {/* Filename */}
                      <div style={{ padding: '0.5rem' }}>
                        <p style={{ 
                          margin: '0', 
                          fontSize: '0.8rem', 
                          color: 'var(--color-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {file.name}
                        </p>
                      </div>
                      
                      {/* Controls */}
                      <div style={{ 
                        position: 'absolute', 
                        top: '0.5rem', 
                        right: '0.5rem', 
                        display: 'flex', 
                        gap: '0.25rem',
                        zIndex: 1
                      }}>
                        {/* Move up button */}
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => reorderImages(index, index - 1)}
                            style={{
                              background: 'rgba(0, 0, 0, 0.7)',
                              border: 'none',
                              color: 'white',
                              borderRadius: '4px',
                              padding: '0.25rem',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '24px',
                              height: '24px'
                            }}
                            title="Move up"
                          >
                            ↑
                          </button>
                        )}
                        
                        {/* Move down button */}
                        {index < form.storyImages.length - 1 && (
                          <button
                            type="button"
                            onClick={() => reorderImages(index, index + 1)}
                            style={{
                              background: 'rgba(0, 0, 0, 0.7)',
                              border: 'none',
                              color: 'white',
                              borderRadius: '4px',
                              padding: '0.25rem',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '24px',
                              height: '24px'
                            }}
                            title="Move down"
                          >
                            ↓
                          </button>
                        )}
                        
                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          style={{
                            background: 'rgba(185, 28, 28, 0.8)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '4px',
                            padding: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px'
                          }}
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </label>
        ) : form.mediaType === 'pdf' ? (
          <label className="field">
            <span>PDF File</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Remember: The display name will be the same as the pdf file name</span>
            <input
              type="file"
              accept="application/pdf"
              required
              onChange={(e) => setForm({ ...form, pdfFile: e.target.files?.[0] ?? null })}
            />
            {pdfPreview && (
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                  Selected PDF:
                </p>
                <div style={{ 
                  position: 'relative',
                  background: 'var(--glass-bg)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: 'var(--glass-shadow)',
                  maxWidth: '300px'
                }}>
                  <iframe 
                    src={pdfPreview} 
                    title="PDF preview"
                    style={{
                      width: '100%',
                      height: '200px',
                      border: 'none',
                      display: 'block'
                    }}
                    onError={(e) => {
                      console.error('PDF preview failed to load')
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div style={{ padding: '0.5rem' }}>
                    <p style={{ 
                      margin: '0', 
                      fontSize: '0.8rem', 
                      color: 'var(--color-muted)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {form.pdfFile?.name}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </label>
        ) : null}

        {error && <div className="error">{error}</div>}
        {successVisible && (
          <div className="toast success show center big" role="status" aria-live="polite">
            <span className="toast-icon" aria-hidden="true">✓</span>
            <span>
              {form.mediaType === 'story' ? 'Story published successfully!' :
               form.mediaType === 'poem' ? 'Poem published successfully!' :
               form.mediaType === 'video' ? 'Video published successfully!' :
               'Image published successfully!'}
            </span>
          </div>
        )}

        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? t('cms_uploading') : t('cms_publish')}
        </button>
      </form>
    </div>
  )
}


