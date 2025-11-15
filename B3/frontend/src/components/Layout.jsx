import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import StaggeredMenu from './StaggeredMenu';
import axios from '../utils/axios';
import './Layout.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const menuItems = [
    { label: 'Dashboard', link: '/dashboard' },
    { label: 'Products', link: '/products' },
    { label: 'Suppliers', link: '/suppliers' },
    { label: 'Alerts', link: '/alerts' },
    { label: 'Reports', link: '/reports' },
    { label: 'Upload', link: '/upload' },
    { label: 'Users', link: '/users' },
  ];

  const socialItems = [
    { label: user ? `👤 ${user.username}` : 'Login', link: user ? '#' : '/login' },
    { label: user ? 'Logout' : 'Register', link: user ? '#logout' : '/register' },
  ];

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/auth/user/');
      if (res.data.authenticated) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    }
  };

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleBack = () => {
    if (location.pathname === '/dashboard') {
      // Already on dashboard, toggle menu
      setIsMenuOpen(!isMenuOpen);
    } else {
      navigate(-1);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout/');
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleMenuItemClick = (link) => {
    if (link === '#logout') {
      handleLogout();
    }
  };

  return (
    <div className="layout">
      {/* Header with back button and menu button */}
      <header className="layout-header">
        <button className="header-btn back-btn" onClick={handleBack} title="Go Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        
        <h1 className="header-title">Eisen Inventory</h1>
        
        <button className="header-btn menu-btn" onClick={toggleMenu} title="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </button>
      </header>

      {/* Main content */}
      <main className="layout-content">
        {children}
      </main>

      {/* Staggered Menu Overlay */}
      <StaggeredMenu 
        isOpen={isMenuOpen} 
        onClose={setIsMenuOpen}
        items={menuItems}
        socialItems={socialItems}
        displayItemNumbering={true}
        displaySocials={true}
        accentColor="#8b5cf6"
        colors={['#667eea', '#764ba2']}
        onItemClick={handleMenuItemClick}
      />
    </div>
  );
};

export default Layout;
