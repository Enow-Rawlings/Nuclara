import { Menu, Bell, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

interface TopbarProps {
  onMenuToggle: () => void
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header
      className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border-grey bg-cloud-white px-4"
      aria-label="Admin top bar"
    >
      <button
        type="button"
        onClick={onMenuToggle}
        aria-label="Toggle sidebar"
        className="rounded p-1.5 text-slate transition-colors hover:bg-pale-ice hover:text-midnight-navy"
      >
        <Menu size={18} aria-hidden="true" />
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded p-1.5 text-slate transition-colors hover:bg-pale-ice hover:text-midnight-navy"
        >
          <Bell size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign out"
          className="flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium text-slate transition-colors hover:bg-pale-ice hover:text-error-red"
        >
          <LogOut size={16} aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  )
}
