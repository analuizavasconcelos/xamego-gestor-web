import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Sales from './pages/Sales'
import Reports from './pages/Reports'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/Resetpassword'
import ForgotPassword from './pages/ForgotPassword'
import ProtectedRoute from './components/ProtectedRoute'
import Courier from './pages/Courier'
import Profile from './pages/Profile'
import Orders from './pages/Orders'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Rotas protegidas */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="sales" element={<Sales />} />
            <Route path="courier" element={<Courier />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}