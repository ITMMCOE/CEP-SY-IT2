// Session Controller - Content Script
// Handles session freezing, unfreezing, and access control

(function() {
  'use strict';
  
  console.log('🔒 Session Controller activated');
  
  let sessionFrozen = false;
  let accessLevel = 'full'; // 'full', 'limited', 'blocked'
  let freezeOverlay = null;
  
  // Listen for freeze/unfreeze commands
  window.addEventListener('FREEZE_SESSION', handleFreeze);
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 Session controller received message:', message.type);
    
    switch (message.type) {
      case 'UNFREEZE_SESSION':
        console.log('Handling UNFREEZE_SESSION with access level:', message.accessLevel);
        handleUnfreeze(message.accessLevel);
        sendResponse({ status: 'unfrozen', accessLevel: message.accessLevel });
        break;
        
      case 'SHOW_LIMITED_ACCESS_BANNER':
        console.log('Handling SHOW_LIMITED_ACCESS_BANNER');
        showLimitedAccessBanner();
        sendResponse({ status: 'shown' });
        break;
        
      default:
        console.log('Unknown message type:', message.type);
        sendResponse({ status: 'unknown_command' });
    }
    return true;
  });
  
  // Freeze the session (disable all interactions)
  function handleFreeze(event) {
    if (sessionFrozen) return;
    
    console.log('❄️ Freezing session...');
    sessionFrozen = true;
    
    // Create full-screen overlay
    createFreezeOverlay();
    
    // Disable all interactions
    disableInteractions();
    
    // Blur the page content
    document.body.style.filter = 'blur(5px)';
    document.body.style.pointerEvents = 'none';
    document.body.style.userSelect = 'none';
  }
  
  // Create visual freeze overlay
  function createFreezeOverlay() {
    if (freezeOverlay) return;
    
    freezeOverlay = document.createElement('div');
    freezeOverlay.id = 'behavioral-auth-freeze-overlay';
    freezeOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 2147483647;
      display: flex;
      justify-content: center;
      align-items: center;
      backdrop-filter: blur(10px);
    `;
    
    const message = document.createElement('div');
    message.style.cssText = `
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 50px rgba(0,0,0,0.5);
      text-align: center;
      max-width: 500px;
      animation: fadeIn 0.3s ease-in;
    `;
    
    message.innerHTML = `
      <div style="font-size: 60px; margin-bottom: 20px;">🔒</div>
      <h2 style="margin: 0 0 10px 0; color: #d32f2f;">Session Frozen</h2>
      <p style="margin: 0; color: #666; font-size: 14px;">
        Unusual behavior detected. Please verify your identity.
      </p>
      <div style="margin-top: 20px;">
        <div class="spinner"></div>
      </div>
    `;
    
    freezeOverlay.appendChild(message);
    document.body.appendChild(freezeOverlay);
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      .spinner {
        border: 3px solid #f3f3f3;
        border-top: 3px solid #1976d2;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 1s linear infinite;
        margin: 0 auto;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Disable all page interactions
  function disableInteractions() {
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    
    // Disable all inputs
    document.querySelectorAll('input, textarea, select, button, a').forEach(element => {
      element.setAttribute('data-behavioral-auth-disabled', 'true');
      element.disabled = true;
      element.style.pointerEvents = 'none';
    });
    
    // Prevent form submissions
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', preventAction, true);
    });
    
    // Prevent clicks
    document.addEventListener('click', preventAction, true);
    document.addEventListener('contextmenu', preventAction, true);
    
    // Prevent keyboard input
    document.addEventListener('keydown', preventAction, true);
    document.addEventListener('keypress', preventAction, true);
  }
  
  // Prevent default action
  function preventAction(event) {
    if (sessionFrozen) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
  }
  
  // Unfreeze the session
  function handleUnfreeze(newAccessLevel) {
    console.log(`🔓 Unfreezing session with ${newAccessLevel} access`);
    
    sessionFrozen = false;
    accessLevel = newAccessLevel;
    
    // Remove freeze overlay
    if (freezeOverlay) {
      freezeOverlay.remove();
      freezeOverlay = null;
    }
    
    // ALSO remove the lock overlay created by triggerSecurityAlert
    const lockOverlay = document.getElementById('behavior-auth-lock');
    if (lockOverlay) {
      lockOverlay.remove();
      console.log('✅ Lock overlay removed');
    } else {
      console.log('⚠️ Lock overlay not found by ID, searching...');
      // Try to find it by searching for the lock screen text
      document.querySelectorAll('div').forEach(div => {
        if (div.innerText && div.innerText.includes('Session Locked')) {
          const parent = div.closest('div[style*="z-index: 2147483647"]');
          if (parent) {
            parent.remove();
            console.log('✅ Lock overlay found and removed via search');
          }
        }
      });
    }
    
    // Restore page appearance (force with !important by using style.setProperty)
    document.body.style.removeProperty('filter');
    document.body.style.removeProperty('pointer-events');
    document.body.style.removeProperty('user-select');
    document.body.style.removeProperty('overflow');
    document.body.style.setProperty('pointer-events', 'auto', 'important');
    console.log('✅ Page appearance restored');
    
    // Re-enable interactions based on access level
    if (newAccessLevel === 'full') {
      enableFullAccess();
    } else if (newAccessLevel === 'limited') {
      enableLimitedAccess();
    }
    
    // Remove event listeners
    document.removeEventListener('click', preventAction, true);
    document.removeEventListener('contextmenu', preventAction, true);
    document.removeEventListener('keydown', preventAction, true);
    document.removeEventListener('keypress', preventAction, true);
  }
  
  // Enable full access
  function enableFullAccess() {
    document.querySelectorAll('[data-behavioral-auth-disabled]').forEach(element => {
      element.removeAttribute('data-behavioral-auth-disabled');
      element.disabled = false;
      element.style.pointerEvents = '';
    });
    
    console.log('✅ Full access restored');
  }
  
  // Enable limited access (with restrictions)
  function enableLimitedAccess() {
    // Enable most elements
    document.querySelectorAll('[data-behavioral-auth-disabled]').forEach(element => {
      // Keep password fields disabled
      if (element.type !== 'password') {
        element.removeAttribute('data-behavioral-auth-disabled');
        element.disabled = false;
        element.style.pointerEvents = '';
      }
    });
    
    // Explicitly disable password fields
    document.querySelectorAll('input[type="password"]').forEach(input => {
      input.disabled = true;
      input.style.opacity = '0.5';
      input.style.pointerEvents = 'none';
      input.title = '🔒 Password access blocked in limited mode';
      
      // Add visual indicator
      if (!input.previousElementSibling || !input.previousElementSibling.classList.contains('limited-access-badge')) {
        const badge = document.createElement('span');
        badge.className = 'limited-access-badge';
        badge.style.cssText = `
          display: inline-block;
          background: #ff9800;
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 10px;
          margin-right: 5px;
          font-weight: bold;
        `;
        badge.textContent = '🔒 BLOCKED';
        input.parentNode.insertBefore(badge, input);
      }
    });
    
    // Disable autofill
    document.querySelectorAll('input').forEach(input => {
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('data-form-type', 'other');
    });
    
    console.log('🔒 Limited access enabled');
  }
  
  // Show limited access banner
  function showLimitedAccessBanner() {
    const banner = document.createElement('div');
    banner.id = 'limited-access-banner';
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #ff9800, #f57c00);
      color: white;
      padding: 12px 20px;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      z-index: 2147483646;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      animation: slideDown 0.3s ease-out;
    `;
    
    // Create elements without innerHTML (CSP compliant)
    const strong = document.createElement('strong');
    strong.textContent = '🔒 Limited Access Mode';
    
    const span = document.createElement('span');
    span.style.cssText = 'margin-left: 20px; opacity: 0.9;';
    span.textContent = 'Passwords and sensitive settings are restricted. ';
    
    const link = document.createElement('a');
    link.href = '#';
    link.id = 'restore-access-link';
    link.style.cssText = 'color: white; text-decoration: underline; margin-left: 10px;';
    link.textContent = 'Restore Full Access';
    
    // Handle restore access click
    link.addEventListener('click', (e) => {
      e.preventDefault();
      // This would trigger re-authentication
      chrome.runtime.sendMessage({ type: 'REQUEST_FULL_ACCESS' });
    });
    
    span.appendChild(link);
    banner.appendChild(strong);
    banner.appendChild(span);
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.insertBefore(banner, document.body.firstChild);
    
    // Add body padding to prevent content from being hidden
    document.body.style.paddingTop = banner.offsetHeight + 'px';
  }
  
  console.log('✅ Session controller ready');
  
})();
