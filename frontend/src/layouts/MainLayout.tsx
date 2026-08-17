import { NavLink, Outlet } from 'react-router'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import {
  Archive,
  BarChart3,
  Banknote,
  Boxes,
  LogOut,
  RotateCcw,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Users,
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
    label: 'Proveedores',
    path: '/proveedores',
    icon: Truck,
  },
  {
    label: 'Compras',
    path: '/compras',
    icon: ShoppingBag,
  },
  {
    label: 'Clientes',
    path: '/clientes',
    icon: Users,
  },
  {
    label: 'Ventas',
    path: '/ventas',
    icon: ShoppingCart,
  },
  {
    label: 'Inventario',
    path: '/inventario',
    icon: Archive,
  },
  {
    label: 'Caja',
    path: '/caja',
    icon: Banknote,
  },
  {
    label: 'Devoluciones',
    path: '/devoluciones',
    icon: RotateCcw,
  },
  {
    label: 'Reportes',
    path: '/reportes',
    icon: BarChart3,
  },
]

function MainLayout() {
  const { user, logout } = useAuth()

  const roleNames = user?.roles
    .map((role) => role.nombre)
    .join(', ')

  return (
    <div className="min-h-screen bg-muted/40 text-foreground">
      <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-card">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Store className="h-6 w-6 text-blue-700 dark:text-blue-400" />
          <span className="text-lg font-bold text-blue-700 dark:text-blue-400">Monesy</span>
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
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card px-6">
          <div>
            <p className="text-sm text-muted-foreground">Sistema de gestion</p>
            <h1 className="text-lg font-semibold">Panel principal</h1>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-right">
              <p className="text-sm font-medium">
                {user?.username}
              </p>
              <p className="text-xs text-muted-foreground">
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
