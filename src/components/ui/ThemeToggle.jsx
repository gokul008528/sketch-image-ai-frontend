import { useTheme } from '../../context/ThemeContext'

const OPTIONS = [
  {
    value: 'system',
    label: 'System',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="12" rx="1.5" />
        <path d="M8 20h8M12 16v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="4" />
        <path
          strokeLinecap="round"
          d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
        />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function ThemeToggle() {
  const { preference, setTheme } = useTheme()

  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex items-center gap-0.5 rounded-md border border-panelBorder bg-surface p-0.5"
    >
      {OPTIONS.map(({ value, label, icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-pressed={preference === value}
          title={label}
          className={`flex items-center justify-center rounded px-2 py-1.5 transition-colors ${
            preference === value
              ? 'bg-panel text-chalk'
              : 'text-graphite hover:text-chalk'
          }`}
        >
          {icon}
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  )
}
