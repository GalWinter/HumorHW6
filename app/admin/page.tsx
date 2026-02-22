import { createSupabaseServer } from '@/lib/supabase-server'

const GRADIENT_CARDS = [
  { gradient: 'from-indigo-500 to-blue-600', iconBg: 'bg-white/20' },
  { gradient: 'from-emerald-500 to-teal-600', iconBg: 'bg-white/20' },
  { gradient: 'from-orange-500 to-rose-600', iconBg: 'bg-white/20' },
  { gradient: 'from-violet-500 to-purple-600', iconBg: 'bg-white/20' },
]

function GradientStatCard({
  label,
  value,
  sub,
  gradient,
  icon,
}: {
  label: string
  value: string | number
  sub?: string
  gradient: string
  icon: React.ReactNode
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white/80">{label}</p>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <p className="mt-3 text-3xl font-bold">{value}</p>
        {sub && <p className="mt-1 text-sm text-white/70">{sub}</p>}
      </div>
      <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5" />
    </div>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:shadow-md transition-shadow duration-300">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${color || 'text-slate-900 dark:text-white'}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  )
}

function BarChart({ data, label, color }: { data: { name: string; value: number }[]; label: string; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const barColor = color || 'from-indigo-500 to-blue-500'
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-md transition-shadow duration-300">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">{label}</h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-600 dark:text-slate-300 truncate max-w-[70%] font-medium">{item.name}</span>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">{item.value.toLocaleString()}</span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500`}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HeatmapRow({ data, label }: { data: number[]; label: string }) {
  const localMax = Math.max(...data, 1)
  return (
    <div className="flex items-center gap-[3px]">
      <span className="text-[11px] text-slate-400 w-8 text-right font-medium">{label}</span>
      {data.map((val, i) => {
        const intensity = val / localMax
        return (
          <div
            key={i}
            className="w-[18px] h-[18px] rounded-[4px] transition-colors"
            title={`${val} captions`}
            style={{
              backgroundColor: intensity > 0
                ? `rgba(99, 102, 241, ${0.15 + intensity * 0.85})`
                : 'rgba(148, 163, 184, 0.08)',
            }}
          />
        )
      })}
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getUTCHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function AdminDashboard() {
  const supabase = await createSupabaseServer()

  // Get current user info
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', user!.id)
    .single()

  const userName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || (user?.email?.split('@')[0] ?? 'Admin')

  // Fetch all stats in parallel
  const [
    { count: totalCaptions },
    { count: totalImages },
    { count: totalVotes },
    { count: totalLikes },
    { count: totalShares },
    { count: totalRequests },
    { count: totalReportedCaptions },
    { count: totalReportedImages },
    { count: totalProfiles },
    { data: topCaptionsByLikes },
    { data: recentCaptions },
    { data: shareDestinations },
    { data: humorFlavors },
    { data: allCaptionsForTimeline },
    { data: featuredCaptions },
    { data: universities },
  ] = await Promise.all([
    supabase.from('captions').select('*', { count: 'exact', head: true }),
    supabase.from('images').select('*', { count: 'exact', head: true }),
    supabase.from('caption_votes').select('*', { count: 'exact', head: true }),
    supabase.from('caption_likes').select('*', { count: 'exact', head: true }),
    supabase.from('shares').select('*', { count: 'exact', head: true }),
    supabase.from('caption_requests').select('*', { count: 'exact', head: true }),
    supabase.from('reported_captions').select('*', { count: 'exact', head: true }),
    supabase.from('reported_images').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('id, content, like_count').order('like_count', { ascending: false }).limit(5),
    supabase.from('captions').select('id, content, created_datetime_utc, like_count').order('created_datetime_utc', { ascending: false }).limit(10),
    supabase.from('shares').select('share_to_destination_id, share_to_destinations(name)'),
    supabase.from('humor_flavors').select('id, slug, description'),
    supabase.from('captions').select('created_datetime_utc').order('created_datetime_utc', { ascending: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }).eq('is_featured', true),
    supabase.from('universities').select('*'),
  ])

  // Compute share destination breakdown
  const shareByDest: Record<string, number> = {}
  if (shareDestinations) {
    for (const s of shareDestinations) {
      const destName = (s.share_to_destinations as unknown as { name: string })?.name ?? 'Unknown'
      shareByDest[destName] = (shareByDest[destName] || 0) + 1
    }
  }
  const shareChartData = Object.entries(shareByDest)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Compute captions per month
  const monthlyActivity: Record<string, number> = {}
  if (allCaptionsForTimeline) {
    for (const c of allCaptionsForTimeline) {
      const d = new Date(c.created_datetime_utc)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthlyActivity[key] = (monthlyActivity[key] || 0) + 1
    }
  }

  // Day-of-week and hour heatmap
  const dayHourGrid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  if (allCaptionsForTimeline) {
    for (const c of allCaptionsForTimeline) {
      const d = new Date(c.created_datetime_utc)
      dayHourGrid[d.getUTCDay()][d.getUTCHours()]++
    }
  }

  // Humor flavor usage
  const flavorUsage: Record<string, number> = {}
  const { data: captionsByFlavor } = await supabase
    .from('captions')
    .select('humor_flavor_id')

  if (captionsByFlavor && humorFlavors) {
    for (const c of captionsByFlavor) {
      if (c.humor_flavor_id) {
        const flavor = humorFlavors.find((f) => f.id === c.humor_flavor_id)
        const name = flavor?.slug ?? `#${c.humor_flavor_id}`
        flavorUsage[name] = (flavorUsage[name] || 0) + 1
      }
    }
  }
  const flavorChartData = Object.entries(flavorUsage)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const monthKeys = Object.keys(monthlyActivity).sort()
  const monthChartData = monthKeys.slice(-12).map((key) => ({
    name: key,
    value: monthlyActivity[key],
  }))

  const avgCaptionsPerImage = totalImages ? Math.round((totalCaptions ?? 0) / totalImages) : 0
  const avgVotesPerCaption = totalCaptions ? ((totalVotes ?? 0) / totalCaptions).toFixed(1) : '0'

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <p className="text-indigo-200 text-sm font-medium">{getGreeting()},</p>
          <h2 className="text-3xl font-bold mt-1">{userName}</h2>
          <p className="mt-2 text-indigo-100/80 text-sm max-w-lg">
            Welcome to the AlmostCrack&apos;d admin panel. Here&apos;s an overview of your platform
            across {universities?.map((u) => u.name).join(' & ')}.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 right-24 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
        <div className="absolute top-12 right-12 w-20 h-20 bg-white/10 rounded-2xl rotate-12" />
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GradientStatCard
          label="Total Captions"
          value={(totalCaptions ?? 0).toLocaleString()}
          sub={`${avgCaptionsPerImage} avg per image`}
          gradient={GRADIENT_CARDS[0].gradient}
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>}
        />
        <GradientStatCard
          label="Total Images"
          value={(totalImages ?? 0).toLocaleString()}
          gradient={GRADIENT_CARDS[1].gradient}
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" /></svg>}
        />
        <GradientStatCard
          label="Total Users"
          value={(totalProfiles ?? 0).toLocaleString()}
          gradient={GRADIENT_CARDS[2].gradient}
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>}
        />
        <GradientStatCard
          label="Votes Cast"
          value={(totalVotes ?? 0).toLocaleString()}
          sub={`${avgVotesPerCaption} avg per caption`}
          gradient={GRADIENT_CARDS[3].gradient}
          icon={<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard label="Requests" value={(totalRequests ?? 0).toLocaleString()} />
        <StatCard label="Likes" value={(totalLikes ?? 0).toLocaleString()} />
        <StatCard label="Shares" value={(totalShares ?? 0).toLocaleString()} />
        <StatCard label="Featured" value={(featuredCaptions ?? 0).toLocaleString()} />
        <StatCard label="Reported" value={(totalReportedCaptions ?? 0).toLocaleString()} color="text-amber-500" />
        <StatCard label="Flavors" value={humorFlavors?.length ?? 0} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart data={monthChartData} label="Captions Per Month" color="from-indigo-500 to-purple-500" />
        <BarChart data={shareChartData} label="Shares by Platform" color="from-emerald-500 to-teal-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart data={flavorChartData} label="Top Humor Flavors" color="from-orange-500 to-rose-500" />

        {/* Heatmap */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-md transition-shadow duration-300">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">
            Caption Activity Heatmap
          </h3>
          <div className="space-y-[3px] overflow-x-auto">
            <div className="flex items-center gap-[3px]">
              <span className="w-8" />
              {Array.from({ length: 24 }, (_, i) => (
                <span key={i} className="w-[18px] text-center text-[9px] text-slate-400 font-medium">
                  {i % 6 === 0 ? `${i}h` : ''}
                </span>
              ))}
            </div>
            {dayHourGrid.map((row, dayIdx) => (
              <HeatmapRow key={dayIdx} data={row} label={dayNames[dayIdx]} />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-5 text-[11px] text-slate-400 font-medium">
            <span>Less</span>
            {[0.1, 0.3, 0.5, 0.7, 1].map((opacity) => (
              <div
                key={opacity}
                className="w-[14px] h-[14px] rounded-[3px]"
                style={{ backgroundColor: `rgba(99, 102, 241, ${opacity})` }}
              />
            ))}
            <span>More</span>
            <span className="ml-2 text-slate-500">(UTC)</span>
          </div>
        </div>
      </div>

      {/* Top Captions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-md transition-shadow duration-300">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">
            Top Captions by Likes
          </h3>
          <div className="space-y-4">
            {topCaptionsByLikes?.map((caption, i) => (
              <div key={caption.id} className="flex items-start gap-3">
                <span className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
                  i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                  i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                  'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2">&ldquo;{caption.content}&rdquo;</p>
                  <p className="text-xs text-indigo-500 font-semibold mt-1">{caption.like_count} likes</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-md transition-shadow duration-300">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">
            Recent Captions
          </h3>
          <div className="space-y-3">
            {recentCaptions?.map((caption) => (
              <div key={caption.id} className="flex items-start justify-between gap-3 group">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {caption.content}
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 flex-shrink-0 font-medium">
                  {new Date(caption.created_datetime_utc).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
