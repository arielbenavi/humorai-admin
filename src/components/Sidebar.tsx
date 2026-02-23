'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Users, Image, MessageSquare, LogOut, Laugh,
  FileText, Sparkles, Blend, Bot, KeyRound, Link2, Brain,
  FlaskConical, Mail, Globe, ChevronRight,
} from 'lucide-react'

interface SidebarProps {
  user: { name: string; email: string }
}

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/images', label: 'Images', icon: Image },
      { href: '/captions', label: 'Captions', icon: MessageSquare },
      { href: '/caption-requests', label: 'Caption Requests', icon: Link2 },
      { href: '/caption-examples', label: 'Caption Examples', icon: FileText },
      { href: '/terms', label: 'Terms', icon: Brain },
    ],
  },
  {
    label: 'Humor Engine',
    items: [
      { href: '/humor-flavors', label: 'Humor Flavors', icon: Sparkles },
      { href: '/humor-mix', label: 'Humor Mix', icon: Blend },
    ],
  },
  {
    label: 'AI / LLM',
    items: [
      { href: '/llm/providers', label: 'LLM Providers', icon: Bot },
      { href: '/llm/models', label: 'LLM Models', icon: FlaskConical },
      { href: '/llm/prompt-chains', label: 'Prompt Chains', icon: Link2 },
      { href: '/llm/responses', label: 'LLM Responses', icon: MessageSquare },
    ],
  },
  {
    label: 'Users & Access',
    items: [
      { href: '/users', label: 'Users', icon: Users },
      { href: '/access/signup-domains', label: 'Signup Domains', icon: Globe },
      { href: '/access/whitelist', label: 'Whitelist Emails', icon: Mail },
      { href: '/access/invitations', label: 'Invitations', icon: KeyRound },
    ],
  },
]

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-purple-500/20 border border-purple-400/30 rounded-lg flex items-center justify-center">
            <Laugh className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div>
            <span className="font-bold text-white text-xs">HumorAI</span>
            <span className="block text-xs text-slate-500">Admin Panel</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-4 py-3">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{label}</span>
                    {isActive && <ChevronRight className="w-3 h-3 ml-auto shrink-0 opacity-60" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-2 border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 mb-0.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
