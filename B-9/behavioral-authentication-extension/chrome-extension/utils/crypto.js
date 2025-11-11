// Crypto Utilities - HTTPS Encryption Helpers
(function() {
  'use strict';
  
  console.log('🔐 Crypto utilities loaded');
  
  const CryptoUtils = {
    // Generate encryption key
    async generateKey() {
      try {
        const key = await crypto.subtle.generateKey(
          {
            name: 'AES-GCM',
            length: 256
          },
          true,
          ['encrypt', 'decrypt']
        );
        
        return key;
      } catch (error) {
        console.error('Key generation error:', error);
        return null;
      }
    },
    
    // Export key to store
    async exportKey(key) {
      try {
        const exported = await crypto.subtle.exportKey('jwk', key);
        return JSON.stringify(exported);
      } catch (error) {
        console.error('Key export error:', error);
        return null;
      }
    },
    
    // Import key from storage
    async importKey(keyData) {
      try {
        const keyObject = JSON.parse(keyData);
        const key = await crypto.subtle.importKey(
          'jwk',
          keyObject,
          {
            name: 'AES-GCM',
            length: 256
          },
          true,
          ['encrypt', 'decrypt']
        );
        
        return key;
      } catch (error) {
        console.error('Key import error:', error);
        return null;
      }
    },
    
    // Encrypt data
    async encrypt(data, key) {
      try {
        // Generate IV
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        // Convert data to bytes
        const encoder = new TextEncoder();
        const dataBytes = encoder.encode(JSON.stringify(data));
        
        // Encrypt
        const encrypted = await crypto.subtle.encrypt(
          {
            name: 'AES-GCM',
            iv: iv
          },
          key,
          dataBytes
        );
        
        // Return encrypted data with IV
        return {
          data: this.arrayBufferToBase64(encrypted),
          iv: this.arrayBufferToBase64(iv),
          timestamp: Date.now()
        };
      } catch (error) {
        console.error('Encryption error:', error);
        return null;
      }
    },
    
    // Decrypt data
    async decrypt(encryptedData, key) {
      try {
        // Convert base64 to ArrayBuffer
        const dataBuffer = this.base64ToArrayBuffer(encryptedData.data);
        const ivBuffer = this.base64ToArrayBuffer(encryptedData.iv);
        
        // Decrypt
        const decrypted = await crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv: new Uint8Array(ivBuffer)
          },
          key,
          dataBuffer
        );
        
        // Convert to string
        const decoder = new TextDecoder();
        const jsonString = decoder.decode(decrypted);
        
        return JSON.parse(jsonString);
      } catch (error) {
        console.error('Decryption error:', error);
        return null;
      }
    },
    
    // Hash data (SHA-256)
    async hash(data) {
      try {
        const encoder = new TextEncoder();
        const dataBytes = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
        
        return this.arrayBufferToBase64(hashBuffer);
      } catch (error) {
        console.error('Hashing error:', error);
        return null;
      }
    },
    
    // Generate random ID
    generateId() {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },
    
    // ArrayBuffer to Base64
    arrayBufferToBase64(buffer) {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    },
    
    // Base64 to ArrayBuffer
    base64ToArrayBuffer(base64) {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes.buffer;
    }
  };
  
  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CryptoUtils;
  } else {
    window.CryptoUtils = CryptoUtils;
  }
  
  console.log('✅ Crypto utilities ready');
  
})();
