// Verification Page Logic
(function() {
  'use strict';
  
  console.log('🔑 Verification page loaded');
  
  // Get token from URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  
  const loadingState = document.getElementById('loading-state');
  const successState = document.getElementById('success-state');
  const errorState = document.getElementById('error-state');
  
  if (!token) {
    // No token provided
    showError();
    return;
  }
  
  // Verify token with extension
  verifyToken(token);
  
  async function verifyToken(token) {
    try {
      // Send verification message to extension
      const response = await chrome.runtime.sendMessage({
        type: 'VERIFY_TOKEN',
        token: token
      });
      
      if (response && response.status === 'verified') {
        showSuccess(token);
      } else {
        showError();
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      showError();
    }
  }
  
  function showSuccess(token) {
    loadingState.style.display = 'none';
    successState.style.display = 'block';
    
    // Update details
    document.getElementById('verify-time').textContent = new Date().toLocaleString();
    document.getElementById('token-display').textContent = token.substring(0, 8) + '...';
    
    // Add close button handler
    document.getElementById('close-tab-btn').addEventListener('click', () => {
      window.close();
    });
    
    console.log('✅ Verification successful');
    
    // Redirect to action choice page after 2 seconds
    setTimeout(() => {
      window.location.href = 'action-choice.html';
    }, 2000);
  }
  
  function showError() {
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
    
    console.log('❌ Verification failed');
  }
})();
