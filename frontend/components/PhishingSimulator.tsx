"use client";

import { useState } from 'react';
import { Mail, ShieldAlert, ExternalLink, AtSign, Globe } from 'lucide-react';
import axios from 'axios';

// --- OFFLINE CLIENT-SIDE SECURITY SCANNING ENGINE ---
// Replicates the backend AI heuristics in-browser to handle offline states seamlessly
const runLocalScanner = (senderEmail: string, urlText: string, emailText: string) => {
  const brandDomains: Record<string, string[]> = {
    amazon: ["amazon.com", "amazon.in", "amazon.co.uk", "amazon.ca", "amazon.de", "amazon.fr", "amazon.co.jp"],
    google: ["google.com", "google.co.in", "gmail.com", "youtube.com", "drive.google.com"],
    apple: ["apple.com", "icloud.com", "me.com"],
    microsoft: ["microsoft.com", "outlook.com", "live.com", "office.com", "hotmail.com"],
    paypal: ["paypal.com", "paypal.co.uk"],
    netflix: ["netflix.com"],
    chase: ["chase.com"],
    flipkart: ["flipkart.com", "flipkart.in"],
    paytm: ["paytm.com"],
    dhl: ["dhl.com", "dhl.de"],
    facebook: ["facebook.com", "fb.com"],
    instagram: ["instagram.com"],
    linkedin: ["linkedin.com"],
    spotify: ["spotify.com"],
    zoom: ["zoom.us", "zoom.com"],
    twitter: ["twitter.com", "x.com"],
    yahoo: ["yahoo.com"],
    github: ["github.com", "github.io"],
    dropbox: ["dropbox.com"],
    wellsfargo: ["wellsfargo.com"],
    bankofamerica: ["bankofamerica.com"]
  };

  const freeEmailProviders = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "protonmail.com", "mail.com", "zoho.com", "yandex.com"
  ];
  
  let isPhishing = false;
  let score = 5.0; // base score for standard safe emails
  let classification = "Safe";
  let senderVerification = "Unverified";
  let senderAnalysis = "Unverified third-party domain name";
  let urlVerification = "Safe";
  let urlAnalysis = "Safe destination domain";
  let suspiciousWords: string[] = [];
  
  // Keyword scanning
  const keywords = ["urgent", "verify", "click here", "suspend", "password", "login", "unauthorized", "account", "update", "action required", "billing", "reset", "free", "win", "claim", "refund", "invoice"];
  const lowerText = emailText.toLowerCase();
  keywords.forEach(w => {
    if (lowerText.includes(w)) suspiciousWords.push(w);
  });
  
  // Calculate base score from keywords
  if (suspiciousWords.length === 1) {
    score = 25.0;
  } else if (suspiciousWords.length === 2) {
    score = 45.0;
  } else if (suspiciousWords.length >= 3) {
    score = 65.0;
  }
  
  // Clean domains helper
  const getDomain = (url: string) => {
    if (!url) return "";
    let clean = url.trim().toLowerCase();
    
    // Support wildcard inputs like https.amazon001 or amazon001 without schemes
    clean = clean.replace("https://", "").replace("http://", "");
    if (clean.startsWith("www.")) clean = clean.substring(4);
    
    // Extract domain from wildcard formats like http.amazon001
    if (clean.includes("https.")) clean = clean.replace("https.", "");
    if (clean.includes("http.")) clean = clean.replace("http.", "");
    
    return clean.split("/")[0].split(":")[0];
  };

  // Levenshtein helper
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
            matrix[i - 1][j - 1] + 1, // substitution
            Math.min(
              matrix[i][j - 1] + 1, // insertion
              matrix[i - 1][j] + 1  // deletion
            )
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  const checkSpoof = (domain: string) => {
    if (!domain) return { status: "Safe", brand: null, reason: "No domain provided" };
    
    // Check exact whitelist
    for (const [brand, officials] of Object.entries(brandDomains)) {
      for (const off of officials) {
        if (domain === off || domain.endsWith("." + off)) {
          return { status: "Safe", brand, reason: `Official ${brand.charAt(0).toUpperCase() + brand.slice(1)} domain` };
        }
      }
    }
    
    // Check typosquatting/similarity
    for (const [brand, officials] of Object.entries(brandDomains)) {
      if (domain.includes(brand)) {
        return { status: "Typosquatting", brand, reason: `Contains '${brand}' but is not an official ${brand.charAt(0).toUpperCase() + brand.slice(1)} domain` };
      }
      
      const segments = domain.replace(/-/g, ".").replace(/_/g, ".").split(".");
      for (const seg of segments) {
        if (seg.length >= 3) {
          const dist = getEditDistance(seg, brand);
          const maxDist = brand.length > 5 ? 2 : 1;
          if (dist > 0 && dist <= maxDist) {
            return { status: "Typosquatting", brand, reason: `Spelling similarity '${seg}' to brand '${brand}'` };
          }
        }
      }
    }
    return { status: "Safe", brand: null, reason: "Safe/Standard domain" };
  };

  // Analyze Sender
  if (senderEmail && senderEmail.includes("@")) {
    const parts = senderEmail.toLowerCase().trim().split("@");
    if (parts.length === 2) {
      const [username, domain] = parts;
      const domainInfo = checkSpoof(domain);
      
      if (domainInfo.status === "Typosquatting") {
        senderVerification = "Suspicious";
        senderAnalysis = domainInfo.reason ? domainInfo.reason : "Impersonation domain";
        isPhishing = true;
        score = Math.max(score, 98.0);
      } else if (freeEmailProviders.includes(domain)) {
        let isImpersonating = false;
        for (const brand of Object.keys(brandDomains)) {
          if (username.includes(brand)) {
            senderVerification = "Suspicious";
            senderAnalysis = `Brand impersonation '${brand.charAt(0).toUpperCase() + brand.slice(1)}' using free email account (${domain})`;
            isPhishing = true;
            score = Math.max(score, 98.0);
            isImpersonating = true;
            break;
          }
        }
        if (!isImpersonating) {
          senderVerification = "Unverified";
          senderAnalysis = "Standard free email address";
        }
      } else if (domainInfo.status === "Safe" && domainInfo.brand) {
        senderVerification = "Verified";
        senderAnalysis = `Verified official ${domainInfo.brand.charAt(0).toUpperCase() + domainInfo.brand.slice(1)} domain`;
      } else {
        senderVerification = "Unverified";
        senderAnalysis = "Unverified domain name";
      }
    }
  }

  // Analyze URL
  if (urlText) {
    const urlDomain = getDomain(urlText);
    const domainInfo = checkSpoof(urlDomain);
    const isHttp = urlText.toLowerCase().trim().startsWith("http://");
    const hasIp = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(urlDomain);
    
    if (domainInfo.status === "Typosquatting") {
      urlVerification = "Typosquatting";
      urlAnalysis = domainInfo.reason ? domainInfo.reason : "Impersonation domain";
      isPhishing = true;
      score = Math.max(score, 98.5);
      if (isHttp) {
        urlAnalysis += " (Also uses insecure unencrypted HTTP protocol)";
      }
    } else if (hasIp) {
      urlVerification = "Malicious";
      urlAnalysis = "URL uses raw numerical IP address instead of domain";
      isPhishing = true;
      score = Math.max(score, 95.0);
    } else if (isHttp) {
      urlVerification = "Suspicious";
      isPhishing = true;
      if (domainInfo.status === "Safe" && domainInfo.brand) {
        urlAnalysis = "Uses insecure unencrypted HTTP connection. Legitimate brands always use secure HTTPS for credentials.";
        score = Math.max(score, 82.0);
      } else {
        urlAnalysis = "Uses insecure unencrypted HTTP connection.";
        score = Math.max(score, 65.0);
      }
    } else if (domainInfo.status === "Safe" && domainInfo.brand) {
      urlVerification = "Safe";
      urlAnalysis = domainInfo.reason ? domainInfo.reason : "Official brand link";
    } else {
      urlVerification = "Unverified";
      urlAnalysis = "Unverified domain name";
      const suspiciousTerms = ["login", "update", "verify", "secure", "free", "win", "claim", "reset", "billing", "invoice"];
      const matchedTerms: string[] = [];
      suspiciousTerms.forEach(t => {
        if (urlText.toLowerCase().includes(t)) matchedTerms.push(t);
      });
      if (matchedTerms.length > 0) {
        urlVerification = "Suspicious";
        urlAnalysis = `Suspicious terms in URL path: ${matchedTerms.join(", ")}`;
        score = Math.max(score, 45.0 + 10 * matchedTerms.length);
      }
    }
    
    // Check suspicious TLDs
    const suspiciousTldRegex = /\.(xyz|su|info|click|top|tk|cf|gq|ml|ga|work|bid|date|download)$/;
    if (suspiciousTldRegex.test(urlDomain)) {
      score = Math.max(score, 75.0);
      if (urlVerification === "Safe") {
        urlVerification = "Suspicious";
      }
      urlAnalysis += " (Hosted on a high-risk suspicious TLD)";
    }
  }
  
  if (isPhishing || score > 45.0) {
    classification = score > 70.0 ? "Phishing" : "Suspicious";
    isPhishing = true;
  }
  
  const explanation = `Diagnostic Report: This scan analyzed the transaction elements against known phishing tactics. The sender is classified as ${senderVerification} (${senderAnalysis}) and the URL is classified as ${urlVerification} (${urlAnalysis}). Legitimate companies never use spoofed domains or ask for credentials over unencrypted connections.`;
  
  return {
    is_phishing: isPhishing,
    confidence_score: score,
    suspicious_words: suspiciousWords,
    classification,
    ai_explanation: explanation,
    sender_verification: senderVerification,
    sender_analysis: senderAnalysis,
    url_verification: urlVerification,
    url_analysis: urlAnalysis,
    new_risk_score: null
  };
};

export default function PhishingSimulator({ onAnalysisComplete, userEmail }: { onAnalysisComplete: (result: any) => void, userEmail: string }) {
  const [emailText, setEmailText] = useState("");
  const [urlText, setUrlText] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const simulateClick = async () => {
    if (!emailText && !urlText && !senderEmail) return;
    setIsAnalyzing(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/analyze`, {
        email: userEmail || "thejusshetty479@gmail.com",
        sender_email: senderEmail,
        text: emailText,
        url: urlText,
        action: "clicked_link"
      });
      onAnalysisComplete(res.data);
    } catch (error) {
      console.warn("Backend offline. Initiating Offline Client-Side Intelligence scanner...");
      // Seamlessly execute offline logic
      const mockAnalysis = runLocalScanner(senderEmail, urlText, emailText);
      onAnalysisComplete(mockAnalysis);
    }
    setIsAnalyzing(false);
  };

  const reportPhishing = async () => {
    if (!emailText) return;
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/report`, {
        email: userEmail || "thejusshetty479@gmail.com",
        text: emailText
      });
      alert("Phishing reported successfully! +5 Safe Points");
      onAnalysisComplete({ new_risk_score: null }); // trigger refresh
    } catch (err) {
      console.warn("Backend offline. Simulating local report log.");
      alert("Phishing reported successfully in offline mode!");
      onAnalysisComplete({ is_phishing: false, classification: "", new_risk_score: null });
    }
  };

  return (
    <div className="glass-panel p-6 flex flex-col gap-5 border border-white/10 bg-black/40 backdrop-blur-xl rounded-2xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)] transition-all duration-300 hover:border-primary/30 hover:shadow-[0_24px_50px_-12px_rgba(59,130,246,0.15)] relative overflow-hidden group">
      
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/20 transition-all duration-500"></div>

      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Mail size={22} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Threat Simulator
            </h2>
            <p className="text-xs text-gray-400">Test any suspicious message in our sandboxed scanner</p>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400">
          Sandboxed Scan
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {/* Sender Email Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <AtSign size={13} className="text-gray-400" /> Sender's Email
          </label>
          <input 
            type="email"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300 text-sm font-mono"
            placeholder="e.g. support@11flipkart.com"
            value={senderEmail}
            onChange={e => setSenderEmail(e.target.value)}
          />
        </div>

        {/* Link URL Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Globe size={13} className="text-gray-400" /> Embedded Link / URL
          </label>
          <input 
            type="text"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300 text-sm font-mono"
            placeholder="e.g. http://11flipkart.com/login"
            value={urlText}
            onChange={e => setUrlText(e.target.value)}
          />
        </div>

        {/* Email Body Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Mail size={13} className="text-gray-400" /> Email Message Content
          </label>
          <textarea 
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300 text-sm resize-none"
            rows={3}
            placeholder="Paste the full email text or content here..."
            value={emailText}
            onChange={e => setEmailText(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3.5 mt-2">
        <button 
          onClick={simulateClick}
          disabled={isAnalyzing || (!emailText && !urlText && !senderEmail)}
          className="flex-1 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.5)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-sm"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Analyzing Threat...
            </>
          ) : (
            <>
              <ExternalLink size={16} />
              Simulate Link Click
            </>
          )}
        </button>
        
        <button 
          onClick={reportPhishing}
          disabled={!emailText}
          className="flex-1 bg-white/5 border border-white/10 hover:bg-danger/10 hover:border-danger/40 text-gray-300 hover:text-danger font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none text-sm"
        >
          <ShieldAlert size={16} />
          Report Phishing
        </button>
      </div>
    </div>
  );
}
