import { useState } from 'react'
import { api } from '../api/client'
import { useProducts } from '../hooks/useProducts'
import { NewProductModal, type EditableProduct } from '../components/NewProductModal'
import { Plus, Pizza, PackageCheck, Pencil } from 'lucide-react'

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Products() {
  const { products, loading, reload } = useProducts()
  const [restockId, setRestockId] = useState<number | null>(null)
  const [restockQty, setRestockQty] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<EditableProduct | null>(null)

  async function handleRestock(productId: number) {
    const qty = Number(restockQty)
    if (!qty || qty < 1) return
    await api.post('/stock-entries', { product_id: productId, quantity: qty })
    setRestockId(null)
    setRestockQty('')
    reload()
  }

  function openCreate() {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  function openEdit(p: EditableProduct) {
    setEditingProduct(p)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  if (loading) return <p className="text-brown-light text-center py-10">Carregando estoque...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-brown">Estoque de Congelados</h1>
          <p className="text-xs md:text-sm text-brown-light">Controle de unidades prontas para entrega</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-terracotta hover:bg-terracotta-dark text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus size={18} />
          Novo Produto
        </button>
      </div>

      {/*Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {products.map((p) => {
          const isLow = p.current_stock <= p.low_stock_threshold
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-cream-dark p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-cream/50 rounded-xl overflow-hidden shrink-0 border border-cream-dark flex items-center justify-center">
                  {p.image_path ? (
                    <img
                      src={`/images/produtos/${p.image_path}`}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Pizza size={24} className="text-brown-light/60" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-brown truncate">{p.name}</p>
                  <p className="text-xs text-brown-light">{p.size}</p>
                  <p className="text-xs text-sage font-bold mt-0.5">{formatMoney(Number(p.current_price))}</p>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block font-bold px-3 py-1 rounded-full text-xs ${
                      isLow ? 'bg-amber-100 text-amber-800' : 'bg-sage-light text-sage'
                    }`}
                  >
                    {p.current_stock} un
                  </span>
                  {isLow && <span className="block text-[10px] text-amber-600 mt-0.5">Estoque baixo</span>}
                </div>
              </div>

              {/* Reposição e edição */}
              <div className="mt-3 pt-3 border-t border-cream-dark/60">
                {restockId === p.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={restockQty}
                      onChange={(e) => setRestockQty(e.target.value)}
                      placeholder="Qtd adicionada"
                      className="flex-1 bg-cream/30 border border-cream-dark rounded-xl h-9 px-3 text-sm text-brown focus:outline-none focus:ring-2 focus:ring-terracotta"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRestock(p.id)}
                      className="bg-sage text-white text-xs font-bold px-3 h-9 rounded-xl hover:bg-sage/90 transition"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setRestockId(null)}
                      className="text-brown-light text-xs px-2 hover:text-brown transition"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRestockId(p.id)}
                      className="flex-1 text-center text-terracotta hover:text-terracotta-dark text-xs font-semibold py-1 transition flex items-center justify-center gap-1"
                    >
                      <PackageCheck size={14} />
                      Repor estoque diário
                    </button>
                    <button
                      onClick={() => openEdit(p)}
                      className="flex-1 text-center text-brown-light hover:text-brown text-xs font-semibold py-1 transition flex items-center justify-center gap-1"
                    >
                      <Pencil size={14} />
                      Editar produto
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de novo produto / edição */}
      <NewProductModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onCreated={reload}
        product={editingProduct}
      />
    </div>
  )
}