import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from '../utils/axios'
import SplitText from '../components/SplitText.jsx'

export default function Home() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    activeAlerts: 0,
    totalSuppliers: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/products/'),
      axios.get('/api/stock-alerts/'),
      axios.get('/api/suppliers/')
    ])
      .then(([productsRes, alertsRes, suppliersRes]) => {
        const products = productsRes.data
        const alerts = alertsRes.data
        const lowStock = products.filter(p => 
          p.reorder_status === 'LOW' || p.reorder_status === 'APPROACHING'
        ).length

        setStats({
          totalProducts: products.length,
          lowStockCount: lowStock,
          activeAlerts: alerts.filter(a => !a.resolved_at).length,
          totalSuppliers: suppliersRes.data.length
        })

        setRecentActivity(alerts.slice(0, 5))
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load dashboard data:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ minHeight: '100vh', position: 'relative', paddingBottom: 60 }}>
      <div className="container">
        {/* Hero Section */}
        <div style={{ textAlign: 'center', padding: '80px 0 60px', position: 'relative' }}>
          {/* Company Logo */}
          <img
            src="/assets/eisen-logo.png"
            alt="Eisen Group logo"
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto 18px',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))'
            }}
          />
          <SplitText
            text="Eisen Traders"
            className="text-4xl"
            delay={60}
            duration={0.5}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-50px"
            textAlign="center"
            tag="h1"
          />
          <p style={{ 
            fontSize: '1.2rem', 
            opacity: 0.85, 
            marginTop: 16, 
            fontWeight: 300,
            letterSpacing: '0.5px'
          }}>
            Intelligent Inventory Management System
          </p>
          <p style={{ fontSize: '0.95rem', opacity: 0.6, marginTop: 8 }}>
            Streamline your stock control with real-time alerts and analytics
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: 24, 
          marginBottom: 48 
        }}>
          <Link to="/products" style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <h3>{loading ? '...' : stats.totalProducts}</h3>
              <p>Total Products</p>
            </div>
          </Link>
          <Link to="/products?filter=low" style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <h3 style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {loading ? '...' : stats.lowStockCount}
              </h3>
              <p>Low Stock Items</p>
            </div>
          </Link>
          <Link to="/alerts" style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <h3 style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {loading ? '...' : stats.activeAlerts}
              </h3>
              <p>Active Alerts</p>
            </div>
          </Link>
          <Link to="/suppliers" style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <h3 style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {loading ? '...' : stats.totalSuppliers}
              </h3>
              <p>Suppliers</p>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 20, fontWeight: 700 }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/products?action=add"><button className="btn btn-sm">➕ Add Product</button></Link>
            <Link to="/upload"><button className="btn btn-sm btn-secondary">📤 Upload Data</button></Link>
            <Link to="/reports"><button className="btn btn-sm btn-secondary">📊 View Reports</button></Link>
            <Link to="/suppliers?action=add"><button className="btn btn-sm btn-secondary">🏢 Add Supplier</button></Link>
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="card">
            <h2 style={{ fontSize: '1.5rem', marginBottom: 20, fontWeight: 700 }}>Recent Alerts</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentActivity.map((alert, idx) => (
                <div 
                  key={alert.id}
                  style={{
                    padding: 16,
                    background: 'rgba(239, 68, 96, 0.1)',
                    border: '1px solid rgba(239, 68, 96, 0.2)',
                    borderRadius: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    animation: `slideUp 0.3s ease ${idx * 0.1}s both`
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{alert.product_name || 'Product'}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{alert.alert_type}: {alert.message}</div>
                  </div>
                  <span className={`pill ${alert.resolved_at ? 'ok' : 'low'}`}>
                    {alert.resolved_at ? 'Resolved' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
            <Link to="/alerts" style={{ display: 'inline-block', marginTop: 16, color: '#e94560', fontWeight: 600 }}>
              View All Alerts →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
