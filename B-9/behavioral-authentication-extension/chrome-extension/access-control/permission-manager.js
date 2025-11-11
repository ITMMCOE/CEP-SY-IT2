// Permission Manager - Access Control Enforcement
(function() {
  'use strict';
  
  console.log('🔐 Permission Manager loaded');
  
  class PermissionManager {
    constructor() {
      this.currentAccessLevel = 'full';
      this.restrictedDomains = [];
      this.initialize();
    }
    
    async initialize() {
      // Load current access level
      const result = await chrome.storage.local.get(['accessLevel']);
      this.currentAccessLevel = result.accessLevel || 'full';
      
      console.log(`Current access level: ${this.currentAccessLevel}`);
    }
    
    // Set access level
    async setAccessLevel(level) {
      this.currentAccessLevel = level;
      await chrome.storage.local.set({ accessLevel: level });
      
      console.log(`Access level updated to: ${level}`);
      
      // Apply restrictions based on level
      switch (level) {
        case 'full':
          await this.enableFullAccess();
          break;
        case 'limited':
          await this.enableLimitedAccess();
          break;
        case 'blocked':
          await this.blockAccess();
          break;
      }
    }
    
    // Enable full access
    async enableFullAccess() {
      console.log('✅ Enabling full access...');
      
      // Remove all restrictions
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1, 2, 3, 4, 5]
      });
      
      // Clear restricted domains
      this.restrictedDomains = [];
      
      // Notify all tabs
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'ACCESS_LEVEL_CHANGED',
          level: 'full'
        }).catch(() => {}); // Ignore errors for tabs without content script
      });
    }
    
    // Enable limited access with restrictions
    async enableLimitedAccess() {
      console.log('🔒 Enabling limited access...');
      
      // Block sensitive domains
      const sensitivePatterns = [
        '*://*.facebook.com/*',
        '*://*.twitter.com/*',
        '*://*.instagram.com/*',
        '*://accounts.google.com/*',
        '*://mail.google.com/*',
        '*://gmail.com/*',
        '*://*.paypal.com/*',
        '*://*.bankofamerica.com/*',
        '*://*.chase.com/*',
        '*://*.wellsfargo.com/*'
      ];
      
      // Create declarativeNetRequest rules
      const rules = sensitivePatterns.map((pattern, index) => ({
        id: index + 1,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            url: chrome.runtime.getURL('alert/access-denied.html')
          }
        },
        condition: {
          urlFilter: pattern,
          resourceTypes: ['main_frame']
        }
      }));
      
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules,
        removeRuleIds: rules.map(r => r.id)
      });
      
      // Block chrome:// URLs
      await this.blockChromePages();
      
      // Notify all tabs
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'ACCESS_LEVEL_CHANGED',
          level: 'limited'
        }).catch(() => {});
      });
    }
    
    // Block chrome:// pages
    async blockChromePages() {
      const chromeTabs = await chrome.tabs.query({ url: 'chrome://*/*' });
      
      chromeTabs.forEach(tab => {
        chrome.tabs.update(tab.id, {
          url: chrome.runtime.getURL('alert/access-denied.html')
        });
      });
    }
    
    // Block all access
    async blockAccess() {
      console.log('❌ Blocking all access...');
      
      // Close all tabs except safe pages
      const tabs = await chrome.tabs.query({});
      const safePageUrl = chrome.runtime.getURL('alert/session-ended.html');
      
      for (const tab of tabs) {
        if (!tab.url.startsWith(chrome.runtime.getURL(''))) {
          await chrome.tabs.remove(tab.id);
        }
      }
      
      // Open session ended page
      await chrome.tabs.create({ url: safePageUrl });
      
      // Clear browsing data
      await this.clearBrowsingData();
    }
    
    // Clear browsing data
    async clearBrowsingData() {
      const dataToRemove = {
        appcache: true,
        cache: true,
        cacheStorage: true,
        cookies: true,
        downloads: true,
        fileSystems: true,
        formData: true,
        history: true,
        indexedDB: true,
        localStorage: true,
        passwords: true,
        serviceWorkers: true,
        webSQL: true
      };
      
      await chrome.browsingData.remove(
        {
          since: 0 // All time
        },
        dataToRemove
      );
      
      console.log('🗑️ Browsing data cleared');
    }
    
    // Check if URL is allowed
    isUrlAllowed(url, accessLevel = this.currentAccessLevel) {
      if (accessLevel === 'full') {
        return true;
      }
      
      if (accessLevel === 'blocked') {
        return url.startsWith(chrome.runtime.getURL(''));
      }
      
      if (accessLevel === 'limited') {
        // Check against restricted patterns
        const restrictedPatterns = [
          'facebook.com',
          'twitter.com',
          'instagram.com',
          'accounts.google.com',
          'mail.google.com',
          'gmail.com',
          'paypal.com',
          'bankofamerica.com',
          'chase.com',
          'wellsfargo.com'
        ];
        
        return !restrictedPatterns.some(pattern => url.includes(pattern));
      }
      
      return false;
    }
    
    // Get current restrictions
    getCurrentRestrictions() {
      switch (this.currentAccessLevel) {
        case 'full':
          return {
            level: 'full',
            description: 'No restrictions',
            blocked: []
          };
        case 'limited':
          return {
            level: 'limited',
            description: 'Sensitive sites and password fields blocked',
            blocked: [
              'Password fields',
              'Financial sites',
              'Social media accounts',
              'Email services',
              'Chrome settings'
            ]
          };
        case 'blocked':
          return {
            level: 'blocked',
            description: 'All access blocked',
            blocked: ['Everything']
          };
        default:
          return {
            level: 'unknown',
            description: 'Unknown access level',
            blocked: []
          };
      }
    }
  }
  
  // Export for use in background script
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PermissionManager;
  } else {
    window.PermissionManager = PermissionManager;
  }
  
  console.log('✅ Permission Manager ready');
  
})();
