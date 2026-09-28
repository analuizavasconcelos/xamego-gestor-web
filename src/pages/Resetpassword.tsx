import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { KeyRound } from 'lucide-react'
import logoXamego from '@/assets/images/logo-xamego-transparente.png'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== passwordConfirmation) {
      setError('As senhas não coincidem.')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível redefinir a senha.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-cream-dark p-6 text-center max-w-sm">
          <p className="text-brown font-medium mb-2">Link inválido</p>
          <p className="text-sm text-brown-light mb-4">
            Este link de redefinição está incompleto ou expirou.
          </p>
          <Link to="/forgot-password" className="text-terracotta font-medium text-sm">
            Solicitar novo link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src={logoXamego}  alt="Xamego Artesanal" className="h-28 w-28 object-contain mb-2" />
          <h1 className="font-display text-xl font-bold text-brown">Nova senha</h1>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl border border-cream-dark p-6 text-center">
            <p className="text-brown font-medium mb-1">Senha redefinida!</p>
            <p className="text-sm text-brown-light">Redirecionando para o login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-cream-dark p-6 space-y-4">
            <div>
              <label className="text-xs text-brown-light block mb-1">Nova senha</label>
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
              <label className="text-xs text-brown-light block mb-1">Confirmar nova senha</label>
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                className="w-full border border-cream-dark rounded-lg h-10 px-3 text-sm"
                placeholder="Repita a nova senha"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-terracotta text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <KeyRound size={18} />
              {submitting ? 'Salvando...' : 'Redefinir senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}