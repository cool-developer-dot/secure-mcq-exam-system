# 🛡️ Anti-Cheating System

## Overview

Comprehensive anti-cheating measures to prevent copying text, taking screenshots, and monitoring suspicious behavior during the exam.

---

## 🔒 Security Features

### 1. **Text Selection Disabled**
- ✅ Cannot select/highlight text during exam
- ✅ Questions and options are not selectable
- ✅ Only input fields (for typing) remain selectable
- ✅ Prevents copying questions

### 2. **Right-Click Context Menu Disabled**
- ✅ Right-click blocked during exam
- ✅ Cannot access "Copy", "Save Image", etc.
- ✅ Attempt logged and displayed to user
- ✅ Shows warning: "🚫 SCREENSHOT BLOCKED"

### 3. **Keyboard Shortcuts Blocked**
All dangerous keyboard combinations are disabled:

#### Copy/Paste Prevention:
- ❌ **Ctrl+C** - Copy blocked
- ❌ **Ctrl+X** - Cut blocked
- ❌ **Ctrl+V** - Paste blocked

#### Screenshot Prevention:
- ❌ **PrintScreen** - Screenshot blocked
- ❌ **Alt+PrintScreen** - Window screenshot blocked
- ❌ **Windows+Shift+S** - Snipping tool (browser-level block)

#### Save/Print Prevention:
- ❌ **Ctrl+S** - Save page blocked
- ❌ **Ctrl+P** - Print blocked

#### Developer Tools Prevention:
- ❌ **F12** - Developer console blocked
- ❌ **Ctrl+Shift+I** - Inspect element blocked
- ❌ **Ctrl+Shift+C** - Inspect element blocked
- ❌ **Ctrl+Shift+J** - Console blocked
- ❌ **Ctrl+U** - View source blocked

### 4. **Tab Switch Detection**
- ✅ Detects when student switches tabs
- ✅ Detects when window is minimized
- ✅ Shows **RED WARNING SCREEN**
- ✅ Counts and logs all violations
- ✅ Displays violation count to student
- ✅ Records timestamps of violations

### 5. **Visual Watermark**
- ✅ Student name + CNIC displayed as watermark
- ✅ Semi-transparent, rotated at 45°
- ✅ Cannot be removed or hidden
- ✅ Appears on any screenshots taken
- ✅ Identifies the candidate uniquely

### 6. **Screenshot Blocker**
- ✅ Shows "🚫 SCREENSHOT BLOCKED" message
- ✅ Appears for 2 seconds when attempt detected
- ✅ Counts all screenshot attempts
- ✅ Logged in admin dashboard

### 7. **Print Prevention**
- ✅ Printing completely disabled
- ✅ Print dialog blocked
- ✅ Page set to not display when printed

### 8. **Window Blur Detection**
- ✅ Detects when exam window loses focus
- ✅ Logs as violation
- ✅ Shows warning screen
- ✅ Helps prevent external help

---

## 📊 Violation Tracking

### What Gets Tracked:
```javascript
{
  violations: 0,           // Total violation count
  tabSwitchCount: 0,       // Times user switched tabs
  screenshotAttempts: 0,   // PrintScreen key presses
  rightClickAttempts: 0    // Right-click attempts
}
```

### Stored with Results:
All violation data is saved with exam submission:
```json
{
  "studentName": "Ali Hassan",
  "cnic": "42101-1234567-3",
  "score": 85.5,
  "antiCheatLog": {
    "violations": 3,
    "tabSwitchCount": 2,
    "screenshotAttempts": 1,
    "rightClickAttempts": 0
  }
}
```

---

## 🎯 Student Experience

### During Exam:
1. **Cannot select text** - Mouse dragging doesn't highlight
2. **Cannot right-click** - Context menu disabled
3. **Cannot screenshot** - PrintScreen blocked, message shown
4. **Cannot copy** - Ctrl+C shows blocker message
5. **Watermark visible** - Name + CNIC in background

### If They Try to Cheat:
1. **Switch tabs** → Red warning screen appears
2. **Try screenshot** → "🚫 SCREENSHOT BLOCKED" message
3. **Right-click** → Blocker message + violation logged
4. **Press F12** → Blocked, no effect

### Warning Screen (Tab Switch):
```
╔═══════════════════════════════════════╗
║                                       ║
║         ⚠️  WARNING                   ║
║                                       ║
║  You have switched tabs or            ║
║  minimized the exam window!           ║
║                                       ║
║  This action has been recorded.       ║
║                                       ║
║     Violations: 3                     ║
║                                       ║
║  Click anywhere to return to exam     ║
║                                       ║
╚═══════════════════════════════════════╝
```

---

## 👨‍💼 Admin Dashboard

### Violations Column Added:
| Student | CNIC | Score | Violations | Details |
|---------|------|-------|------------|---------|
| Ali Hassan | 42101-... | 85.5 | ✓ 0 | Clean exam |
| Sara Ahmed | 61101-... | 72.0 | ⚠ 2 | Minor violations |
| Ahmed Khan | 54201-... | 65.5 | ⚠️ 8 | Suspicious activity |

### Violation Indicators:
- **✓ Green (0 violations)** - Clean, no issues
- **⚠ Orange (1-5 violations)** - Minor issues, acceptable
- **⚠️ Red (6+ violations)** - Suspicious, requires review

### Hover for Details:
Hover over violation count to see:
```
Tab switches: 2
Screenshot attempts: 1
Right-click attempts: 0
```

---

## 🔐 Technical Implementation

### CSS-Based Protection:
```css
/* Disable text selection globally */
body {
    -webkit-user-select: none;
    user-select: none;
}

/* Allow only in input fields */
input, textarea {
    user-select: text;
}
```

### JavaScript Event Blocking:
```javascript
// Block right-click
document.addEventListener('contextmenu', e => {
    if (examActive) e.preventDefault();
});

// Block keyboard shortcuts
document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        showBlocker();
    }
});
```

### Tab Switch Detection:
```javascript
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        violations++;
        showWarning();
    }
});
```

---

## 🎨 Visual Elements

### Watermark:
- **Position**: Center of screen, rotated -45°
- **Content**: "Candidate Name - CNIC"
- **Opacity**: 3% (visible but not obstructive)
- **Font size**: 4rem
- **Layer**: Behind all content (z-index: 9998)

### Warning Screen:
- **Background**: Red semi-transparent overlay
- **Z-index**: 10000 (topmost)
- **Auto-hide**: After 5 seconds or on click
- **Content**: Warning message + violation count

### Screenshot Blocker:
- **Background**: Black 80% opacity
- **Text**: "🚫 SCREENSHOT BLOCKED"
- **Duration**: 2 seconds
- **Font size**: 2rem, bold

---

## ⚠️ What Cannot Be Prevented

### System-Level Screenshots:
- **Windows Snipping Tool** - Can be launched outside browser
- **Third-party software** - OBS, ShareX, etc.
- **Mobile phone photos** - Taking picture of screen
- **External cameras** - Recording screen

### Workarounds:
While the system blocks most cheating attempts:
- Determined users with recording software can still capture
- Physical cameras can photograph the screen
- Second device can be used

### Recommended Additional Measures:
1. **Proctor monitoring** (live or recorded)
2. **Webcam requirement**
3. **Screen recording software**
4. **Randomized question order**
5. **Time pressure** (less time to cheat)
6. **Physical supervision** for high-stakes exams

---

## 📊 Violation Severity Guidelines

### Green Zone (0 violations):
- ✅ Clean exam
- ✅ No suspicious activity
- ✅ Full marks eligible

### Yellow Zone (1-5 violations):
- ⚠️ Minor issues (accidental tab switches)
- ⚠️ Acceptable in most cases
- ⚠️ May warrant manual review

### Red Zone (6+ violations):
- ⚠️ Suspicious behavior
- ⚠️ Requires manual review
- ⚠️ May indicate cheating attempt
- ⚠️ Consider interview or re-test

---

## 🧪 Testing Anti-Cheating

### Test Scenarios:
1. **Try selecting text** → Should not work
2. **Try right-clicking** → Blocker message appears
3. **Press Ctrl+C** → Blocker message appears
4. **Press PrintScreen** → Blocker message appears
5. **Switch tabs** → Red warning screen
6. **Press F12** → No effect
7. **Try to print (Ctrl+P)** → Blocked

### Expected Behavior:
- All attempts should be blocked
- Violations should be counted
- Messages should appear
- Data should be logged

---

## 📝 Configuration

### Enable/Disable Anti-Cheating:
Currently auto-enabled when exam starts. To modify:

```javascript
// In exam.js
function startExam() {
    // ...
    enableAntiCheating(); // Comment this to disable
    // ...
}
```

### Adjust Violation Thresholds:
```javascript
// In admin.html
if (violations > 5) {
    violationClass = 'wrong';  // Red
} else if (violations > 0) {
    violationClass = 'warning'; // Orange
}
```

---

## 🆘 False Positives

### Common Causes:
1. **Accidental tab switch** - Alt+Tab by mistake
2. **Browser notifications** - Can cause blur event
3. **System updates** - Windows popup
4. **Slow computer** - Window may lose focus

### Handling:
- Review high violation counts manually
- Consider context (technical issues vs. intent)
- Allow students to explain in interview
- Set reasonable thresholds (6+ is suspicious)

---

## ✅ Benefits

### For Administrators:
- ✅ Comprehensive cheating prevention
- ✅ Detailed violation logs
- ✅ Easy to review suspicious cases
- ✅ Professional exam environment

### For Honest Students:
- ✅ Fair exam conditions
- ✅ No disadvantage vs. cheaters
- ✅ Clear rules and boundaries
- ✅ Professional assessment

### For Institution:
- ✅ Credible exam results
- ✅ Reduced cheating incidents
- ✅ Better integrity
- ✅ Professional reputation

---

## 📖 Summary

Your exam system now has:
- ✅ **Text selection disabled**
- ✅ **Screenshot prevention**
- ✅ **Copy/paste blocking**
- ✅ **Right-click disabled**
- ✅ **Tab switch detection**
- ✅ **Visual watermarks**
- ✅ **Violation tracking**
- ✅ **Admin monitoring**
- ✅ **Keyboard shortcut blocking**
- ✅ **Developer tools prevention**

**A professional, secure exam environment!** 🛡️

