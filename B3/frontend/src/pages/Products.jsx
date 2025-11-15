import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from '../utils/axios'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    current_stock_level: 0,
    minimum_stock_level: 0,
    reorder_point: 0,
    safety_stock: 0
  })

  useEffect(() => {
    loadProducts()
    if (searchParams.get('action') === 'add') {
      setShowModal(true)
      setSearchParams({})
    }
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get('/api/products/')
      setProducts(res.data)
    } catch (e) {
      setError(e?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}/`, formData)
      } else {
        await axios.post('/api/products/', formData)
      }
      setShowModal(false)
      setEditingProduct(null)
      setFormData({ sku: '', name: '', current_stock_level: 0, minimum_stock_level: 0, reorder_point: 0, safety_stock: 0 })
      loadProducts()
    } catch (err) {
      alert('Failed to save product: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      sku: product.sku,
      name: product.name,
      current_stock_level: product.current_stock_level || 0,
      minimum_stock_level: product.minimum_stock_level || 0,
      reorder_point: product.reorder_point || 0,
      safety_stock: product.safety_stock || 0
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await axios.delete(`/api/products/${id}/`)
      loadProducts()
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'low' && (p.reorder_status === 'LOW' || p.reorder_status === 'APPROACHING'))

    return matchesSearch && matchesFilter
  })

  return (
    <div className="container">
      <h1 className="page-title">Products Management</h1>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input-field"
          style={{ flex: '1 1 300px', maxWidth: 400 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search by name or SKU..."
        />
        <select 
          className="input-field" 
          style={{ flex: '0 0 160px' }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="low">Low Stock Only</option>
        </select>
        <button className="btn" onClick={() => { setEditingProduct(null); setShowModal(true); }}>
          ➕ Add Product
        </button>
        <button className="btn btn-secondary" onClick={loadProducts}>
          🔄 Refresh
        </button>
      </div>

      {loading && <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
        <p style={{ marginTop: 16, opacity: 0.7 }}>Loading products...</p>
      </div>}

      {error && <div className="card" style={{ borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
        <strong>Error:</strong> {error}
      </div>}

      {!loading && !error && (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Current Stock</th>
                  <th>Min Stock</th>
                  <th>Reorder Point</th>
                  <th>Safety Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? filteredProducts.map((p, idx) => (
                  <tr key={p.id} style={{ animation: `slideUp 0.3s ease ${idx * 0.05}s both` }}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', color: '#e94560' }}>{p.sku}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.current_stock_level}</td>
                    <td>{p.minimum_stock_level}</td>
                    <td>{p.reorder_point || '—'}</td>
                    <td>{p.safety_stock || '—'}</td>
                    <td>
                      <span className={`pill ${String(p.reorder_status || 'ok').toLowerCase()}`}>
                        {p.reorder_status || 'OK'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-secondary" style={{ marginRight: 8 }} onClick={() => handleEdit(p)}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', opacity: 0.6, padding: 40 }}>
                      No products found. Click "Add Product" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, opacity: 0.7, fontSize: '0.9rem' }}>
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 24, fontSize: '1.8rem' }}>
              {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>SKU *</label>
                  <input
                    className="input-field"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    placeholder="e.g. PROD-001"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Product Name *</label>
                  <input
                    className="input-field"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Steel Pipes"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Current Stock</label>
                    <input
                      className="input-field"
                      type="number"
                      value={formData.current_stock_level}
                      onChange={(e) => setFormData({...formData, current_stock_level: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Minimum Stock</label>
                    <input
                      className="input-field"
                      type="number"
                      value={formData.minimum_stock_level}
                      onChange={(e) => setFormData({...formData, minimum_stock_level: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Reorder Point</label>
                    <input
                      className="input-field"
                      type="number"
                      value={formData.reorder_point}
                      onChange={(e) => setFormData({...formData, reorder_point: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Safety Stock</label>
                    <input
                      className="input-field"
                      type="number"
                      value={formData.safety_stock}
                      onChange={(e) => setFormData({...formData, safety_stock: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>
                  💾 Save Product
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                  ✖️ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

