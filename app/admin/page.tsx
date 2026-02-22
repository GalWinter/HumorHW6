import { createSupabaseServer } from '@/lib/supabase-server'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{sub}</p>}
    </div>
  )
}

function BarChart({ data, label }: { data: { name: string; value: number }[]; label: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">{label}</h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[70%]">{item.name}</span>
              <span className="text-zinc-500 dark:text-zinc-400 font-mono">{item.value.toLocaleString()}</span>
            </div>
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HeatmapRow({ data, label }: { data: number[]; label: string; maxVal: number }) {
  const localMax = Math.max(...data, 1)
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-zinc-500 dark:text-zinc-400 w-8 text-right">{label}</span>
      {data.map((val, i) => {
        const intensity = val / localMax
        return (
          <div
            key={i}
            className="w-5 h-5 rounded-sm"
            title={`${val} captions`}
            style={{
              backgroundColor: intensity > 0
                ? `rgba(59, 130, 246, ${0.15 + intensity * 0.85})`
                : 'rgba(128, 128, 128, 0.1)',
            }}
          />
        )
      })}
    </div>
  )
}

export default async function AdminDashboard() {
  const supabase = await createSupabaseServer()

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

  // Compute captions per month for activity heatmap
  const monthlyActivity: Record<string, number> = {}
  if (allCaptionsForTimeline) {
    for (const c of allCaptionsForTimeline) {
      const d = new Date(c.created_datetime_utc)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthlyActivity[key] = (monthlyActivity[key] || 0) + 1
    }
  }

  // Compute day-of-week and hour heatmap
  const dayHourGrid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  if (allCaptionsForTimeline) {
    for (const c of allCaptionsForTimeline) {
      const d = new Date(c.created_datetime_utc)
      dayHourGrid[d.getUTCDay()][d.getUTCHours()]++
    }
  }
  const heatmapMax = Math.max(...dayHourGrid.flat(), 1)

  // Humor flavor usage: count captions per flavor
  const flavorUsage: Record<string, number> = {}
  // We'll fetch captions grouped by flavor via a separate query
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
    .slice(0, 10)

  // Monthly activity chart
  const monthKeys = Object.keys(monthlyActivity).sort()
  const monthChartData = monthKeys.slice(-12).map((key) => ({
    name: key,
    value: monthlyActivity[key],
  }))

  const avgCaptionsPerImage = totalImages ? Math.round((totalCaptions ?? 0) / totalImages) : 0
  const avgVotesPerCaption = totalCaptions ? ((totalVotes ?? 0) / totalCaptions).toFixed(1) : '0'

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Platform overview for AlmostCrack&apos;d &mdash; {universities?.map((u) => u.name).join(' & ')}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Captions" value={(totalCaptions ?? 0).toLocaleString()} sub={`${avgCaptionsPerImage} avg per image`} />
        <StatCard label="Total Images" value={(totalImages ?? 0).toLocaleString()} />
        <StatCard label="Total Users" value={(totalProfiles ?? 0).toLocaleString()} />
        <StatCard label="Caption Requests" value={(totalRequests ?? 0).toLocaleString()} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Votes Cast" value={(totalVotes ?? 0).toLocaleString()} sub={`${avgVotesPerCaption} avg per caption`} />
        <StatCard label="Likes" value={(totalLikes ?? 0).toLocaleString()} />
        <StatCard label="Shares" value={(totalShares ?? 0).toLocaleString()} />
        <StatCard label="Featured Captions" value={(featuredCaptions ?? 0).toLocaleString()} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Reported Captions" value={(totalReportedCaptions ?? 0).toLocaleString()} />
        <StatCard label="Reported Images" value={(totalReportedImages ?? 0).toLocaleString()} />
        <StatCard label="Humor Flavors" value={humorFlavors?.length ?? 0} />
        <StatCard label="Universities" value={universities?.length ?? 0} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart data={monthChartData} label="Captions Per Month (Last 12 Months)" />
        <BarChart data={shareChartData} label="Shares by Platform" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart data={flavorChartData} label="Top 10 Humor Flavors by Usage" />

        {/* Day/Hour Heatmap */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
            Caption Activity Heatmap (Day x Hour, UTC)
          </h3>
          <div className="space-y-1 overflow-x-auto">
            <div className="flex items-center gap-1">
              <span className="w-8" />
              {Array.from({ length: 24 }, (_, i) => (
                <span key={i} className="w-5 text-center text-[10px] text-zinc-400">{i}</span>
              ))}
            </div>
            {dayHourGrid.map((row, dayIdx) => (
              <HeatmapRow key={dayIdx} data={row} label={dayNames[dayIdx]} maxVal={heatmapMax} />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-zinc-400">
            <span>Less</span>
            {[0.15, 0.35, 0.55, 0.75, 1].map((opacity) => (
              <div
                key={opacity}
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: `rgba(59, 130, 246, ${opacity})` }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Top Captions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
            Top Captions by Likes
          </h3>
          <div className="space-y-3">
            {topCaptionsByLikes?.map((caption, i) => (
              <div key={caption.id} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 truncate">&ldquo;{caption.content}&rdquo;</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{caption.like_count} likes</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
            Recent Captions
          </h3>
          <div className="space-y-3">
            {recentCaptions?.map((caption) => (
              <div key={caption.id} className="flex items-start justify-between gap-3">
                <p className="text-sm text-zinc-800 dark:text-zinc-200 truncate flex-1">
                  &ldquo;{caption.content}&rdquo;
                </p>
                <span className="text-xs text-zinc-400 flex-shrink-0">
                  {new Date(caption.created_datetime_utc).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
