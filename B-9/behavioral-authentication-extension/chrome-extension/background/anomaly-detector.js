// Anomaly Detector - AI-powered behavioral analysis
// Based on trained models from Altair AI Studio

export class AnomalyDetector {
  constructor() {
    this.keystrokeBaseline = null;
    this.mouseBaseline = null;
    this.modelsLoaded = false;
    this.loadModels();
  }
  
  // Load trained model parameters from Altair AI
  async loadModels() {
    try {
      // Load keystroke model thresholds (from your 70.5% accuracy model)
      const keystrokeResponse = await fetch(chrome.runtime.getURL('models/keystroke-threshold.json'));
      const keystrokeModel = await keystrokeResponse.json();
      
      // Extract baseline from model structure
      this.keystrokeBaseline = {
        avgHoldTime: keystrokeModel.features.avgHoldTime.mean,
        stdHoldTime: keystrokeModel.features.avgHoldTime.std,
        avgFlightTime: keystrokeModel.features.avgFlightTime.mean,
        stdFlightTime: keystrokeModel.features.avgFlightTime.std,
        typingSpeed: keystrokeModel.features.typingSpeed.mean,
        errorRate: keystrokeModel.features.errorRate.mean
      };
      
      // Load mouse model thresholds
      const mouseResponse = await fetch(chrome.runtime.getURL('models/mouse-threshold.json'));
      const mouseModel = await mouseResponse.json();
      
      // Extract mouse baseline from model structure
      this.mouseBaseline = {
        avgSpeed: mouseModel.features.avgSpeed.mean,
        avgAcceleration: mouseModel.features.accelerationProfile?.mean || 150,
        straightness: mouseModel.features.straightness.mean,
        avgCurvature: mouseModel.features.avgCurvature.mean,
        avgDistance: 200, // Default value
        pauseFrequency: mouseModel.features.pauseFrequency.mean
      };
      
      this.modelsLoaded = true;
      console.log('✅ Anomaly detection models loaded successfully');
      console.log('   Keystroke baseline:', this.keystrokeBaseline);
      console.log('   Mouse baseline:', this.mouseBaseline);
      
    } catch (error) {
      console.error('❌ Error loading models:', error);
      console.warn('⚠️ Using default thresholds');
      this.setDefaultBaselines();
    }
  }
  
  // Set default baselines based on typical user behavior
  setDefaultBaselines() {
    this.keystrokeBaseline = {
      avgHoldTime: 0.150,        // Average key hold time (seconds)
      avgFlightTime: 0.200,      // Average time between keys
      stdHoldTime: 0.075,        // Standard deviation
      stdFlightTime: 0.100,
      typingSpeed: 300,          // Characters per minute
      errorRate: 0.05            // 5% error rate
    };
    
    this.mouseBaseline = {
      avgSpeed: 150,             // pixels per second
      avgAcceleration: 50,       // pixels per second²
      straightness: 0.75,        // 0-1, higher = straighter paths
      avgCurvature: 0.2,         // Average curve angle
      avgDistance: 200,          // pixels per movement
      pauseFrequency: 0.3        // pauses per second
    };
    
    this.modelsLoaded = true;
  }
  
  // Analyze keystroke patterns for anomalies
  async analyzeKeystrokes(keystrokeData) {
    if (!this.modelsLoaded) {
      await this.loadModels();
    }
    
    if (keystrokeData.length < 10) {
      return { score: 0, confidence: 0, features: {} };
    }
    
    // Extract features from recent keystrokes
    const features = this.extractKeystrokeFeatures(keystrokeData);
    
    console.log('🔍 Extracted keystroke features:', features);
    console.log('📊 Baseline:', this.keystrokeBaseline);
    
    // Calculate anomaly score (0-1, higher = more anomalous)
    let anomalyScore = 0;
    let deviations = [];
    
    // Hold time deviation
    const holdTimeDeviation = Math.abs(features.avgHoldTime - this.keystrokeBaseline.avgHoldTime) / 
                              this.keystrokeBaseline.stdHoldTime;
    deviations.push(holdTimeDeviation);
    console.log(`  Hold time deviation: ${holdTimeDeviation.toFixed(2)} (current: ${features.avgHoldTime.toFixed(3)}s, baseline: ${this.keystrokeBaseline.avgHoldTime.toFixed(3)}s)`);
    
    // Flight time deviation
    const flightTimeDeviation = Math.abs(features.avgFlightTime - this.keystrokeBaseline.avgFlightTime) / 
                                this.keystrokeBaseline.stdFlightTime;
    deviations.push(flightTimeDeviation);
    console.log(`  Flight time deviation: ${flightTimeDeviation.toFixed(2)} (current: ${features.avgFlightTime.toFixed(3)}s, baseline: ${this.keystrokeBaseline.avgFlightTime.toFixed(3)}s)`);
    
    // Typing speed deviation
    const speedDeviation = Math.abs(features.typingSpeed - this.keystrokeBaseline.typingSpeed) / 
                          (this.keystrokeBaseline.typingSpeed * 0.5); // 50% tolerance
    deviations.push(speedDeviation);
    console.log(`  Speed deviation: ${speedDeviation.toFixed(2)} (current: ${features.typingSpeed.toFixed(1)} cpm, baseline: ${this.keystrokeBaseline.typingSpeed.toFixed(1)} cpm)`);
    
    // Error rate check
    if (features.errorRate > this.keystrokeBaseline.errorRate * 2) {
      deviations.push(2.0);
    }
    
    // Combine deviations (sigmoid function to normalize to 0-1)
    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
    console.log(`  Average deviation: ${avgDeviation.toFixed(2)}`);
    anomalyScore = 1 / (1 + Math.exp(-2 * (avgDeviation - 1.5))); // Sigmoid centered at 1.5 std deviations
    console.log(`  ⚠️ Keystroke anomaly score: ${(anomalyScore * 100).toFixed(1)}%`);
    
    return {
      score: Math.min(1, anomalyScore),
      confidence: keystrokeData.length >= 20 ? 0.9 : 0.5,
      features: features,
      deviations: {
        holdTime: holdTimeDeviation,
        flightTime: flightTimeDeviation,
        typingSpeed: speedDeviation
      }
    };
  }
  
  // Extract keystroke features
  extractKeystrokeFeatures(keystrokeData) {
    const holdTimes = [];
    const flightTimes = [];
    let errorCount = 0;
    
    for (let i = 0; i < keystrokeData.length; i++) {
      const event = keystrokeData[i];
      
      if (event.holdTime) {
        holdTimes.push(event.holdTime);
      }
      
      if (i > 0 && event.timestamp) {
        const flightTime = (event.timestamp - keystrokeData[i-1].timestamp) / 1000;
        flightTimes.push(flightTime);
      }
      
      // Check for backspace (error indicator)
      if (event.key === 'Backspace' || event.keyCode === 8) {
        errorCount++;
      }
    }
    
    const avgHoldTime = holdTimes.length > 0 ? 
                       holdTimes.reduce((a, b) => a + b, 0) / holdTimes.length : 0.150;
    
    const avgFlightTime = flightTimes.length > 0 ? 
                         flightTimes.reduce((a, b) => a + b, 0) / flightTimes.length : 0.200;
    
    // Calculate typing speed (characters per minute)
    const timeSpan = keystrokeData.length > 1 ? 
                    (keystrokeData[keystrokeData.length - 1].timestamp - keystrokeData[0].timestamp) / 1000 : 1;
    const typingSpeed = (keystrokeData.length / timeSpan) * 60;
    
    const errorRate = keystrokeData.length > 0 ? errorCount / keystrokeData.length : 0;
    
    return {
      avgHoldTime,
      avgFlightTime,
      typingSpeed,
      errorRate,
      totalKeys: keystrokeData.length
    };
  }
  
  // Analyze mouse movements for anomalies
  async analyzeMouse(mouseData) {
    if (!this.modelsLoaded) {
      await this.loadModels();
    }
    
    if (mouseData.length < 20) {
      return { score: 0, confidence: 0, features: {} };
    }
    
    // Extract features from mouse movements
    const features = this.extractMouseFeatures(mouseData);
    
    console.log('🖱️ Extracted mouse features:', features);
    console.log('📊 Mouse baseline:', this.mouseBaseline);
    
    // Calculate anomaly score
    let anomalyScore = 0;
    let deviations = [];
    
    // Speed deviation
    const speedDeviation = Math.abs(features.avgSpeed - this.mouseBaseline.avgSpeed) / 
                          (this.mouseBaseline.avgSpeed * 0.6); // 60% tolerance
    deviations.push(speedDeviation);
    console.log(`  Mouse speed deviation: ${speedDeviation.toFixed(2)} (current: ${features.avgSpeed.toFixed(1)} px/s, baseline: ${this.mouseBaseline.avgSpeed.toFixed(1)} px/s)`);
    
    // Straightness deviation
    const straightnessDeviation = Math.abs(features.straightness - this.mouseBaseline.straightness) / 0.3;
    deviations.push(straightnessDeviation);
    console.log(`  Straightness deviation: ${straightnessDeviation.toFixed(2)} (current: ${features.straightness.toFixed(3)}, baseline: ${this.mouseBaseline.straightness.toFixed(3)})`);
    
    // Curvature deviation
    const curvatureDeviation = Math.abs(features.avgCurvature - this.mouseBaseline.avgCurvature) / 0.2;
    deviations.push(curvatureDeviation);
    console.log(`  Curvature deviation: ${curvatureDeviation.toFixed(2)}`);
    
    // Pause pattern check
    const pauseDeviation = Math.abs(features.pauseFrequency - this.mouseBaseline.pauseFrequency) / 0.2;
    deviations.push(pauseDeviation);
    console.log(`  Pause deviation: ${pauseDeviation.toFixed(2)}`);
    
    // Combine deviations
    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
    console.log(`  Average mouse deviation: ${avgDeviation.toFixed(2)}`);
    anomalyScore = 1 / (1 + Math.exp(-2 * (avgDeviation - 1.5)));
    console.log(`  ⚠️ Mouse anomaly score: ${(anomalyScore * 100).toFixed(1)}%`);
    
    return {
      score: Math.min(1, anomalyScore),
      confidence: mouseData.length >= 50 ? 0.9 : 0.6,
      features: features,
      deviations: {
        speed: speedDeviation,
        straightness: straightnessDeviation,
        curvature: curvatureDeviation,
        pauses: pauseDeviation
      }
    };
  }
  
  // Extract mouse movement features
  extractMouseFeatures(mouseData) {
    const speeds = [];
    const distances = [];
    const angles = [];
    let pauses = 0;
    let totalDistance = 0;
    let straightLineDistance = 0;
    
    for (let i = 1; i < mouseData.length; i++) {
      const prev = mouseData[i - 1];
      const curr = mouseData[i];
      
      // Safety check for required properties
      if (!prev || !curr || prev.x === undefined || curr.x === undefined) {
        continue;
      }
      
      // Calculate distance
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (!isNaN(distance) && isFinite(distance)) {
        distances.push(distance);
        totalDistance += distance;
      }
      
      // Calculate speed
      const timespan = (curr.timestamp - prev.timestamp) / 1000; // seconds
      if (timespan > 0 && !isNaN(timespan)) {
        const speed = distance / timespan;
        if (!isNaN(speed) && isFinite(speed)) {
          speeds.push(speed);
          
          // Check for pause (speed < 10 px/s)
          if (speed < 10) {
            pauses++;
          }
        }
      }
      
      // Calculate angle change (curvature)
      if (i > 1) {
        const prevPrev = mouseData[i - 2];
        if (prevPrev && prevPrev.x !== undefined) {
          const angle1 = Math.atan2(prev.y - prevPrev.y, prev.x - prevPrev.x);
          const angle2 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
          let angleDiff = Math.abs(angle2 - angle1);
          if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
          if (!isNaN(angleDiff) && isFinite(angleDiff)) {
            angles.push(angleDiff);
          }
        }
      }
    }
    
    // Straight line distance from start to end
    if (mouseData.length >= 2) {
      const start = mouseData[0];
      const end = mouseData[mouseData.length - 1];
      if (start && end && start.x !== undefined && end.x !== undefined) {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        straightLineDistance = Math.sqrt(dx * dx + dy * dy);
      }
    }
    
    const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 150;
    const avgDistance = distances.length > 0 ? distances.reduce((a, b) => a + b, 0) / distances.length : 50;
    const avgCurvature = angles.length > 0 ? angles.reduce((a, b) => a + b, 0) / angles.length : 0.2;
    
    // Straightness: ratio of straight-line distance to total path distance
    const straightness = straightLineDistance > 0 && totalDistance > 0 ? 
                        straightLineDistance / totalDistance : 0.75;
    
    // Pause frequency: pauses per movement
    const pauseFrequency = mouseData.length > 0 ? pauses / mouseData.length : 0.3;
    
    return {
      avgSpeed,
      avgDistance,
      avgCurvature,
      straightness,
      pauseFrequency,
      totalMovements: mouseData.length
    };
  }
  
  // Update baseline with new user behavior (adaptive learning)
  updateBaseline(keystrokeData, mouseData) {
    // Gradually update baselines with new data (exponential moving average)
    const alpha = 0.1; // Learning rate
    
    if (keystrokeData && keystrokeData.length >= 20) {
      const newFeatures = this.extractKeystrokeFeatures(keystrokeData);
      this.keystrokeBaseline.avgHoldTime = 
        (1 - alpha) * this.keystrokeBaseline.avgHoldTime + alpha * newFeatures.avgHoldTime;
      this.keystrokeBaseline.avgFlightTime = 
        (1 - alpha) * this.keystrokeBaseline.avgFlightTime + alpha * newFeatures.avgFlightTime;
      this.keystrokeBaseline.typingSpeed = 
        (1 - alpha) * this.keystrokeBaseline.typingSpeed + alpha * newFeatures.typingSpeed;
    }
    
    if (mouseData && mouseData.length >= 50) {
      const newFeatures = this.extractMouseFeatures(mouseData);
      this.mouseBaseline.avgSpeed = 
        (1 - alpha) * this.mouseBaseline.avgSpeed + alpha * newFeatures.avgSpeed;
      this.mouseBaseline.straightness = 
        (1 - alpha) * this.mouseBaseline.straightness + alpha * newFeatures.straightness;
      this.mouseBaseline.avgCurvature = 
        (1 - alpha) * this.mouseBaseline.avgCurvature + alpha * newFeatures.avgCurvature;
    }
  }
}
