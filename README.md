# 🎓 MCQ Exam System

A professional, secure, and full-featured Multiple Choice Question (MCQ) examination system with real-time timer, automatic grading, and comprehensive analytics.

## ✨ Features

### Student Features
- ✅ **Enhanced Registration System**
  - Candidate full name
  - Father's name
  - CNIC number (auto-formatted)
  - Complete validation and security
- ✅ **100 Professional MCQ Questions**
  - 30 General Knowledge questions
  - 20 Mathematics questions (FSc + University level)
  - 50 Electrical Engineering + Telecom questions
- ⏱️ **30-Minute Countdown Timer**
  - Visible timer at top-right
  - Warnings at 5 min and 1 min remaining
  - Auto-submit when time expires
- 📊 **Real-time Progress Tracking**
  - Progress bar showing answered questions
  - Question navigation
  - Answer selection highlighting
- 🎯 **Intelligent Scoring System**
  - +1 mark for correct answer
  - -0.5 marks for wrong answer
  - 0 marks for skipped questions
- 📈 **Detailed Results**
  - Total score with breakdown
  - Section-wise performance
  - Correct/Wrong/Skipped statistics

### Admin Features
- 📋 **Admin Dashboard** (`admin.html`)
  - View all submitted exams
  - Student-wise results
  - Section-wise performance
  - Timestamps for each submission
  - Search functionality
  - Statistics (Total exams, Average score, Highest score)
  - Auto-refresh capability
- 🗂️ **Result retention controls**
  - Only the most recent 7 submissions are stored automatically
  - Delete any record manually from the admin dashboard
- ⚙️ **Exam Configuration** (`admin-config.html`) **NEW!**
  - Set 45-minute availability window
  - Control when students can start exam
  - Enable/disable exam globally
  - Quick action buttons (Start Now, Start in 30 min, etc.)
  - Real-time configuration management

### Security Features
- 🔒 **Never exposes correct answers to frontend**
- 🔒 **Difficulty levels stored backend-only**
- 🔒 **Section names masked** (shown as Section 1, 2, 3)
- 🔒 **Input validation and sanitization**
- 🔒 **XSS protection**
- 🔒 **CORS enabled for cross-origin requests**
- 🔒 **Minimal data transmission** (only question + options)

### Anti-Cheating Features **NEW!**
- 🛡️ **Text selection disabled** - Cannot copy questions
- 🛡️ **Screenshot prevention** - PrintScreen blocked
- 🛡️ **Right-click disabled** - Context menu blocked
- 🛡️ **Keyboard shortcuts blocked** - Ctrl+C, Ctrl+S, F12, etc.
- 🛡️ **Tab switch detection** - Red warning screen
- 🛡️ **Visual watermark** - Name + CNIC displayed
- 🛡️ **Violation tracking** - All attempts logged
- 🛡️ **Admin monitoring** - View violations per student
- 🛡️ **Developer tools blocked** - F12, Inspect Element disabled

## 📁 Project Structure

```
mcq-exam-system/
├── backend/
│   ├── server.js              # Express server with all API endpoints
│   ├── package.json           # Backend dependencies
│   ├── results.json           # Stores all exam results
│   ├── questions/
│   │   └── questions.json     # 100 MCQ questions with metadata
│   └── public/
│       └── index.html         # API documentation page
│
└── frontend/
    ├── index.html             # Main exam interface
    ├── admin.html             # Admin results dashboard
    ├── admin-config.html      # Exam configuration panel
    ├── exam.js                # Exam logic and API integration
    ├── styles.css             # Professional styling
    └── config.js              # Frontend environment configuration
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Configure API base URL (frontend)
Edit `frontend/config.js` to point to your backend API. By default it falls back to the current origin (when hosted together with the backend) or `http://localhost:3000` (when opened from the filesystem).

```js
window.__ENV = {
  API_BASE_URL: 'https://your-backend.example.com' // Optional override
};
```

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Start the Backend Server
```bash
npm start
```
Server will run on: **http://localhost:3000**

### Step 3: Open the Frontend
Open `frontend/index.html` in your web browser

## 📡 API Endpoints

### For Frontend (Student)

#### `GET /exam`
Returns sanitized questions (no correct answers, difficulty, or sections)

**Response:**
```json
{
  "q1": {
    "question": "Question text here...",
    "options": {
      "A": "Option A",
      "B": "Option B",
      "C": "Option C",
      "D": "Option D"
    }
  }
}
```

#### `POST /submit`
Submit exam answers and receive results

**Request:**
```json
{
  "studentName": "John Doe",
  "answers": {
    "q1": "A",
    "q2": "C",
    "q3": "B"
  }
}
```

**Response:**
```json
{
  "score": 45.5,
  "correct": 50,
  "wrong": 9,
  "skipped": 41,
  "sections": {
    "section1": { "correct": 15, "wrong": 3, "skipped": 12, "score": 13.5 },
    "section2": { "correct": 10, "wrong": 2, "skipped": 8, "score": 9.0 },
    "section3": { "correct": 25, "wrong": 4, "skipped": 21, "score": 23.0 }
  }
}
```

### For Admin

#### `GET /results`
Returns all submitted exam results

**Response:**
```json
[
  {
    "studentName": "John Doe",
    "score": 45.5,
    "correct": 50,
    "wrong": 9,
    "skipped": 41,
    "sections": {
      "GK": { "correct": 15, "wrong": 3, "skipped": 12, "score": 13.5 },
      "Mathematics": { "correct": 10, "wrong": 2, "skipped": 8, "score": 9.0 },
      "Electrical": { "correct": 25, "wrong": 4, "skipped": 21, "score": 23.0 }
    },
    "timestamp": "2024-11-22T10:30:00.000Z"
  }
]
```

#### `DELETE /results/:id`
Delete a specific result (Admin only)

**Response:**
```json
{
  "success": true
}
```

#### `GET /health`
Health check endpoint

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## 🎯 How to Use

### For Students

1. **Open the Exam**
   - Open `frontend/index.html` in your browser
   - Enter your full name
   - Click "Start Exam"

2. **Take the Exam**
   - Read each question carefully
   - Click on option (A, B, C, or D) to select
   - Selected options are highlighted
   - Timer counts down from 30:00
   - Scroll through all 100 questions

3. **Submit the Exam**
   - Click "Submit Exam" when finished
   - Or wait for auto-submit at 00:00
   - View your detailed results

### For Admin

1. **Open Admin Panel**
   - Open `frontend/admin.html` in your browser
   - View all submitted exam results
   - Search by student name
   - Click "Refresh" to update data

## ⏰ Time Window Feature

### 45-Minute Availability Window
Admins can set a **45-minute window** during which students can **start** the exam:
- Students have 45 minutes to begin the exam
- Once started, they get full 30 minutes to complete
- Handles late starts and technical issues gracefully
- Prevents early or late attempts

### Example:
```
Window: 2:00 PM - 2:45 PM
- Student A starts at 2:05 PM → Works until 2:35 PM ✅
- Student B starts at 2:40 PM → Works until 3:10 PM ✅
- Student C tries at 2:50 PM → Blocked ❌
```

### Configuration:
- Open `frontend/admin-config.html`
- Set start time
- End time auto-calculated (+45 minutes)
- Quick actions: Start Now, Start in 30 min, etc.
- Enable/disable exam globally

### Student Experience:
- Sees availability status on welcome screen
- Clear messages if exam not available
- Start button disabled outside window
- No way to bypass time restrictions

📖 **Full documentation:** See `TIME_WINDOW_FEATURE.md`

## 🔐 Security Implementation

### What Frontend Receives
```json
{
  "question": "Question text",
  "options": { "A": "...", "B": "...", "C": "...", "D": "..." }
}
```

### What Frontend NEVER Receives
- ❌ Correct answers
- ❌ Difficulty levels (high, medium-high)
- ❌ Section names (GK, Mathematics, Electrical)
- ❌ Any metadata that could expose answers

### Input Validation
- Student name: 3-100 characters, sanitized
- Answers: Must be valid options (A, B, C, D, or empty)
- XSS protection on all inputs

## 📊 Question Bank Distribution

| Section | Count | Topics |
|---------|-------|--------|
| General Knowledge | 30 | International affairs, Nobel prizes, treaties, economics, technology |
| Mathematics | 20 | Calculus, algebra, matrices, probability, transforms |
| Electrical/Telecom | 50 | Circuit theory, power systems, control systems, communications, signal processing |

**Total:** 100 Questions  
**Difficulty:** Medium-High to High (professional exam level)

## 🎨 UI Features

- **Modern gradient design**
- **Smooth animations and transitions**
- **Responsive layout** (mobile-friendly)
- **Professional color scheme**
- **Clear visual feedback** for selected answers
- **Progress tracking**
- **Timer with color warnings**

## 📝 Results Storage

Results are automatically saved in `backend/results.json` with:
- Student name
- Total score
- Correct/Wrong/Skipped counts
- Section-wise breakdown (with actual section names for admin)
- Timestamp
- Only the **latest 7** submissions are retained automatically to keep storage tidy
- Administrators can delete individual submissions via the dashboard

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **File System (fs)** - Data persistence

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with animations
- **Vanilla JavaScript** - Logic (no frameworks)
- **Fetch API** - HTTP requests

## 🚨 Important Notes

1. **Server must be running** before opening frontend
2. **Port 3000** must be available
3. **Results are persistent** (stored in results.json)
4. **No database required** (file-based storage)
5. **Exam cannot be paused** once started
6. **Browser refresh loses progress** (by design)

## 📱 Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ✅ Opera

## 🔄 Future Enhancements (Optional)

- [ ] Database integration (MongoDB/MySQL)
- [ ] User authentication system
- [ ] Question randomization
- [ ] PDF report generation
- [ ] Email notifications
- [ ] Multiple exam templates
- [ ] Question bank management UI

## 📄 License

This project is created for educational purposes.

## 👨‍💻 Support

For issues or questions, please check:
1. Server is running on port 3000
2. All files are in correct directories
3. Browser console for errors

## 🌍 Deployment Guide

### Recommended free stack

| Layer    | Service          | Notes                                |
|----------|------------------|--------------------------------------|
| Backend  | Render / Railway | Deploy `backend`, run `npm start`    |
| Frontend | Netlify / Vercel | Deploy `frontend`, static hosting    |

### Deploy backend (Render example)
1. Push this repository to GitHub/GitLab
2. Create a new **Web Service** on Render
3. Select the `backend` folder
4. Build command: `npm install`
5. Start command: `npm start`
6. Note the deployed URL, e.g. `https://mcq-backend.onrender.com`

### Deploy frontend (Netlify example)
1. Drag-and-drop the `frontend` folder into Netlify (or connect via Git)
2. Update `frontend/config.js`:
   ```js
   window.__ENV = {
     API_BASE_URL: 'https://mcq-backend.onrender.com'
   };
   ```
3. Redeploy – the frontend now talks to the hosted backend

### Single-origin deployment
If you serve both backend and frontend from the same domain, leave `API_BASE_URL` undefined. The frontend will automatically use `window.location.origin`.

---

**Made with ❤️ for professional exam assessment**

