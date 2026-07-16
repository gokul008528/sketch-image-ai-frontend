import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function AppShell({ children }) {
  return (
    <div className="grain min-h-screen bg-canvas">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
