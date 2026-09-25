"use client";

import { useState } from 'react';
import { Mail, ShieldAlert, ExternalLink, AtSign, Globe, Sparkles, AlertTriangle, Eye, Edit3, ShieldCheck, Check, RotateCcw } from 'lucide-react';
import axios from 'axios';

// Preset scenarios for instant testing
const PRESET_SCENARIOS = [
  {
    title: "Amazon Urgent Alert",
    type: "Phishing (Typosquatting)",
    sender: "security@amazon00.com",
    url: "http://amazon00.com/account/verify",
    body: "URGENT: Unusual sign-in attempt detected on your Amazon account. Verify your password within 24 hours to prevent permanent suspension. Click below to secure your credentials."
  },
  {
    title: "Flipkart Promo Voucher",
    type: "Phishing (Spoof Brand)",
    sender: "promo@11flipkart.com",
    url: "http://11flipkart.com/claim-reward",
    body: "Congratulations! You have been selected for a free ₹5,000 Flipkart festive gift card! Click here to claim your reward immediately before it expires."
  },
  {
    title: "Bank Password Lock",
    type: "Phishing (Malicious IP)",
    sender: "support-alerts@chase-secure-portal.info",
    url: "http://192.168.1.105/auth/reset",
    body: "Security Alert: Unauthorized login from an unrecognized device. Your Chase bank profile is locked. Reset your security credentials immediately."
  },
  {
    title: "Official Google Drive Share",
    type: "Safe Link",
    sender: "no-reply@google.com",
    url: "https://drive.google.com/file/d/1X9b0K7mZ",
    body: "Alex shared a document with you: 'Q3 Financial Review.pdf'. Open Google Drive to collaborate in real-time."
  },
  {
    title: "Amazon Official Dispatch",
    type: "Safe Link",
    sender: "shipping@amazon.in",
    url: "https://amazon.in/orders/track-package",
    body: "Your Amazon.in package has been dispatched and will arrive tomorrow. Track your delivery status online."
  },
  {
    title: "Zoom Team Meeting",
    type: "Safe Link",
    sender: "alex@company.com",
    url: "https://zoom.us/j/987654321",
    body: "Hey team, join our quick project status sync call today at 3:00 PM."
  }
];

// Offline client-side heuristic analyzer for zero-downtime demonstration
const runLocalScanner = (senderEmail: string, urlText: string, emailText: string) => {
  const brandDomains: Record<string, string[]> = {
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

  const knownSafeDomains = [
    "zoom.us", "zoom.com", "docusign.net", "docusign.com", "github.com", "github.io",
    "slack.com", "trello.com", "figma.com", "pastebin.com", "nytimes.com", "allrecipes.com",
    "opentable.com", "united.com", "delta.com", "uber.com", "starbucks.com", "doordash.com",
    "expensify.com", "workday.com", "atlassian.net", "atlassian.com", "irs.gov"
  ];

  const freeEmailProviders = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "protonmail.com", "mail.com", "zoho.com", "yandex.com", "icloud.com"
  ];

  const highRiskTlds = ["xyz", "su", "top", "click", "info", "tk", "ml", "ga", "cf", "gq", "work", "download", "bid", "date", "link", "stream", "zone"];

  const phishingDomainKeywords = [
    "verify", "verification", "account", "login", "signin", "security", "update", "unlock",
    "password", "support", "billing", "confirm", "confirmation", "quota", "claim", "winner",
    "reward", "refund", "penalty", "compromise", "wallet", "resolution", "portal", "auth",
    "banking", "direct-deposit", "salary-review", "fraud-alert", "secure-portal"
  ];

  const getEditDistance = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  const parseUrl = (raw: string) => {
    if (!raw) return { domain: "", rootDomain: "", path: "", isHttp: false, hasIp: false, tld: "" };
    let clean = raw.trim();
    const isHttp = clean.toLowerCase().startsWith("http://");
    const isHttps = clean.toLowerCase().startsWith("https://");
    if (!isHttp && !isHttps) clean = "http://" + clean;

    try {
      const parsed = new URL(clean);
      let hostname = parsed.hostname.toLowerCase();
      if (hostname.startsWith("www.")) hostname = hostname.substring(4);
      const path = (parsed.pathname + parsed.search).toLowerCase();
      const hasIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) || /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(hostname);
      const parts = hostname.split(".");
      const tld = parts.length > 1 ? parts[parts.length - 1] : "";
      let rootDomain = hostname;
      if (parts.length >= 2) {
        if (parts.length >= 3 && ["co", "com", "gov", "org", "edu", "net"].includes(parts[parts.length - 2]) && parts[parts.length - 1].length <= 3) {
          rootDomain = parts.slice(-3).join(".");
        } else {
          rootDomain = parts.slice(-2).join(".");
        }
      }
      return { domain: hostname, rootDomain, path, isHttp, hasIp, tld };
    } catch (e) {
      return { domain: clean.split("/")[0], rootDomain: clean.split("/")[0], path: "", isHttp, hasIp: false, tld: "" };
    }
  };

  const checkDomainThreat = (domain: string, rootDomain: string, path: string, isHttp: boolean, hasIp: boolean, tld: string) => {
    if (!domain) return { status: "Safe", verification: "Unverified", analysis: "No URL provided", score: 0, isMalicious: false };

    if (hasIp) {
      return { status: "Malicious", verification: "Malicious", analysis: `URL uses raw numerical IP address (${domain}) instead of registered domain`, score: 96, isMalicious: true };
    }

    // Check official brand domains
    for (const [brand, officials] of Object.entries(brandDomains)) {
      for (const off of officials) {
        if (domain === off || domain.endsWith("." + off)) {
          return { status: "Safe", verification: "Safe", analysis: `Verified official ${brand.charAt(0).toUpperCase() + brand.slice(1)} domain (${domain})`, score: 2, isMalicious: false };
        }
      }
    }

    // Check known safe domains
    for (const safeD of knownSafeDomains) {
      if (domain === safeD || domain.endsWith("." + safeD) || domain.endsWith(".internal.company.com")) {
        return { status: "Safe", verification: "Safe", analysis: `Recognized standard platform domain (${domain})`, score: 3, isMalicious: false };
      }
    }

    // Check brand typosquatting & spoofing
    const domainClean = rootDomain.replace(/-/g, ".").replace(/_/g, ".");
    const segments = domainClean.split(".");

    for (const [brand, officials] of Object.entries(brandDomains)) {
      if (rootDomain.includes(brand) || domain.includes(brand)) {
        return {
          status: "Typosquatting",
          verification: "Typosquatting",
          analysis: `Contains brand name '${brand}' in unauthorized domain '${domain}' (spoofing risk)`,
          score: 98,
          isMalicious: true
        };
      }

      for (const seg of segments) {
        if (seg.length >= 3) {
          const dist = getEditDistance(seg, brand);
          const maxDist = brand.length > 5 ? 2 : 1;
          if (dist > 0 && dist <= maxDist) {
            return {
              status: "Typosquatting",
              verification: "Typosquatting",
              analysis: `Spelling similarity '${seg}' mimics brand '${brand}' (typosquatting distance = ${dist})`,
              score: 97.5,
              isMalicious: true
            };
          }
        }
      }
    }

    // Check phishing keywords + high risk TLDs
    const matchedKeywords = phishingDomainKeywords.filter(kw => domain.includes(kw) || rootDomain.includes(kw));
    const isHighRiskTld = highRiskTlds.includes(tld);

    if (matchedKeywords.length > 0 && isHighRiskTld) {
      return {
        status: "Suspicious",
        verification: "Suspicious",
        analysis: `Domain combines security keywords (${matchedKeywords[0]}) with high-risk TLD (.${tld})`,
        score: 92,
        isMalicious: true
      };
    }

    if (matchedKeywords.length >= 2) {
      return {
        status: "Suspicious",
        verification: "Suspicious",
        analysis: `Deceptive domain composition targeting security terms: ${matchedKeywords.slice(0, 3).join(", ")}`,
        score: 88,
        isMalicious: true
      };
    }

    if (isHighRiskTld) {
      return {
        status: "Suspicious",
        verification: "Suspicious",
        analysis: `Destination URL registered under high-risk suspicious TLD (.${tld})`,
        score: 75,
        isMalicious: true
      };
    }

    if (isHttp && (path.includes("login") || path.includes("password") || path.includes("verify"))) {
      return {
        status: "Suspicious",
        verification: "Suspicious",
        analysis: "Requests login credentials over unencrypted HTTP protocol",
        score: 84,
        isMalicious: true
      };
    }

    return {
      status: "Unverified",
      verification: "Unverified",
      analysis: `Standard third-party domain (${domain})`,
      score: 15,
      isMalicious: false
    };
  };

  // 1. Evaluate URL
  const urlObj = parseUrl(urlText);
  const urlEval = checkDomainThreat(urlObj.domain, urlObj.rootDomain, urlObj.path, urlObj.isHttp, urlObj.hasIp, urlObj.tld);

  // 2. Evaluate Sender
  let senderVerification = "Unverified";
  let senderAnalysis = "No sender email provided";
  let senderMalicious = false;
  let senderScore = 0;

  if (senderEmail && senderEmail.includes("@")) {
    let senderClean = senderEmail.toLowerCase().trim();
    const match = senderClean.match(/<([^>]+)>/);
    if (match) senderClean = match[1];

    const parts = senderClean.split("@");
    if (parts.length === 2) {
      const [username, domain] = parts;
      const sUrl = parseUrl(domain);
      const sDomainEval = checkDomainThreat(sUrl.domain, sUrl.rootDomain, "", false, false, sUrl.tld);

      if (sDomainEval.status === "Typosquatting") {
        senderVerification = "Suspicious";
        senderAnalysis = `Sender domain spoofs brand: ${sDomainEval.analysis}`;
        senderMalicious = true;
        senderScore = 97;
      } else if (freeEmailProviders.includes(domain)) {
        let isImpersonating = false;
        for (const brand of Object.keys(brandDomains)) {
          if (username.includes(brand)) {
            senderVerification = "Suspicious";
            senderAnalysis = `Brand impersonation: claims to be '${brand.charAt(0).toUpperCase() + brand.slice(1)}' using free webmail (${domain})`;
            senderMalicious = true;
            senderScore = 95;
            isImpersonating = true;
            break;
          }
        }
        if (!isImpersonating) {
          senderVerification = "Unverified";
          senderAnalysis = `Public webmail account (${domain})`;
          senderScore = 15;
        }
      } else if (sDomainEval.status === "Safe" && sDomainEval.verification === "Safe") {
        senderVerification = "Verified";
        senderAnalysis = `Verified official sender domain (${domain})`;
        senderScore = 2;
      } else {
        senderVerification = "Unverified";
        senderAnalysis = `Corporate/third-party sender domain (${domain})`;
        senderScore = 10;
      }
    }
  }

  // 3. Evaluate Body Text
  const lowerText = emailText.toLowerCase();
  const suspiciousWords: string[] = [];
  const urgencyKeywords = ["urgent", "immediately", "within 24 hours", "suspended", "locked", "critical", "emergency", "action required", "final warning", "expire", "compromised", "unauthorized"];
  const greedKeywords = ["free", "won", "lottery", "gift card", "reward", "voucher", "claim now", "claim prize", "rebate", "bonus"];
  const credentialKeywords = ["verify password", "update login", "reset password", "credentials", "banking details", "direct deposit", "wire transfer", "credit card", "security code"];
  const genericKeywords = ["verify", "login", "password", "account", "update", "invoice", "billing", "refund", "suspend", "click here", "payment failed"];

  [...genericKeywords, ...urgencyKeywords, ...greedKeywords, ...credentialKeywords].forEach(kw => {
    if (lowerText.includes(kw) && !suspiciousWords.includes(kw)) {
      suspiciousWords.push(kw);
    }
  });

  const hasHighUrgency = urgencyKeywords.some(k => lowerText.includes(k));
  const hasGreedLure = greedKeywords.some(k => lowerText.includes(k));
  const hasCredentialTheft = credentialKeywords.some(k => lowerText.includes(k));

  // Unified Threat Score
  let score = 5.0;
  let isPhishing = false;
  let classification = "Safe";

  if (urlEval.isMalicious || senderMalicious) {
    score = Math.max(urlEval.score, senderScore);
    if (suspiciousWords.length >= 2) score = Math.min(99.5, score + 2.0);
    isPhishing = true;
    classification = "Phishing";
  } else if (urlEval.verification === "Safe" && senderVerification === "Verified") {
    score = 3.0;
    isPhishing = false;
    classification = "Safe";
  } else if (urlEval.verification === "Safe" && !senderMalicious) {
    score = suspiciousWords.length <= 1 ? 8.0 : 15.0;
    isPhishing = false;
    classification = "Safe";
  } else {
    score = 10.0;
    if (hasCredentialTheft) score += 40.0;
    if (hasHighUrgency) score += 25.0;
    if (hasGreedLure) score += 35.0;
    score += Math.min(20.0, suspiciousWords.length * 5.0);

    score = Math.min(98.0, Math.max(5.0, score));
    isPhishing = score >= 50.0;
    classification = score >= 70.0 ? "Phishing" : (score >= 30.0 ? "Suspicious" : "Safe");
  }

  // Generate clear diagnostic explanation
  const explanationParts: string[] = [];
  if (senderMalicious) explanationParts.push(`Sender Red Flag: ${senderAnalysis}.`);
  if (urlEval.isMalicious) explanationParts.push(`Destination Red Flag: ${urlEval.analysis}.`);
  if (hasHighUrgency) explanationParts.push("Social engineering detected: Artificial urgency and pressure to act immediately.");
  if (hasGreedLure) explanationParts.push("Lure indicator detected: Unsolicited rewards or prizes designed to prompt impulsive link clicks.");
  if (hasCredentialTheft) explanationParts.push("Credential harvesting risk: Requests for password, PIN, or account verification.");

  let explanation = "";
  if (explanationParts.length > 0) {
    explanation = explanationParts.join(" ");
  } else {
    if (isPhishing) {
      explanation = "Diagnostic Alert: Suspicious transaction pattern detected. Exercise caution before clicking embedded links or entering sensitive credentials.";
    } else {
      explanation = `Diagnostic Report: Legitimate communication pattern verified. Official sender (${senderAnalysis}) and secure destination link (${urlEval.analysis}).`;
    }
  }

  return {
    is_phishing: isPhishing,
    confidence_score: Math.round(score * 10) / 10,
    suspicious_words: suspiciousWords,
    classification,
    ai_explanation: explanation,
    sender_verification: senderVerification,
    sender_analysis: senderAnalysis,
    url_verification: urlEval.verification,
    url_analysis: urlEval.analysis,
    new_risk_score: null
  };
};

export default function PhishingSimulator({
  onAnalysisComplete,
  userEmail
}: {
  onAnalysisComplete: (result: any) => void;
  userEmail: string;
}) {
  const [emailText, setEmailText] = useState("");
  const [urlText, setUrlText] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [reportSuccess, setReportSuccess] = useState(false);

  const loadPreset = (scenario: typeof PRESET_SCENARIOS[0]) => {
    setSenderEmail(scenario.sender);
    setUrlText(scenario.url);
    setEmailText(scenario.body);
    setReportSuccess(false);
  };

  const clearForm = () => {
    setSenderEmail("");
    setUrlText("");
    setEmailText("");
    setReportSuccess(false);
  };

  const simulateClick = async () => {
    if (!emailText && !urlText && !senderEmail) return;
    setIsAnalyzing(true);
    setReportSuccess(false);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/analyze`, {
        email: userEmail || "user@company.com",
        sender_email: senderEmail,
        text: emailText,
        url: urlText,
        action: "clicked_link"
      });
      onAnalysisComplete(res.data);
    } catch (error) {
      // Offline fallback with identical multi-vector logic
      const mockAnalysis = runLocalScanner(senderEmail, urlText, emailText);
      onAnalysisComplete(mockAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reportPhishing = async () => {
    if (!emailText && !senderEmail && !urlText) return;
    setIsAnalyzing(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/report`, {
        email: userEmail || "user@company.com",
        text: emailText || `Reported link: ${urlText}`
      });
      setReportSuccess(true);
      onAnalysisComplete({ new_risk_score: null });
    } catch (err) {
      setReportSuccess(true);
      onAnalysisComplete({ is_phishing: false, classification: "", new_risk_score: null });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="surface-card p-6 flex flex-col gap-5 border border-white/[0.08] shadow-2xl relative">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary/15 text-primary-light rounded-xl border border-primary/25">
            <Mail size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-snug">
              Threat Sandbox &amp; Simulator
            </h3>
            <p className="text-xs text-slate-400">Test emails and URLs safely in an isolated environment</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/[0.06] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("form")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "form"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Edit3 size={13} />
            Scanner Input
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "preview"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye size={13} />
            Inbox Preview
          </button>
        </div>
      </div>

      {/* Preset Quick Scenarios */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles size={12} className="text-primary-light" /> Quick Attack Scenarios
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {PRESET_SCENARIOS.map((scenario, index) => {
            const isMalicious = scenario.type.includes("Phishing");
            return (
              <button
                key={index}
                onClick={() => loadPreset(scenario)}
                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] text-slate-300 transition-all text-left"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isMalicious ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
                <span className="font-semibold text-slate-200">{scenario.title}</span>
              </button>
            );
          })}
          {(senderEmail || urlText || emailText) && (
            <button
              onClick={clearForm}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] text-slate-400 hover:text-slate-200 transition-all"
            >
              <RotateCcw size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "form" ? (
        <div className="flex flex-col gap-4">
          {/* Sender Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <AtSign size={13} className="text-slate-400" /> Sender Email Address
            </label>
            <input
              type="text"
              className="w-full bg-[#07080d] border border-white/[0.08] focus:border-primary/80 focus:ring-1 focus:ring-primary/40 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder-slate-500 font-mono transition-colors outline-none"
              placeholder="e.g. security@amazon00.com or support@company.com"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
            />
          </div>

          {/* Embedded URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Globe size={13} className="text-slate-400" /> Embedded Link / Destination URL
            </label>
            <input
              type="text"
              className="w-full bg-[#07080d] border border-white/[0.08] focus:border-primary/80 focus:ring-1 focus:ring-primary/40 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder-slate-500 font-mono transition-colors outline-none"
              placeholder="e.g. http://amazon00.com/login or https://google.com"
              value={urlText}
              onChange={(e) => setUrlText(e.target.value)}
            />
          </div>

          {/* Email Content Body */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail size={13} className="text-slate-400" /> Email Subject &amp; Body
            </label>
            <textarea
              className="w-full bg-[#07080d] border border-white/[0.08] focus:border-primary/80 focus:ring-1 focus:ring-primary/40 rounded-xl px-3.5 py-2.5 text-white text-xs placeholder-slate-500 transition-colors outline-none resize-none"
              rows={3}
              placeholder="Paste email text, subject line, or message content..."
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
            />
          </div>
        </div>
      ) : (
        /* Inbox Preview Mode */
        <div className="bg-[#07080d] border border-white/[0.08] rounded-xl p-4 flex flex-col gap-3 font-sans">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                {senderEmail ? senderEmail.slice(0, 2).toUpperCase() : "EM"}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200">
                  {senderEmail ? senderEmail.split("@")[0] : "Sender Name"}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {senderEmail || "sender@domain.com"}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-slate-500">Today, 10:45 AM</span>
          </div>

          <div className="py-2 text-xs text-slate-300 leading-relaxed min-h-[70px]">
            {emailText || "No email content provided yet. Select a preset or type in the scanner input tab."}
          </div>

          {urlText && (
            <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <Globe size={14} className="text-primary-light shrink-0" />
                <span className="text-xs text-primary-light font-mono truncate">{urlText}</span>
              </div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 shrink-0">Clickable Element</span>
            </div>
          )}
        </div>
      )}

      {/* Success Notification for Reporting */}
      {reportSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <Check size={16} className="text-emerald-400 shrink-0" />
          <span>Phishing reported successfully! Defensive score rewarded (+5 Safe Points).</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          onClick={simulateClick}
          disabled={isAnalyzing || (!emailText && !urlText && !senderEmail)}
          className="flex-1 bg-primary hover:bg-primary-hover disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/25 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Scanning Threat Elements...</span>
            </>
          ) : (
            <>
              <ExternalLink size={14} />
              <span>Simulate Link Click</span>
            </>
          )}
        </button>

        <button
          onClick={reportPhishing}
          disabled={isAnalyzing || (!emailText && !senderEmail && !urlText)}
          className="flex-1 bg-white/[0.04] hover:bg-rose-500/15 hover:border-rose-500/30 border border-white/[0.08] text-slate-300 hover:text-rose-300 text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShieldAlert size={14} />
          <span>Report as Suspicious</span>
        </button>
      </div>
    </div>
  );
}
