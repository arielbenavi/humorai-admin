'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, ChevronLeft, ChevronRight, Globe, Lock, Package } from 'lucide-react'
import Image from 'next/image'

interface ImageRecord {
  id: string
  url: string | null
  created_datetime_utc: string
  is_public: boolean
  is_common_use: boolean
  additional_context: string | null
  image_description: string | null
  profile_id: string | null
}

interface ImagesGridProps {
  images: ImageRecord[]
  page: number
  totalPages: number
  search: string
  filter: string
  total: number
}

export default function ImagesGrid({
  images,
  page,
  totalPages,
  search,
  filter,
  total,
}: ImagesGridProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(search)
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null)

  const navigate = (params: Record<string, string>) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set('search', params.search)
    if (params.filter && params.filter !== 'all') sp.set('filter', params.filter)
    if (params.page && params.page !== '1') sp.set('page', params.page)
    startTransition(() => {
      router.push(`${pathname}?${sp.toString()}`)
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate({ search: searchInput, filter, page: '1' })
  }

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
    { value: 'common_use', label: 'Common Use' },
  ]

  return (
    <div className="space-y-4">
      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by description or context…"
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
          >
            Search
          </button>
        </form>
        <div className="flex gap-2 flex-wrap">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => navigate({ search, filter: opt.value, page: '1' })}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                filter === opt.value
                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {images.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-slate-500">No images found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelectedImage(img)}
              className="group relative aspect-square bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all"
            >
              {img.url ? (
                <Image
                  src={img.url}
                  alt={img.image_description ?? 'Image'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 16vw"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {/* Badges */}
              <div className="absolute top-1.5 left-1.5 flex gap-1">
                {img.is_public ? (
                  <span className="w-4 h-4 bg-green-500/80 rounded-full flex items-center justify-center">
                    <Globe className="w-2.5 h-2.5 text-white" />
                  </span>
                ) : (
                  <span className="w-4 h-4 bg-slate-500/80 rounded-full flex items-center justify-center">
                    <Lock className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
                {img.is_common_use && (
                  <span className="w-4 h-4 bg-blue-500/80 rounded-full flex items-center justify-center">
                    <Package className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {images.length} of {total} images
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => navigate({ search, filter, page: String(page - 1) })}
              className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => navigate({ search, filter, page: String(page + 1) })}
              className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedImage.url && (
              <div className="relative h-64 bg-slate-950">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.image_description ?? 'Image'}
                  fill
                  className="object-contain"
                  sizes="512px"
                  unoptimized
                />
              </div>
            )}
            <div className="p-5 space-y-3">
              <div className="flex gap-2">
                {selectedImage.is_public && (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                    <Globe className="w-3 h-3" /> Public
                  </span>
                )}
                {!selectedImage.is_public && (
                  <span className="inline-flex items-center gap-1 text-xs bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded-full border border-slate-500/20">
                    <Lock className="w-3 h-3" /> Private
                  </span>
                )}
                {selectedImage.is_common_use && (
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                    <Package className="w-3 h-3" /> Common Use
                  </span>
                )}
              </div>
              {selectedImage.image_description && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Description</p>
                  <p className="text-sm text-slate-300">{selectedImage.image_description}</p>
                </div>
              )}
              {selectedImage.additional_context && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Additional Context</p>
                  <p className="text-sm text-slate-300">{selectedImage.additional_context}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500 mb-1">ID</p>
                <p className="text-xs text-slate-400 font-mono">{selectedImage.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Created</p>
                <p className="text-sm text-slate-400">
                  {new Date(selectedImage.created_datetime_utc).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors mt-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
