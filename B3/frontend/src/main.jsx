import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import Reports from './pages/Reports.jsx'
import Upload from './pages/Upload.jsx'
import Alerts from './pages/Alerts.jsx'
import Suppliers from './pages/Suppliers.jsx'
import Users from './pages/Users.jsx'
import Login from './pages/Login.jsx'
import './styles/global.css'

function App() {
  return (
    <StrictMode>
      <BrowserRouter>
        <Routes>
          {/* Public route - Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Default route redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/products" element={
            <ProtectedRoute>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/upload" element={
            <ProtectedRoute>
              <Layout>
                <Upload />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/alerts" element={
            <ProtectedRoute>
              <Layout>
                <Alerts />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/suppliers" element={
            <ProtectedRoute>
              <Layout>
                <Suppliers />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/users" element={
            <ProtectedRoute>
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')).render(<App />)
