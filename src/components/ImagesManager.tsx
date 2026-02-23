'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import NextImage from 'next/image'
import Modal from './Modal'
import { createImage, updateImage, deleteImage } from '@/lib/actions/images'
import { Search, ChevronLeft, ChevronRight, Globe, Lock, Package, Plus, Pencil, Trash2 } from 'lucide-react'

interface ImageRecord {
  id: string
  url: string | null
  created_datetime_utc: string
  is_public: boolean
  is_common_use: boolean
  additional_context: string | null
  image_description: string | null
}

interface Props {
  images: ImageRecord[]
  page: number
  totalPages: number
  search: string
  filter: string
  total: number
}

type ModalMode = 'create' | 'edit' | null

const blankForm = { url: '', is_public: true, is_common_use: false, additional_context: '', image_description: '' }

export default function ImagesManager({ images, page, totalPages, search, filter, total }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(search)
  const [mode, setMode] = useState<ModalMode>(null)
  const [editing, setEditing] = useState<ImageRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [previewImg, setPreviewImg] = useState<ImageRecord | null>(null)

  const navigate = (params: Record<string, string>) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set('search', params.search)
    if (params.filter && params.filter !== 'all') sp.set('filter', params.filter)
    if (params.page && params.page !== '1') sp.set('page', params.page)
    startTransition(() => router.push(`${pathname}?${sp.toString()}`))
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); navigate({ search: searchInput, filter, page: '1' }) }

  const openCreate = () => { setEditing(null); setError(null); setMode('create') }
  const openEdit = (img: ImageRecord) => { setEditing(img); setError(null); setMode('edit') }
  const closeModal = () => { setMode(null); setEditing(null); setError(null) }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = mode === 'create' ? await createImage(formData) : await updateImage(formData)
    setSubmitting(false)
    if (result.error) { setError(result.error) } else { closeModal(); router.refresh() }
  }

  const handleDelete = async (img: ImageRecord) => {
    if (!confirm(`Delete this image? This may fail if captions reference it.`)) return
    const result = await deleteImage(img.id)
    if (result.error) alert(result.error)
    else router.refresh()
  }

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
    { value: 'common_use', label: 'Common Use' },
  ]

  const FormFields = ({ data }: { data: ImageRecord | null }) => (
    <>
      {data && <input type="hidden" name="id" value={data.id} />}
      <div>
        <label className="block text-xs text-slate-400 mb-1">Image URL</label>
        <input name="url" defaultValue={data?.url ?? ''} placeholder="https://…" className="input-field" />
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-1">Upload File (optional — requires &apos;images&apos; storage bucket)</label>
        <input type="file" name="file" accept="image/*" className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-800 file:text-slate-300 file:cursor-pointer w-full" />
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-1">Image Description</label>
        <textarea name="image_description" defaultValue={data?.image_description ?? ''} rows={2} className="input-field" />
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-1">Additional Context</label>
        <input name="additional_context" defaultValue={data?.additional_context ?? ''} className="input-field" />
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input type="checkbox" name="is_public" value="true" defaultChecked={data?.is_public ?? true} className="accent-purple-500" />
          Public
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input type="checkbox" name="is_common_use" value="true" defaultChecked={data?.is_common_use ?? false} className="accent-purple-500" />
          Common Use
        </label>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button type="submit" disabled={submitting} className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors">
        {submitting ? 'Saving…' : mode === 'create' ? 'Create Image' : 'Save Changes'}
      </button>
    </>
  )

  return (
    <div className="space-y-4">
      <style>{`.input-field { width: 100%; background: #0f172a; border: 1px solid #334155; border-radius: 0.5rem; padding: 0.5rem 0.75rem; color: white; font-size: 0.875rem; outline: none; } .input-field:focus { border-color: #a855f7; }`}</style>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search description…" className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
          </div>
          <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg">Search</button>
        </form>
        <div className="flex gap-2 flex-wrap">
          {filterOptions.map((opt) => (
            <button key={opt.value} onClick={() => navigate({ search, filter: opt.value, page: '1' })}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors ${filter === opt.value ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
              {opt.label}
            </button>
          ))}
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Image
          </button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center"><p className="text-slate-500">No images found</p></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all">
              <button onClick={() => setPreviewImg(img)} className="absolute inset-0 w-full h-full">
                {img.url ? (
                  <NextImage src={img.url} alt={img.image_description ?? 'Image'} fill className="object-cover" sizes="20vw" unoptimized />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                    <Package className="w-6 h-6" />
                  </div>
                )}
              </button>
              {/* Badges */}
              <div className="absolute top-1.5 left-1.5 flex gap-1 pointer-events-none">
                {img.is_public
                  ? <span className="w-3.5 h-3.5 bg-green-500/80 rounded-full flex items-center justify-center"><Globe className="w-2 h-2 text-white" /></span>
                  : <span className="w-3.5 h-3.5 bg-slate-500/80 rounded-full flex items-center justify-center"><Lock className="w-2 h-2 text-white" /></span>
                }
                {img.is_common_use && <span className="w-3.5 h-3.5 bg-blue-500/80 rounded-full flex items-center justify-center"><Package className="w-2 h-2 text-white" /></span>}
              </div>
              {/* Action overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2 gap-2">
                <button onClick={(e) => { e.stopPropagation(); openEdit(img) }} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors">
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(img) }} className="p-1.5 bg-red-900/80 hover:bg-red-800 rounded-lg text-red-400 hover:text-red-300 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">Showing {images.length} of {total} images</p>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => navigate({ search, filter, page: String(page - 1) })}
              className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => navigate({ search, filter, page: String(page + 1) })}
              className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal open={mode !== null} onClose={closeModal} title={mode === 'create' ? 'Add Image' : 'Edit Image'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormFields data={editing} />
        </form>
      </Modal>

      {/* Preview modal */}
      {previewImg && (
        <Modal open={!!previewImg} onClose={() => setPreviewImg(null)} title="Image Detail">
          {previewImg.url && (
            <div className="relative h-56 bg-slate-950 rounded-lg overflow-hidden -mx-5 -mt-5 mb-4">
              <NextImage src={previewImg.url} alt="" fill className="object-contain" sizes="512px" unoptimized />
            </div>
          )}
          <div className="space-y-3">
            <InfoRow label="URL" value={previewImg.url ?? '—'} mono />
            <InfoRow label="Description" value={previewImg.image_description ?? '—'} />
            <InfoRow label="Context" value={previewImg.additional_context ?? '—'} />
            <InfoRow label="Public" value={previewImg.is_public ? 'Yes' : 'No'} />
            <InfoRow label="Common Use" value={previewImg.is_common_use ? 'Yes' : 'No'} />
            <InfoRow label="Created" value={new Date(previewImg.created_datetime_utc).toLocaleString()} />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => { setPreviewImg(null); openEdit(previewImg) }} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg">Edit</button>
            <button onClick={() => { setPreviewImg(null); handleDelete(previewImg) }} className="py-2 px-4 bg-red-900/60 hover:bg-red-800/60 text-red-400 text-sm rounded-lg">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className={`text-sm text-slate-300 break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  )
}
