import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Boxes,
  ShoppingBag,
  Users,
  FileText,
  Search,
  MessageSquare,
  BarChart3,
  Settings,
  ClipboardList,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Categories', href: '/categories', icon: FolderOpen },
  { label: 'Inventory', href: '/inventory', icon: Boxes },
  { label: 'Orders', href: '/orders', icon: ShoppingBag },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Content', href: '/content', icon: FileText },
  { label: 'SEO', href: '/seo', icon: Search },
  { label: 'Live Chat', href: '/live-chat', icon: MessageSquare },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Audit Log', href: '/audit-log', icon: ClipboardList },
]

const settingsItems = [
  { label: 'Settings', href: '/settings/store', icon: Settings },
  { label: 'Profile', href: '/profile', icon: User },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      aria-label="Admin navigation"
      style={{ width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
      className="relative flex flex-shrink-0 flex-col border-r border-slate/20 bg-sidebar-bg transition-[width] duration-200"
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-slate/20 px-4">
        {!collapsed && (
          <span className="font-heading text-base font-bold text-pale-ice">Nuclara</span>
        )}
        {collapsed && (
          <span className="font-heading text-base font-bold text-scientific-teal">N</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4" aria-label="Sidebar navigation">
        <ul className="space-y-0.5 px-2" role="list">
          {navItems.map(({ label, href, icon: Icon }) => (
            <li key={href}>
              <NavLink
                to={href}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded px-3 py-2 text-sm font-medium no-underline transition-colors ${
                    isActive
                      ? 'bg-sidebar-active text-white'
                      : 'text-slate hover:bg-sidebar-hover hover:text-pale-ice'
                  }`
                }
              >
                <Icon size={18} aria-hidden="true" className="flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-4 border-t border-slate/20 pt-4">
          <ul className="space-y-0.5 px-2" role="list">
            {settingsItems.map(({ label, href, icon: Icon }) => (
              <li key={href}>
                <NavLink
                  to={href}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded px-3 py-2 text-sm font-medium no-underline transition-colors ${
                      isActive
                        ? 'bg-sidebar-active text-white'
                        : 'text-slate hover:bg-sidebar-hover hover:text-pale-ice'
                    }`
                  }
                >
                  <Icon size={18} aria-hidden="true" className="flex-shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-border-grey bg-cloud-white text-slate shadow-card transition-colors hover:bg-pale-ice hover:text-midnight-navy"
      >
        {collapsed ? (
          <ChevronRight size={12} aria-hidden="true" />
        ) : (
          <ChevronLeft size={12} aria-hidden="true" />
        )}
      </button>
    </aside>
  )
}
