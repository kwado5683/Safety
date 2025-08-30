/*
Description: App shell with header, optional sidebar, and content container.
- Provides responsive layout: header (top), sidebar (left on md+), main content.
- Pass custom headerRight and sidebar nodes via props.
- Includes role-based navigation.

Pseudocode:
- Render header with title and right-side actions
- Render flex container: sidebar (md+) and main content area
- Constrain main content width and add padding
- Show navigation based on user role
*/
import Link from 'next/link'

export default function Layout({ 
  headerRight = null, 
  sidebar = null, 
  children,
  user = null,
  isManager = false,
  isOfficer = false
}) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sm:px-6">
        <div className="font-semibold tracking-tight">Safety Dashboard</div>
        <div className="flex items-center gap-2">
          {headerRight}
          {user && (
            <>
              <Link href="/settings" className="text-sm text-neutral-600 hover:text-neutral-900">
                Settings
              </Link>
              <Link href="/sign-out" className="text-sm text-neutral-600 hover:text-neutral-900">
                Sign Out
              </Link>
            </>
          )}
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:block w-64 shrink-0 bg-white border-r border-neutral-200 min-h-[calc(100vh-4rem)] p-4">
          {sidebar || (
            <nav className="space-y-2">
              <Link href="/" className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md">
                Dashboard
              </Link>
              <Link href="/incidents" className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md">
                Incidents
              </Link>
              <Link href="/inspections" className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md">
                Inspections
              </Link>
              <Link href="/training" className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md">
                Training
              </Link>
              <Link href="/documents" className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md">
                Documents
              </Link>
              {(isManager || isOfficer) && (
                <Link href="/risk" className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md">
                  Risk Management
                </Link>
              )}
              {isManager && (
                <Link href="/settings" className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md">
                  User Management
                </Link>
              )}
            </nav>
          )}
        </aside>

        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}


