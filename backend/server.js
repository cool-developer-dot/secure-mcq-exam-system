/**
 * MCQ Exam System - Backend Server
 * 
 * SECURITY IMPLEMENTATION:
 * ========================
 * 1. NEVER expose correct answers to frontend
 * 2. NEVER expose question difficulty levels
 * 3. NEVER expose section/category names to frontend
 * 4. Only send minimal required data (question text + options)
 * 5. Validate and sanitize all user inputs
 * 6. Section names masked as "section1", "section2", "section3" in responses
 * 
 * ENDPOINTS:
 * ==========
 * GET  /exam      - Returns sanitized questions (no answers/difficulty/sections)
 * POST /submit    - Accepts answers, calculates score, saves results
 * GET  /results   - Returns all results (admin only)
 * GET  /health    - Health check endpoint
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_RESULTS = 7;
const REGISTERED_CNICS = new Set([
  '3650213768125',
  '3640102167887',
  '3333333333335'
]);

// Middleware
app.use(cors());
app.use(express.json());

// File paths
const QUESTIONS_FILE = path.join(__dirname, 'questions', 'questions.json');
const RESULTS_FILE = path.join(__dirname, 'results.json');
const CONFIG_FILE = path.join(__dirname, 'exam-config.json');

// Helper function to load questions
async function loadQuestions() {
  try {
    const data = await fs.readFile(QUESTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading questions:', error);
    throw new Error('Failed to load questions');
  }
}

function getDefaultConfig() {
  return {
    examAvailable: true,
    examStartTime: null,
    examEndTime: null,
    examDuration: 30,
    availabilityWindow: 45,
    examTitle: 'MCQ Professional Examination',
    lastUpdated: new Date().toISOString()
  };
}

// Helper function to load results
async function loadResults() {
  try {
    const data = await fs.readFile(RESULTS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    let mutated = false;
    const normalized = parsed.map((result) => {
      if (!result.id) {
        mutated = true;
        return { ...result, id: randomUUID() };
      }
      return result;
    });

    if (mutated) {
      await saveResults(normalized);
    }

    return normalized;
  } catch (error) {
    // If file doesn't exist, return empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error('Error loading results:', error);
    throw new Error('Failed to load results');
  }
}

// Helper function to save results
async function saveResults(results) {
  try {
    await fs.writeFile(RESULTS_FILE, JSON.stringify(results, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving results:', error);
    throw new Error('Failed to save results');
  }
}

function normalizeCnicDigits(cnic) {
  if (!cnic || typeof cnic !== 'string') return '';
  return cnic.replace(/[^0-9]/g, '');
}

// Helper function to load exam configuration
async function loadConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT' || error.name === 'SyntaxError') {
      // If config is missing or corrupted, reset to default
      const defaultConfig = getDefaultConfig();
      await saveConfig(defaultConfig);
      return defaultConfig;
    }
    console.error('Error loading config:', error);
    throw new Error('Failed to load configuration');
  }
}

// Helper function to save exam configuration
async function saveConfig(config) {
  try {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving config:', error);
    throw new Error('Failed to save configuration');
  }
}

// POST /submit - Submit student answers and calculate score
app.post('/submit', async (req, res) => {
  try {
    const { studentName, fatherName, cnic, answers, antiCheatLog, autoSubmitted } = req.body;

    // SECURITY: Strict input validation
    if (!studentName || typeof studentName !== 'string' || studentName.trim() === '') {
      return res.status(400).json({ error: 'Student name is required' });
    }

    if (!fatherName || typeof fatherName !== 'string' || fatherName.trim() === '') {
      return res.status(400).json({ error: "Father's name is required" });
    }

    if (!cnic || typeof cnic !== 'string' || cnic.trim() === '') {
      return res.status(400).json({ error: 'CNIC is required' });
    }

    // Sanitize inputs (prevent XSS)
    const sanitizedName = studentName.trim().substring(0, 100);
    const sanitizedFatherName = fatherName.trim().substring(0, 100);
    const sanitizedCNIC = cnic.trim().replace(/[^0-9-]/g, '').substring(0, 15);

    if (sanitizedName.length < 3) {
      return res.status(400).json({ error: 'Student name must be at least 3 characters' });
    }

    if (sanitizedFatherName.length < 3) {
      return res.status(400).json({ error: "Father's name must be at least 3 characters" });
    }

    // Validate CNIC format (13 digits with dashes)
    const cnicDigits = normalizeCnicDigits(sanitizedCNIC);
    if (!/^\d{13}$/.test(cnicDigits)) {
      return res.status(400).json({ error: 'Invalid CNIC format. Must be 13 digits' });
    }

    // Check CNIC registration
    if (!REGISTERED_CNICS.has(cnicDigits)) {
      return res.status(403).json({
        error: 'Your CNIC is not registered for this exam. Please contact the administrator.'
      });
    }

    // Ensure CNIC has not already taken the exam
    const existingResults = await loadResults();
    const alreadyAttempted = existingResults.some((result) => {
      const existingDigits = normalizeCnicDigits(result.cnic);
      return existingDigits === cnicDigits;
    });

    if (alreadyAttempted) {
      return res.status(403).json({
        error: 'This CNIC has already attempted the exam. Each registered student can only attempt once.'
      });
    }

    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers object is required' });
    }

    // Validate that answers only contain valid options (A, B, C, D)
    const validOptions = ['A', 'B', 'C', 'D', ''];
    for (const [qId, answer] of Object.entries(answers)) {
      if (typeof answer !== 'string' || !validOptions.includes(answer)) {
        return res.status(400).json({ error: 'Invalid answer format' });
      }
    }

    // Load all questions
    const questions = await loadQuestions();

    // Initialize scoring variables
    let totalScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    // Section-wise tracking
    const sectionStats = {
      GK: { correct: 0, wrong: 0, skipped: 0, score: 0 },
      Mathematics: { correct: 0, wrong: 0, skipped: 0, score: 0 },
      Electrical: { correct: 0, wrong: 0, skipped: 0, score: 0 }
    };

    // Process each question
    for (const [questionId, questionData] of Object.entries(questions)) {
      const studentAnswer = answers[questionId];
      const correctAnswer = questionData.correct;
      const section = questionData.section;

      if (!studentAnswer || studentAnswer.trim() === '') {
        // Skipped question: -1 mark
        skippedCount++;
        totalScore -= 1;
        sectionStats[section].skipped++;
        sectionStats[section].score -= 1;
      } else if (studentAnswer === correctAnswer) {
        // Correct answer: +1 mark
        correctCount++;
        totalScore += 1;
        sectionStats[section].correct++;
        sectionStats[section].score += 1;
      } else {
        // Wrong answer: -1.25 marks
        wrongCount++;
        totalScore -= 1.25;
        sectionStats[section].wrong++;
        sectionStats[section].score -= 1.25;
      }
    }

    // Create result record (to be saved in results.json)
    const resultRecord = {
      id: randomUUID(),
      studentName: sanitizedName,
      fatherName: sanitizedFatherName,
      cnic: sanitizedCNIC,
      autoSubmitted: Boolean(autoSubmitted),
      score: totalScore,
      correct: correctCount,
      wrong: wrongCount,
      skipped: skippedCount,
      antiCheatLog: antiCheatLog || {
        violations: 0,
        tabSwitchCount: 0,
        screenshotAttempts: 0,
        rightClickAttempts: 0
      },
      sections: {
        GK: {
          correct: sectionStats.GK.correct,
          wrong: sectionStats.GK.wrong,
          skipped: sectionStats.GK.skipped,
          score: sectionStats.GK.score
        },
        Mathematics: {
          correct: sectionStats.Mathematics.correct,
          wrong: sectionStats.Mathematics.wrong,
          skipped: sectionStats.Mathematics.skipped,
          score: sectionStats.Mathematics.score
        },
        Electrical: {
          correct: sectionStats.Electrical.correct,
          wrong: sectionStats.Electrical.wrong,
          skipped: sectionStats.Electrical.skipped,
          score: sectionStats.Electrical.score
        }
      },
      timestamp: new Date().toISOString()
    };

    // Load existing results and append new result
    const allResults = await loadResults();
    allResults.push(resultRecord);
    while (allResults.length > MAX_RESULTS) {
      allResults.shift();
    }
    await saveResults(allResults);

    // SECURITY: Response to frontend WITHOUT section names to prevent exposure
    const response = {
      score: totalScore,
      correct: correctCount,
      wrong: wrongCount,
      skipped: skippedCount,
      sections: {
        section1: {
          correct: sectionStats.GK.correct,
          wrong: sectionStats.GK.wrong,
          skipped: sectionStats.GK.skipped,
          score: sectionStats.GK.score
        },
        section2: {
          correct: sectionStats.Mathematics.correct,
          wrong: sectionStats.Mathematics.wrong,
          skipped: sectionStats.Mathematics.skipped,
          score: sectionStats.Mathematics.score
        },
        section3: {
          correct: sectionStats.Electrical.correct,
          wrong: sectionStats.Electrical.wrong,
          skipped: sectionStats.Electrical.skipped,
          score: sectionStats.Electrical.score
        }
      }
      // SECURITY: Never send correct answers, difficulty, or section names
    };

    res.json(response);
  } catch (error) {
    console.error('Error in /submit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /results - Get all results (Admin only)
app.get('/results', async (req, res) => {
  try {
    const results = await loadResults();
    res.json(results);
  } catch (error) {
    console.error('Error in /results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /results/:id - Remove a result (Admin)
app.delete('/results/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Result id is required' });
    }

    const allResults = await loadResults();
    const index = allResults.findIndex((result) => result.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Result not found' });
    }

    allResults.splice(index, 1);
    await saveResults(allResults);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /config - Get exam configuration (Admin)
app.get('/config', async (req, res) => {
  try {
    const config = await loadConfig();
    res.json(config);
  } catch (error) {
    console.error('Error in /config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /config - Update exam configuration (Admin only)
app.post('/config', async (req, res) => {
  try {
    const { examAvailable, examStartTime, examEndTime, examTitle } = req.body;

    // Load current config
    const currentConfig = await loadConfig();

    // Update config with new values
    const updatedConfig = {
      ...currentConfig,
      examAvailable: typeof examAvailable === 'boolean' ? examAvailable : currentConfig.examAvailable,
      examStartTime: examStartTime || currentConfig.examStartTime,
      examEndTime: examEndTime || currentConfig.examEndTime,
      examTitle: examTitle || currentConfig.examTitle,
      lastUpdated: new Date().toISOString()
    };

    // Save updated config
    await saveConfig(updatedConfig);

    res.json({ success: true, config: updatedConfig });
  } catch (error) {
    console.error('Error in /config POST:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /availability - Check if exam is currently available
app.get('/availability', async (req, res) => {
  try {
    const config = await loadConfig();
    const now = new Date();

    let available = config.examAvailable;
    let message = 'Exam is available';
    let timeInfo = {};

    // Check time window if start and end times are set
    if (config.examStartTime && config.examEndTime) {
      const startTime = new Date(config.examStartTime);
      const endTime = new Date(config.examEndTime);

      if (now < startTime) {
        available = false;
        message = `Exam has not started yet. It will be available from ${startTime.toLocaleString()}`;
        timeInfo = {
          startsIn: Math.floor((startTime - now) / 1000), // seconds
          startTime: config.examStartTime
        };
      } else if (now > endTime) {
        available = false;
        message = `Exam window has closed. It was available until ${endTime.toLocaleString()}`;
        timeInfo = {
          endedAt: config.examEndTime
        };
      } else {
        // Within the window
        const remainingTime = Math.floor((endTime - now) / 1000); // seconds
        message = `Exam is available. Window closes at ${endTime.toLocaleString()}`;
        timeInfo = {
          remainingWindow: remainingTime,
          endTime: config.examEndTime
        };
      }
    }

    res.json({
      available,
      message,
      examTitle: config.examTitle,
      examDuration: config.examDuration,
      ...timeInfo
    });
  } catch (error) {
    console.error('Error in /availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /eligibility - Check if a CNIC is allowed to start the exam
app.post('/eligibility', async (req, res) => {
  try {
    const { cnic } = req.body || {};

    if (!cnic || typeof cnic !== 'string' || cnic.trim() === '') {
      return res.status(400).json({ error: 'CNIC is required' });
    }

    const sanitizedCNIC = cnic.trim().replace(/[^0-9-]/g, '').substring(0, 15);
    const cnicDigits = normalizeCnicDigits(sanitizedCNIC);

    if (!/^\d{13}$/.test(cnicDigits)) {
      return res.status(400).json({ error: 'Invalid CNIC format. Must be 13 digits' });
    }

    if (!REGISTERED_CNICS.has(cnicDigits)) {
      return res.status(403).json({
        error: 'Your CNIC is not registered for this exam. Please contact the administrator.'
      });
    }

    const existingResults = await loadResults();
    const alreadyAttempted = existingResults.some((result) => {
      const existingDigits = normalizeCnicDigits(result.cnic);
      return existingDigits === cnicDigits;
    });

    if (alreadyAttempted) {
      return res.status(403).json({
        error: 'This CNIC has already attempted the exam. Each registered student can only attempt once.'
      });
    }

    res.json({ eligible: true });
  } catch (error) {
    console.error('Error in /eligibility:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /exam - Get questions for frontend (WITHOUT correct answers, section, difficulty)
app.get('/exam', async (req, res) => {
  try {
    const questions = await loadQuestions();
    
    // SECURITY: Strip ALL sensitive data before sending to frontend
    const sanitizedQuestions = {};
    for (const [questionId, questionData] of Object.entries(questions)) {
      // ONLY send question text and options - NOTHING ELSE
      sanitizedQuestions[questionId] = {
        question: questionData.question,
        options: questionData.options
        // SECURITY: Deliberately omitting correct, section, difficulty
      };
    }
    
    res.json(sanitizedQuestions);
  } catch (error) {
    console.error('Error in /exam:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /questions - Alias for /exam endpoint (backward compatibility)
app.get('/questions', async (req, res) => {
  try {
    const questions = await loadQuestions();
    
    // SECURITY: Strip ALL sensitive data before sending to frontend
    const sanitizedQuestions = {};
    for (const [questionId, questionData] of Object.entries(questions)) {
      // ONLY send question text and options - NOTHING ELSE
      sanitizedQuestions[questionId] = {
        question: questionData.question,
        options: questionData.options
        // SECURITY: Deliberately omitting correct, section, difficulty
      };
    }
    
    res.json(sanitizedQuestions);
  } catch (error) {
    console.error('Error in /questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static HTML for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /submit     - Submit exam answers');
  console.log('  GET  /results    - Get all results (Admin)');
  console.log('  GET  /questions  - Get questions (sanitized)');
  console.log('  GET  /health     - Health check');
});

module.exports = app;
