# ⏰ Time Window Feature - Admin Guide

## Overview

This feature allows administrators to set a **45-minute availability window** during which students can **start** the exam. Once a student starts the exam, they have the full **30 minutes** to complete it, even if the availability window closes.

---

## 🎯 Use Case

**Problem:** 
- Candidates might start the exam late due to technical issues
- Need flexibility in start times while maintaining exam duration
- Want to prevent early or late attempts

**Solution:**
- Admin sets a 45-minute window (e.g., 2:00 PM - 2:45 PM)
- Students can start anytime within this window
- Once started, they get full 30 minutes to complete
- Example: Student starts at 2:40 PM, they can work until 3:10 PM

---

## 🚀 How to Use

### Step 1: Open Admin Configuration
1. Navigate to: **`frontend/admin-config.html`**
2. Or click "⚙️ Config" button from the admin results page

### Step 2: Set Time Window

#### Option A: Quick Actions
- **🕐 Start Now** - Opens window immediately for next 45 minutes
- **⏰ Start in 30 min** - Opens window 30 minutes from now
- **🕐 Start in 1 hour** - Opens window 1 hour from now
- **❌ Clear Times** - Remove time restrictions

#### Option B: Manual Setting
1. Click on "Start Time" field
2. Select date and time when students can BEGIN starting the exam
3. End time automatically calculated (+45 minutes)
4. Or manually adjust if needed

### Step 3: Enable/Disable Exam
- Toggle the "Enable Exam" switch
- When OFF: Exam is completely unavailable regardless of time

### Step 4: Save Configuration
- Click **"💾 Save Configuration"**
- Changes take effect immediately
- Students see updated availability status

---

## 📊 Example Scenarios

### Scenario 1: Standard 45-Minute Window
```
Start Time: 2:00 PM
End Time:   2:45 PM (auto-calculated)
Exam Duration: 30 minutes

Timeline:
- 2:00 PM: Window opens
- Student A starts at 2:05 PM → Can work until 2:35 PM ✅
- Student B starts at 2:40 PM → Can work until 3:10 PM ✅
- 2:45 PM: Window closes (no new starts allowed)
- Student C tries at 2:50 PM → Blocked ❌
```

### Scenario 2: Technical Issues Buffer
```
Start Time: 10:00 AM
End Time:   10:45 AM

- Student experiences login issues at 10:00 AM
- Resolves issues at 10:30 AM
- Still within window, can start exam ✅
- Gets full 30 minutes until 11:00 AM
```

### Scenario 3: No Time Restriction
```
Start Time: (empty)
End Time:   (empty)
Enable Exam: ON

- Exam available 24/7
- Students can start anytime
- Useful for practice exams or flexible testing
```

---

## 🔐 Security Features

### What Students See
- ✅ Exam availability status
- ✅ Time remaining in window (if applicable)
- ✅ "Exam Not Available" message if outside window
- ❌ Cannot see start/end times (for security)
- ❌ Cannot bypass time restrictions

### What Admins Control
- Set exact start/end times
- Enable/disable exam globally
- View current configuration
- Change settings anytime

---

## 📋 Configuration Options

| Setting | Description | Default |
|---------|-------------|---------|
| **Exam Title** | Custom title for the exam | "MCQ Professional Examination" |
| **Enable Exam** | Master on/off switch | ON |
| **Start Time** | When window opens | Not set (always available) |
| **End Time** | When window closes | Not set (always available) |
| **Exam Duration** | Time to complete once started | 30 minutes |
| **Availability Window** | Start window duration | 45 minutes |

---

## 🎓 Student Experience

### When Exam is Available
```
┌─────────────────────────────────────┐
│ ✅ Exam is Available                │
│ Window closes in 35 minutes         │
└─────────────────────────────────────┘

[Enter Your Name]
[Start Exam] ← Enabled
```

### When Exam Hasn't Started
```
┌─────────────────────────────────────┐
│ ⚠️ Exam has not started yet         │
│ It will be available from 2:00 PM   │
└─────────────────────────────────────┘

[Enter Your Name]
[Start Exam] ← Disabled (grayed out)
```

### When Window Has Closed
```
┌─────────────────────────────────────┐
│ ⚠️ Exam window has closed           │
│ It was available until 2:45 PM      │
└─────────────────────────────────────┘

[Enter Your Name]
[Start Exam] ← Disabled
```

---

## 🛠️ API Endpoints (For Developers)

### GET /availability
Check if exam is currently available

**Response:**
```json
{
  "available": true,
  "message": "Exam is available. Window closes at 2:45 PM",
  "examTitle": "MCQ Professional Examination",
  "examDuration": 30,
  "remainingWindow": 2100,  // seconds remaining
  "endTime": "2024-11-22T14:45:00.000Z"
}
```

### GET /config
Get current exam configuration (Admin)

**Response:**
```json
{
  "examAvailable": true,
  "examStartTime": "2024-11-22T14:00:00.000Z",
  "examEndTime": "2024-11-22T14:45:00.000Z",
  "examDuration": 30,
  "availabilityWindow": 45,
  "examTitle": "MCQ Professional Examination"
}
```

### POST /config
Update exam configuration (Admin)

**Request:**
```json
{
  "examAvailable": true,
  "examStartTime": "2024-11-22T14:00:00.000Z",
  "examEndTime": "2024-11-22T14:45:00.000Z",
  "examTitle": "MCQ Professional Examination"
}
```

---

## 📝 Configuration File

Settings stored in: **`backend/exam-config.json`**

```json
{
  "examAvailable": true,
  "examStartTime": null,
  "examEndTime": null,
  "examDuration": 30,
  "availabilityWindow": 45,
  "examTitle": "MCQ Professional Examination"
}
```

---

## ✅ Best Practices

### Recommended Setup
1. **Set time window 5-10 minutes before actual start**
   - Allows students to log in early
   - Reduces rush at exact start time

2. **Use 45-minute window for flexibility**
   - Accounts for technical issues
   - Reduces student anxiety about being late

3. **Test configuration before actual exam**
   - Verify times are correct
   - Check student view
   - Ensure timezone is accurate

4. **Monitor during exam window**
   - Keep admin dashboard open
   - Watch for submission patterns
   - Be ready to extend if needed

### Common Mistakes to Avoid
- ❌ Setting end time before start time
- ❌ Window shorter than 30 minutes
- ❌ Forgetting to save configuration
- ❌ Not testing before actual exam
- ❌ Wrong timezone settings

---

## 🆘 Troubleshooting

### Issue: Students can't start exam
**Solution:**
1. Check "Enable Exam" is ON
2. Verify current time is within window
3. Check server is running
4. Clear browser cache

### Issue: Time shows incorrectly
**Solution:**
1. Check server system time
2. Verify timezone settings
3. Use browser in same timezone as server

### Issue: Can't save configuration
**Solution:**
1. Check backend server is running
2. Verify `exam-config.json` has write permissions
3. Check browser console for errors

---

## 🎯 Summary

✅ **45-minute window** for starting exam  
✅ **30-minute duration** once started  
✅ **Flexible start times** within window  
✅ **Quick action buttons** for easy setup  
✅ **Real-time availability** checking  
✅ **Student-friendly** messages  
✅ **Secure** time enforcement  

---

**This feature gives you complete control over exam timing while providing flexibility for students!** 🚀

