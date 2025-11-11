// Security Alert Modal Logic
(function() {
  'use strict';
  
  console.log('🚨 Security Alert Modal loaded');
  
  let anomalyData = null;
  
  // Get anomaly data from URL parameters or storage
  async function loadAnomalyData() {
    const params = new URLSearchParams(window.location.search);
    const score = params.get('score');
    const timestamp = params.get('timestamp');
    
    if (score && timestamp) {
      anomalyData = {
        score: parseFloat(score),
        timestamp: parseInt(timestamp),
        features: {}
      };
    } else {
      // Load from storage
      const result = await chrome.storage.local.get(['currentAnomaly']);
      anomalyData = result.currentAnomaly || { score: 0, timestamp: Date.now() };
    }
    
    displayAnomalyData();
  }
  
  // Display anomaly information
  function displayAnomalyData() {
    const scoreElement = document.getElementById('anomalyScore');
    const timeElement = document.getElementById('detectionTime');
    
    if (anomalyData) {
      // Format score as percentage
      const scorePercent = (anomalyData.score * 100).toFixed(1);
      scoreElement.textContent = `${scorePercent}% (${getSeverityLabel(anomalyData.score)})`;
      scoreElement.style.color = getSeverityColor(anomalyData.score);
      
      // Format timestamp
      const date = new Date(anomalyData.timestamp);
      timeElement.textContent = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
  }
  
  // Get severity label based on score
  function getSeverityLabel(score) {
    if (score >= 0.9) return 'Critical';
    if (score >= 0.75) return 'High';
    if (score >= 0.65) return 'Medium';
    return 'Low';
  }
  
  // Get severity color
  function getSeverityColor(score) {
    if (score >= 0.9) return '#b71c1c';
    if (score >= 0.75) return '#d32f2f';
    if (score >= 0.65) return '#ff5722';
    return '#ff9800';
  }
  
  // Handle button clicks
  function handleResponse(response) {
    console.log(`User response: ${response}`);
    
    // Show loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'flex';
    
    // Send encrypted HTTPS message
    sendSecurityAlert(response).then(() => {
      // Send response to background script
      chrome.runtime.sendMessage({
        type: 'SECURITY_RESPONSE',
        response: response,
        timestamp: Date.now(),
        anomalyData: anomalyData
      }, (result) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending response:', chrome.runtime.lastError);
          return;
        }
        
        console.log('Response sent successfully:', result);
        
        // Close alert window after short delay
        setTimeout(() => {
          if (response === 'no') {
            // For "not me" response, show termination message
            showTerminationMessage();
          } else {
            window.close();
          }
        }, 1000);
      });
    });
  }
  
  // Send encrypted HTTPS security alert to user's email
  async function sendSecurityAlert(response) {
    try {
      // Get user email from storage
      const { userEmail } = await chrome.storage.sync.get(['userEmail']);
      
      if (!userEmail) {
        console.warn('No user email configured');
        return;
      }
      
      // Prepare alert data
      const alertData = {
        timestamp: new Date().toISOString(),
        anomalyScore: anomalyData?.score,
        userResponse: response,
        browserInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        },
        sessionInfo: {
          url: window.location.href,
          timestamp: anomalyData?.timestamp
        }
      };
      
      // Encrypt data (using Web Crypto API)
      const encryptedData = await encryptData(JSON.stringify(alertData));
      
      // Send to webhook/email service (placeholder URL)
      const webhookUrl = 'https://api.behavioral-auth.example.com/security-alert';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          encryptedPayload: encryptedData,
          subject: '🔒 Security Alert: Unusual Behavior Detected'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      console.log('✅ Security alert sent successfully');
      
    } catch (error) {
      console.error('❌ Failed to send security alert:', error);
      // Continue anyway - don't block user action
    }
  }
  
  // Encrypt data using Web Crypto API
  async function encryptData(data) {
    try {
      // Generate a key (in production, use stored key or key exchange)
      const key = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256
        },
        true,
        ['encrypt']
      );
      
      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt
      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        new TextEncoder().encode(data)
      );
      
      // Return base64-encoded result
      const encryptedArray = new Uint8Array(encrypted);
      return {
        data: btoa(String.fromCharCode.apply(null, encryptedArray)),
        iv: btoa(String.fromCharCode.apply(null, iv)),
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('Encryption error:', error);
      // Fallback: return base64-encoded data (not secure, just for demo)
      return {
        data: btoa(data),
        iv: null,
        timestamp: Date.now(),
        encrypted: false
      };
    }
  }
  
  // Show session termination message
  function showTerminationMessage() {
    document.body.innerHTML = `
      <div class="alert-container" style="animation: slideUp 0.3s ease-out;">
        <div class="alert-icon">
          <div style="font-size: 80px;">🔒</div>
        </div>
        <h1 style="color: #d32f2f; text-align: center; margin-bottom: 20px;">Session Terminated</h1>
        <p style="text-align: center; color: #666; font-size: 16px; line-height: 1.6;">
          For your security, this browsing session has been terminated.<br>
          All tabs have been closed and browsing data has been cleared.
        </p>
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px;">
          <p style="color: #856404; font-size: 14px; margin: 0;">
            <strong>📧 Security Notice:</strong> An encrypted alert has been sent to your registered email address.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="window.close()" style="
            background: #1976d2;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            font-weight: 600;
          ">Close Window</button>
        </div>
      </div>
    `;
  }
  
  // Event listeners
  document.addEventListener('DOMContentLoaded', () => {
    loadAnomalyData();
    
    // Attach button listeners
    document.getElementById('btnYesMe').addEventListener('click', () => handleResponse('yes'));
    document.getElementById('btnKnown').addEventListener('click', () => handleResponse('known'));
    document.getElementById('btnNotMe').addEventListener('click', () => handleResponse('no'));
    
    // Prevent escape key from closing
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
      }
    });
  });
  
  console.log('✅ Security alert ready');
  
})();
