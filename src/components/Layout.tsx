import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { 
  Home, 
  Package, 
  Receipt, 
  BarChart3, 
  Bike, 
  LogOut, 
  CalendarDays 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logoXamego from '@/assets/images/logo-xamego-transparente.png'
import { Navbar } from './Navbar'

const navItems = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/orders', label: 'Agendamentos', icon: CalendarDays }, 
  { to: '/products', label: 'Estoque', icon: Package },
  { to: '/sales', label: 'Pedidos', icon: Receipt },
  { to: '/courier', label: 'Motoboy', icon: Bike },
  { to: '/reports', label: 'Relatórios', icon: BarChart3 },
]

export default function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar*/}
      <aside className="hidden md:flex md:flex-col w-56 bg-white border-r border-cream-dark shrink-0">
        <div className="flex items-center justify-center py-5 border-b border-cream-dark">
          <img src={logoXamego} alt="Xamego Artesanal" className="h-22 w-22 object-contain mx-auto" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-terracotta text-white shadow-xs'
                    : 'text-brown-light hover:bg-cream hover:text-brown'
                }`
              }
            >
              <item.icon size={18} strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Rodapé */}
        <div className="px-3 pb-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-brown-light hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} strokeWidth={2} />
            Sair
          </button>
        </div>

        <div className="px-5 py-4 border-t border-cream-dark text-center">
          <p className="text-[11px] text-brown-light">Feito à mão. Como em casa.</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Navbar onLogout={handleLogout} />

        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 max-w-4xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Bottom nav para mobile */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-cream-dark z-10 shadow-lg">
          <ul className="flex">
            {navItems.map((item) => (
              <li key={item.to} className="flex-1">
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                      isActive ? 'text-terracotta font-semibold' : 'text-brown-light'
                    }`
                  }
                >
                  <item.icon size={18} strokeWidth={2} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}