import { NavLink, Outlet } from 'react-router'
import {
  BarChart3,
  Boxes,
  LogOut,
  ShoppingCart,
  Store,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

const menuItems = [
  {
    label: 'Dashboard',
    path: '/',
    icon: BarChart3,
  },
  {
    label: 'Productos',
    path: '/productos',
    icon: Boxes,
  },
  {
    label: 'Ventas',
    path: '/ventas',
    icon: ShoppingCart,
  },
]

function MainLayout() {
  const { user, logout } = useAuth()

  const roleNames = user?.roles
    .map((role) => role.nombre)
    .join(', ')

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-white">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Store className="h-6 w-6 text-blue-700" />
          <span className="text-lg font-bold text-blue-700">Monesy</span>
        </div>

        <nav className="space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <div className="pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6">
          <div>
            <p className="text-sm text-slate-500">Sistema de gestion</p>
            <h1 className="text-lg font-semibold">Panel principal</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">
                {user?.username}
              </p>
              <p className="text-xs text-slate-500">
                {roleNames || 'Sin rol'}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesion
            </Button>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
