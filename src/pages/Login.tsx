import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogIn } from 'lucide-react'
import logoXamego from '@/assets/images/logo-xamego-transparente.png'
import bgLogin from '@/assets/images/bg-login.jpg'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'E-mail ou senha incorretos.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-cream overflow-hidden">
      {/* Imagem de Fundo Estilizada */}
      <img
        src={bgLogin}
        alt=""
        aria-hidden="true"
        className="fixed inset-0 w-full h-full object-cover opacity-6 pointer-events-none select-none"
      />

      {/* Cartão de Login */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img
            src={logoXamego}
            alt="Xamego Gestor"
            className="h-28 w-28 object-contain mb-2 drop-shadow-sm"
          />
          <h1 className="font-display text-2xl font-bold text-brown">Seja Bem-vindo!</h1>
          <p className="text-xs text-brown-light mt-0.5">Acesse o Xamego Gestor</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/95 backdrop-blur-sm rounded-2xl border border-cream-dark p-6 space-y-4 shadow-xl shadow-brown/5"
        >
          <div>
            <label className="text-xs text-brown-light block mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-cream-dark rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="text-xs text-brown-light block mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-cream-dark rounded-lg h-10 px-3 text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
              placeholder="••••••••"
            />
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-terracotta font-medium hover:underline">
              Esqueci minha senha
            </Link>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-terracotta text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60 shadow-md shadow-terracotta/20"
          >
            <LogIn size={18} />
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-brown-light mt-4">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-terracotta font-medium hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}