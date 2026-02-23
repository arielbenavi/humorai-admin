'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, ChevronLeft, ChevronRight, Star, Globe, Lock, Heart, X } from 'lucide-react'

interface Caption {
  id: string
  content: string
  created_datetime_utc: string
  is_public: boolean
  is_featured: boolean
  like_count: number
  profile_id: string | null
  image_id: string | null
  humor_flavors: { slug: string } | null
}

interface CaptionsTableProps {
  captions: Caption[]
  page: number
  totalPages: number
  search: string
  filter: string
  total: number
}

const FLAVOR_COLORS: Record<string, string> = {
  dark: 'bg-red-500/20 text-red-400 border-red-500/20',
  sarcastic: 'bg-orange-500/20 text-orange-400 border-orange-500/20',
  wholesome: 'bg-green-500/20 text-green-400 border-green-500/20',
  absurdist: 'bg-pink-500/20 text-pink-400 border-pink-500/20',
  witty: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20',
  default: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
}

function getFlavorColor(slug: string) {
  for (const key of Object.keys(FLAVOR_COLORS)) {
    if (slug.includes(key)) return FLAVOR_COLORS[key]
  }
  return FLAVOR_COLORS.default
}

export default function CaptionsTable({
  captions,
  page,
  totalPages,
  search,
  filter,
  total,
}: CaptionsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(search)
  const [selected, setSelected] = useState<Caption | null>(null)

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
    { value: 'featured', label: 'Featured' },
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
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
              placeholder="Search caption text…"
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

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Caption</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-28">Flavor</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-20">Likes</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-24">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-28">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {captions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">
                    No captions found
                  </td>
                </tr>
              )}
              {captions.map((caption) => (
                <tr
                  key={caption.id}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  onClick={() => setSelected(caption)}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-200 line-clamp-2 max-w-md">{caption.content}</p>
                  </td>
                  <td className="px-4 py-3">
                    {caption.humor_flavors ? (
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${getFlavorColor(caption.humor_flavors.slug)}`}>
                        {caption.humor_flavors.slug.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-pink-400">
                      <Heart className="w-3 h-3" />
                      <span>{caption.like_count}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {caption.is_featured && (
                        <span className="inline-flex items-center gap-0.5 text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full border border-yellow-500/20">
                          <Star className="w-2.5 h-2.5" />
                        </span>
                      )}
                      {caption.is_public ? (
                        <span className="inline-flex items-center gap-0.5 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/20">
                          <Globe className="w-2.5 h-2.5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-xs bg-slate-500/20 text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-500/20">
                          <Lock className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {new Date(caption.created_datetime_utc).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {captions.length} of {total} captions
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
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-white">Caption Detail</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <p className="text-slate-200 text-sm leading-relaxed">{selected.content}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Humor Flavor</p>
                <p className="text-sm text-slate-300">
                  {selected.humor_flavors?.slug.replace(/_/g, ' ') ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Likes</p>
                <div className="flex items-center gap-1 text-pink-400">
                  <Heart className="w-3 h-3" />
                  <span className="text-sm">{selected.like_count}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Visibility</p>
                <span className={`text-sm ${selected.is_public ? 'text-green-400' : 'text-slate-400'}`}>
                  {selected.is_public ? 'Public' : 'Private'}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Featured</p>
                <span className={`text-sm ${selected.is_featured ? 'text-yellow-400' : 'text-slate-400'}`}>
                  {selected.is_featured ? '⭐ Yes' : 'No'}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Created</p>
                <p className="text-sm text-slate-300">
                  {new Date(selected.created_datetime_utc).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Caption ID</p>
                <p className="text-xs text-slate-400 font-mono">{selected.id.slice(0, 16)}…</p>
              </div>
            </div>

            {selected.image_id && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Image ID</p>
                <p className="text-xs text-slate-400 font-mono">{selected.image_id}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
