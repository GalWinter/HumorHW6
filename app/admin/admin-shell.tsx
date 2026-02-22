'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavSection {
  title: string
  items: { href: string; label: string }[]
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/users', label: 'Users' },
    ],
  },
  {
    title: 'Content',
    items: [
      { href: '/admin/images', label: 'Images' },
      { href: '/admin/captions', label: 'Captions' },
      { href: '/admin/caption-requests', label: 'Caption Requests' },
      { href: '/admin/caption-examples', label: 'Caption Examples' },
      { href: '/admin/terms', label: 'Terms' },
    ],
  },
  {
    title: 'Humor',
    items: [
      { href: '/admin/flavors', label: 'Flavors' },
      { href: '/admin/flavor-steps', label: 'Flavor Steps' },
      { href: '/admin/humor-mix', label: 'Humor Mix' },
    ],
  },
  {
    title: 'AI / LLM',
    items: [
      { href: '/admin/llm-models', label: 'Models' },
      { href: '/admin/llm-providers', label: 'Providers' },
      { href: '/admin/llm-chains', label: 'Prompt Chains' },
      { href: '/admin/llm-responses', label: 'Responses' },
    ],
  },
  {
    title: 'Access Control',
    items: [
      { href: '/admin/signup-domains', label: 'Signup Domains' },
      { href: '/admin/email-whitelist', label: 'Email Whitelist' },
    ],
  },
]

export default function AdminShell({
  user,
  children,
}: {
  user: { email: string; name: string }
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sidebar = (
    <>
      {/* Logo */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">AC</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">AlmostCrack&apos;d</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="mx-3 mb-4 p-3 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-indigo-300 truncate">{user.email}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-medium">Superadmin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-4 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2.5 mb-1.5">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-500/15 text-indigo-400'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.label}
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-slate-800">
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 text-sm px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 font-medium"
          >
            Sign out
          </button>
        </form>
      </div>
    </>
  )

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-60 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'var(--sidebar-bg)' }}
      >
        {sidebar}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
