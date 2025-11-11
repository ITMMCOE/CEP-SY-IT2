# 🚀 COMPLETE STEP-BY-STEP GUIDE - Chrome Extension Deployment

## 📅 For Demo on October 29, 2025

This guide walks you through **EVERYTHING** you need to do to deploy and demo your Behavioral Authentication Chrome Extension.

---

## ⏰ TIMELINE (Morning of Demo)

### **1 Hour Before Demo** (Critical)

#### **Step 1: Open Chrome Browser** (30 seconds)
1. Double-click Chrome icon on desktop
2. Wait for browser to open

#### **Step 2: Navigate to Extensions Page** (1 minute)
1. **Option A**: Type in address bar:
   ```
   chrome://extensions/
   ```
   Press Enter

2. **Option B**: Click menu (3 dots in top-right)
   - Hover over "Extensions"
   - Click "Manage Extensions"

**✅ You should see**: Extensions management page

---

#### **Step 3: Enable Developer Mode** (30 seconds)
1. Look at **top-right corner** of the page
2. Find toggle switch labeled **"Developer mode"**
3. Click it to turn it **ON** (should turn blue)

**✅ You should see**: Three new buttons appear:
- "Load unpacked"
- "Pack extension"
- "Update"

---

#### **Step 4: Load Your Extension** (2 minutes)

1. Click the **"Load unpacked"** button

2. **File Explorer Window Opens**:
   - Navigate to: `C:\`
   - Open folder: `AltairAI`
   - Open folder: `DataMerge`
   - Open folder: `behavior-authentication`
   - Open folder: `chrome-extension`

3. **IMPORTANT**: Select the **`chrome-extension`** folder itself
   - Don't open it and select files inside
   - Just click on the folder once to highlight it
   - Click **"Select Folder"** button

4. **Wait 2-3 seconds** for extension to load

**✅ You should see**:
- A new card appears with your extension
- Name: "Behavioral Authentication" 
- Icon: Blue shield with lock
- Status: No errors (if errors appear, see Troubleshooting below)

---

#### **Step 5: Pin Extension to Toolbar** (1 minute)

1. Look at Chrome toolbar (top-right)
2. Click the **puzzle piece icon** (Extensions)
3. Find "Behavioral Authentication" in the list
4. Click the **pin icon** next to it

**✅ You should see**: Extension icon appears in Chrome toolbar permanently

---

#### **Step 6: Initial Configuration** (2 minutes)

1. **Click the extension icon** in toolbar (blue shield)

2. **Popup Opens** - You should see:
   - Header: "Behavioral Auth"
   - Status: "Loading..." or "Monitoring Active"
   - Stats showing 0 keystrokes, 0 mouse events

3. **Check Settings** (scroll down in popup):
   - ✅ **Enable Monitoring**: Should be ON (toggle to right, green)
   - 🎯 **Sensitivity**: Should say "Medium (0.65+)"
   
4. If settings are wrong:
   - Toggle "Enable Monitoring" to ON
   - Change dropdown to "Medium"

**✅ You should see**: Green status dot, monitoring active

---

#### **Step 7: Train Your Baseline** (5-10 minutes) - **CRITICAL!**

This is the **most important step** - the AI needs to learn YOUR typing and mouse patterns.

1. **In the popup**, click **"Train Baseline"** button
   - Button text changes to "Training..."

2. **Open a new tab** (Ctrl+T)

3. **Go to any website** (suggestions):
   - Wikipedia.org
   - News site (CNN, BBC)
   - Your email (Gmail)

4. **Type naturally for 5-10 minutes**:
   - Write a comment
   - Search for things
   - Type in text boxes
   - Be yourself - don't try to type perfectly

5. **Move your mouse naturally**:
   - Browse around
   - Click links
   - Scroll pages
   - Normal behavior

6. **Watch the popup stats** (click extension icon to check):
   - Keystroke Count: Should increase (aim for 200+)
   - Mouse Events: Should increase (aim for 500+)
   - Confidence Score: Should reach 70-85%

**✅ You should see**: 
- Keystroke count: 200-500+
- Mouse count: 500-1000+
- Confidence: 75-90%
- "Train Baseline" button back to normal

---

#### **Step 8: Verify Extension is Working** (3 minutes)

1. **Open extension popup** again
2. **Check Status Indicator**:
   - Dot should be **green**
   - Text: "Monitoring Active"
   - Access Level: "FULL"

3. **Check Real-Time Stats**:
   - Type on any webpage → Keystroke counter should increase immediately
   - Move mouse → Mouse counter should increase
   - Watch confidence bar fill up

4. **Open Browser Console** (for debugging):
   - Press **F12** on keyboard
   - Click **"Console"** tab
   - You should see logs like:
     - "🔒 Session Controller activated"
     - "📊 Behavior Tracker ready"
     - "🎯 Anomaly Detector loaded"

**✅ You should see**: All green, no red errors

---

## 🧪 TEST RUN (30 Minutes Before Demo)

### **Test 1: Normal Browsing** (2 minutes)

1. Browse any website normally
2. Type in search boxes
3. Click links
4. Check popup → Should show green status

**Expected**: No alerts, full access maintained

---

### **Test 2: Trigger Anomaly - Limited Access** (5 minutes)

1. **Open a test webpage** (Google, Wikipedia)

2. **Type VERY DIFFERENTLY** than normal:
   - **Option A**: Type extremely slowly (1 key per 2 seconds)
   - **Option B**: Type extremely fast (mash keyboard quickly)
   - **Option C**: Use only one finger instead of touch typing
   
3. **Type for 30-60 seconds** continuously

4. **Wait 10-15 seconds** for detection

5. **What Should Happen**:
   - Screen **blurs**
   - Page **freezes** (can't click anything)
   - **Security Alert modal** appears with:
     - "Unusual Behavior Detected" title
     - Anomaly score (e.g., "72.3%")
     - 3 colored buttons

6. **Click the ORANGE button**: "Someone I know"

7. **What Should Happen**:
   - Modal closes
   - Page unfreezes
   - **Orange banner** appears at top: "Limited Access Mode"
   - Try to visit a bank site → Blocked
   - Try to type in password field → Disabled

8. **To reset**: Close all tabs, reopen extension popup, it should reset

**Expected**: Limited access mode with restrictions

---

### **Test 3: Full Access Restoration** (3 minutes)

1. **Trigger anomaly** again (type differently)
2. **Wait for alert** modal
3. **Click GREEN button**: "Yes, it's me"

**Expected**: 
- Modal closes immediately
- Full access restored
- No restrictions
- Green status in popup

---

### **Test 4: Session Termination** (3 minutes)

**⚠️ WARNING**: This will close ALL your tabs!

1. **Save any important work** first
2. **Trigger anomaly** again
3. **Wait for alert** modal
4. **Click RED button**: "No, it's not me"

**Expected**:
- Modal shows "Processing..."
- All tabs close
- New tab opens with "Session Terminated" page
- Lists security actions taken
- Extension resets

---

## 🎬 DEMO SCRIPT (10 Minutes)

### **Part 1: Introduction** (2 minutes)

**What to Say**:
> "Today I'm showing you a Chrome extension that uses AI to continuously authenticate users based on their behavioral patterns. Unlike passwords that can be stolen, your typing rhythm and mouse movements are unique to you."

**What to Show**:
1. Click extension icon
2. Show popup with stats
3. Point to real-time counters

---

### **Part 2: How It Works** (3 minutes)

**What to Say**:
> "The extension was trained using Altair AI Studio with real-world datasets. The keystroke model achieved 70.5% accuracy on 20,000 samples from 51 users. It continuously monitors your behavior in the background."

**What to Show**:
1. Open any webpage
2. Start typing
3. Show keystroke counter increasing in real-time
4. Move mouse around
5. Show mouse counter increasing
6. Point to confidence score: "Currently 85% confident this is me"

---

### **Part 3: Anomaly Detection** (3 minutes)

**What to Say**:
> "Now I'll demonstrate what happens when the AI detects unusual behavior - perhaps someone else using my computer."

**What to Do**:
1. Type very slowly/fast (differently than your baseline)
2. Wait 10-15 seconds
3. **When freeze happens**, say:
   > "The system detected behavior that doesn't match my profile. The browser froze for security."

4. **Point to modal**:
   > "Now I can choose how to respond with three options."

---

### **Part 4: Security Responses** (2 minutes)

**Option 1: Green Button**
**Say**: 
> "If it's just me typing unusually, I can restore full access immediately."

**Do**: Click green button, show normal access restored

**Option 2: Orange Button**
**Say**:
> "If a family member is using my laptop, I can enable limited access mode which blocks passwords and sensitive sites."

**Do**: Trigger another anomaly, click orange button, try to visit a bank → blocked

**Option 3: Red Button**
**Say**:
> "If someone unauthorized accessed my account, this immediately terminates the session and sends me an encrypted email alert."

**Do**: Trigger final anomaly, click red button, show session termination page

---

## 📋 PRE-DEMO CHECKLIST

### **30 Minutes Before**
- [ ] Extension installed in Chrome
- [ ] Baseline trained (200+ keystrokes, 500+ mouse events)
- [ ] Green status showing in popup
- [ ] Test anomaly trigger works
- [ ] All 3 response buttons tested
- [ ] Browser console open (F12) for live logs

### **5 Minutes Before**
- [ ] Close unnecessary tabs (keep 2-3 for demo)
- [ ] Have Wikipedia/news site ready in tabs
- [ ] Extension popup open
- [ ] Screen recording started (optional)
- [ ] Smile and breathe! 😊

### **During Demo**
- [ ] Speak clearly and slowly
- [ ] Point to screen elements as you explain
- [ ] Wait for animations to complete
- [ ] Make eye contact with audience
- [ ] Have fun!

---

## 🐛 TROUBLESHOOTING

### **Problem: Extension won't load**

**Error Message**: "Manifest file is missing or unreadable"

**Fix**:
1. Verify you selected the correct folder:
   - Should be: `C:\AltairAI\DataMerge\behavior-authentication\chrome-extension\`
   - NOT: `C:\AltairAI\DataMerge\behavior-authentication\`
2. Check that `manifest.json` exists in the folder
3. Try "Load unpacked" again

---

### **Problem: Extension loads but shows errors**

**Error Message**: Red text about "service worker" or "content script"

**Fix**:
1. Click the **"Errors"** button on extension card
2. Read the error message
3. Common issues:
   - **"service-worker.js not found"**: Check file exists in `background/` folder
   - **"Failed to load"**: Refresh extension (click refresh icon)
4. If errors persist: Remove extension, reload it

---

### **Problem: Stats showing 0 keystrokes**

**Symptoms**: You're typing but keystroke counter stays at 0

**Fix**:
1. **Refresh the webpage** you're typing on (F5)
2. Extension only works on pages loaded AFTER extension installed
3. Try a new tab (Ctrl+T)
4. Don't test on chrome:// pages (they're restricted)

---

### **Problem: Anomaly won't trigger**

**Symptoms**: Typing differently but no alert appears

**Fix**:
1. Type VERY differently (extremely slow or fast)
2. Type for longer (60+ seconds continuously)
3. Check sensitivity in settings (try "High" sensitivity)
4. Verify baseline was trained (check stats > 200 keystrokes)
5. Wait longer (detection can take 15-30 seconds)

---

### **Problem: Security alert doesn't appear**

**Symptoms**: Page freezes but no modal shows

**Fix**:
1. Check if popup blockers are enabled (disable them)
2. Open browser console (F12) → Look for errors
3. Verify `alert/security-alert.html` exists
4. Reload extension and try again

---

### **Problem: Limited access mode not working**

**Symptoms**: Clicked orange button but can still access everything

**Fix**:
1. Check that banner appeared at top of page
2. Refresh the page (F5) for restrictions to apply
3. Try visiting a bank site → Should redirect
4. Try password field → Should be disabled

---

## 📊 TALKING POINTS FOR QUESTIONS

### **"How accurate is it?"**
> "The keystroke model achieved 70.5% accuracy on a dataset of 51 users, which is 36 times better than random guessing. The mouse model achieved 58.2% accuracy on 65 users, which is 38 times better than random guessing. Together, they provide strong multi-modal authentication."

### **"Can it be fooled?"**
> "While no system is perfect, behavioral biometrics are very hard to replicate. Each person's typing rhythm is as unique as a fingerprint. An attacker would need to perfectly mimic timing patterns down to milliseconds."

### **"What about privacy?"**
> "All behavioral data is stored locally in Chrome's storage. Nothing is sent to external servers except the encrypted security alerts. Users have full control and can clear data anytime."

### **"How was it trained?"**
> "I used Altair AI Studio's AutoML platform with real-world datasets - the CMU keystroke dynamics dataset and the Balabit mouse dynamics dataset. The AI tested 168 different model variations and selected the best performer."

### **"What about false positives?"**
> "The system uses adaptive learning to update your baseline over time, reducing false positives. The 65% threshold provides a good balance. Users can also adjust sensitivity in settings."

### **"Can this replace passwords?"**
> "It's designed as an additional layer, not a replacement. Think of it as continuous two-factor authentication - your password is what you know, your behavior is what you are."

---

## 🎯 SUCCESS CRITERIA

Your demo is successful if the audience understands:

1. ✅ **What** it does (behavioral authentication)
2. ✅ **Why** it matters (security + continuous monitoring)
3. ✅ **How** it works (AI models, real-time detection)
4. ✅ **When** to use it (account protection, shared computers)
5. ✅ **Who** benefits (anyone concerned about security)

---

## 📧 AFTER THE DEMO

### **Things to Share**
1. Extension folder location: `C:\AltairAI\DataMerge\behavior-authentication\chrome-extension\`
2. Installation guide: `INSTALLATION.md`
3. Technical docs: `README.md`
4. Model files: `models/*.json`

### **Follow-Up Tasks**
1. ✅ Mouse model exported from Altair AI (Completed October 28, 2025 - 58.2% accuracy)
2. ✅ `models/mouse-threshold.json` updated
3. Convert SVG icons to PNG (optional improvement)
4. Collect feedback from audience

---

## ✅ FINAL CHECKLIST

**Morning of Demo (Oct 29):**
- [ ] 1. Open Chrome
- [ ] 2. Go to chrome://extensions/
- [ ] 3. Enable Developer mode
- [ ] 4. Load unpacked → Select chrome-extension folder
- [ ] 5. Pin extension to toolbar
- [ ] 6. Enable monitoring in settings
- [ ] 7. Train baseline (5-10 min typing)
- [ ] 8. Verify green status
- [ ] 9. Test anomaly trigger once
- [ ] 10. Review demo script
- [ ] 11. Breathe and relax! 😊

**You're Ready! 🚀**

---

## 🔥 QUICK REFERENCE

### **File Locations**
```
Extension: C:\AltairAI\DataMerge\behavior-authentication\chrome-extension\
Models: chrome-extension\models\
Docs: chrome-extension\README.md
```

### **Chrome URLs**
```
Extensions: chrome://extensions/
```

### **Keyboard Shortcuts**
```
New Tab: Ctrl+T
Refresh: F5
Console: F12
Close Tab: Ctrl+W
```

### **Emergency Contacts**
```
Documentation: README.md
Installation Help: INSTALLATION.md
This Guide: STEP-BY-STEP-DEPLOYMENT.md
```

---

**🎉 YOU'VE GOT THIS! GOOD LUCK TOMORROW! 🚀**

---

**Last Updated**: October 28, 2025  
**Demo Date**: October 29, 2025  
**Status**: Ready to Deploy ✅
