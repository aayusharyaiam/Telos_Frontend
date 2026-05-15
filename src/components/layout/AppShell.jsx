import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen text-ink-900">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <main className="px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
