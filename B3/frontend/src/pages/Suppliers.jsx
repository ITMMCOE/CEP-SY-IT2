import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from '../utils/axios'

export default function Suppliers() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    loadSuppliers()
    if (searchParams.get('action') === 'add') {
      setShowModal(true)
      setSearchParams({})
    }
  }, [])

  const loadSuppliers = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/suppliers/')
      setSuppliers(res.data)
    } catch (err) {
      console.error('Failed to load suppliers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingSupplier) {
        await axios.put(`/api/suppliers/${editingSupplier.id}/`, formData)
      } else {
        await axios.post('/api/suppliers/', formData)
      }
      setShowModal(false)
      setEditingSupplier(null)
      setFormData({ name: '', contact_person: '', email: '', phone: '', address: '' })
      loadSuppliers()
    } catch (err) {
      alert('Failed to save supplier: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier?')) return
    try {
      await axios.delete(`/api/suppliers/${id}/`)
      loadSuppliers()
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  return (
    <div className="container">
      <h1 className="page-title">🏢 Suppliers Management</h1>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className="btn" onClick={() => { setEditingSupplier(null); setShowModal(true); }}>
          ➕ Add Supplier
        </button>
        <button className="btn btn-secondary" onClick={loadSuppliers}>
          🔄 Refresh
        </button>
      </div>

      {loading && <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
        <p style={{ marginTop: 16, opacity: 0.7 }}>Loading suppliers...</p>
      </div>}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
          {suppliers.length > 0 ? suppliers.map((s, idx) => (
            <div 
              key={s.id}
              className="card"
              style={{ 
                animation: `slideUp 0.3s ease ${idx * 0.05}s both`,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 12, color: '#e94560' }}>
                  {s.name}
                </h3>
                {s.contact_person && (
                  <div style={{ marginBottom: 8, opacity: 0.9 }}>
                    <strong>👤 Contact:</strong> {s.contact_person}
                  </div>
                )}
                {s.email && (
                  <div style={{ marginBottom: 8, opacity: 0.9 }}>
                    <strong>📧 Email:</strong> <a href={`mailto:${s.email}`} style={{ color: '#e94560' }}>{s.email}</a>
                  </div>
                )}
                {s.phone && (
                  <div style={{ marginBottom: 8, opacity: 0.9 }}>
                    <strong>📞 Phone:</strong> {s.phone}
                  </div>
                )}
                {s.address && (
                  <div style={{ marginBottom: 8, opacity: 0.9 }}>
                    <strong>📍 Address:</strong> {s.address}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
                <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => handleEdit(s)}>
                  ✏️ Edit
                </button>
                <button className="btn btn-sm btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(s.id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          )) : (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏢</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>No suppliers yet</div>
              <p style={{ opacity: 0.7 }}>Click "Add Supplier" to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 24, fontSize: '1.8rem' }}>
              {editingSupplier ? '✏️ Edit Supplier' : '➕ Add New Supplier'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Supplier Name *</label>
                  <input
                    className="input-field"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Acme Metals Inc."
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Contact Person</label>
                  <input
                    className="input-field"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Email</label>
                    <input
                      className="input-field"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="contact@acme.com"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Phone</label>
                    <input
                      className="input-field"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Address</label>
                  <textarea
                    className="input-field"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="123 Main St, City, Country"
                    rows={3}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>
                  💾 Save Supplier
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
