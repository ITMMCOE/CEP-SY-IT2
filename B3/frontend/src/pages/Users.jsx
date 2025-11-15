import { useEffect, useState } from 'react'
import axios from '../utils/axios'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    superusers: 0,
    staff: 0
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get('/api/users/')
      setUsers(res.data)
      
      // Calculate stats
      const total = res.data.length
      const active = res.data.filter(u => u.is_active).length
      const superusers = res.data.filter(u => u.is_superuser).length
      const staff = res.data.filter(u => u.is_staff).length
      
      setStats({ total, active, superusers, staff })
    } catch (e) {
      setError(e?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = () => {
    window.location.href = '/admin/auth/user/add/'
  }

  const handleManageGroups = () => {
    window.location.href = '/admin/auth/group/'
  }

  const handleEditUser = (userId) => {
    window.location.href = `/admin/auth/user/${userId}/change/`
  }

  if (loading) {
    return (
      <div className="container">
        <h1 className="page-title">User Management</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Loading users...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <h1 className="page-title">User Management</h1>
        <p style={{ color: '#ef5656' }}>{error}</p>
      </div>
    )
  }

  return (
    <div className="container">
      <h1 className="page-title">👥 User Management</h1>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: 20, 
        marginBottom: 32 
      }}>
        <div className="stat-card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Total Users
          </h3>
          <p style={{ fontSize: 40, fontWeight: 700, color: '#fff', margin: '10px 0 0 0' }}>
            {stats.total}
          </p>
        </div>

        <div className="stat-card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Active Users
          </h3>
          <p style={{ fontSize: 40, fontWeight: 700, color: '#fff', margin: '10px 0 0 0' }}>
            {stats.active}
          </p>
        </div>

        <div className="stat-card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Superusers
          </h3>
          <p style={{ fontSize: 40, fontWeight: 700, color: '#fff', margin: '10px 0 0 0' }}>
            {stats.superusers}
          </p>
        </div>

        <div className="stat-card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Staff Users
          </h3>
          <p style={{ fontSize: 40, fontWeight: 700, color: '#fff', margin: '10px 0 0 0' }}>
            {stats.staff}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <button
          onClick={handleCreateUser}
          style={{
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          ➕ Create New User
        </button>

        <button
          onClick={handleManageGroups}
          style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          👥 Manage Groups
        </button>
      </div>

      {/* Users Table */}
      <div className="card">
        <h2 style={{ marginTop: 0, marginBottom: 20, color: '#fff', fontSize: 20 }}>📋 All Users</h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 12,
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ background: 'rgba(233, 69, 96, 0.2)', borderBottom: '1px solid rgba(233, 69, 96, 0.3)' }}>
                <th style={{ padding: 16, textAlign: 'left', color: '#fff', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Username
                </th>
                <th style={{ padding: 16, textAlign: 'left', color: '#fff', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Email
                </th>
                <th style={{ padding: 16, textAlign: 'center', color: '#fff', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Status
                </th>
                <th style={{ padding: 16, textAlign: 'center', color: '#fff', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Role
                </th>
                <th style={{ padding: 16, textAlign: 'center', color: '#fff', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Groups
                </th>
                <th style={{ padding: 16, textAlign: 'center', color: '#fff', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Permissions
                </th>
                <th style={{ padding: 16, textAlign: 'center', color: '#fff', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr 
                  key={user.id}
                  style={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background 0.2s',
                    animation: `fadeIn 0.5s ease-out ${idx * 0.05}s backwards`
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(233, 69, 96, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: 16, color: '#fff' }}>
                    <strong>{user.username}</strong>
                  </td>
                  <td style={{ padding: 16, color: 'rgba(255, 255, 255, 0.8)' }}>
                    {user.email || '—'}
                  </td>
                  <td style={{ padding: 16, textAlign: 'center' }}>
                    {user.is_active ? (
                      <span style={{
                        background: 'rgba(56, 239, 125, 0.2)',
                        border: '1px solid rgba(56, 239, 125, 0.5)',
                        color: '#38ef7d',
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        Active
                      </span>
                    ) : (
                      <span style={{
                        background: 'rgba(239, 56, 56, 0.2)',
                        border: '1px solid rgba(239, 56, 56, 0.5)',
                        color: '#ef5656',
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        Inactive
                      </span>
                    )}
                  </td>
                  <td style={{ padding: 16, textAlign: 'center' }}>
                    {user.is_superuser ? (
                      <span style={{
                        background: 'rgba(220, 53, 69, 0.2)',
                        border: '1px solid rgba(220, 53, 69, 0.5)',
                        color: '#ff6b6b',
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        Superuser
                      </span>
                    ) : user.is_staff ? (
                      <span style={{
                        background: 'rgba(255, 193, 7, 0.2)',
                        border: '1px solid rgba(255, 193, 7, 0.5)',
                        color: '#ffd93d',
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        Staff
                      </span>
                    ) : (
                      <span style={{
                        background: 'rgba(108, 117, 125, 0.2)',
                        border: '1px solid rgba(108, 117, 125, 0.5)',
                        color: '#adb5bd',
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        User
                      </span>
                    )}
                  </td>
                  <td style={{ padding: 16, textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)' }}>
                    {user.groups?.length || 0}
                  </td>
                  <td style={{ padding: 16, textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)' }}>
                    {user.user_permissions?.length || 0}
                  </td>
                  <td style={{ padding: 16, textAlign: 'center' }}>
                    <button
                      onClick={() => handleEditUser(user.id)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                        e.target.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                        e.target.style.transform = 'translateY(0)'
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
