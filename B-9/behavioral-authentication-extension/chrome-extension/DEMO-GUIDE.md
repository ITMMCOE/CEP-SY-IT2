# 🚀 Quick Start Guide - Chrome Extension Demo (Oct 29, 2025)

## ⚡ 5-Minute Setup

### Step 1: Install Extension (2 minutes)

1. **Open Chrome Extensions Page**:
   - Type `chrome://extensions/` in address bar
   - OR: Menu (⋮) → Extensions → Manage Extensions

2. **Enable Developer Mode**:
   - Toggle switch in top-right corner

3. **Load Extension**:
   - Click "Load unpacked"
   - Navigate to: `C:\AltairAI\DataMerge\behavior-authentication\chrome-extension\`
   - Click "Select Folder"
   - ✅ Extension loaded!

4. **Pin to Toolbar** (Optional):
   - Click puzzle icon in toolbar
   - Find "Behavioral Auth"
   - Click pin icon

### Step 2: Initial Configuration (1 minute)

1. **Click Extension Icon** in toolbar
2. **Check Settings**:
   - ✅ Enable Monitoring: ON
   - 🎯 Sensitivity: Medium
3. Ready!

### Step 3: Train Baseline (2 minutes)

1. Click **"Train Baseline"** button in popup
2. **Type naturally** on any webpage:
   - Open a new tab
   - Go to any website (e.g., Wikipedia, news site)
   - Type in search boxes, comment fields
   - Browse normally for 2-3 minutes
3. Watch popup stats increase:
   - Keystroke count rises
   - Mouse events captured
   - Confidence builds to 80%+

✅ **You're Ready for Demo!**

---

## 🎬 Demo Script (10 minutes)

### Part 1: Introduction (1 min)

**Say**: 
> "This is a Chrome extension that uses AI to continuously authenticate users 
> based on their behavioral patterns - how they type and move their mouse. 
> It was trained using Altair AI Studio with real-world datasets."

**Show**: Extension popup with live stats

### Part 2: Normal Usage Demo (2 min)

**Do**:
1. Open popup → Show green status
2. Type on a webpage → Point out keystroke counter increasing
3. Move mouse → Show mouse events being captured
4. Highlight confidence score: "Currently 85% confident this is me"

**Say**:
> "The extension continuously monitors in the background. Right now it sees 
> my normal typing rhythm and mouse movements, so confidence is high."

### Part 3: Anomaly Detection (3 min)

**Do**:
1. **Trigger anomaly**:
   - Type very slowly or very quickly (unusual pattern)
   - OR: Use keyboard with different rhythm
   - Wait 5-10 seconds for detection

2. **Show freeze**:
   - Browser blurs and freezes
   - Security alert modal appears

3. **Explain modal**:
   - "Unusual behavior detected"
   - Shows anomaly score (e.g., 72%)
   - Three response options

**Say**:
> "The AI detected behavior that doesn't match my baseline profile. 
> Maybe someone else is using my computer, or I'm typing differently. 
> Now I can choose how to respond."

### Part 4: Security Responses (3 min)

#### Option 1: "Yes, it's me" (Green)
**Do**: Click button
**Result**: Full access restored immediately
**Say**: "If it was just me typing unusually, I restore full access"

#### Option 2: "Someone I know" (Orange)
**Do**: Trigger another anomaly, click orange button
**Result**: 
- Limited access banner appears
- Try to visit a bank site → Blocked
- Try password field → Disabled

**Say**: 
> "Limited mode restricts sensitive sites and password fields. 
> Good for when a family member borrows your laptop."

#### Option 3: "No, it's not me" (Red)
**Do**: Trigger final anomaly, click red button
**Result**:
- All tabs close
- Session-ended page appears
- Data cleared

**Say**:
> "If someone unauthorized accessed my account, this immediately 
> terminates the session and sends me an encrypted alert email."

### Part 5: Technical Highlights (1 min)

**Show** (quickly):
1. Models folder → Keystroke model (70.5% accuracy)
2. Background console → Real-time logs
3. Popup → Live statistics

**Say**:
> "Built with Manifest V3, trained in Altair AI Studio with 20,400 
> keystroke samples and 60,000+ mouse samples. Uses Generalized Linear 
> Model achieving 70.5% accuracy."

---

## 🎯 Key Talking Points

### Technical Stack
- ✅ **Chrome Extension**: Manifest V3 (latest standard)
- ✅ **AI Training**: Altair AI Studio (AutoML platform)
- ✅ **Model**: Generalized Linear Model (70.5% accuracy)
- ✅ **Datasets**: CMU (keystroke) + Balabit (mouse)
- ✅ **Code**: 1,500+ lines of JavaScript
- ✅ **Security**: AES-256 encryption, HTTPS alerts

### Unique Features
1. **Real-Time**: Continuous monitoring, not just login
2. **Multi-Modal**: Keystroke + mouse dynamics combined
3. **Adaptive**: Learns and updates baseline over time
4. **User-Friendly**: Clear visual feedback, easy controls
5. **Privacy-First**: All data stored locally, encrypted

### Use Cases
- 🏠 **Home**: Detect when family members use your computer
- 💼 **Work**: Prevent account takeover attacks
- 🏦 **Banking**: Extra layer beyond password
- 🔐 **High-Security**: Government/healthcare compliance

---

## 🐛 Quick Troubleshooting (Demo Day)

### Issue: Extension doesn't show up
**Fix**: Reload extensions page, verify folder selected

### Issue: Stats show 0 keystrokes
**Fix**: Refresh the webpage you're typing on

### Issue: Anomaly won't trigger
**Fix**: Type VERY differently (super slow or super fast)

### Issue: Alert modal doesn't appear
**Fix**: Check popup blocked, allow popups for extension

---

## 📊 Stats to Highlight

### Model Performance
- **Keystroke Accuracy**: 70.5%
- **Baseline**: 1.96% (random guess for 51 users)
- **Improvement**: 36x better than random
- **Training Time**: 7 minutes 30 seconds
- **Training Data**: 20,400 samples from 51 users

### Extension Metrics
- **Total Code**: 1,500+ lines
- **Files Created**: 20+
- **Features Tracked**: 34 (keystroke) + 43 (mouse)
- **Detection Speed**: < 5 seconds
- **False Positive Rate**: Low (65% threshold)

---

## ✅ Pre-Demo Checklist

**30 Minutes Before:**
- [ ] Extension installed and enabled
- [ ] Baseline trained (2-3 minutes of typing)
- [ ] Chrome browser updated to latest
- [ ] Close unnecessary tabs/programs
- [ ] Test freeze mechanism once

**5 Minutes Before:**
- [ ] Open popup, verify green status
- [ ] Have 2-3 tabs ready (Wikipedia, news site)
- [ ] Background console open (F12) for logs
- [ ] Screen recording started (optional)

**During Demo:**
- [ ] Speak clearly and slowly
- [ ] Point to screen elements as you explain
- [ ] Let modal animations complete (don't rush)
- [ ] Smile and maintain eye contact
- [ ] Prepare for questions

---

## 💡 Demo Tips

### Visual Impact
- **Use full screen** when showing alert modal
- **Slow down** when clicking buttons (let audience see)
- **Zoom in** on popup stats (Ctrl + Plus)

### Engagement
- Ask: "Has anyone had their account hacked?"
- Ask: "How many times do you check if it's really you logging in?"
- Pause after showing freeze mechanism (dramatic effect)

### Backup Plan
- If live trigger fails, have screenshots ready
- Explain concept even if demo glitches
- Emphasize the training results from Altair AI

---

## 🎉 Closing Statement

**Say**:
> "This project demonstrates how behavioral biometrics can provide continuous 
> authentication without disrupting user experience. Unlike passwords that can be 
> stolen, your typing rhythm and mouse patterns are unique to you. By combining 
> machine learning with real-time monitoring, we've created a security system 
> that's both intelligent and user-friendly."

**End with**: Questions?

---

## 📧 Follow-Up Materials

After demo, share:
- Extension folder path: `C:\AltairAI\DataMerge\behavior-authentication\chrome-extension\`
- README.md (documentation)
- INSTALLATION.md (setup guide)
- Model files (JSON thresholds)
- Altair AI training screenshots

---

## 🌟 Success Metrics

**Demo is successful if audience understands:**
1. ✅ What behavioral authentication is
2. ✅ How it works in real-time
3. ✅ Why it's better than password-only
4. ✅ The 3-tier security response system
5. ✅ Practical use cases

---

**🔥 You've Got This!**

**Total Prep Time**: 10 minutes  
**Demo Duration**: 10 minutes  
**Wow Factor**: 100%

---

**Good luck on October 29! 🚀**

---

**Emergency Contact**: If anything breaks, check:
1. Chrome DevTools Console (F12)
2. Background service worker logs
3. Extension reload button
4. This guide: [INSTALLATION.md](INSTALLATION.md)
