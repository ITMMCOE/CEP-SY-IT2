// Storage Utilities - Secure Storage Helpers
(function() {
  'use strict';
  
  console.log('💾 Storage utilities loaded');
  
  const StorageUtils = {
    // Save to sync storage (encrypted)
    async saveSyncData(key, value) {
      try {
        const data = { [key]: value };
        await chrome.storage.sync.set(data);
        console.log(`Saved to sync: ${key}`);
        return true;
      } catch (error) {
        console.error('Sync storage save error:', error);
        return false;
      }
    },
    
    // Load from sync storage
    async loadSyncData(key) {
      try {
        const result = await chrome.storage.sync.get([key]);
        return result[key] || null;
      } catch (error) {
        console.error('Sync storage load error:', error);
        return null;
      }
    },
    
    // Save to local storage
    async saveLocalData(key, value) {
      try {
        const data = { [key]: value };
        await chrome.storage.local.set(data);
        console.log(`Saved to local: ${key}`);
        return true;
      } catch (error) {
        console.error('Local storage save error:', error);
        return false;
      }
    },
    
    // Load from local storage
    async loadLocalData(key) {
      try {
        const result = await chrome.storage.local.get([key]);
        return result[key] || null;
      } catch (error) {
        console.error('Local storage load error:', error);
        return null;
      }
    },
    
    // Save behavioral data (compressed)
    async saveBehavioralData(sessionId, data) {
      try {
        const key = `behavior_${sessionId}`;
        const compressed = this.compressData(data);
        
        await chrome.storage.local.set({ [key]: compressed });
        console.log(`Saved behavioral data for session: ${sessionId}`);
        return true;
      } catch (error) {
        console.error('Behavioral data save error:', error);
        return false;
      }
    },
    
    // Load behavioral data
    async loadBehavioralData(sessionId) {
      try {
        const key = `behavior_${sessionId}`;
        const result = await chrome.storage.local.get([key]);
        
        if (result[key]) {
          return this.decompressData(result[key]);
        }
        
        return null;
      } catch (error) {
        console.error('Behavioral data load error:', error);
        return null;
      }
    },
    
    // Save model data
    async saveModel(modelType, modelData) {
      try {
        const key = `model_${modelType}`;
        await chrome.storage.local.set({ [key]: modelData });
        console.log(`Saved model: ${modelType}`);
        return true;
      } catch (error) {
        console.error('Model save error:', error);
        return false;
      }
    },
    
    // Load model data
    async loadModel(modelType) {
      try {
        const key = `model_${modelType}`;
        const result = await chrome.storage.local.get([key]);
        return result[key] || null;
      } catch (error) {
        console.error('Model load error:', error);
        return null;
      }
    },
    
    // Clear all behavioral data
    async clearBehavioralData() {
      try {
        const allData = await chrome.storage.local.get(null);
        const behaviorKeys = Object.keys(allData).filter(key => key.startsWith('behavior_'));
        
        if (behaviorKeys.length > 0) {
          await chrome.storage.local.remove(behaviorKeys);
          console.log(`Cleared ${behaviorKeys.length} behavioral data entries`);
        }
        
        return true;
      } catch (error) {
        console.error('Clear behavioral data error:', error);
        return false;
      }
    },
    
    // Get storage usage
    async getStorageUsage() {
      try {
        const localUsage = await chrome.storage.local.getBytesInUse();
        const syncUsage = await chrome.storage.sync.getBytesInUse();
        
        return {
          local: localUsage,
          sync: syncUsage,
          localFormatted: this.formatBytes(localUsage),
          syncFormatted: this.formatBytes(syncUsage)
        };
      } catch (error) {
        console.error('Storage usage error:', error);
        return null;
      }
    },
    
    // Compress data (simple JSON string compression)
    compressData(data) {
      // In production, use actual compression library
      return JSON.stringify(data);
    },
    
    // Decompress data
    decompressData(compressed) {
      try {
        return JSON.parse(compressed);
      } catch (error) {
        console.error('Decompression error:', error);
        return null;
      }
    },
    
    // Format bytes
    formatBytes(bytes) {
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
  };
  
  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageUtils;
  } else {
    window.StorageUtils = StorageUtils;
  }
  
  console.log('✅ Storage utilities ready');
  
})();
