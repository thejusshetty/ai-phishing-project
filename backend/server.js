const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000/predict';

app.use(cors());
app.use(express.json());

// --- IN-MEMORY USER DATABASE ---
let mockUsers = [
  {
    name: "John Doe",
    email: "john@example.com",
    risk_score: 15,
    phishing_attempts: 3,
    failed_attempts: 1,
    interactions: [
      {
        action: "clicked_link",
        is_phishing: true,
        details: "From: support@amazon00.com | Link: http://amazon00.com/login",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        action: "reported_phishing",
        is_phishing: true,
        details: "Action Required: Your password has expired...",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    risk_score: 8,
    phishing_attempts: 2,
    failed_attempts: 0,
    interactions: [
      {
        action: "clicked_link",
        is_phishing: false,
        details: "From: shipping@amazon.in | Link: https://amazon.in/orders",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

// Auth Endpoints: Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required fields" });
    }
    
    const emailLower = email.toLowerCase().strip ? email.toLowerCase().strip() : email.toLowerCase().trim();
    let existing = mockUsers.find(u => u.email === emailLower);
    if (existing) {
      return res.status(400).json({ error: "Email is already registered" });
    }
    
    const newUser = {
      name,
      email: emailLower,
      risk_score: 10,
      phishing_attempts: 0,
      failed_attempts: 0,
      interactions: []
    };
    mockUsers.push(newUser);
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal register server error" });
  }
});

// Auth Endpoints: Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email parameter is required" });
    }
    
    const emailLower = email.toLowerCase().strip ? email.toLowerCase().strip() : email.toLowerCase().trim();
    let user = mockUsers.find(u => u.email === emailLower);
    if (!user) {
      return res.status(404).json({ error: "No profile found under this email. Please Sign Up first!" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal login server error" });
  }
});

// Get individual user profile
app.get('/api/users/:email', (req, res) => {
  try {
    const emailLower = req.params.email.toLowerCase().trim();
    let user = mockUsers.find(u => u.email === emailLower);
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal user retrieval error" });
  }
});

// Endpoint to analyze email/URL
app.post('/api/analyze', async (req, res) => {
  try {
    const { email, text, url, action, sender_email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "User email parameter is required" });
    }
    
    // 1. Call Python AI Service
    let aiResponse;
    try {
      const response = await axios.post(AI_SERVICE_URL, { text, url, sender_email });
      aiResponse = response.data;
    } catch (error) {
      console.error("Error calling AI service:", error.message);
      return res.status(500).json({ error: "AI Service unavailable" });
    }
    
    // 2. Find user (or auto-create) & update score
    const emailLower = email.toLowerCase().trim();
    let user = mockUsers.find(u => u.email === emailLower);
    if (!user) {
      user = {
        name: emailLower.split('@')[0],
        email: emailLower,
        risk_score: 10,
        phishing_attempts: 0,
        failed_attempts: 0,
        interactions: []
      };
      mockUsers.push(user);
    }
    
    let trainingTriggered = false;
    let newScore = user.risk_score;
    
    if (action === 'clicked_link') {
      user.phishing_attempts += 1;
      if (aiResponse.is_phishing) {
        user.failed_attempts += 1;
        user.risk_score = Math.min(100, user.risk_score + 15);
        trainingTriggered = true;
      } else {
        user.risk_score = Math.max(0, user.risk_score - 2);
      }
      user.interactions.push({
        action,
        is_phishing: aiResponse.is_phishing,
        details: sender_email ? `From: ${sender_email} | Link: ${url || 'None'}` : (url || 'No link'),
        timestamp: new Date().toISOString()
      });
      newScore = user.risk_score;
    }
    
    res.json({
      ...aiResponse,
      training_triggered: trainingTriggered,
      new_risk_score: newScore
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error during analysis" });
  }
});

// Admin endpoint to get all users
app.get('/api/users', async (req, res) => {
  try {
    // Sort by risk score descending
    const sortedUsers = [...mockUsers].sort((a, b) => b.risk_score - a.risk_score);
    res.json(sortedUsers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Endpoint to report phishing manually
app.post('/api/report', async (req, res) => {
  try {
    const { email, text } = req.body;
    if (!email) {
      return res.status(400).json({ error: "User email is required" });
    }
    
    const emailLower = email.toLowerCase().trim();
    let user = mockUsers.find(u => u.email === emailLower);
    if (user) {
      user.risk_score = Math.max(0, user.risk_score - 5);
      user.interactions.push({
        action: 'reported_phishing',
        is_phishing: true,
        details: text.substring(0, 50) + "...",
        timestamp: new Date().toISOString()
      });
    }
    res.json({ success: true, message: "Thank you for reporting!" });
  } catch (error) {
    res.status(500).json({ error: "Error reporting phishing" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT} (Using Dynamic In-Memory Store)`);
});
