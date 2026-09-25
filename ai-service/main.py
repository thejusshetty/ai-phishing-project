from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import os
import re
import requests
import urllib.parse
import json
from typing import Optional, List, Dict, Any

def load_api_key():
    # 1. Try to load from the user's custom api.env/api.txt file
    api_txt_path = os.path.join(os.path.dirname(__file__), "api.env", "api.txt")
    if os.path.exists(api_txt_path):
        try:
            with open(api_txt_path, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if "GEMINI_API_KEY=" in content:
                    key = content.split("GEMINI_API_KEY=")[1].strip()
                    if key:
                        print("Successfully loaded Gemini API Key from api.env/api.txt")
                        return key
                elif content:
                    print("Successfully loaded raw Gemini API Key from api.env/api.txt")
                    return content
        except Exception as e:
            print(f"Error loading key from api.env/api.txt: {e}")

    # 2. Try loading from .env file or environment variables
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass

    env_key = os.getenv("GEMINI_API_KEY")
    if env_key:
        print("Successfully loaded Gemini API Key from environment/.env")
        return env_key

    # 3. Default fallback key
    return "AIzaSyBcKUMpGPoBiLLBZu2Ua5v0fY_u7Pzyr9I"

GEMINI_API_KEY = load_api_key()

app = FastAPI(title="Phishing Detection AI Service", version="2.0.0")

# Load trained ML model if available
MODEL_PATH = os.path.join(os.path.dirname(__file__), "phishing_model.pkl")
ml_model = None
try:
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            ml_model = pickle.load(f)
            print("Loaded trained NLP machine learning model.")
except Exception as e:
    print(f"Note on ML model: {e}")

# Known major brands and their verified official domains
BRAND_DOMAINS: Dict[str, List[str]] = {
    "amazon": ["amazon.com", "amazon.in", "amazon.co.uk", "amazon.ca", "amazon.de", "amazon.fr", "amazon.co.jp", "amazon.com.mx", "aws.amazon.com"],
    "google": ["google.com", "google.co.in", "gmail.com", "youtube.com", "drive.google.com", "docs.google.com", "play.google.com", "photos.google.com", "slides.google.com"],
    "apple": ["apple.com", "icloud.com", "me.com", "mac.com"],
    "microsoft": ["microsoft.com", "outlook.com", "live.com", "office.com", "microsoftonline.com", "sharepoint.com", "windows.net", "hotmail.com"],
    "paypal": ["paypal.com", "paypal.co.uk", "paypal.in"],
    "netflix": ["netflix.com"],
    "chase": ["chase.com"],
    "bankofamerica": ["bankofamerica.com", "bofa.com"],
    "wellsfargo": ["wellsfargo.com"],
    "dhl": ["dhl.com", "dhl.de", "dhl.co.in"],
    "fedex": ["fedex.com"],
    "ups": ["ups.com"],
    "usps": ["usps.com"],
    "facebook": ["facebook.com", "fb.com"],
    "instagram": ["instagram.com"],
    "linkedin": ["linkedin.com"],
    "spotify": ["spotify.com"],
    "zoom": ["zoom.us", "zoom.com"],
    "twitter": ["twitter.com", "x.com"],
    "yahoo": ["yahoo.com", "myyahoo.com"],
    "github": ["github.com", "github.io"],
    "dropbox": ["dropbox.com"],
    "flipkart": ["flipkart.com", "flipkart.in"],
    "paytm": ["paytm.com"],
    "docusign": ["docusign.com", "docusign.net"],
    "slack": ["slack.com"],
    "jira": ["atlassian.com", "atlassian.net", "jira.com"],
    "trello": ["trello.com"],
    "workday": ["workday.com"],
    "figma": ["figma.com"],
    "binance": ["binance.com"],
    "coinbase": ["coinbase.com"],
    "expensify": ["expensify.com"],
    "starbucks": ["starbucks.com"],
    "doordash": ["doordash.com"],
    "uber": ["uber.com"],
    "united": ["united.com"],
    "delta": ["delta.com"],
    "opentable": ["opentable.com"],
    "pastebin": ["pastebin.com"],
    "nytimes": ["nytimes.com"],
    "allrecipes": ["allrecipes.com"],
    "irs": ["irs.gov"],
    "mcafee": ["mcafee.com"]
}

# Recognized legitimate top corporate and service platforms
KNOWN_SAFE_DOMAINS = [
    "zoom.us", "zoom.com", "docusign.net", "docusign.com", "github.com", "github.io",
    "slack.com", "trello.com", "figma.com", "pastebin.com", "nytimes.com", "allrecipes.com",
    "opentable.com", "united.com", "delta.com", "uber.com", "starbucks.com", "doordash.com",
    "expensify.com", "workday.com", "atlassian.net", "atlassian.com", "irs.gov"
]

FREE_EMAIL_PROVIDERS = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "protonmail.com", "mail.com", "zoho.com", "yandex.com", "icloud.com"
]

HIGH_RISK_TLDS = [
    "xyz", "su", "top", "click", "info", "tk", "ml", "ga", "cf", "gq", "work", "download", "bid", "date", "link", "stream", "zone"
]

PHISHING_DOMAIN_KEYWORDS = [
    "verify", "verification", "account", "login", "signin", "security", "update", "unlock",
    "password", "support", "billing", "confirm", "confirmation", "quota", "claim", "winner",
    "reward", "refund", "penalty", "compromise", "wallet", "resolution", "portal", "auth",
    "banking", "direct-deposit", "salary-review", "fraud-alert", "secure-portal", "resolution-center"
]

def levenshtein_distance(s1: str, s2: str) -> int:
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]

def extract_domain_components(url: str) -> Dict[str, Any]:
    if not url:
        return {"raw": "", "domain": "", "root_domain": "", "path": "", "is_http": False, "has_ip": False, "tld": ""}

    url_str = url.strip()
    is_http = url_str.lower().startswith("http://")
    is_https = url_str.lower().startswith("https://")

    url_to_parse = url_str
    if not (is_http or is_https):
        url_to_parse = "http://" + url_str

    try:
        parsed = urllib.parse.urlparse(url_to_parse)
        netloc = parsed.netloc.lower()
        if ":" in netloc:
            netloc = netloc.split(":")[0]
        if netloc.startswith("www."):
            netloc = netloc[4:]

        path = (parsed.path + ("?" + parsed.query if parsed.query else "")).lower()

        # Check for IP address
        has_ip = bool(re.search(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', netloc)) or bool(re.search(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', netloc))

        # Extract TLD and base root domain
        parts = netloc.split(".")
        tld = parts[-1] if len(parts) > 1 else ""

        # Extract effective root domain (e.g., 'amazon00.com', 'google.co.in')
        root_domain = netloc
        if len(parts) >= 2:
            if len(parts) >= 3 and parts[-2] in ["co", "com", "gov", "org", "edu", "net"] and len(parts[-1]) <= 3:
                root_domain = ".".join(parts[-3:])
            else:
                root_domain = ".".join(parts[-2:])

        return {
            "raw": url_str,
            "domain": netloc,
            "root_domain": root_domain,
            "path": path,
            "is_http": is_http,
            "has_ip": has_ip,
            "tld": tld
        }
    except Exception:
        return {"raw": url, "domain": "", "root_domain": "", "path": "", "is_http": False, "has_ip": False, "tld": ""}

def evaluate_domain_threat(domain_info: Dict[str, Any]) -> Dict[str, Any]:
    domain = domain_info["domain"]
    root_domain = domain_info["root_domain"]
    path = domain_info["path"]
    is_http = domain_info["is_http"]
    has_ip = domain_info["has_ip"]
    tld = domain_info["tld"]

    if not domain:
        return {
            "status": "Safe",
            "verification": "Unverified",
            "analysis": "No URL provided",
            "threat_score": 0.0,
            "is_malicious": False
        }

    # 1. Check IP address
    if has_ip:
        return {
            "status": "Malicious",
            "verification": "Malicious",
            "analysis": f"URL uses a raw numerical IP address ({domain}) to bypass DNS domain reputation checks",
            "threat_score": 96.0,
            "is_malicious": True
        }

    # 2. Check if it is a genuine official brand domain
    for brand, officials in BRAND_DOMAINS.items():
        for official in officials:
            if domain == official or domain.endswith("." + official):
                return {
                    "status": "Safe",
                    "verification": "Safe",
                    "analysis": f"Verified official {brand.capitalize()} domain ({domain})",
                    "threat_score": 2.0,
                    "is_malicious": False
                }

    # Check known safe platforms
    for safe_d in KNOWN_SAFE_DOMAINS:
        if domain == safe_d or domain.endswith("." + safe_d) or domain.endswith(".internal.company.com"):
            return {
                "status": "Safe",
                "verification": "Safe",
                "analysis": f"Recognized standard service domain ({domain})",
                "threat_score": 3.0,
                "is_malicious": False
            }

    # 3. Check for Typosquatting / Brand Spoofing in domain or root domain
    domain_clean = root_domain.replace("-", ".").replace("_", ".")
    segments = domain_clean.split(".")

    for brand, officials in BRAND_DOMAINS.items():
        # Check direct substring brand spoofing (e.g., 'amazon00.com', '11flipkart.com', 'chase-security.com')
        if brand in root_domain or brand in domain:
            return {
                "status": "Typosquatting",
                "verification": "Typosquatting",
                "analysis": f"Contains brand name '{brand}' in unauthorized domain '{domain}' (spoofing risk)",
                "threat_score": 98.0,
                "is_malicious": True
            }

        # Check Levenshtein distance on domain segments
        for seg in segments:
            if len(seg) >= 3:
                dist = levenshtein_distance(seg, brand)
                max_dist = 2 if len(brand) > 5 else 1
                if dist > 0 and dist <= max_dist:
                    return {
                        "status": "Typosquatting",
                        "verification": "Typosquatting",
                        "analysis": f"Spelling permutation '{seg}' mimics legitimate brand '{brand}' (Levenshtein typosquatting distance = {dist})",
                        "threat_score": 97.5,
                        "is_malicious": True
                    }

    # 4. Check for generic phishing domain keywords + high risk TLDs
    matched_domain_phish_words = [kw for kw in PHISHING_DOMAIN_KEYWORDS if kw in domain or kw in root_domain]
    is_high_risk_tld = tld in HIGH_RISK_TLDS

    if matched_domain_phish_words and is_high_risk_tld:
        return {
            "status": "Suspicious",
            "verification": "Suspicious",
            "analysis": f"Domain contains credential/security keywords ({', '.join(matched_domain_phish_words[:2])}) and is hosted on high-risk TLD (.{tld})",
            "threat_score": 92.0,
            "is_malicious": True
        }

    if len(matched_domain_phish_words) >= 2:
        return {
            "status": "Suspicious",
            "verification": "Suspicious",
            "analysis": f"Deceptive domain composition targeting security terms: {', '.join(matched_domain_phish_words[:3])}",
            "threat_score": 88.0,
            "is_malicious": True
        }

    if is_high_risk_tld:
        return {
            "status": "Suspicious",
            "verification": "Suspicious",
            "analysis": f"Destination URL is registered under high-risk suspicious TLD (.{tld})",
            "threat_score": 75.0,
            "is_malicious": True
        }

    # Check path keywords on unverified domains
    matched_path_phish = [kw for kw in PHISHING_DOMAIN_KEYWORDS if kw in path]
    if matched_path_phish and is_http:
        return {
            "status": "Suspicious",
            "verification": "Suspicious",
            "analysis": f"Unencrypted HTTP link requesting sensitive action ({', '.join(matched_path_phish)})",
            "threat_score": 80.0,
            "is_malicious": True
        }

    if is_http and ("login" in path or "password" in path or "verify" in path):
        return {
            "status": "Suspicious",
            "verification": "Suspicious",
            "analysis": "Transmits credential/login data over unencrypted HTTP protocol",
            "threat_score": 84.0,
            "is_malicious": True
        }

    return {
        "status": "Unverified",
        "verification": "Unverified",
        "analysis": f"Standard third-party domain ({domain})",
        "threat_score": 15.0,
        "is_malicious": False
    }

def evaluate_sender_threat(sender_email: str) -> Dict[str, Any]:
    if not sender_email or "@" not in sender_email:
        return {
            "verification": "Unverified",
            "analysis": "No sender email provided",
            "threat_score": 0.0,
            "is_malicious": False
        }

    sender_clean = sender_email.lower().strip()
    # Extract email if formatted as 'Name <email@domain.com>'
    email_match = re.search(r'<([^>]+)>', sender_clean)
    if email_match:
        sender_clean = email_match.group(1)

    parts = sender_clean.split("@")
    if len(parts) != 2:
        return {
            "verification": "Unverified",
            "analysis": "Invalid email formatting",
            "threat_score": 10.0,
            "is_malicious": False
        }

    username, domain = parts

    # Check sender domain
    domain_info = extract_domain_components(domain)
    domain_eval = evaluate_domain_threat(domain_info)

    if domain_eval["status"] == "Typosquatting":
        return {
            "verification": "Suspicious",
            "analysis": f"Sender domain spoofs brand: {domain_eval['analysis']}",
            "threat_score": 97.0,
            "is_malicious": True
        }

    if domain in FREE_EMAIL_PROVIDERS:
        for brand in BRAND_DOMAINS.keys():
            if brand in username:
                return {
                    "verification": "Suspicious",
                    "analysis": f"Brand impersonation: claims to represent '{brand.capitalize()}' but originates from free webmail ({domain})",
                    "threat_score": 95.0,
                    "is_malicious": True
                }
        return {
            "verification": "Unverified",
            "analysis": f"Sent from public webmail address ({domain})",
            "threat_score": 15.0,
            "is_malicious": False
        }

    if domain_eval["status"] == "Safe" and domain_eval["verification"] == "Safe":
        return {
            "verification": "Verified",
            "analysis": f"Verified official sender domain ({domain})",
            "threat_score": 2.0,
            "is_malicious": False
        }

    return {
        "verification": "Unverified",
        "analysis": f"Unverified corporate or third-party domain ({domain})",
        "threat_score": 10.0,
        "is_malicious": False
    }

def analyze_body_content(text: str) -> Dict[str, Any]:
    text_lower = text.lower() if text else ""
    suspicious_words = []

    urgency_keywords = ["urgent", "immediately", "within 24 hours", "suspended", "locked", "critical", "emergency", "action required", "final warning", "expire", "compromised", "unauthorized"]
    greed_keywords = ["free", "won", "lottery", "gift card", "reward", "voucher", "claim now", "claim prize", "rebate", "bonus"]
    credential_keywords = ["verify password", "update login", "reset password", "credentials", "banking details", "direct deposit", "wire transfer", "credit card", "security code"]
    generic_keywords = ["verify", "login", "password", "account", "update", "invoice", "billing", "refund", "suspend", "click here", "payment failed"]

    for kw in generic_keywords + urgency_keywords + greed_keywords + credential_keywords:
        if kw in text_lower and kw not in suspicious_words:
            suspicious_words.append(kw)

    # Calculate NLP ML probability if model is loaded
    ml_phishing_prob = None
    if ml_model and text_lower:
        try:
            sample = text
            probs = ml_model.predict_proba([sample])[0]
            ml_phishing_prob = float(probs[1] * 100.0)
        except Exception:
            pass

    return {
        "suspicious_words": suspicious_words,
        "ml_prob": ml_phishing_prob,
        "has_high_urgency": any(k in text_lower for k in urgency_keywords),
        "has_greed_lure": any(k in text_lower for k in greed_keywords),
        "has_credential_theft": any(k in text_lower for k in credential_keywords)
    }

def calculate_unified_threat_score(
    text: str,
    url: str,
    sender_email: str
) -> Dict[str, Any]:
    # 1. Parse and evaluate components
    url_info = extract_domain_components(url)
    url_eval = evaluate_domain_threat(url_info)
    sender_eval = evaluate_sender_threat(sender_email)
    body_eval = analyze_body_content(text)

    suspicious_words = body_eval["suspicious_words"]
    url_malicious = url_eval["is_malicious"]
    sender_malicious = sender_eval["is_malicious"]

    # Base score calculations
    if url_malicious or sender_malicious:
        # Definitive phishing indicators present
        score = max(url_eval["threat_score"], sender_eval["threat_score"])
        if len(suspicious_words) >= 2:
            score = min(99.5, score + 2.0)
        is_phishing = True
        classification = "Phishing"
    elif url_eval["verification"] == "Safe" and sender_eval["verification"] == "Verified":
        # Both sender and URL verified official
        score = 3.0
        is_phishing = False
        classification = "Safe"
    elif url_eval["verification"] == "Safe" and not sender_malicious:
        # URL is verified official brand
        score = 8.0 if len(suspicious_words) <= 1 else 15.0
        is_phishing = False
        classification = "Safe"
    else:
        # Unverified domain / generic text
        score = 10.0

        # Factor in body analysis
        if body_eval["has_credential_theft"]:
            score += 40.0
        if body_eval["has_high_urgency"]:
            score += 25.0
        if body_eval["has_greed_lure"]:
            score += 35.0

        score += min(20.0, len(suspicious_words) * 5.0)

        # Integrate ML model probability if present
        if body_eval["ml_prob"] is not None:
            score = (score * 0.5) + (body_eval["ml_prob"] * 0.5)

        score = min(98.0, max(5.0, score))
        is_phishing = score >= 50.0
        classification = "Phishing" if score >= 70.0 else ("Suspicious" if score >= 30.0 else "Safe")

    # Generate tailored diagnostic explanation
    explanation_parts = []
    if sender_malicious:
        explanation_parts.append(f"Sender Red Flag: {sender_eval['analysis']}.")
    if url_malicious:
        explanation_parts.append(f"Destination Red Flag: {url_eval['analysis']}.")
    if body_eval["has_high_urgency"]:
        explanation_parts.append("Social engineering tactics detected: Artificial urgency and pressure to act immediately.")
    if body_eval["has_greed_lure"]:
        explanation_parts.append("Lure indicator detected: Unsolicited rewards or prizes designed to prompt impulsive link clicks.")
    if body_eval["has_credential_theft"]:
        explanation_parts.append("Credential harvesting risk: Requests for password, PIN, or account verification.")

    if not explanation_parts:
        if is_phishing:
            explanation = "Diagnostic Alert: Suspicious transaction pattern detected. Exercise caution before clicking embedded links or entering sensitive credentials."
        else:
            explanation = f"Diagnostic Report: Legitimate communication pattern verified. Official sender ({sender_eval['analysis']}) and secure destination link ({url_eval['analysis']})."
    else:
        explanation = " ".join(explanation_parts)

    return {
        "is_phishing": is_phishing,
        "confidence_score": round(score, 1),
        "classification": classification,
        "suspicious_words": suspicious_words,
        "sender_verification": sender_eval["verification"],
        "sender_analysis": sender_eval["analysis"],
        "url_verification": url_eval["verification"],
        "url_analysis": url_eval["analysis"],
        "ai_explanation": explanation
    }

def clean_json_string(text: str) -> str:
    text_clean = text.strip()
    if text_clean.startswith("```"):
        lines = text_clean.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines[-1].strip() == "```":
            lines = lines[:-1]
        text_clean = "\n".join(lines).strip()
    return text_clean

def query_gemini_microtraining(
    text: str,
    url: str,
    sender_email: str,
    baseline: Dict[str, Any]
) -> Optional[str]:
    if not GEMINI_API_KEY:
        return None

    prompt = (
        f"You are a cybersecurity training instructor.\n"
        f"An automated analyzer determined this transaction is '{baseline['classification']}' "
        f"with threat score {baseline['confidence_score']}%.\n"
        f"Sender analysis: {baseline['sender_analysis']}\n"
        f"URL analysis: {baseline['url_analysis']}\n"
        f"Red flag terms: {', '.join(baseline['suspicious_words'])}\n"
        f"Message text:\n{text}\n\n"
        f"Write a concise, 2-sentence educational micro-training insight for the employee explaining why this is {baseline['classification']} and how to avoid being deceived. Return only the 2 sentences of plain text without quotes."
    )

    try:
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={GEMINI_API_KEY}",
            json={
                "contents": [{
                    "parts": [{"text": prompt}]
                }]
            },
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        data = response.json()
        if "candidates" in data and len(data["candidates"]) > 0:
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            if raw_text and len(raw_text) > 10:
                return raw_text
        return None
    except Exception:
        return None

class AnalyzeRequest(BaseModel):
    text: str
    url: str = ""
    sender_email: str = ""

class AnalyzeResponse(BaseModel):
    is_phishing: bool
    confidence_score: float
    suspicious_words: List[str]
    classification: str
    ai_explanation: Optional[str] = None
    sender_verification: str
    sender_analysis: str
    url_verification: str
    url_analysis: str

@app.get("/")
def read_root():
    return {"status": "AI Phishing Detection Service v2.0 is running"}

@app.post("/predict", response_model=AnalyzeResponse)
def predict(req: AnalyzeRequest):
    # 1. Compute deterministic baseline using verified multi-tier analysis
    result = calculate_unified_threat_score(
        text=req.text or "",
        url=req.url or "",
        sender_email=req.sender_email or ""
    )

    # 2. Enrich with Gemini educational micro-training if API is available
    gemini_insight = query_gemini_microtraining(
        text=req.text or "",
        url=req.url or "",
        sender_email=req.sender_email or "",
        baseline=result
    )

    final_explanation = gemini_insight if gemini_insight else result["ai_explanation"]

    return AnalyzeResponse(
        is_phishing=result["is_phishing"],
        confidence_score=result["confidence_score"],
        suspicious_words=result["suspicious_words"],
        classification=result["classification"],
        ai_explanation=final_explanation,
        sender_verification=result["sender_verification"],
        sender_analysis=result["sender_analysis"],
        url_verification=result["url_verification"],
        url_analysis=result["url_analysis"]
    )
