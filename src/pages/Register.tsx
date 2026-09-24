import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserPlus } from 'lucide-react'
import logoXamego from '@/assets/images/logo-xamego-transparente.png'
import bgLogin from '@/assets/images/bg-login.jpg'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== passwordConfirmation) {
      setError('As senhas não coincidem.')
      return
    }

    setSubmitting(true)
    try {
      await register(name, email, password, passwordConfirmation)
      navigate('/')
    } catch (err: any) {
      const messages = err.response?.data?.errors
      const firstError = messages ? Object.values(messages)[0] as string[] : null
      setError(firstError?.[0] || 'Não foi possível criar a conta.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-cream overflow-hidden">
      <img
        src={bgLogin}
        alt=""
        aria-hidden="true"
        className="fixed inset-0 w-full h-full object-cover opacity-6 pointer-events-none select-none"
      />
      <div className="relative z-10 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src={logoXamego} alt="Xamego Artesanal" className="h-28 w-28 object-contain mb-2" />
          <h1 className="font-display text-xl font-bold text-brown">Criar conta</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-cream-dark p-6 space-y-4">
          <div>
            <label className="text-xs text-brown-light block mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-cream-dark rounded-lg h-10 px-3 text-sm"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="text-xs text-brown-light block mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-cream-dark rounded-lg h-10 px-3 text-sm"
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
              minLength={6}
              className="w-full border border-cream-dark rounded-lg h-10 px-3 text-sm"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="text-xs text-brown-light block mb-1">Confirmar senha</label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              className="w-full border border-cream-dark rounded-lg h-10 px-3 text-sm"
              placeholder="Repita a senha"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-terracotta text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <UserPlus size={18} />
            {submitting ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-brown-light mt-4">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-terracotta font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}