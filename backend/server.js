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
    name: "Thejas Shetty",
    email: "thejusshetty479@gmail.com",
    risk_score: 20,
    phishing_attempts: 3,
    failed_attempts: 1,
    interactions: [
      {
        action: "clicked_link",
        is_phishing: true,
        details: "From: security@amazon00.com | Link: http://amazon00.com/login",
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
      },
      {
        action: "reported_phishing",
        is_phishing: false,
        details: "Reported: Urgent Account Verification Alert",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      {
        action: "clicked_link",
        is_phishing: false,
        details: "From: shipping@amazon.in | Link: https://amazon.in/orders",
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    name: "Alex Johnson",
    email: "alex.j@company.com",
    risk_score: 82,
    phishing_attempts: 5,
    failed_attempts: 4,
    interactions: [
      {
        action: "clicked_link",
        is_phishing: true,
        details: "From: alerts@11flipkart.com | Link: http://11flipkart.com/claim-reward",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    name: "Sarah Parker",
    email: "sarah.p@company.com",
    risk_score: 45,
    phishing_attempts: 4,
    failed_attempts: 2,
    interactions: [
      {
        action: "clicked_link",
        is_phishing: true,
        details: "From: verify@paypal-login-verify-now.com | Link: http://paypal-login-verify-now.com",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    name: "David Chen",
    email: "david.c@company.com",
    risk_score: 12,
    phishing_attempts: 3,
    failed_attempts: 0,
    interactions: [
      {
        action: "clicked_link",
        is_phishing: false,
        details: "From: no-reply@google.com | Link: https://drive.google.com/file/d/1X9b0K7mZ",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    name: "Elena Rostova",
    email: "elena.r@company.com",
    risk_score: 74,
    phishing_attempts: 4,
    failed_attempts: 3,
    interactions: [
      {
        action: "clicked_link",
        is_phishing: true,
        details: "From: security@chase-secure-portal.info | Link: http://192.168.1.105/auth/reset",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

// --- BUILT-IN MULTI-TIER HEURISTIC THREAT ENGINE ---
const BRAND_DOMAINS = {
  amazon: ["amazon.com", "amazon.in", "amazon.co.uk", "amazon.ca", "amazon.de", "amazon.fr", "amazon.co.jp", "aws.amazon.com"],
  google: ["google.com", "google.co.in", "gmail.com", "youtube.com", "drive.google.com", "docs.google.com", "play.google.com", "photos.google.com", "slides.google.com"],
  apple: ["apple.com", "icloud.com", "me.com", "mac.com"],
  microsoft: ["microsoft.com", "outlook.com", "live.com", "office.com", "microsoftonline.com", "sharepoint.com", "windows.net", "hotmail.com"],
  paypal: ["paypal.com", "paypal.co.uk", "paypal.in"],
  netflix: ["netflix.com"],
  chase: ["chase.com"],
  bankofamerica: ["bankofamerica.com", "bofa.com"],
  wellsfargo: ["wellsfargo.com"],
  dhl: ["dhl.com", "dhl.de", "dhl.co.in"],
  fedex: ["fedex.com"],
  ups: ["ups.com"],
  usps: ["usps.com"],
  facebook: ["facebook.com", "fb.com"],
  instagram: ["instagram.com"],
  linkedin: ["linkedin.com"],
  spotify: ["spotify.com"],
  zoom: ["zoom.us", "zoom.com"],
  twitter: ["twitter.com", "x.com"],
  yahoo: ["yahoo.com", "myyahoo.com"],
  github: ["github.com", "github.io"],
  dropbox: ["dropbox.com"],
  flipkart: ["flipkart.com", "flipkart.in"],
  paytm: ["paytm.com"],
  docusign: ["docusign.com", "docusign.net"],
  slack: ["slack.com"],
  jira: ["atlassian.com", "atlassian.net", "jira.com"],
  trello: ["trello.com"],
  workday: ["workday.com"],
  figma: ["figma.com"],
  irs: ["irs.gov"]
};

const KNOWN_SAFE = [
  "zoom.us", "zoom.com", "docusign.net", "docusign.com", "github.com", "github.io",
  "slack.com", "trello.com", "figma.com", "pastebin.com", "nytimes.com", "allrecipes.com",
  "opentable.com", "united.com", "delta.com", "uber.com", "starbucks.com", "doordash.com",
  "expensify.com", "workday.com", "atlassian.net", "atlassian.com", "irs.gov"
];

const HIGH_RISK_TLDS = ["xyz", "su", "top", "click", "info", "tk", "ml", "ga", "cf", "gq", "work", "download", "bid", "date", "link", "stream", "zone"];
const FREE_EMAIL_PROVIDERS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "protonmail.com", "mail.com", "zoho.com", "yandex.com", "icloud.com"];
const PHISH_KEYWORDS = ["verify", "verification", "secure", "security", "update", "login", "signin", "auth", "confirm", "account", "banking", "billing", "support", "helpdesk", "alert", "notification"];

function calculateLevenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

function evaluateThreat(senderEmail = "", urlText = "", emailText = "") {
  const cleanUrl = urlText.trim().toLowerCase();
  const cleanSender = senderEmail.trim().toLowerCase();
  const cleanBody = emailText.trim().toLowerCase();

  let isHttp = cleanUrl.startsWith("http://");
  let hasIp = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(cleanUrl);
  let domain = "";
  let rootDomain = "";
  let tld = "";

  if (cleanUrl) {
    try {
      const parsed = new URL(cleanUrl.startsWith("http") ? cleanUrl : `http://${cleanUrl}`);
      domain = parsed.hostname;
      const parts = domain.split(".");
      tld = parts[parts.length - 1];
      rootDomain = parts.length > 2 ? parts.slice(-2).join(".") : domain;
    } catch (e) {
      domain = cleanUrl.split("/")[0];
      rootDomain = domain;
    }
  }

  // 1. Sender Evaluation
  let senderScore = 0;
  let senderStatus = "Unverified";
  let senderAnalysis = cleanSender ? `Sender domain: ${cleanSender.split("@")[1] || cleanSender}` : "No sender provided";
  let senderMalicious = false;

  if (cleanSender) {
    const senderParts = cleanSender.split("@");
    const senderDomain = senderParts.length > 1 ? senderParts[1] : "";
    const senderUser = senderParts[0] || "";

    for (const [brand, officials] of Object.entries(BRAND_DOMAINS)) {
      if (officials.includes(senderDomain) || officials.some(o => senderDomain.endsWith("." + o))) {
        senderStatus = "Verified";
        senderAnalysis = `Verified official sender domain for ${brand.toUpperCase()}`;
        senderScore = 2;
        break;
      }
      if (FREE_EMAIL_PROVIDERS.includes(senderDomain) && senderUser.includes(brand)) {
        senderStatus = "Suspicious";
        senderAnalysis = `High Risk: Brand impersonation (${brand}) originating from free webmail provider (@${senderDomain})`;
        senderScore = 95;
        senderMalicious = true;
        break;
      }
      if (senderDomain.includes(brand) && !officials.includes(senderDomain)) {
        senderStatus = "Suspicious";
        senderAnalysis = `High Risk: Sender domain '${senderDomain}' mimics ${brand} without authorization`;
        senderScore = 94;
        senderMalicious = true;
        break;
      }
    }
  }

  // 2. URL Evaluation
  let urlScore = 0;
  let urlStatus = "Unverified";
  let urlAnalysis = domain ? `Destination: ${domain}` : "No link destination provided";
  let urlMalicious = false;

  if (domain) {
    if (hasIp) {
      urlStatus = "Malicious";
      urlAnalysis = `Malicious: Raw IP address (${domain}) used instead of verified registered domain`;
      urlScore = 96;
      urlMalicious = true;
    } else {
      let matchedSafe = false;
      for (const [brand, officials] of Object.entries(BRAND_DOMAINS)) {
        if (officials.includes(domain) || officials.some(o => domain.endsWith("." + o))) {
          urlStatus = "Safe";
          urlAnalysis = `Verified official ${brand.toUpperCase()} domain (${domain})`;
          urlScore = 2;
          matchedSafe = true;
          break;
        }
      }

      if (!matchedSafe) {
        for (const safeD of KNOWN_SAFE) {
          if (domain === safeD || domain.endsWith("." + safeD)) {
            urlStatus = "Safe";
            urlAnalysis = `Verified safe standard platform domain (${domain})`;
            urlScore = 3;
            matchedSafe = true;
            break;
          }
        }
      }

      if (!matchedSafe) {
        // Typosquatting check
        const cleanSegments = rootDomain.replace(/-/g, ".").split(".");
        for (const [brand, officials] of Object.entries(BRAND_DOMAINS)) {
          if (rootDomain.includes(brand) || domain.includes(brand)) {
            urlStatus = "Typosquatting";
            urlAnalysis = `Malicious: Unauthorized brand misuse of '${brand}' in domain '${domain}'`;
            urlScore = 98;
            urlMalicious = true;
            break;
          }
          for (const seg of cleanSegments) {
            if (seg.length >= 3) {
              const dist = calculateLevenshtein(seg, brand);
              const maxDist = brand.length > 5 ? 2 : 1;
              if (dist > 0 && dist <= maxDist) {
                urlStatus = "Typosquatting";
                urlAnalysis = `Typosquatting Detected: '${seg}' mimics brand '${brand}' (Levenshtein edit distance = ${dist})`;
                urlScore = 97.5;
                urlMalicious = true;
                break;
              }
            }
          }
          if (urlMalicious) break;
        }

        if (!urlMalicious && HIGH_RISK_TLDS.includes(tld)) {
          urlStatus = "Suspicious";
          urlAnalysis = `Suspicious: Registered on high-risk generic TLD (.${tld})`;
          urlScore = 80;
          urlMalicious = true;
        }

        if (!urlMalicious && isHttp && (cleanUrl.includes("login") || cleanUrl.includes("verify") || cleanUrl.includes("password"))) {
          urlStatus = "Suspicious";
          urlAnalysis = `Unencrypted HTTP transmission requesting sensitive credential operations`;
          urlScore = 85;
          urlMalicious = true;
        }
      }
    }
  }

  // 3. Body Intent Analysis
  const suspiciousKeywords = ["urgent", "immediately", "verify password", "account suspended", "gift card", "reward", "unauthorized login", "lock", "prize", "winner", "security alert"];
  const matchedWords = suspiciousKeywords.filter(k => cleanBody.includes(k));

  let finalScore = 5.0;
  let isPhishing = false;
  let classification = "Safe";

  if (urlMalicious || senderMalicious) {
    finalScore = Math.max(urlScore, senderScore);
    isPhishing = true;
    classification = "Phishing";
  } else if (urlStatus === "Safe" && senderStatus === "Verified") {
    finalScore = 3.0;
    isPhishing = false;
    classification = "Safe";
  } else if (urlStatus === "Safe" && !senderMalicious) {
    finalScore = matchedWords.length > 1 ? 15.0 : 8.0;
    isPhishing = false;
    classification = "Safe";
  } else {
    if (matchedWords.length >= 2) {
      finalScore = 75.0;
      isPhishing = true;
      classification = "Phishing";
    } else if (matchedWords.length === 1) {
      finalScore = 35.0;
      isPhishing = false;
      classification = "Suspicious";
    }
  }

  return {
    is_phishing: isPhishing,
    confidence_score: Math.round(finalScore * 10) / 10,
    classification,
    suspicious_words: matchedWords,
    sender_verification: senderStatus,
    sender_analysis: senderAnalysis,
    url_verification: urlStatus,
    url_analysis: urlAnalysis,
    ai_explanation: isPhishing
      ? `Threat Detected: ${senderAnalysis}. ${urlAnalysis}. Social engineering markers: ${matchedWords.join(', ') || 'Deceptive links'}.`
      : `Verified Safe: Sender and destination links are verified official assets. No malicious markers detected.`
  };
}

// Auth Endpoints: Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required fields" });
    }

    const emailLower = email.toLowerCase().trim();
    let existing = mockUsers.find(u => u.email === emailLower);
    if (existing) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const newUser = {
      name: name.trim(),
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

    const emailLower = email.toLowerCase().trim();
    let user = mockUsers.find(u => u.email === emailLower);
    if (!user) {
      user = {
        name: emailLower.split('@')[0],
        email: emailLower,
        risk_score: 15,
        phishing_attempts: 0,
        failed_attempts: 0,
        interactions: []
      };
      mockUsers.push(user);
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

    // 1. Call Python AI Service, fallback to Node heuristic engine on timeout or failure
    let aiResponse;
    try {
      const response = await axios.post(AI_SERVICE_URL, { text, url, sender_email }, { timeout: 3500 });
      aiResponse = response.data;
    } catch (error) {
      // Graceful instant fallback to Node.js multi-tier heuristic engine
      aiResponse = evaluateThreat(sender_email, url, text);
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
      user.interactions.unshift({
        action,
        is_phishing: aiResponse.is_phishing,
        details: sender_email ? `From: ${sender_email} | Link: ${url || 'None'}` : (url || 'No link provided'),
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
      user.interactions.unshift({
        action: 'reported_phishing',
        is_phishing: false,
        details: (text || "Reported suspicious email").substring(0, 60),
        timestamp: new Date().toISOString()
      });
    }
    res.json({ success: true, message: "Thank you for reporting! Defensive reward applied (-5 Risk Score)." });
  } catch (error) {
    res.status(500).json({ error: "Error reporting phishing" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT} (With Resilient Multi-Tier Heuristic Engine)`);
});
