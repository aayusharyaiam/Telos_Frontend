export default function FullScreenLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="flex items-center gap-3 rounded-full bg-white/80 px-5 py-3 shadow-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-900 border-t-transparent" />
        <span className="text-sm font-semibold text-ink-800">Loading Telos...</span>
      </div>
    </div>
  )
}
