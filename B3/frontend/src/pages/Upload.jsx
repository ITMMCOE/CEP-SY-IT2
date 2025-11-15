import { useState } from 'react'
import axios from '../utils/axios'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [mode, setMode] = useState('append')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      const ext = selected.name.split('.').pop().toLowerCase()
      if (!['csv', 'xlsx', 'xls'].includes(ext)) {
        setError('Please upload a CSV or Excel file')
        setFile(null)
        return
      }
      setFile(selected)
      setError('')
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    
    setUploading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('mode', mode)

    try {
      const ext = file.name.split('.').pop().toLowerCase()
      const endpoint = ['xlsx', 'xls'].includes(ext) ? '/api/uploads/upload_excel/' : '/api/uploads/upload_csv/'
      
      const res = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      // Backend returns {import_result: {created, updated, mode}} 
      const resultData = res.data.import_result || res.data
      setResult(resultData)
      console.log('Upload result:', resultData)
      setFile(null)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || err.message || 'Upload failed'
      setError(errorMsg)
      console.error('Upload error:', err.response?.data)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container">
      <h1 className="page-title">📤 Upload Inventory Data</h1>

      <div className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16 }}>Upload CSV or Excel File</h2>
        <p style={{ opacity: 0.7, marginBottom: 24 }}>
          Import products, update stock levels, or replace your entire inventory with a single file.
        </p>

        {/* File Upload */}
        <div 
          style={{
            border: '2px dashed rgba(233, 69, 96, 0.4)',
            borderRadius: 16,
            padding: 48,
            textAlign: 'center',
            marginBottom: 24,
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            background: file ? 'rgba(233, 69, 96, 0.1)' : 'transparent'
          }}
          onClick={() => document.getElementById('file-input').click()}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#e94560' }}
          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(233, 69, 96, 0.4)' }}
          onDrop={(e) => {
            e.preventDefault()
            if (e.dataTransfer.files[0]) {
              const fakeEvent = { target: { files: [e.dataTransfer.files[0]] } }
              handleFileChange(fakeEvent)
            }
            e.currentTarget.style.borderColor = 'rgba(233, 69, 96, 0.4)'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📁</div>
          {file ? (
            <>
              <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>{file.name}</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>{(file.size / 1024).toFixed(1)} KB</div>
            </>
          ) : (
            <>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Drop file here or click to browse</div>
              <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>Supports CSV, XLSX, XLS files</div>
            </>
          )}
          <input
            id="file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Mode Selection */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 12, fontWeight: 600 }}>Import Mode</label>
          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ 
              flex: 1, 
              padding: 16, 
              border: `2px solid ${mode === 'append' ? '#e94560' : 'rgba(233, 69, 96, 0.2)'}`,
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: mode === 'append' ? 'rgba(233, 69, 96, 0.1)' : 'transparent'
            }}>
              <input
                type="radio"
                value="append"
                checked={mode === 'append'}
                onChange={(e) => setMode(e.target.value)}
                style={{ marginRight: 8 }}
              />
              <strong>Append</strong> - Add new products or update existing ones
            </label>
            <label style={{ 
              flex: 1, 
              padding: 16, 
              border: `2px solid ${mode === 'replace_all' ? '#e94560' : 'rgba(233, 69, 96, 0.2)'}`,
              borderRadius: 12,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: mode === 'replace_all' ? 'rgba(233, 69, 96, 0.1)' : 'transparent'
            }}>
              <input
                type="radio"
                value="replace_all"
                checked={mode === 'replace_all'}
                onChange={(e) => setMode(e.target.value)}
                style={{ marginRight: 8 }}
              />
              <strong>Replace All</strong> - Clear inventory and import fresh data
            </label>
          </div>
        </div>

        {/* Upload Button */}
        <button 
          className="btn" 
          onClick={handleUpload} 
          disabled={!file || uploading}
          style={{ 
            width: '100%', 
            opacity: !file || uploading ? 0.5 : 1,
            cursor: !file || uploading ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? '⏳ Uploading...' : '🚀 Upload & Import'}
        </button>

        {/* Error */}
        {error && (
          <div style={{ 
            marginTop: 24, 
            padding: 16, 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid #ef4444',
            borderRadius: 12,
            color: '#f87171'
          }}>
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div style={{ 
            marginTop: 24, 
            padding: 20, 
            background: 'rgba(16, 185, 129, 0.1)', 
            border: '1px solid #10b981',
            borderRadius: 12,
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 12, color: '#6ee7b7' }}>
              ✅ Upload Successful!
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.9rem' }}>
              <div>
                <strong>Created:</strong> {result.created || 0} products
              </div>
              <div>
                <strong>Updated:</strong> {result.updated || 0} products
              </div>
              {result.deleted !== undefined && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Deleted:</strong> {result.deleted} products
                </div>
              )}
            </div>
            {result.message && (
              <div style={{ marginTop: 12, opacity: 0.8 }}>{result.message}</div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="card" style={{ maxWidth: 700, margin: '32px auto 0' }}>
        <h3 style={{ marginBottom: 16, fontSize: '1.2rem' }}>📋 File Format Requirements</h3>
        <p style={{ marginBottom: 12, opacity: 0.8 }}>Your CSV/Excel file must include these columns in this exact order:</p>
        <ul style={{ paddingLeft: 20, opacity: 0.8, lineHeight: 1.8 }}>
          <li><code>SR NO.</code> - Serial number (any value)</li>
          <li><code>PRODUCT NAME</code> - Name of the product</li>
          <li><code>PRODUCT ID</code> - Unique SKU/ID for the product</li>
          <li><code>PRODUCTS ORDERED</code> - Number of products ordered (optional)</li>
          <li><code>PRODUCTS USED</code> - Number of products used (optional)</li>
          <li><code>PRODUCTS IN STOCK</code> - Current stock level (number)</li>
          <li><code>RESTOCK</code> - Use "NEEDS RESTOCK" to set minimum stock to 15, otherwise defaults to 5</li>
        </ul>
        <p style={{ marginTop: 16, opacity: 0.6, fontSize: '0.9rem' }}>
          💡 Tip: Excel files (.xlsx or .xls) will be automatically converted to CSV format
        </p>
      </div>
    </div>
  )
}
