import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logoXamego from '@/assets/images/logo-xamego-transparente.png'

interface NavbarProps {
  onLogout: () => void
}

export function Navbar({ onLogout }: NavbarProps) {
  const { user } = useAuth()
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'X'

  return (
    <header className="bg-white backdrop-blur-xs border-b border-cream-dark/60 sticky top-0 z-20">
      <div className="px-4 sm:px-8 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 md:hidden">
          <img src={logoXamego} alt="Xamego Artesanal" className="h-7 w-7 object-contain" />
          <span className="font-semibold text-brown text-sm tracking-tight">Xamego Gestor</span>
        </div>

        <div className="hidden md:block" />
        <div className="flex items-center gap-3">
          {user && (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `group flex items-center gap-2.5 py-1 px-1.5 rounded-full transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-85 hover:opacity-100'
                }`
              }
            >
              <div className="w-7 h-7 rounded-full bg-terracotta/15 text-terracotta font-semibold text-xs flex items-center justify-center transition-transform group-hover:scale-105">
                {userInitial}
              </div>

              <span className="text-xs font-medium text-brown group-hover:text-terracotta transition-colors truncate max-w-[150px]">
                {user.name}
              </span>
            </NavLink>
          )}

          {/* logout para mobile */}
          <button
            onClick={onLogout}
            title="Sair"
            className="md:hidden p-1.5 text-brown-light hover:text-rose-600 transition-colors"
          >
            <LogOut size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  )
}