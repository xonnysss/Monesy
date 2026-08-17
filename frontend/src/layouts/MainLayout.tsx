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
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

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

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const roleNames = user?.roles
    .map((role) => role.nombre)
    .join(', ')

  return (
    <div className="min-h-screen bg-muted/40 text-foreground">
      {isMenuOpen && (
        <button
          type="button"
          aria-label="Cerrar menu"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-card transition-transform duration-200 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Store className="h-6 w-6 text-blue-700 dark:text-blue-400" />
          <span className="text-lg font-bold text-blue-700 dark:text-blue-400">Monesy</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${isActive
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

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-2 border-b bg-card px-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="shrink-0 lg:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label={isMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
            title={isMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-muted-foreground">
              Sistema de gestion
            </p>
            <h1 className="truncate text-lg font-semibold">
              Panel principal
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />

            <div className="hidden text-right sm:block">
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
              size="icon-sm"
              onClick={logout}
              aria-label="Cerrar sesion"
              title="Cerrar sesion"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar sesion</span>
            </Button>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
