import { BrowserRouter, Route, Routes } from 'react-router'
import LoginPage from '@/pages/LoginPage'
import MainLayout from '@/layouts/MainLayout'
import DashboardPage from '@/pages/DashboardPage'
import ProductsPage from '@/pages/ProductsPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import ProvidersPage from '@/pages/ProvidersPage'
import CustomersPage from '@/pages/CustomersPage'
import PurchasesPage from '@/pages/PurchasesPage'
import SalesPage from '@/pages/SalesPage'
import InventoryPage from '@/pages/InventoryPage'
import CashPage from '@/pages/CashPage'
import ReturnsPage from '@/pages/ReturnsPage'
import ReportsPage from '@/pages/ReportsPage'
import NotFoundPage from '@/pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/proveedores" element={<ProvidersPage />} />
            <Route path="/compras" element={<PurchasesPage />} />
            <Route path="/clientes" element={<CustomersPage />} />
            <Route path="/ventas" element={<SalesPage />} />
            <Route path="/inventario" element={<InventoryPage />} />
            <Route path="/caja" element={<CashPage />} />
            <Route path="/devoluciones" element={<ReturnsPage />} />
            <Route path="/reportes" element={<ReportsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
