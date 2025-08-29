/*
Description: App shell with header, optional sidebar, and content container.
- Provides responsive layout: header (top), sidebar (left on md+), main content.
- Pass custom headerRight and sidebar nodes via props.

Pseudocode:
- Render header with title and right-side actions
- Render flex container: sidebar (md+) and main content area
- Constrain main content width and add padding
*/
export default function Layout({ headerRight = null, sidebar = null, children }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sm:px-6">
        <div className="font-semibold tracking-tight">Safety Dashboard</div>
        <div className="flex items-center gap-2">{headerRight}</div>
      </header>

      <div className="flex">
        <aside className="hidden md:block w-64 shrink-0 bg-white border-r border-neutral-200 min-h-[calc(100vh-4rem)] p-4">
          {sidebar}
        </aside>

        <main className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}


