// Configuration
const API_BASE_URL = window.__ENV?.API_BASE_URL || 'http://localhost:3000';
const EXAM_DURATION = 30 * 60; // 30 minutes in seconds

// State management
let examState = {
    studentName: '',
    fatherName: '',
    cnic: '',
    questions: {},
    answers: {},
    timerInterval: null,
    timeRemaining: EXAM_DURATION,
    isExamStarted: false,
    isExamSubmitted: false
};

// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');
const examScreen = document.getElementById('examScreen');
const resultsScreen = document.getElementById('resultsScreen');
const loadingOverlay = document.getElementById('loadingOverlay');
const studentNameInput = document.getElementById('studentName');
const fatherNameInput = document.getElementById('fatherName');
const cnicInput = document.getElementById('cnic');
const startExamBtn = document.getElementById('startExamBtn');
const submitExamBtn = document.getElementById('submitExamBtn');
const timerDisplay = document.getElementById('timer');
const questionsContainer = document.getElementById('questionsContainer');
const displayStudentName = document.getElementById('displayStudentName');
const nameError = document.getElementById('nameError');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

// Event Listeners
startExamBtn.addEventListener('click', startExam);
submitExamBtn.addEventListener('click', confirmSubmitExam);

// Allow Enter key to start exam
studentNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fatherNameInput.focus();
    }
});

fatherNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        cnicInput.focus();
    }
});

cnicInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        startExam();
    }
});

// Auto-format CNIC as user types
cnicInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-digits
    
    if (value.length > 5) {
        value = value.substring(0, 5) + '-' + value.substring(5);
    }
    if (value.length > 13) {
        value = value.substring(0, 13) + '-' + value.substring(13);
    }
    if (value.length > 15) {
        value = value.substring(0, 15);
    }
    
    e.target.value = value;
});

// Check exam availability on page load
window.addEventListener('DOMContentLoaded', checkExamAvailability);

// Check availability function
async function checkExamAvailability() {
    try {
        const response = await fetch(`${API_BASE_URL}/availability`);
        const data = await response.json();
        
        const statusDiv = document.getElementById('availabilityStatus');
        const statusContent = document.getElementById('statusContent');
        
        if (data.available) {
            statusContent.className = 'status-content available';
            if (data.remainingWindow) {
                const remainingMinutes = Math.floor(data.remainingWindow / 60);
                statusContent.innerHTML = `✅ Exam is Available - Window closes in ${remainingMinutes} minutes`;
            } else {
                statusContent.innerHTML = '✅ Exam is Available';
            }
        } else {
            statusContent.className = 'status-content unavailable';
            statusContent.innerHTML = `⚠️ ${data.message}`;
            startExamBtn.disabled = true;
            startExamBtn.style.opacity = '0.5';
            startExamBtn.style.cursor = 'not-allowed';
        }
        
        statusDiv.style.display = 'block';
        
    } catch (error) {
        console.error('Error checking availability:', error);
        // Don't show status if check fails
    }
}

// Validation Helper Functions
function validateCNIC(cnic) {
    // Remove dashes and check if it's 13 digits
    const cleanCNIC = cnic.replace(/-/g, '');
    return /^\d{13}$/.test(cleanCNIC);
}

// Start Exam Function
async function startExam() {
    const name = studentNameInput.value.trim();
    const fatherName = fatherNameInput.value.trim();
    const cnic = cnicInput.value.trim();
    
    // Validation
    if (!name) {
        showError('Please enter your full name');
        studentNameInput.focus();
        return;
    }
    
    if (name.length < 3) {
        showError('Please enter your full name (minimum 3 characters)');
        studentNameInput.focus();
        return;
    }
    
    if (!fatherName) {
        showError("Please enter your father's name");
        fatherNameInput.focus();
        return;
    }
    
    if (fatherName.length < 3) {
        showError("Father's name must be at least 3 characters");
        fatherNameInput.focus();
        return;
    }
    
    if (!cnic) {
        showError('Please enter your CNIC number');
        cnicInput.focus();
        return;
    }
    
    if (!validateCNIC(cnic)) {
        showError('Please enter a valid 13-digit CNIC (Format: 12345-1234567-1)');
        cnicInput.focus();
        return;
    }
    
    // Show loading
    showLoading(true);
    
    // Check exam availability first
    try {
        const availabilityResponse = await fetch(`${API_BASE_URL}/availability`);
        const availabilityData = await availabilityResponse.json();
        
        if (!availabilityData.available) {
            showLoading(false);
            alert(`⚠️ Exam Not Available\n\n${availabilityData.message}`);
            showError(availabilityData.message);
            return;
        }
        
        // Show time window info if available
        if (availabilityData.remainingWindow) {
            const remainingMinutes = Math.floor(availabilityData.remainingWindow / 60);
            console.log(`Exam window closes in ${remainingMinutes} minutes`);
        }
        
    } catch (error) {
        console.error('Error checking availability:', error);
        // Continue anyway if availability check fails (fallback)
    }

    // Check CNIC eligibility (registered and not used before)
    try {
        const eligibilityResponse = await fetch(`${API_BASE_URL}/eligibility`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cnic })
        });

        if (!eligibilityResponse.ok) {
            const data = await eligibilityResponse.json().catch(() => ({}));
            const message = data.error || 'You are not eligible to take this exam.';
            showLoading(false);
            showError(message);
            alert(`⚠️ ${message}`);
            return;
        }
    } catch (error) {
        console.error('Error checking eligibility:', error);
        showLoading(false);
        showError('Unable to verify exam eligibility. Please try again in a moment.');
        return;
    }
    
    examState.studentName = name;
    examState.fatherName = fatherName;
    examState.cnic = cnic;
    displayStudentName.textContent = name;
    
    try {
        // Fetch questions from backend using secure /exam endpoint
        const response = await fetch(`${API_BASE_URL}/exam`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch questions from server');
        }
        
        examState.questions = await response.json();
        
        // Verify we have questions
        const questionCount = Object.keys(examState.questions).length;
        if (questionCount === 0) {
            throw new Error('No questions received from server');
        }
        
        console.log(`Loaded ${questionCount} questions`);
        
        // Initialize answers object
        examState.answers = {};
        Object.keys(examState.questions).forEach(qId => {
            examState.answers[qId] = '';
        });
        
        // Display questions
        displayQuestions();
        
        // Switch to exam screen
        welcomeScreen.classList.add('hidden');
        examScreen.classList.remove('hidden');
        
        // Start timer
        startTimer();
        
        // Enable anti-cheating measures
        enableAntiCheating();
        
        examState.isExamStarted = true;
        
    } catch (error) {
        console.error('Error starting exam:', error);
        showError('Failed to load exam. Please check if the server is running and try again.');
    } finally {
        showLoading(false);
    }
}

// Display Questions
function displayQuestions() {
    questionsContainer.innerHTML = '';
    
    const questionEntries = Object.entries(examState.questions);
    
    questionEntries.forEach(([questionId, questionData], index) => {
        const questionCard = createQuestionCard(questionId, questionData, index + 1);
        questionsContainer.appendChild(questionCard);
    });
}

// Create Question Card
function createQuestionCard(questionId, questionData, questionNumber) {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.id = `question-${questionId}`;
    
    // Question Header
    const header = document.createElement('div');
    header.className = 'question-header';
    header.innerHTML = `<span class="question-number">Question ${questionNumber}</span>`;
    
    // Question Text
    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.textContent = questionData.question;
    
    // Options Container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    
    // Create options (A, B, C, D)
    ['A', 'B', 'C', 'D'].forEach(optionKey => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.onclick = () => selectOption(questionId, optionKey, optionDiv);
        
        const optionLabel = document.createElement('span');
        optionLabel.className = 'option-label';
        optionLabel.textContent = optionKey;
        
        const optionText = document.createElement('span');
        optionText.className = 'option-text';
        optionText.textContent = questionData.options[optionKey];
        
        optionDiv.appendChild(optionLabel);
        optionDiv.appendChild(optionText);
        optionsContainer.appendChild(optionDiv);
    });
    
    card.appendChild(header);
    card.appendChild(questionText);
    card.appendChild(optionsContainer);
    
    return card;
}

// Select Option
function selectOption(questionId, optionKey, optionElement) {
    if (examState.isExamSubmitted) return;
    
    // Remove previous selection for this question
    const questionCard = document.getElementById(`question-${questionId}`);
    const allOptions = questionCard.querySelectorAll('.option');
    allOptions.forEach(opt => opt.classList.remove('selected'));
    
    // Add selection to clicked option
    optionElement.classList.add('selected');
    
    // Store answer
    examState.answers[questionId] = optionKey;
    
    // Update progress
    updateProgress();
}

// Update Progress
function updateProgress() {
    const totalQuestions = Object.keys(examState.questions).length;
    const answeredQuestions = Object.values(examState.answers).filter(ans => ans !== '').length;
    const percentage = (answeredQuestions / totalQuestions) * 100;
    
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${answeredQuestions}/${totalQuestions} Answered`;
}

// Timer Functions
function startTimer() {
    updateTimerDisplay();
    
    examState.timerInterval = setInterval(() => {
        examState.timeRemaining--;
        updateTimerDisplay();
        
        // Auto-submit when time runs out
        if (examState.timeRemaining <= 0) {
            clearInterval(examState.timerInterval);
            autoSubmitExam();
        }
        
        // Warning when 5 minutes remaining
        if (examState.timeRemaining === 300) {
            alert('⚠️ Warning: Only 5 minutes remaining!');
        }
        
        // Warning when 1 minute remaining
        if (examState.timeRemaining === 60) {
            alert('⚠️ Warning: Only 1 minute remaining!');
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(examState.timeRemaining / 60);
    const seconds = examState.timeRemaining % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Change color when time is running out
    if (examState.timeRemaining <= 60) {
        timerDisplay.style.color = '#dc3545';
        timerDisplay.style.animation = 'pulse 1s infinite';
    } else if (examState.timeRemaining <= 300) {
        timerDisplay.style.color = '#ffc107';
    }
}

// Confirm Submit
function confirmSubmitExam() {
    const answeredCount = Object.values(examState.answers).filter(ans => ans !== '').length;
    const totalCount = Object.keys(examState.questions).length;
    const unansweredCount = totalCount - answeredCount;
    
    let message = `Are you sure you want to submit the exam?\n\n`;
    message += `Answered: ${answeredCount}/${totalCount}\n`;
    
    if (unansweredCount > 0) {
        message += `Unanswered: ${unansweredCount}\n\n`;
        message += `Note: Unanswered questions will be marked as skipped (0 marks)`;
    }
    
    if (confirm(message)) {
        submitExam();
    }
}

// Auto Submit (when time runs out)
function autoSubmitExam() {
    alert('⏰ Time is up! Your exam will be submitted automatically.');
    submitExam();
}

// Submit Exam
async function submitExam() {
    if (examState.isExamSubmitted) return;
    
    examState.isExamSubmitted = true;
    clearInterval(examState.timerInterval);
    
    showLoading(true);
    
    try {
        const payload = createSubmitPayload(false);
        
        const response = await fetch(`${API_BASE_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit exam');
        }
        
        const results = await response.json();
        
        // Display results
        displayResults(results);
        
    } catch (error) {
        console.error('Error submitting exam:', error);
        alert('Failed to submit exam. Please try again or contact the administrator.');
        examState.isExamSubmitted = false;
        
        // Restart timer if it was running
        if (examState.timeRemaining > 0) {
            startTimer();
        }
    } finally {
        showLoading(false);
    }
}

// Build submit payload (shared between manual submit and auto-submit)
function createSubmitPayload(autoSubmitted = false) {
    return {
        studentName: examState.studentName,
        fatherName: examState.fatherName,
        cnic: examState.cnic,
        answers: examState.answers,
        antiCheatLog: {
            violations: antiCheat.violations,
            tabSwitchCount: antiCheat.tabSwitchCount,
            screenshotAttempts: antiCheat.screenshotAttempts,
            rightClickAttempts: antiCheat.rightClickAttempts
        },
        autoSubmitted
    };
}

// Display Results
function displayResults(results) {
    // Disable anti-cheating measures
    disableAntiCheating();
    
    // Hide exam screen
    examScreen.classList.add('hidden');
    
    // Show results screen
    resultsScreen.classList.remove('hidden');
    
    // Populate results
    document.getElementById('resultStudentName').textContent = examState.studentName;
    document.getElementById('totalScore').textContent = results.score.toFixed(1);
    document.getElementById('correctCount').textContent = results.correct;
    document.getElementById('wrongCount').textContent = results.wrong;
    document.getElementById('skippedCount').textContent = results.skipped;
    
    // Section-wise results
    if (results.sections) {
        // Section 1
        if (results.sections.section1) {
            document.getElementById('section1Score').textContent = results.sections.section1.score.toFixed(1);
            document.getElementById('section1Correct').textContent = results.sections.section1.correct;
            document.getElementById('section1Wrong').textContent = results.sections.section1.wrong;
            document.getElementById('section1Skipped').textContent = results.sections.section1.skipped;
        }
        
        // Section 2
        if (results.sections.section2) {
            document.getElementById('section2Score').textContent = results.sections.section2.score.toFixed(1);
            document.getElementById('section2Correct').textContent = results.sections.section2.correct;
            document.getElementById('section2Wrong').textContent = results.sections.section2.wrong;
            document.getElementById('section2Skipped').textContent = results.sections.section2.skipped;
        }
        
        // Section 3
        if (results.sections.section3) {
            document.getElementById('section3Score').textContent = results.sections.section3.score.toFixed(1);
            document.getElementById('section3Correct').textContent = results.sections.section3.correct;
            document.getElementById('section3Wrong').textContent = results.sections.section3.wrong;
            document.getElementById('section3Skipped').textContent = results.sections.section3.skipped;
        }
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Utility Functions
function showError(message) {
    nameError.textContent = message;
    nameError.style.display = 'block';
    studentNameInput.focus();
    
    setTimeout(() => {
        nameError.style.display = 'none';
    }, 5000);
}

function showLoading(show) {
    if (show) {
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}

// Prevent page reload during exam
window.addEventListener('beforeunload', (e) => {
    if (examState.isExamStarted && !examState.isExamSubmitted) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your exam progress will be lost.';
        return e.returnValue;
    }
});

// Prevent back button during exam
if (window.history && window.history.pushState) {
    window.history.pushState('forward', null, '');
    window.addEventListener('popstate', () => {
        if (examState.isExamStarted && !examState.isExamSubmitted) {
            if (confirm('Are you sure you want to go back? Your exam will be lost.')) {
                window.history.back();
            } else {
                window.history.pushState('forward', null, '');
            }
        }
    });
}

console.log('MCQ Exam System Initialized');
console.log('API Base URL:', API_BASE_URL);

// ============================================
// ANTI-CHEATING MEASURES
// ============================================

let antiCheat = {
    violations: 0,
    tabSwitchCount: 0,
    screenshotAttempts: 0,
    rightClickAttempts: 0,
    isExamActive: false
};

// Disable right-click context menu during exam
document.addEventListener('contextmenu', function(e) {
    if (antiCheat.isExamActive) {
        e.preventDefault();
        antiCheat.rightClickAttempts++;
        showScreenshotBlocker();
        console.warn('Right-click blocked during exam');
        return false;
    }
});

// Disable key combinations for copying, screenshots, and developer tools
document.addEventListener('keydown', function(e) {
    if (!antiCheat.isExamActive) return;

    // Disable Ctrl+C (Copy)
    if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        showScreenshotBlocker();
        console.warn('Copy blocked');
        return false;
    }

    // Disable Ctrl+X (Cut)
    if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        showScreenshotBlocker();
        return false;
    }

    // Disable Ctrl+V (Paste) - optional, but good for consistency
    if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        return false;
    }

    // Disable Ctrl+P (Print)
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        showScreenshotBlocker();
        console.warn('Print blocked');
        return false;
    }

    // Disable Ctrl+S (Save)
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        showScreenshotBlocker();
        return false;
    }

    // Disable PrintScreen
    if (e.key === 'PrintScreen') {
        e.preventDefault();
        antiCheat.screenshotAttempts++;
        showScreenshotBlocker();
        console.warn('Screenshot attempt blocked');
        return false;
    }

    // Disable Alt+PrintScreen
    if (e.altKey && e.key === 'PrintScreen') {
        e.preventDefault();
        antiCheat.screenshotAttempts++;
        showScreenshotBlocker();
        return false;
    }

    // Disable Ctrl+Shift+I (Developer Tools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        showScreenshotBlocker();
        return false;
    }

    // Disable F12 (Developer Tools)
    if (e.key === 'F12') {
        e.preventDefault();
        showScreenshotBlocker();
        return false;
    }

    // Disable Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        showScreenshotBlocker();
        return false;
    }

    // Disable Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        showScreenshotBlocker();
        return false;
    }

    // Disable Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        showScreenshotBlocker();
        return false;
    }
});

// Detect tab switching or window blur
document.addEventListener('visibilitychange', function() {
    if (!antiCheat.isExamActive) return;

    if (document.hidden) {
        // User switched tabs or minimized window
        antiCheat.tabSwitchCount++;
        antiCheat.violations++;
        showTabWarning();
        console.warn('Tab switch detected. Violation count:', antiCheat.violations);
    }
});

window.addEventListener('blur', function() {
    if (!antiCheat.isExamActive) return;

    antiCheat.tabSwitchCount++;
    antiCheat.violations++;
    showTabWarning();
    console.warn('Window blur detected. Violation count:', antiCheat.violations);
});

// Show tab warning overlay
function showTabWarning() {
    const tabWarning = document.getElementById('tabWarning');
    const violationCount = document.getElementById('violationCount');
    
    if (tabWarning && violationCount) {
        violationCount.textContent = antiCheat.violations;
        tabWarning.classList.add('active');
        
        // Auto-hide after 5 seconds or on click
        const hideWarning = () => {
            tabWarning.classList.remove('active');
            tabWarning.removeEventListener('click', hideWarning);
        };
        
        tabWarning.addEventListener('click', hideWarning);
        
        setTimeout(() => {
            tabWarning.classList.remove('active');
        }, 5000);
    }
}

// Show screenshot blocker temporarily
function showScreenshotBlocker() {
    const blocker = document.getElementById('screenshotBlocker');
    if (blocker) {
        blocker.style.display = 'flex';
        setTimeout(() => {
            blocker.style.display = 'none';
        }, 2000);
    }
}

// Set up watermark with candidate information
function setupWatermark() {
    const watermark = document.getElementById('examWatermark');
    if (watermark && examState.studentName && examState.cnic) {
        const watermarkText = `${examState.studentName} - ${examState.cnic}`;
        watermark.textContent = watermarkText;
    }
}

// Enable anti-cheating when exam starts
function enableAntiCheating() {
    antiCheat.isExamActive = true;
    setupWatermark();
    console.log('Anti-cheating measures activated');
}

// Disable anti-cheating when exam ends
function disableAntiCheating() {
    antiCheat.isExamActive = false;
    console.log('Anti-cheating measures deactivated');
}

// Detect if user is trying to take screenshot using screen recording software
setInterval(() => {
    if (!antiCheat.isExamActive) return;
    
    // Check if dev tools are open (basic check)
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    
    if (widthThreshold || heightThreshold) {
        console.warn('Developer tools may be open');
    }
}, 1000);

console.log('Anti-cheating system initialized');

// Auto-submit on page hide / close if exam started but not submitted
async function autoSubmitOnExit() {
    try {
        if (!examState.isExamStarted || examState.isExamSubmitted) {
            return;
        }

        const payload = createSubmitPayload(true);

        await fetch(`${API_BASE_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            keepalive: true
        });

        examState.isExamSubmitted = true;
    } catch (error) {
        // We can't reliably report errors during unload; best-effort only.
        console.error('Auto-submit on exit failed:', error);
    }
}

window.addEventListener('pagehide', () => {
    autoSubmitOnExit();
});
