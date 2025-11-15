import { useEffect, useState } from 'react'
import axios from '../utils/axios'

export default function Reports() {
  const [monthlyData, setMonthlyData] = useState([])
  const [yearlyData, setYearlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState('monthly') // 'monthly' | 'yearly'

  useEffect(() => {
    loadData()
  }, [view])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      if (view === 'monthly') {
        const res = await axios.get('/api/stock-snapshots/monthly/')
        setMonthlyData(res.data)
      } else {
        const res = await axios.get('/api/stock-snapshots/yearly/')
        setYearlyData(res.data)
      }
    } catch (e) {
      setError(e?.message || 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const currentData = view === 'monthly' ? monthlyData : yearlyData

  return (
    <div className="container">
      <h1 className="page-title">📊 Stock Reports & Analytics</h1>

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <button 
          className={view === 'monthly' ? 'btn' : 'btn btn-secondary'}
          onClick={() => setView('monthly')}
        >
          📅 Monthly View
        </button>
        <button 
          className={view === 'yearly' ? 'btn' : 'btn btn-secondary'}
          onClick={() => setView('yearly')}
        >
          📆 Yearly View
        </button>
        <button className="btn btn-secondary" onClick={loadData}>
          🔄 Refresh
        </button>
      </div>

      {loading && <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
        <p style={{ marginTop: 16, opacity: 0.7 }}>Loading reports...</p>
      </div>}

      {error && <div className="card" style={{ borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
        <strong>Error:</strong> {error}
      </div>}

      {!loading && !error && (
        <>
          {currentData.length > 0 ? (
            <div className="card">
              <h2 style={{ fontSize: '1.5rem', marginBottom: 20, fontWeight: 700 }}>
                {view === 'monthly' ? 'Monthly' : 'Yearly'} Stock Summary
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>{view === 'monthly' ? 'Month' : 'Year'}</th>
                      <th>Avg Stock</th>
                      <th>Min Stock</th>
                      <th>Max Stock</th>
                      <th>Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((r, i) => {
                      const range = r.max_stock - r.min_stock
                      return (
                        <tr key={i} style={{ animation: `slideUp 0.3s ease ${i * 0.03}s both` }}>
                          <td style={{ fontWeight: 600 }}>{r.product__name}</td>
                          <td>{view === 'monthly' 
                            ? new Date(r.month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                            : new Date(r.year).getFullYear()
                          }</td>
                          <td style={{ fontWeight: 600, color: '#e94560' }}>
                            {Number(r.avg_stock).toFixed(1)}
                          </td>
                          <td>{r.min_stock}</td>
                          <td>{r.max_stock}</td>
                          <td>
                            <div style={{ 
                              display: 'inline-block',
                              padding: '4px 10px',
                              background: range > 50 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                              borderRadius: 8,
                              fontSize: '0.9rem'
                            }}>
                              {range}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 20, opacity: 0.7, fontSize: '0.9rem' }}>
                Showing {currentData.length} records
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>📊</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>No snapshot data available</div>
              <p style={{ opacity: 0.7, marginBottom: 20 }}>
                Stock snapshots are created automatically. If this is a new system, please wait or run the snapshot command manually.
              </p>
              <code style={{ 
                display: 'block',
                padding: 16,
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 8,
                fontSize: '0.9rem',
                maxWidth: 500,
                margin: '0 auto'
              }}>
                python manage.py snapshot_stock_levels
              </code>
            </div>
          )}

          {/* Summary Stats */}
          {currentData.length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 16,
              marginTop: 24
            }}>
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#e94560', marginBottom: 8 }}>
                  {new Set(currentData.map(r => r.product__name)).size}
                </div>
                <div style={{ opacity: 0.8 }}>Products Tracked</div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>
                  {currentData.length}
                </div>
                <div style={{ opacity: 0.8 }}>Total Records</div>
              </div>
              <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981', marginBottom: 8 }}>
                  {(currentData.reduce((sum, r) => sum + Number(r.avg_stock), 0) / currentData.length).toFixed(0)}
                </div>
                <div style={{ opacity: 0.8 }}>Overall Avg Stock</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

