import { BrowserRouter, Route, Routes } from 'react-router'
import LoginPage from '@/pages/LoginPage'
import MainLayout from '@/layouts/MainLayout'
import DashboardPage from '@/pages/DashboardPage'
import ProductsPage from '@/pages/ProductsPage'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import ProvidersPage from '@/pages/ProvidersPage'
import CustomersPage from '@/pages/CustomersPage'

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
            <Route path="/clientes" element={<CustomersPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App