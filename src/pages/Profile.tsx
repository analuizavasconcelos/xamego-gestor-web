import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import { 
  User, 
  Mail, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  BadgeCheck,
} from 'lucide-react'

// Componente de Perfil Estilizado: Minimalista, Moderno, Estilo Apple.
// Mantém as cores de referência: cream, terracotta, brown.
export default function Profile() {
  const { user } = useAuth()

  // Estados dos formulários (valores iniciais vêm do contexto de autenticação)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('')

  // Estados de feedback visual (carregamento, sucesso, erro)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Função para atualizar os dados básicos do perfil
  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault()
    setProfileError(null)
    setProfileSuccess(false)
    setSavingProfile(true)

    try {
      await api.put('/me', { name, email })
      setProfileSuccess(true)
      // Oculta a mensagem de sucesso após 4 segundos
      setTimeout(() => setProfileSuccess(false), 4000)
    } catch (err: any) {
      console.error(err)
      setProfileError(err.response?.data?.message || 'Erro ao atualizar informações.')
    } finally {
      setSavingProfile(false)
    }
  }

  // Função para atualizar a senha
  async function handleUpdatePassword(e: FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    // Validações básicas no front-end
    if (newPassword !== newPasswordConfirmation) {
      setPasswordError('A confirmação da nova senha não confere.')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('A nova senha deve ter no mínimo 8 caracteres.')
      return
    }

    setSavingPassword(true)

    try {
      await api.put('/me/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      })

      setPasswordSuccess(true)
      // Limpa os campos de senha após o sucesso
      setCurrentPassword('')
      setNewPassword('')
      setNewPasswordConfirmation('')
      // Oculta a mensagem de sucesso após 4 segundos
      setTimeout(() => setPasswordSuccess(false), 4000)
    } catch (err: any) {
      console.error(err)
      setPasswordError(err.response?.data?.message || 'Erro ao atualizar a senha.')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    // Container principal centralizado com fundo leve
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6 bg-cream/10">
      {/* Cartão central único que engloba todo o conteúdo */}
      <div className="bg-white p-10 rounded-3xl border border-cream/40 shadow-md shadow-brown/5 max-w-4xl w-full">
        
        {/* Cabeçalho do Perfil (Top Header) - Centralizado com Avatar Proeminente */}
        {/* CORREÇÃO APLICADA AQUI: Tags fechadas corretamente e remoção da chave extra */}
        <div className="flex flex-col items-center mb-10 text-center">
          {/* Avatar circular estilizado */}
          <div className="w-22 h-22 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center font-display font-bold text-5xl mb-6 shadow-inset shadow-brown/10 ring-2 ring-terracotta/10">
            {user?.name?.charAt(0).toUpperCase() || 'X'}
          </div>
          {/* Badge de função (Administrador) */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream text-brown-light text-xs font-semibold mb-2">
            <BadgeCheck size={14} className="text-sage" />
            <span>Administrador da Loja</span>
          </div>
          {/* Nome e E-mail do usuário */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brown tracking-tighter">
            {user?.name || 'Seu Perfil'}
          </h1>
          <p className="text-sm text-brown-light mt-1.5">{user?.email}</p>
        </div>

        {/* Grelha de Conteúdo Principal - Divide os dois formulários */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start border-t border-cream-dark/60 pt-10">
          
          {/* Coluna 1: Formulário de Dados Pessoais */}
          <div className="space-y-6">
            <div className="border-b border-cream-dark/60 pb-4">
              <h2 className="text-md font-semibold text-brown tracking-tight flex items-center gap-2.5">
                <User size={18} className="text-terracotta" />
                Dados Pessoais
              </h2>
              <p className="text-sm text-brown-light mt-1">Mantenha seu nome e e-mail de contato atualizados</p>
            </div>

            {/* Alertas de Feedback (Sucesso/Erro) */}
            {profileSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-xl flex items-center gap-2.5 animate-fade-in">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                <span>Dados atualizados com sucesso!</span>
              </div>
            )}

            {profileError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm px-4 py-3 rounded-xl flex items-center gap-2.5 animate-fade-in">
                <AlertCircle size={18} className="shrink-0 text-rose-600" />
                <span>{profileError}</span>
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-brown-light block">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full px-3 py-2 bg-cream/20 border border-cream rounded-xl text-base text-brown focus:outline-none focus:ring-2 focus:ring-terracotta/60 transition-all shadow-inset shadow-brown/5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-brown-light block">
                  E-mail de Acesso
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full px-3 py-2 bg-cream/20 border border-cream rounded-xl text-base text-brown focus:outline-none focus:ring-2 focus:ring-terracotta/60 transition-all shadow-inset shadow-brown/5"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full bg-terracotta hover:bg-terracotta-dark text-white text-base font-bold py-3 px-4 rounded-2xl shadow-md transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2.5"
              >
                {savingProfile ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <span>Salvar Informações</span>
                )}
              </button>
            </form>
          </div>

          {/* Formulário de Senha */}
          <div className="space-y-6">
            <div className="border-b border-cream-dark/60 pb-4">
              <h2 className="text-md font-semibold text-brown tracking-tight flex items-center gap-2.5">
                <Lock size={18} className="text-terracotta" />
                Segurança & Senha
              </h2>
              <p className="text-sm text-brown-light mt-1">Altere sua senha de login quando necessário</p>
            </div>

            {/* Alertas */}
            {passwordSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-xl flex items-center gap-2.5 animate-fade-in">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                <span>Senha alterada com sucesso!</span>
              </div>
            )}

            {passwordError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm px-4 py-3 rounded-xl flex items-center gap-2.5 animate-fade-in">
                <AlertCircle size={18} className="shrink-0 text-rose-600" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Formulário de Senha */}
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-brown-light block">
                  Senha Atual
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-cream/20 border border-cream rounded-xl text-base text-brown focus:outline-none focus:ring-2 focus:ring-terracotta/60 transition-all shadow-inset shadow-brown/5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-brown-light block">
                  Nova Senha (mínimo 8 dígitos)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-cream/20 border border-cream rounded-xl text-base text-brown focus:outline-none focus:ring-2 focus:ring-terracotta/60 transition-all shadow-inset shadow-brown/5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-brown-light block">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={newPasswordConfirmation}
                  onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-cream/20 border border-cream rounded-xl text-base text-brown focus:outline-none focus:ring-2 focus:ring-terracotta/60 transition-all shadow-inset shadow-brown/5"
                />
              </div>
              
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full bg-cream hover:bg-cream-dark/60 text-brown border border-cream-dark text-base font-semibold py-3 px-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2.5"
              >
                {savingPassword ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Atualizando senha...</span>
                  </>
                ) : (
                  <span>Atualizar Senha</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}