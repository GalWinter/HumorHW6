'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '\u2302' },
  { href: '/admin/users', label: 'Users', icon: '\u263A' },
  { href: '/admin/images', label: 'Images', icon: '\u25A3' },
  { href: '/admin/captions', label: 'Captions', icon: '\u270E' },
]

export default function AdminShell({
  user,
  children,
}: {
  user: { email: string; name: string }
  children: React.ReactNode
}) {
  const pathname = usePathname()

  async function handleLogout() {
    const supabase = createSupabaseBrowser()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
            AlmostCrack&apos;d
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="mb-3">
            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-sm px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition font-medium"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
