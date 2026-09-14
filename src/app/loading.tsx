export default function Loading() {
  return (
    <div className="w-full flex items-center justify-center p-12">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant font-medium">Loading StackIt...</p>
      </div>
    </div>
  )
}
