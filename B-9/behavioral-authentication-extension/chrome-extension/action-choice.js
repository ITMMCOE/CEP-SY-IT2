// Action Choice Logic
(function() {
  'use strict';
  
  console.log('🔐 Action choice page loaded');
  
  // Add click handlers
  document.getElementById('option-yes').addEventListener('click', () => {
    handleAction('YES_ITS_ME');
  });
  
  document.getElementById('option-known').addEventListener('click', () => {
    handleAction('SOMEONE_I_KNOW');
  });
  
  document.getElementById('option-not-me').addEventListener('click', () => {
    handleAction('NOT_ME');
  });
  
  async function handleAction(response) {
    console.log('Selected action:', response);
    
    try {
      // Send response to extension
      await chrome.runtime.sendMessage({
        type: 'SECURITY_RESPONSE',
        response: response
      });
      
      // Show confirmation and close
      showConfirmation(response);
      
      setTimeout(() => {
        window.close();
      }, 2000);
      
    } catch (error) {
      console.error('Error sending response:', error);
    }
  }
  
  function showConfirmation(response) {
    const container = document.querySelector('.container');
    let message = '';
    
    switch (response) {
      case 'YES_ITS_ME':
        message = '✅ Full access restored!';
        break;
      case 'SOMEONE_I_KNOW':
        message = '🔒 Limited access enabled';
        break;
      case 'NOT_ME':
        message = '🚨 Session terminated';
        break;
    }
    
    container.innerHTML = `
      <div class="icon">✓</div>
      <h1>${message}</h1>
      <p class="subtitle">This tab will close automatically...</p>
    `;
  }
})();
