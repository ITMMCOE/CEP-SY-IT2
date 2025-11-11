// Behavioral Authentication Shield - Background Service Worker
// Manifest V3 - Service Worker for anomaly detection and session management

import { AnomalyDetector } from './anomaly-detector.js';

// Global state
let behaviorData = {
  keystroke: [],
  mouse: [],
  sessionStart: Date.now(),
  anomalyCount: 0,
  accessLevel: 'full', // 'full', 'limited', 'blocked'
  lastCheck: Date.now(),
  confidence: 0,
  lastAnomalyScore: 0
};

const detector = new AnomalyDetector();

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('🔐 Behavioral Authentication Shield installed');
  
  // Initialize storage
  chrome.storage.local.set({
    authenticated: true,
    accessLevel: 'full',
    anomalyCount: 0,
    sessionStart: Date.now(),
    userProfile: {
      keystrokeBaseline: null,
      mouseBaseline: null
    }
  });
  
  // Set up periodic checks
  chrome.alarms.create('behaviorCheck', { periodInMinutes: 0.5 }); // Check every 30 seconds
});

// Listen for behavior data from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Message received:', message.type);
  
  switch (message.type) {
    case 'KEYSTROKE_DATA':
      handleKeystrokeData(message.data, sender.tab);
      sendResponse({ status: 'received' });
      break;
      
    case 'MOUSE_DATA':
      handleMouseData(message.data, sender.tab);
      sendResponse({ status: 'received' });
      break;
      
    case 'GET_AUTH_STATUS':
      sendResponse({
        authenticated: behaviorData.accessLevel !== 'blocked',
        accessLevel: behaviorData.accessLevel,
        anomalyCount: behaviorData.anomalyCount
      });
      break;
      
    case 'GET_STATS':
      // Calculate current confidence based on data collected
      const dataPoints = behaviorData.keystroke.length + behaviorData.mouse.length;
      const confidence = Math.min(dataPoints / 500, 1.0); // Max confidence at 500 data points
      
      sendResponse({
        stats: {
          monitoring: true,
          keystrokeCount: behaviorData.keystroke.length,
          mouseCount: behaviorData.mouse.length,
          anomalyCount: behaviorData.anomalyCount,
          accessLevel: behaviorData.accessLevel,
          sessionStart: behaviorData.sessionStart,
          lastCheck: behaviorData.lastCheck,
          confidence: confidence,
          confidenceScore: 1 - (behaviorData.lastAnomalyScore || 0) // Higher confidence = lower anomaly
        }
      });
      break;
      
    case 'TRAIN_BASELINE':
      (async () => {
        const success = await handleTrainBaseline();
        sendResponse({ success: success, message: success ? 'Baseline training complete' : 'Training failed' });
      })();
      return true; // Keep channel open for async response
      
    case 'SECURITY_RESPONSE':
      console.log('🔔 SECURITY_RESPONSE received:', message.response);
      (async () => {
        await handleSecurityResponse(message.response);
        sendResponse({ status: 'received' });
      })();
      return true; // Keep channel open for async response
      
    case 'VERIFY_TOKEN':
      // User clicked verification link from email
      handleTokenVerification(message.token, sender.tab);
      sendResponse({ status: 'verified' });
      break;
      
    default:
      sendResponse({ status: 'unknown_type' });
  }
  
  return true; // Keep channel open for async response
});

// Handle keystroke data
function handleKeystrokeData(data, tab) {
  behaviorData.keystroke.push({
    ...data,
    timestamp: Date.now(),
    tabId: tab.id
  });
  
  // Keep only last 100 keystrokes
  if (behaviorData.keystroke.length > 100) {
    behaviorData.keystroke = behaviorData.keystroke.slice(-100);
  }
  
  // Check for anomalies if we have enough data
  if (behaviorData.keystroke.length >= 20) {
    checkForAnomalies(tab);
  }
}

// Handle mouse data
function handleMouseData(data, tab) {
  behaviorData.mouse.push({
    ...data,
    timestamp: Date.now(),
    tabId: tab.id
  });
  
  // Keep only last 200 mouse events
  if (behaviorData.mouse.length > 200) {
    behaviorData.mouse = behaviorData.mouse.slice(-200);
  }
  
  // Check for anomalies
  if (behaviorData.mouse.length >= 50) {
    checkForAnomalies(tab);
  }
}

// Handle baseline training request
async function handleTrainBaseline() {
  console.log('🎓 Starting baseline training...');
  
  try {
    // Check if we have enough data
    const keystrokeCount = behaviorData.keystroke.length;
    const mouseCount = behaviorData.mouse.length;
    
    console.log(`📊 Current data: ${keystrokeCount} keystrokes, ${mouseCount} mouse events`);
    
    if (keystrokeCount < 10 && mouseCount < 20) {
      console.warn('⚠️ Not enough data yet. Keep browsing!');
      return false;
    }
    
    // Update baseline with current data
    detector.updateBaseline(behaviorData.keystroke, behaviorData.mouse);
    
    // Store baseline in storage
    await chrome.storage.local.set({
      baselineTrained: true,
      baselineTimestamp: Date.now(),
      keystrokeSamples: keystrokeCount,
      mouseSamples: mouseCount
    });
    
    console.log('✅ Baseline training complete!');
    console.log(`   Keystroke samples: ${keystrokeCount}`);
    console.log(`   Mouse samples: ${mouseCount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Baseline training error:', error);
    return false;
  }
}

// Check for behavioral anomalies
async function checkForAnomalies(tab) {
  // Don't check if user has already responded to an alert
  if (behaviorData.accessLevel === 'limited' || behaviorData.accessLevel === 'blocked') {
    console.log('⏸️ Anomaly detection paused - access level:', behaviorData.accessLevel);
    return;
  }
  
  // Don't check too frequently
  const timeSinceLastCheck = Date.now() - behaviorData.lastCheck;
  if (timeSinceLastCheck < 10000) return; // At least 10 seconds between checks
  
  behaviorData.lastCheck = Date.now();
  
  try {
    // Analyze behavior patterns
    const keystrokeAnomaly = await detector.analyzeKeystrokes(behaviorData.keystroke);
    const mouseAnomaly = await detector.analyzeMouse(behaviorData.mouse);
    
    console.log(`📊 Keystroke anomaly result:`, keystrokeAnomaly);
    console.log(`📊 Mouse anomaly result:`, mouseAnomaly);
    
    // Combined anomaly score (0-1, higher = more suspicious)
    // Handle NaN values by defaulting to 0
    const keystrokeScore = isNaN(keystrokeAnomaly.score) ? 0 : keystrokeAnomaly.score;
    const mouseScore = isNaN(mouseAnomaly.score) ? 0 : mouseAnomaly.score;
    const anomalyScore = (keystrokeScore * 0.6) + (mouseScore * 0.4);
    
    console.log(`🔍 Combined Anomaly Score: ${(anomalyScore * 100).toFixed(1)}% (keystroke: ${(keystrokeScore * 100).toFixed(1)}%, mouse: ${(mouseScore * 100).toFixed(1)}%)`);
    
    // Store the score for display
    behaviorData.lastAnomalyScore = anomalyScore;
    
    // Threshold for alert (lowered to 60% to trigger on keystroke alone)
    const ANOMALY_THRESHOLD = 0.60; // 60% anomaly score triggers alert
    
    if (anomalyScore > ANOMALY_THRESHOLD) {
      behaviorData.anomalyCount++;
      console.log('⚠️ ANOMALY DETECTED!');
      
      // Trigger security alert
      await triggerSecurityAlert(tab, {
        anomalyScore: anomalyScore,
        keystrokeAnomaly: keystrokeAnomaly,
        mouseAnomaly: mouseAnomaly,
        anomalyCount: behaviorData.anomalyCount
      });
    }
    
    // Update storage
    chrome.storage.local.set({
      lastAnomalyScore: anomalyScore,
      lastCheckTime: Date.now(),
      anomalyCount: behaviorData.anomalyCount
    });
    
  } catch (error) {
    console.error('Error checking anomalies:', error);
  }
}

// Trigger security alert in the active tab
async function triggerSecurityAlert(tab, anomalyData) {
  console.log('🚨 Triggering security alert in tab:', tab.id);
  
  // Check if we can inject into this tab
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:')) {
    console.log('⚠️ Cannot lock chrome:// or extension pages. Please navigate to a regular webpage.');
    return;
  }
  
  try {
    // Step 1: IMMEDIATELY lock the browser
    console.log('Step 1: Locking browser...');
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Create full-screen lock overlay
        const lockOverlay = document.createElement('div');
        lockOverlay.id = 'behavior-auth-lock';
        lockOverlay.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          background: rgba(0, 0, 0, 0.95) !important;
          z-index: 2147483647 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-family: system-ui, -apple-system, sans-serif !important;
        `;
        
        lockOverlay.innerHTML = `
          <div style="text-align: center !important; color: white !important; max-width: 500px !important; padding: 40px !important;">
            <div style="font-size: 80px !important; margin-bottom: 30px !important;">🔒</div>
            <h1 style="font-size: 32px !important; margin: 0 0 20px 0 !important; color: #dc2626 !important;">
              Session Locked
            </h1>
            <p style="font-size: 18px !important; line-height: 1.6 !important; color: #e5e5e5 !important; margin-bottom: 30px !important;">
              <strong>Unusual behavior detected</strong><br>
              Your session has been locked for security.
            </p>
            <div style="background: rgba(255,255,255,0.1) !important; padding: 20px !important; border-radius: 12px !important; margin-bottom: 30px !important;">
              <p style="font-size: 16px !important; margin: 0 0 15px 0 !important; color: #fbbf24 !important;">
                ⚠️ A verification code has been sent to:
              </p>
              <p style="font-size: 20px !important; margin: 0 !important; font-weight: bold !important; color: white !important;">
                your.email@example.com
              </p>
            </div>
            <p style="font-size: 14px !important; color: #9ca3af !important; margin-bottom: 20px !important;">
              Please check your email and click the verification link to unlock this session.
            </p>
            <div style="background: rgba(220, 38, 38, 0.2) !important; border: 1px solid #dc2626 !important; border-radius: 8px !important; padding: 15px !important; margin-top: 30px !important;">
              <p style="font-size: 13px !important; margin: 0 !important; color: #fca5a5 !important;">
                �️ This page will remain locked until you verify from your registered device.
              </p>
            </div>
          </div>
        `;
        
        document.body.appendChild(lockOverlay);
        
        // Disable all interactions
        document.body.style.pointerEvents = 'none';
        lockOverlay.style.pointerEvents = 'all'; // Only lock screen is interactive (but has no buttons)
      }
    });
    console.log('✅ Browser locked');
    
    // Step 2: Send encrypted alert via webhook/email
    console.log('Step 2: Sending encrypted alert...');
    await sendSecurityAlert(anomalyData);
    
  } catch (error) {
    console.error('❌ Error triggering security alert:', error);
  }
}

// Send encrypted alert via webhook/email
async function sendSecurityAlert(anomalyData) {
  const alertData = {
    timestamp: Date.now(),
    anomalyScore: (anomalyData.anomalyScore * 100).toFixed(1),
    userAgent: navigator.userAgent,
    keystrokeAnomaly: (anomalyData.keystrokeAnomaly.score * 100).toFixed(1),
    mouseAnomaly: (anomalyData.mouseAnomaly.score * 100).toFixed(1),
    // Generate verification token
    verificationToken: generateToken()
  };
  
  console.log('📧 Alert data prepared:', alertData);
  console.log('🔑 VERIFICATION TOKEN:', alertData.verificationToken);
  console.log('🔓 TO UNLOCK, GO TO: chrome-extension://' + chrome.runtime.id + '/verify.html?token=' + alertData.verificationToken);
  
  try {
    // Option 1: Send via webhook (replace with your actual endpoint)
    const webhookUrl = 'https://your-server.com/api/security-alert';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData)
    });
    
    if (response.ok) {
      console.log('✅ Security alert sent successfully');
    } else {
      console.error('❌ Failed to send alert:', response.status);
    }
  } catch (error) {
    console.error('❌ Error sending alert:', error);
    
    // Fallback: Store locally for manual retrieval
    chrome.storage.local.set({
      pendingAlert: alertData,
      alertStatus: 'pending'
    });
    
    console.log('⚠️ Alert stored locally - webhook failed');
  }
}

// Generate secure verification token
function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Handle token verification from email link
async function handleTokenVerification(token, tab) {
  console.log('🔑 Verifying token from email...');
  
  try {
    // Get stored pending alert
    const result = await chrome.storage.local.get(['pendingAlert']);
    const pendingAlert = result.pendingAlert;
    
    if (!pendingAlert) {
      console.error('❌ No pending alert found');
      return;
    }
    
    // Verify token matches
    if (token === pendingAlert.verificationToken) {
      console.log('✅ Token verified! Unlocking session...');
      
      // Unlock all tabs
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        // Skip chrome:// and extension pages
        if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('about:'))) {
          continue;
        }
        
        try {
          console.log(`Unlocking tab ${tab.id}: ${tab.url}`);
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              // Remove lock overlay
              const lockOverlay = document.getElementById('behavior-auth-lock');
              if (lockOverlay) {
                lockOverlay.remove();
                console.log('✅ Lock overlay removed');
              } else {
                console.log('⚠️ No lock overlay found');
              }
              // Restore interactions
              document.body.style.pointerEvents = '';
              document.body.style.filter = 'none';
            }
          });
          console.log(`✅ Tab ${tab.id} unlocked`);
        } catch (e) {
          console.log(`⚠️ Could not unlock tab ${tab.id}:`, e.message);
        }
      }
      
      // Clear pending alert
      chrome.storage.local.remove(['pendingAlert', 'alertStatus']);
      
      // Reset anomaly count
      behaviorData.anomalyCount = 0;
      behaviorData.accessLevel = 'full';
      
      console.log('🎉 Session unlocked successfully');
    } else {
      console.error('❌ Invalid token');
    }
  } catch (error) {
    console.error('❌ Error verifying token:', error);
  }
}

// Handle user's response to security alert
async function handleSecurityResponse(response) {
  console.log('📋 Security Response:', response);
  console.log('🔍 Starting handleSecurityResponse function');
  
  // Get all tabs (we'll unlock/restrict all of them)
  const tabs = await chrome.tabs.query({});
  console.log('📑 Total tabs found:', tabs.length, tabs.map(t => ({id: t.id, url: t.url})));
  
  switch (response) {
    case 'YES_ITS_ME':
      // Full access restored
      behaviorData.accessLevel = 'full';
      behaviorData.anomalyCount = 0;
      
      // Unfreeze all tabs
      for (const tab of tabs) {
        if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              type: 'UNFREEZE_SESSION',
              accessLevel: 'full'
            });
          } catch (e) {
            // Tab might not be accessible
          }
        }
      }
      
      console.log('✅ Full access granted');
      break;
      
    case 'SOMEONE_I_KNOW':
      // Limited access mode
      behaviorData.accessLevel = 'limited';
      
      // First, close all chrome:// and chrome-extension:// tabs
      const restrictedTabs = tabs.filter(tab => 
        tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://'))
      );
      
      for (const tab of restrictedTabs) {
        try {
          await chrome.tabs.remove(tab.id);
          console.log('🔒 Closed restricted tab:', tab.url);
        } catch (e) {
          console.log('Could not close tab:', tab.id);
        }
      }
      
      // Unfreeze and apply restrictions to normal tabs
      const normalTabs = tabs.filter(tab => 
        tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')
      );
      
      console.log(`Processing ${normalTabs.length} normal tabs for limited access`);
      
      for (const tab of normalTabs) {
        try {
          console.log(`Unfreezing tab ${tab.id}: ${tab.url}`);
          
          // Remove the lock overlay directly via executeScript (same way it was created)
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              const lockOverlay = document.getElementById('behavior-auth-lock');
              if (lockOverlay) {
                lockOverlay.remove();
                console.log('✅ Lock overlay removed via executeScript');
              }
              // Restore pointer events
              document.body.style.pointerEvents = 'auto';
            }
          });
          
          // Then unfreeze the session via content script
          const response = await chrome.tabs.sendMessage(tab.id, {
            type: 'UNFREEZE_SESSION',
            accessLevel: 'limited'
          });
          
          console.log(`Tab ${tab.id} unfreeze response:`, response);
          
          // Then apply limited access restrictions
          await applyLimitedAccess(tab);
          
          console.log(`Tab ${tab.id} limited access applied`);
        } catch (e) {
          console.log(`⚠️ Could not process tab ${tab.id}:`, e.message);
        }
      }
      
      console.log('🔒 Limited access granted');
      break;
      
    case 'NOT_ME':
      // Block and end session
      behaviorData.accessLevel = 'blocked';
      
      // Terminate session
      await terminateSession();
      
      console.log('🚫 Session terminated');
      break;
  }
  
  // Update storage
  chrome.storage.local.set({
    accessLevel: behaviorData.accessLevel,
    anomalyCount: behaviorData.anomalyCount,
    lastResponseTime: Date.now()
  });
}

// Apply limited access restrictions
async function applyLimitedAccess(tab) {
  try {
    // Block password fields
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Disable password fields
        document.querySelectorAll('input[type="password"]').forEach(input => {
          input.disabled = true;
          input.style.opacity = '0.5';
          input.title = 'Password access blocked in limited mode';
        });
        
        // Disable autofill
        document.querySelectorAll('input').forEach(input => {
          input.setAttribute('autocomplete', 'off');
        });
      }
    });
    
    // Block access to chrome:// URLs (settings, extensions, etc.)
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (behaviorData.accessLevel === 'limited') {
        if (tab.url && (
          tab.url.startsWith('chrome://') ||
          tab.url.startsWith('chrome-extension://')
        )) {
          chrome.tabs.remove(tabId);
          console.log('🔒 Blocked access to:', tab.url);
        }
      }
    });
    
    // Show limited access banner
    await chrome.tabs.sendMessage(tab.id, {
      type: 'SHOW_LIMITED_ACCESS_BANNER'
    });
    
  } catch (error) {
    console.error('Error applying limited access:', error);
  }
}

// Terminate session completely
async function terminateSession() {
  try {
    console.log('🚨 Terminating session...');
    
    // Get all tabs BEFORE clearing data
    const allTabs = await chrome.tabs.query({});
    console.log(`Found ${allTabs.length} tabs to close`, allTabs.map(t => ({id: t.id, url: t.url})));
    
    // First, create the session ended page so we have something to keep
    const sessionEndedTab = await chrome.tabs.create({
      url: chrome.runtime.getURL('alert/session-ended.html'),
      active: true
    });
    console.log('✅ Session ended page created:', sessionEndedTab.id);
    
    // Wait a moment for the tab to fully load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Now close ALL other tabs
    const tabsToClose = allTabs.filter(tab => tab.id !== sessionEndedTab.id);
    console.log(`Closing ${tabsToClose.length} tabs (keeping session-ended tab ${sessionEndedTab.id})`);
    
    // Close tabs using callback-based API wrapped in Promise
    if (tabsToClose.length > 0) {
      const tabIdsToClose = tabsToClose.map(t => t.id);
      await new Promise((resolve) => {
        chrome.tabs.remove(tabIdsToClose, () => {
          if (chrome.runtime.lastError) {
            console.log('⚠️ Some tabs could not be closed:', chrome.runtime.lastError.message);
          } else {
            console.log(`✅ Closed ${tabIdsToClose.length} tabs`);
          }
          resolve();
        });
      });
    }
    
    // Clear all browsing data AFTER closing tabs
    await chrome.browsingData.remove({
      since: behaviorData.sessionStart
    }, {
      cache: true,
      cookies: true,
      downloads: false,
      formData: true,
      history: true,
      passwords: false, // Keep passwords for security
      serviceWorkers: true
    });
    console.log('✅ Browsing data cleared');
    
    // Send alert to admin (using the new secure function)
    await sendSecurityAlert({
      timestamp: Date.now(),
      anomalyScore: 100, // Session terminated
      userAgent: navigator.userAgent,
      keystrokeAnomaly: 100,
      mouseAnomaly: 100,
      verificationToken: generateToken(),
      reason: 'User indicated unauthorized access'
    });
    
  } catch (error) {
    console.error('Error terminating session:', error);
  }
}

// Periodic behavior check alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'behaviorCheck') {
    console.log('⏰ Periodic behavior check');
    
    // Get active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0]) {
        checkForAnomalies(tabs[0]);
      }
    });
  }
});

console.log('🚀 Background service worker initialized');
