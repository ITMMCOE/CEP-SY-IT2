import { useEffect, useState } from 'react'
import axios from '../utils/axios'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('active') // 'all', 'active', 'resolved'

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/stock-alerts/')
      setAlerts(res.data)
    } catch (err) {
      console.error('Failed to load alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (alertId) => {
    try {
      await axios.post(`/api/stock-alerts/${alertId}/resolve/`)
      loadAlerts()
    } catch (err) {
      alert('Failed to resolve: ' + err.message)
    }
  }

  const handleEvaluateAll = async () => {
    try {
      await axios.post('/api/stock-alerts/evaluate/')
      loadAlerts()
    } catch (err) {
      alert('Failed to evaluate: ' + err.message)
    }
  }

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'active') return !a.resolved_at
    if (filter === 'resolved') return a.resolved_at
    return true
  })

  const activeCount = alerts.filter(a => !a.resolved_at).length

  return (
    <div className="container">
      <h1 className="page-title">🚨 Stock Alerts</h1>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <div className="stat-card" style={{ flex: '1 1 200px' }}>
          <h3 style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {activeCount}
          </h3>
          <p>Active Alerts</p>
        </div>
        <div className="stat-card" style={{ flex: '1 1 200px' }}>
          <h3>{alerts.filter(a => a.resolved_at).length}</h3>
          <p>Resolved</p>
        </div>
        <div className="stat-card" style={{ flex: '1 1 200px' }}>
          <h3>{alerts.length}</h3>
          <p>Total Alerts</p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <select 
          className="input-field" 
          style={{ flex: '0 0 180px' }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Alerts</option>
          <option value="active">Active Only</option>
          <option value="resolved">Resolved Only</option>
        </select>
        <button className="btn" onClick={handleEvaluateAll}>
          🔍 Evaluate All Products
        </button>
        <button className="btn btn-secondary" onClick={loadAlerts}>
          🔄 Refresh
        </button>
      </div>

      {loading && <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
        <p style={{ marginTop: 16, opacity: 0.7 }}>Loading alerts...</p>
      </div>}

      {!loading && (
        <div className="card">
          {filteredAlerts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredAlerts.map((alert, idx) => (
                <div
                  key={alert.id}
                  style={{
                    padding: 20,
                    background: alert.resolved_at 
                      ? 'rgba(16, 185, 129, 0.1)' 
                      : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${alert.resolved_at ? '#10b981' : '#ef4444'}`,
                    borderRadius: 16,
                    animation: `slideUp 0.3s ease ${idx * 0.05}s both`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>
                        {alert.product_name || `Product #${alert.product}`}
                      </div>
                      <div style={{ 
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: alert.alert_type === 'LOW_STOCK' ? '#ef4444' : '#f59e0b',
                        borderRadius: 8,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        marginBottom: 8
                      }}>
                        {alert.alert_type}
                      </div>
                      <div style={{ opacity: 0.9, marginTop: 8 }}>{alert.message}</div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: 8 }}>
                        Created: {new Date(alert.created_at).toLocaleString()}
                      </div>
                      {alert.resolved_at && (
                        <div style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: 4, color: '#6ee7b7' }}>
                          ✅ Resolved: {new Date(alert.resolved_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div>
                      {!alert.resolved_at && (
                        <button 
                          className="btn btn-sm"
                          onClick={() => handleResolve(alert.id)}
                        >
                          ✅ Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 60, opacity: 0.6 }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>No {filter !== 'all' ? filter : ''} alerts found</div>
              <p style={{ marginTop: 8 }}>Your inventory is looking good!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
