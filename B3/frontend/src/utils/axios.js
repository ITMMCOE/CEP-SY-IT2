import axios from 'axios'

// Optional: use environment variable for API base URL when serving frontend from Netlify (or any CDN)
// If VITE_API_BASE_URL is not set, axios will use relative paths against the same origin (Django-served mode)
let API_BASE
try {
  // This is available in Vite at build/runtime for the frontend
  API_BASE = import.meta.env && import.meta.env.VITE_API_BASE_URL
} catch (e) {
  // ignore if not running under Vite (e.g., server-side or non-ESM context)
}
if (API_BASE) {
  axios.defaults.baseURL = API_BASE
}

// Get CSRF token from cookie
function getCookie(name) {
  let cookieValue = null
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}

// Configure axios defaults
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.withCredentials = true

// Add interceptor to include CSRF token
axios.interceptors.request.use(
  (config) => {
    const token = getCookie('csrftoken')
    if (token) {
      config.headers['X-CSRFToken'] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default axios
