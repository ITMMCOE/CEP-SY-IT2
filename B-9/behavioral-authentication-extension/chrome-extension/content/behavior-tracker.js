// Behavior Tracker - Content Script
// Captures keystroke and mouse dynamics in real-time

(function() {
  'use strict';
  
  console.log('🔍 Behavior Tracker activated');
  
  // Behavior data buffers
  let keystrokeBuffer = [];
  let mouseBuffer = [];
  
  // Keystroke tracking variables
  let keydownTimes = {};
  let lastKeyTime = 0;
  
  // Mouse tracking variables
  let lastMouseTime = 0;
  let lastMousePos = { x: 0, y: 0 };
  
  // Send interval (send data every 5 seconds)
  const SEND_INTERVAL = 5000;
  
  // Start tracking
  init();
  
  function init() {
    // Keystroke event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    
    // Mouse event listeners
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleMouseClick, true);
    
    // Periodic data sending
    setInterval(sendBehaviorData, SEND_INTERVAL);
    
    console.log('✅ Behavior tracking started');
  }
  
  // Handle keydown event
  function handleKeyDown(event) {
    const key = event.key;
    const keyCode = event.keyCode || event.which;
    const timestamp = Date.now();
    
    // Store keydown time for calculating hold time
    keydownTimes[keyCode] = timestamp;
    
    // Calculate flight time (time since last key)
    const flightTime = lastKeyTime > 0 ? timestamp - lastKeyTime : 0;
    
    // Store keystroke data
    keystrokeBuffer.push({
      key: key,
      keyCode: keyCode,
      timestamp: timestamp,
      flightTime: flightTime,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      metaKey: event.metaKey
    });
    
    lastKeyTime = timestamp;
    
    // Limit buffer size
    if (keystrokeBuffer.length > 100) {
      keystrokeBuffer = keystrokeBuffer.slice(-100);
    }
  }
  
  // Handle keyup event
  function handleKeyUp(event) {
    const keyCode = event.keyCode || event.which;
    const timestamp = Date.now();
    
    // Calculate hold time
    if (keydownTimes[keyCode]) {
      const holdTime = (timestamp - keydownTimes[keyCode]) / 1000; // Convert to seconds
      
      // Find the corresponding keydown event and add hold time
      for (let i = keystrokeBuffer.length - 1; i >= 0; i--) {
        if (keystrokeBuffer[i].keyCode === keyCode && !keystrokeBuffer[i].holdTime) {
          keystrokeBuffer[i].holdTime = holdTime;
          break;
        }
      }
      
      delete keydownTimes[keyCode];
    }
  }
  
  // Handle mouse move event
  function handleMouseMove(event) {
    const timestamp = Date.now();
    
    // Throttle: only record every 50ms
    if (timestamp - lastMouseTime < 50) {
      return;
    }
    
    const x = event.clientX;
    const y = event.clientY;
    
    // Calculate distance from last position
    const dx = x - lastMousePos.x;
    const dy = y - lastMousePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate speed
    const timeDelta = (timestamp - lastMouseTime) / 1000; // seconds
    const speed = timeDelta > 0 ? distance / timeDelta : 0;
    
    // Store mouse data
    mouseBuffer.push({
      x: x,
      y: y,
      timestamp: timestamp,
      distance: distance,
      speed: speed,
      dx: dx,
      dy: dy
    });
    
    lastMouseTime = timestamp;
    lastMousePos = { x, y };
    
    // Limit buffer size
    if (mouseBuffer.length > 200) {
      mouseBuffer = mouseBuffer.slice(-200);
    }
  }
  
  // Handle mouse click event
  function handleMouseClick(event) {
    const timestamp = Date.now();
    
    mouseBuffer.push({
      x: event.clientX,
      y: event.clientY,
      timestamp: timestamp,
      button: event.button, // 0=left, 1=middle, 2=right
      clickType: event.detail, // 1=single, 2=double
      isClick: true
    });
  }
  
  // Send behavior data to background script
  function sendBehaviorData() {
    // Only send if we have data
    if (keystrokeBuffer.length === 0 && mouseBuffer.length === 0) {
      return;
    }
    
    // Send keystroke data
    if (keystrokeBuffer.length > 0) {
      chrome.runtime.sendMessage({
        type: 'KEYSTROKE_DATA',
        data: keystrokeBuffer.slice() // Send copy
      }, (response) => {
        if (response && response.status === 'received') {
          console.log(`📤 Sent ${keystrokeBuffer.length} keystrokes`);
        }
      });
    }
    
    // Send mouse data
    if (mouseBuffer.length > 0) {
      chrome.runtime.sendMessage({
        type: 'MOUSE_DATA',
        data: mouseBuffer.slice() // Send copy
      }, (response) => {
        if (response && response.status === 'received') {
          console.log(`📤 Sent ${mouseBuffer.length} mouse events`);
        }
      });
    }
    
    // Don't clear buffers completely - keep some for continuity
    if (keystrokeBuffer.length > 20) {
      keystrokeBuffer = keystrokeBuffer.slice(-20);
    }
    if (mouseBuffer.length > 50) {
      mouseBuffer = mouseBuffer.slice(-50);
    }
  }
  
  // Listen for status requests
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_BEHAVIOR_STATS') {
      sendResponse({
        keystrokeCount: keystrokeBuffer.length,
        mouseCount: mouseBuffer.length,
        tracking: true
      });
    }
    return true;
  });
  
})();
