'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

interface CaptionTrendPoint {
  date: string
  count: number
}

interface HumorFlavor {
  id: number
  slug: string
  description: string | null
}

interface DashboardChartsProps {
  captionTrend: CaptionTrendPoint[]
  voteDistribution: { upvotes: number; downvotes: number }
  humorFlavors: HumorFlavor[]
}

const PURPLE = '#a855f7'
const BLUE = '#3b82f6'
const GREEN = '#22c55e'
const ORANGE = '#f97316'
const PINK = '#ec4899'
const CYAN = '#06b6d4'
const YELLOW = '#eab308'
const RED = '#ef4444'

const FLAVOR_COLORS = [PURPLE, BLUE, GREEN, ORANGE, PINK, CYAN, YELLOW, RED]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p: { name: string; value: number; color: string }, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardCharts({
  captionTrend,
  voteDistribution,
  humorFlavors,
}: DashboardChartsProps) {
  const pieData = [
    { name: 'Upvotes', value: voteDistribution.upvotes },
    { name: 'Downvotes', value: voteDistribution.downvotes },
  ]

  const flavorBarData = humorFlavors.slice(0, 8).map((f, i) => ({
    name: f.slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    id: f.id,
    color: FLAVOR_COLORS[i % FLAVOR_COLORS.length],
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Captions trend — spans 2 cols */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Captions Created (Last 14 Days)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={captionTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="captionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PURPLE} stopOpacity={0.3} />
                <stop offset="95%" stopColor={PURPLE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              name="Captions"
              stroke={PURPLE}
              strokeWidth={2}
              fill="url(#captionGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Vote distribution pie */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Vote Distribution</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              <Cell fill={GREEN} />
              <Cell fill={RED} />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Humor flavors bar chart */}
      <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Humor Flavors</h2>
        {flavorBarData.length === 0 ? (
          <p className="text-slate-500 text-sm">No humor flavors configured</p>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={flavorBarData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="id" name="Flavor ID" radius={[4, 4, 0, 0]}>
                {flavorBarData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
