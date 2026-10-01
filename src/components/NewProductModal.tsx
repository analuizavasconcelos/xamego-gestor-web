import { useState, useEffect, type FormEvent } from 'react'
import { api } from '../api/client'
import { X, Loader2, Image as ImageIcon } from 'lucide-react'

interface NewProductModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export function NewProductModal({ isOpen, onClose, onCreated }: NewProductModalProps) {
  const [name, setName] = useState('')
  const [size, setSize] = useState('')
  const [imagePath, setImagePath] = useState('')
  const [cost, setCost] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [minStock, setMinStock] = useState('5')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fecha no Esc
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Cálculo de margem 
  const numCost = Number(cost) || 0
  const numPrice = Number(price) || 0
  const profitMargin = numPrice > 0 ? (((numPrice - numCost) / numPrice) * 100).toFixed(0) : null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !size.trim() || !cost || !price) {
      setError('Preencha os campos obrigatórios (*)')
      return
    }

    setSaving(true)
    try {
      await api.post('/products', {
        name: name.trim(),
        size: size.trim(),
        image_path: imagePath.trim() || null,
        current_cost: Number(cost),
        current_price: Number(price),
        current_stock: Number(stock) || 0,
        low_stock_threshold: Number(minStock) || 5,
      })

      onCreated()
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Erro ao cadastrar produto.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-brown/20 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full md:max-w-md shadow-xl border border-cream-dark space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-cream-dark pb-3">
          <div>
            <h2 className="font-display text-lg font-bold text-brown">Novo Congelado</h2>
            <p className="text-xs text-brown-light">Adicione uma nova opção ao catálogo</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-brown-light hover:text-brown p-1.5 rounded-lg hover:bg-cream transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome e Tamanho */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-brown block mb-1">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Pizza Calabresa"
                className="w-full bg-cream/30 border border-cream-dark rounded-xl h-10 px-3 text-sm text-brown placeholder:text-brown-light/60 focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brown block mb-1">
                Tamanho *
              </label>
              <input
                type="text"
                required
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="Ex: 25cm"
                className="w-full bg-cream/30 border border-cream-dark rounded-xl h-10 px-3 text-sm text-brown placeholder:text-brown-light/60 focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
          </div>

          {/* Custos e Preços */}
          <div className="bg-cream/20 p-3 rounded-xl border border-cream-dark space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-brown block mb-1">
                  Custo Prod. (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-white border border-cream-dark rounded-xl h-10 px-3 text-sm text-brown focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-brown block mb-1">
                  Preço Venda (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-white border border-cream-dark rounded-xl h-10 px-3 text-sm text-brown focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
            </div>

            {profitMargin !== null && (
              <p className="text-[11px] text-brown-light flex justify-between px-1">
                <span>Lucro estimado por un: <strong className="text-sage">R$ {(numPrice - numCost).toFixed(2)}</strong></span>
                <span>Margem: <strong className="text-sage">{profitMargin}%</strong></span>
              </p>
            )}
          </div>

          {/* Estoques */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-brown block mb-1">
                Estoque Inicial
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="w-full bg-cream/30 border border-cream-dark rounded-xl h-10 px-3 text-sm text-brown focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brown block mb-1">
                Alerta Estoque Mín.
              </label>
              <input
                type="number"
                min="1"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                placeholder="5"
                className="w-full bg-cream/30 border border-cream-dark rounded-xl h-10 px-3 text-sm text-brown focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
          </div>

          {/* Imagem */}
          <div>
            <label className="text-xs font-semibold text-brown block mb-1">
              Nome do arquivo da foto (opcional)
            </label>
            <div className="relative">
              <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-light" />
              <input
                type="text"
                value={imagePath}
                onChange={(e) => setImagePath(e.target.value)}
                placeholder="Ex: brotinho-queijo.jpg"
                className="w-full pl-9 pr-3 bg-cream/30 border border-cream-dark rounded-xl h-10 text-sm text-brown placeholder:text-brown-light/60 focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-3 border-t border-cream-dark">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-cream-dark text-brown-light hover:bg-cream rounded-xl py-2.5 text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-terracotta hover:bg-terracotta-dark text-white rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-60 shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Produto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}