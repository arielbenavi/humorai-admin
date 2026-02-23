import { createClient } from '@/lib/supabase/server'
import DashboardCharts from '@/components/DashboardCharts'
import { Users, Image, MessageSquare, ThumbsUp, Star, TrendingUp } from 'lucide-react'

async function getDashboardData() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: totalImages },
    { count: totalCaptions },
    { count: totalVotes },
    { count: featuredCaptions },
    { data: captionsPerDay },
    { data: topCaptions },
    { data: humorFlavors },
    { data: voteDistribution },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('images').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }),
    supabase.from('caption_votes').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }).eq('is_featured', true),
    // Captions per day (last 14 days)
    supabase
      .from('captions')
      .select('created_datetime_utc')
      .gte('created_datetime_utc', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_datetime_utc', { ascending: true }),
    // Top voted captions
    supabase
      .from('captions')
      .select('id, content, like_count')
      .order('like_count', { ascending: false })
      .limit(5),
    // Humor flavors
    supabase
      .from('humor_flavors')
      .select('id, slug, description'),
    // Vote distribution (sample)
    supabase
      .from('caption_votes')
      .select('vote_value')
      .limit(2000),
    // Recent users
    supabase
      .from('profiles')
      .select('id, first_name, last_name, email, created_datetime_utc, is_superadmin')
      .order('created_datetime_utc', { ascending: false })
      .limit(5),
  ])

  // Process captions per day
  const dayMap: Record<string, number> = {}
  const now = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    dayMap[key] = 0
  }
  if (captionsPerDay) {
    for (const c of captionsPerDay as Array<{ created_datetime_utc: string }>) {
      const key = c.created_datetime_utc.split('T')[0]
      if (dayMap[key] !== undefined) {
        dayMap[key]++
      }
    }
  }
  const captionTrend = Object.entries(dayMap).map(([date, count]) => ({
    date: date.slice(5), // MM-DD
    count,
  }))

  // Vote distribution
  const upvotes = voteDistribution?.filter((v: { vote_value: number }) => v.vote_value > 0).length ?? 0
  const downvotes = voteDistribution?.filter((v: { vote_value: number }) => v.vote_value < 0).length ?? 0

  return {
    stats: {
      totalUsers: totalUsers ?? 0,
      totalImages: totalImages ?? 0,
      totalCaptions: totalCaptions ?? 0,
      totalVotes: totalVotes ?? 0,
      featuredCaptions: featuredCaptions ?? 0,
    },
    captionTrend,
    topCaptions: topCaptions ?? [],
    humorFlavors: humorFlavors ?? [],
    voteDistribution: { upvotes, downvotes },
    recentUsers: recentUsers ?? [],
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
  sub?: string
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of HumorAI platform metrics</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          label="Total Users"
          value={data.stats.totalUsers}
          icon={Users}
          color="bg-blue-500/15 text-blue-400"
        />
        <StatCard
          label="Total Images"
          value={data.stats.totalImages}
          icon={Image}
          color="bg-green-500/15 text-green-400"
        />
        <StatCard
          label="Total Captions"
          value={data.stats.totalCaptions}
          icon={MessageSquare}
          color="bg-purple-500/15 text-purple-400"
        />
        <StatCard
          label="Total Votes"
          value={data.stats.totalVotes}
          icon={ThumbsUp}
          color="bg-orange-500/15 text-orange-400"
        />
        <StatCard
          label="Featured"
          value={data.stats.featuredCaptions}
          icon={Star}
          color="bg-yellow-500/15 text-yellow-400"
          sub="captions"
        />
      </div>

      {/* Charts */}
      <DashboardCharts
        captionTrend={data.captionTrend}
        voteDistribution={data.voteDistribution}
        humorFlavors={data.humorFlavors}
      />

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top captions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-white">Top Voted Captions</h2>
          </div>
          <div className="space-y-3">
            {data.topCaptions.length === 0 && (
              <p className="text-slate-500 text-sm">No captions yet</p>
            )}
            {(data.topCaptions as Array<{ id: string; content: string; like_count: number }>).map((c, i) => (
              <div key={c.id} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-slate-300 text-sm flex-1 line-clamp-2">{c.content}</p>
                <span className="text-pink-400 text-xs font-semibold whitespace-nowrap">
                  ♥ {c.like_count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Recent Users</h2>
          </div>
          <div className="space-y-3">
            {data.recentUsers.length === 0 && (
              <p className="text-slate-500 text-sm">No users yet</p>
            )}
            {(data.recentUsers as Array<{ id: string; first_name: string | null; last_name: string | null; email: string | null; created_datetime_utc: string; is_superadmin: boolean }>).map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {(u.first_name ?? u.email ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {u.first_name || u.last_name
                      ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim()
                      : u.email ?? 'Unknown'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {u.is_superadmin && (
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">
                      admin
                    </span>
                  )}
                  <span className="text-xs text-slate-600 whitespace-nowrap">
                    {new Date(u.created_datetime_utc).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
