# 🔗 MCQ Exam System - All Links & URLs

## 📍 Quick Access Links

---

## 🎓 **For Students**

### **Student Exam Page** (Main Exam Interface)
```
File Location: C:\Users\mfara\Desktop\mcq-exam-system\frontend\index.html
```
**To Open:**
- Double-click the file in File Explorer
- Or drag and drop into browser
- Or right-click → Open with → Chrome/Firefox/Edge

**What it does:**
- Student registration (Name, Father's Name, CNIC)
- Take the 100-question exam
- 30-minute timer
- Submit and view results

---

## 👨‍💼 **For Administrators**

### **Admin Results Dashboard**
```
File Location: C:\Users\mfara\Desktop\mcq-exam-system\frontend\admin.html
```
**To Open:**
- Double-click the file in File Explorer
- Or drag and drop into browser

**What it shows:**
- All submitted exam results
- Student details (Name, Father's Name, CNIC)
- Scores and statistics
- Violation tracking
- Section-wise performance
- Search functionality

---

### **Admin Configuration Panel**
```
File Location: C:\Users\mfara\Desktop\mcq-exam-system\frontend\admin-config.html
```
**To Open:**
- Double-click the file in File Explorer
- Or drag and drop into browser

**What you can do:**
- Set 45-minute exam availability window
- Enable/disable exam
- Quick action buttons (Start Now, Start in 30 min, etc.)
- View current configuration
- Control when students can start exam

---

## 🖥️ **Backend Server**

### **Backend API Documentation**
```
URL: http://localhost:3000
```
**To Access:**
- Make sure server is running (npm start in backend folder)
- Open browser and go to: http://localhost:3000
- Shows API documentation page

---

## 🔌 **API Endpoints**

### **Health Check**
```
GET http://localhost:3000/health
```
**Returns:** Server status
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

### **Get Exam Questions** (For Students)
```
GET http://localhost:3000/exam
```
**Returns:** Sanitized questions (no correct answers)
```json
{
  "q1": {
    "question": "Question text...",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." }
  }
}
```

---

### **Check Exam Availability**
```
GET http://localhost:3000/availability
```
**Returns:** Availability status
```json
{
  "available": true,
  "message": "Exam is available",
  "examDuration": 30,
  "remainingWindow": 2700
}
```

---

### **Submit Exam** (POST)
```
POST http://localhost:3000/submit
Content-Type: application/json

{
  "studentName": "Ali Hassan",
  "fatherName": "Hassan Ahmed",
  "cnic": "42101-1234567-3",
  "answers": { "q1": "A", "q2": "C", ... },
  "antiCheatLog": { ... }
}
```
**Returns:** Score and results

---

### **Get All Results** (Admin)
```
GET http://localhost:3000/results
```
**Returns:** Array of all exam submissions

---

### **Get Configuration** (Admin)
```
GET http://localhost:3000/config
```
**Returns:** Current exam configuration

---

### **Update Configuration** (Admin)
```
POST http://localhost:3000/config
Content-Type: application/json

{
  "examAvailable": true,
  "examStartTime": "2024-11-22T14:00:00.000Z",
  "examEndTime": "2024-11-22T14:45:00.000Z",
  "examTitle": "MCQ Professional Examination"
}
```
**Returns:** Updated configuration

---

## 📂 **File Paths Reference**

### **Frontend Files:**
```
📁 C:\Users\mfara\Desktop\mcq-exam-system\frontend\
   ├── index.html          (Student Exam Page)
   ├── admin.html          (Admin Results Dashboard)
   ├── admin-config.html   (Admin Configuration)
   ├── exam.js             (JavaScript logic)
   └── styles.css          (Styling)
```

### **Backend Files:**
```
📁 C:\Users\mfara\Desktop\mcq-exam-system\backend\
   ├── server.js           (Express server)
   ├── questions/
   │   └── questions.json  (100 MCQ questions)
   ├── results.json        (Exam results storage)
   └── exam-config.json    (Exam configuration)
```

---

## 🚀 **Quick Start Guide**

### **Step 1: Start Backend Server**
```powershell
cd C:\Users\mfara\Desktop\mcq-exam-system\backend
npm start
```
✅ Server runs on: **http://localhost:3000**

### **Step 2: Open Pages**

#### **For Students:**
```
Double-click: C:\Users\mfara\Desktop\mcq-exam-system\frontend\index.html
```

#### **For Admins - View Results:**
```
Double-click: C:\Users\mfara\Desktop\mcq-exam-system\frontend\admin.html
```

#### **For Admins - Configure Exam:**
```
Double-click: C:\Users\mfara\Desktop\mcq-exam-system\frontend\admin-config.html
```

---

## 🔗 **Browser Bookmarks (Recommended)**

Create bookmarks for quick access:

1. **Student Exam**
   ```
   file:///C:/Users/mfara/Desktop/mcq-exam-system/frontend/index.html
   ```

2. **Admin Dashboard**
   ```
   file:///C:/Users/mfara/Desktop/mcq-exam-system/frontend/admin.html
   ```

3. **Admin Config**
   ```
   file:///C:/Users/mfara/Desktop/mcq-exam-system/frontend/admin-config.html
   ```

4. **API Docs**
   ```
   http://localhost:3000
   ```

5. **Health Check**
   ```
   http://localhost:3000/health
   ```

---

## 🧪 **Testing URLs**

### **Test API Endpoints in Browser:**

1. **Health Check:**
   ```
   http://localhost:3000/health
   ```
   Should show: `{"status":"OK","message":"Server is running"}`

2. **Availability:**
   ```
   http://localhost:3000/availability
   ```
   Shows if exam is currently available

3. **Configuration:**
   ```
   http://localhost:3000/config
   ```
   Shows current exam settings

4. **Results:**
   ```
   http://localhost:3000/results
   ```
   Shows all exam results (JSON format)

---

## 📱 **Navigation Flow**

### **Student Journey:**
```
1. Open index.html
   ↓
2. Fill registration form
   ↓
3. Start exam
   ↓
4. Answer 100 questions
   ↓
5. Submit exam
   ↓
6. View results
```

### **Admin Journey:**
```
1. Open admin-config.html
   ↓
2. Set exam time window
   ↓
3. Save configuration
   ↓
4. Open admin.html
   ↓
5. View all results
   ↓
6. Check violations
```

---

## 🛠️ **Troubleshooting URLs**

### **Server Not Running?**
Try accessing: `http://localhost:3000/health`
- ✅ **Success:** Shows `{"status":"OK"}`
- ❌ **Error:** Server not running - Start with `npm start`

### **Can't Access Admin Panel?**
Check:
1. File exists: `C:\Users\mfara\Desktop\mcq-exam-system\frontend\admin.html`
2. Server running: `http://localhost:3000/health`
3. Results exist: `http://localhost:3000/results`

### **Students Can't Start Exam?**
Check:
1. Availability: `http://localhost:3000/availability`
2. Configuration: `http://localhost:3000/config`
3. Server running: `http://localhost:3000/health`

---

## 📊 **Quick Links Summary**

| Page | Link | Purpose |
|------|------|---------|
| **Student Exam** | `frontend/index.html` | Take exam |
| **Admin Results** | `frontend/admin.html` | View results |
| **Admin Config** | `frontend/admin-config.html` | Configure exam |
| **API Docs** | `http://localhost:3000` | API documentation |
| **Health Check** | `http://localhost:3000/health` | Server status |
| **Availability** | `http://localhost:3000/availability` | Exam availability |
| **Results API** | `http://localhost:3000/results` | All results (JSON) |
| **Config API** | `http://localhost:3000/config` | Configuration |

---

## 🌐 **Network Access**

### **Current Setup (Localhost Only)**
- Students and admins must be on the same computer
- Server accessible only at `http://localhost:3000`

### **To Access from Other Computers (Optional)**
Replace `localhost` with your computer's IP address:
```
http://192.168.1.100:3000
```

**Steps:**
1. Find your IP: `ipconfig` in Command Prompt
2. Allow firewall access for port 3000
3. Share link with students/admins
4. Update `API_BASE_URL` in exam.js, admin.html, admin-config.html

---

## 🎯 **Most Used Links**

### **Daily Use:**
1. **Start Exam:** `frontend/index.html`
2. **View Results:** `frontend/admin.html`
3. **Configure:** `frontend/admin-config.html`

### **Check Status:**
1. **Server Health:** `http://localhost:3000/health`
2. **Exam Available?:** `http://localhost:3000/availability`

---

## 💡 **Pro Tips**

1. **Bookmark all three frontend pages** in your browser
2. **Keep admin tabs open** during exam day
3. **Check health endpoint** if issues occur
4. **Use admin-config** to control exam availability
5. **Monitor violations** in admin dashboard

---

## 📖 **Documentation Links**

All documentation is in the project folder:
```
C:\Users\mfara\Desktop\mcq-exam-system\
   ├── README.md                    (Complete guide)
   ├── QUICK_START.md               (Quick reference)
   ├── ANTI_CHEATING.md             (Anti-cheating guide)
   ├── REGISTRATION_FIELDS.md       (Registration docs)
   ├── TIME_WINDOW_FEATURE.md       (Time window guide)
   └── SYSTEM_LINKS.md              (This file)
```

---

## ✅ **Checklist Before Exam**

1. ✅ Backend server running (`npm start`)
2. ✅ Test health check: `http://localhost:3000/health`
3. ✅ Configure exam time: Open `admin-config.html`
4. ✅ Test student page: Open `index.html`
5. ✅ Keep admin dashboard open: `admin.html`

---

**All your system links in one place! 🎯**

Bookmark this file for quick reference!

