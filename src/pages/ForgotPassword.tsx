import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { Mail, CircleCheck } from 'lucide-react'
import logoXamego from '@/assets/images/logo-xamego-transparente.png'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await api.post('/forgot-password', { email })
      setSent(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível enviar o link.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src={logoXamego} alt="ego Artesanal" className="h-28 w-28 object-contain mb-2" />
          <h1 className="font-display text-xl font-bold text-brown">Recuperar senha</h1>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl border border-cream-dark p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-sage-light flex items-center justify-center mx-auto">
              <CircleCheck size={28} className="text-sage" />
            </div>
            <p className="text-brown font-medium">Link enviado!</p>
            <p className="text-sm text-brown-light">
              Verifique seu e-mail e siga as instruções para redefinir sua senha.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-cream-dark p-6 space-y-4">
            <p className="text-sm text-brown-light">
              Digite seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
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

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-terracotta text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Mail size={18} />
              {submitting ? 'Enviando...' : 'Enviar link'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-brown-light mt-4">
          <Link to="/login" className="text-terracotta font-medium">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  )
}