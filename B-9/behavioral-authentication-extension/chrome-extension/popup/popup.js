// Popup Logic
(function() {
  'use strict';
  
  console.log('📊 Popup script loaded');
  
  let refreshInterval = null;
  
  // Initialize popup
  async function initialize() {
    await loadStats();
    await loadSettings();
    attachEventListeners();
    
    // Refresh stats every 2 seconds
    refreshInterval = setInterval(loadStats, 2000);
  }
  
  // Load current statistics
  async function loadStats() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
      
      if (response && response.stats) {
        updateUI(response.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }
  
  // Update UI with stats
  function updateUI(stats) {
    // Status indicator
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.getElementById('statusText');
    const accessValue = document.getElementById('accessValue');
    
    if (stats.monitoring) {
      statusDot.className = 'status-dot active';
      statusText.textContent = 'Monitoring Active';
    } else {
      statusDot.className = 'status-dot inactive';
      statusText.textContent = 'Monitoring Disabled';
    }
    
    // Access level
    const accessLevel = stats.accessLevel || 'full';
    accessValue.textContent = accessLevel;
    accessValue.style.color = getAccessLevelColor(accessLevel);
    
    // Stats
    document.getElementById('keystrokeCount').textContent = formatNumber(stats.keystrokeCount || 0);
    document.getElementById('mouseCount').textContent = formatNumber(stats.mouseCount || 0);
    
    // Accuracy score
    const accuracyScore = stats.confidenceScore || 0;
    const accuracyElement = document.getElementById('accuracyScore');
    accuracyElement.textContent = `${(accuracyScore * 100).toFixed(0)}%`;
    accuracyElement.style.color = getScoreColor(accuracyScore);
    
    // Confidence bar
    const confidence = stats.confidence || 0;
    document.getElementById('confidenceValue').textContent = `${(confidence * 100).toFixed(0)}%`;
    document.getElementById('confidenceFill').style.width = `${confidence * 100}%`;
    
    // Update confidence bar color based on value
    const confidenceFill = document.getElementById('confidenceFill');
    if (confidence >= 0.8) {
      confidenceFill.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
    } else if (confidence >= 0.6) {
      confidenceFill.style.background = 'linear-gradient(90deg, #ff9800, #ffc107)';
    } else {
      confidenceFill.style.background = 'linear-gradient(90deg, #f44336, #ff5722)';
    }
  }
  
  // Get access level color
  function getAccessLevelColor(level) {
    switch (level) {
      case 'full': return '#4CAF50';
      case 'limited': return '#ff9800';
      case 'blocked': return '#f44336';
      default: return '#999';
    }
  }
  
  // Get score color
  function getScoreColor(score) {
    if (score >= 0.8) return '#4CAF50';
    if (score >= 0.6) return '#ff9800';
    return '#f44336';
  }
  
  // Format number with commas
  function formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
  
  // Load settings from storage
  async function loadSettings() {
    const result = await chrome.storage.sync.get(['enableMonitoring', 'sensitivity']);
    
    document.getElementById('enableMonitoring').checked = result.enableMonitoring !== false;
    document.getElementById('sensitivity').value = result.sensitivity || 'medium';
  }
  
  // Save settings to storage
  async function saveSettings() {
    const enableMonitoring = document.getElementById('enableMonitoring').checked;
    const sensitivity = document.getElementById('sensitivity').value;
    
    await chrome.storage.sync.set({ enableMonitoring, sensitivity });
    
    // Notify background script
    chrome.runtime.sendMessage({
      type: 'UPDATE_SETTINGS',
      settings: { enableMonitoring, sensitivity }
    });
    
    console.log('Settings saved:', { enableMonitoring, sensitivity });
  }
  
  // Attach event listeners
  function attachEventListeners() {
    // Train baseline button
    document.getElementById('btnTrainModel').addEventListener('click', async () => {
      const button = document.getElementById('btnTrainModel');
      button.disabled = true;
      button.innerHTML = '<span class="btn-icon">⏳</span><span>Training...</span>';
      
      console.log('🎓 Train Baseline button clicked');
      
      try {
        const response = await chrome.runtime.sendMessage({ type: 'TRAIN_BASELINE' });
        console.log('📨 Response received:', response);
        
        if (response && response.success) {
          console.log('✅ Training successful!', response.message);
          button.innerHTML = '<span class="btn-icon">✓</span><span>Training Complete!</span>';
          setTimeout(() => {
            button.innerHTML = '<span class="btn-icon">🎓</span><span>Train Baseline</span>';
            button.disabled = false;
          }, 2000);
        } else {
          console.warn('⚠️ Training returned false:', response);
          throw new Error(response?.message || 'Training failed');
        }
      } catch (error) {
        console.error('❌ Training error:', error);
        button.innerHTML = '<span class="btn-icon">✗</span><span>Training Failed</span>';
        setTimeout(() => {
          button.innerHTML = '<span class="btn-icon">🎓</span><span>Train Baseline</span>';
          button.disabled = false;
        }, 2000);
      }
    });
    
    // Settings toggle
    document.getElementById('enableMonitoring').addEventListener('change', saveSettings);
    document.getElementById('sensitivity').addEventListener('change', saveSettings);
    
    // Settings link
    document.getElementById('btnSettings').addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
  }
  
  // Cleanup on close
  window.addEventListener('unload', () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
  
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', initialize);
  
  console.log('✅ Popup ready');
  
})();
