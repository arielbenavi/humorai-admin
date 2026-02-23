'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, ChevronLeft, ChevronRight, Shield, FlaskConical, BookOpen } from 'lucide-react'

interface User {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  created_datetime_utc: string
  modified_datetime_utc: string | null
  is_superadmin: boolean
  is_in_study: boolean
  is_matrix_admin: boolean
}

interface UsersTableProps {
  users: User[]
  page: number
  totalPages: number
  search: string
  filter: string
  total: number
}

export default function UsersTable({
  users,
  page,
  totalPages,
  search,
  filter,
  total,
}: UsersTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(search)

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
    { value: 'all', label: 'All Users' },
    { value: 'superadmin', label: 'Superadmins' },
    { value: 'study', label: 'In Study' },
  ]

  return (
    <div className="space-y-4">
      {/* Search & filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email…"
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
        <div className="flex gap-2">
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
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Roles</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                    No users found
                  </td>
                </tr>
              )}
              {users.map((user) => {
                const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || '—'
                const initial = (user.first_name ?? user.email ?? '?').charAt(0).toUpperCase()
                return (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {initial}
                        </div>
                        <div>
                          <p className="text-sm text-white">{name}</p>
                          <p className="text-xs text-slate-500 font-mono">{user.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{user.email ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {user.is_superadmin && (
                          <span className="inline-flex items-center gap-1 text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        )}
                        {user.is_in_study && (
                          <span className="inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                            <FlaskConical className="w-3 h-3" /> Study
                          </span>
                        )}
                        {user.is_matrix_admin && (
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                            <BookOpen className="w-3 h-3" /> Matrix
                          </span>
                        )}
                        {!user.is_superadmin && !user.is_in_study && !user.is_matrix_admin && (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(user.created_datetime_utc).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {users.length} of {total} users
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => navigate({ search, filter, page: String(page - 1) })}
                className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-400">
                {page} / {totalPages}
              </span>
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
    </div>
  )
}
