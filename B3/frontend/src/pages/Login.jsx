import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post('/api/auth/login/', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data.success) {
        // Store authentication token or user info if needed
        localStorage.setItem('authenticated', 'true');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div className="card" style={{ maxWidth: 450, width: '100%', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            Eisen Inventory
          </h1>
          <p style={{ opacity: 0.7 }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.15)',
                fontSize: '1rem',
                color: '#fff',
                outline: 'none',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#333' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.15)',
                fontSize: '1rem',
                color: '#fff',
                outline: 'none',
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '1rem',
              background: 'rgba(239, 68, 96, 0.1)',
              border: '1px solid rgba(239, 68, 96, 0.3)',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              color: '#e94460',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 600,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', opacity: 0.7, fontSize: '0.9rem' }}>
          <p>
            Need access? Contact your administrator
          </p>
          <a 
            href="/admin" 
            style={{ 
              color: '#8b5cf6', 
              textDecoration: 'none',
              fontWeight: 600 
            }}
          >
            Admin Panel →
          </a>
        </div>
      </div>
    </div>
  );
}
