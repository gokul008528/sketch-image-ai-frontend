export default function Spinner({ className = 'h-4 w-4' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-panelBorder border-t-marker ${className}`}
    />
  )
}
