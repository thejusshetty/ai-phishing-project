from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import os
import re
import requests
import urllib.parse
import json
from typing import Optional

def load_api_key():
    # 1. Try to load from the user's custom api.env/api.txt file
    # Uses os.path.dirname(__file__) to make the file lookup relative and robust
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
        
    # 3. Fallback default key
    return "AIzaSyBcKUMpGPoBiLLBZu2Ua5v0fY_u7Pzyr9I"

GEMINI_API_KEY = load_api_key()

app = FastAPI(title="Phishing Detection AI Service")

# Load the trained model at startup (fallback model)
MODEL_PATH = "phishing_model.pkl"
try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
except FileNotFoundError:
    model = None
    print("Warning: Fallback model not found. Please run train_model.py first.")

# Brand whitelist definitions and their official domains (for fallback heuristics)
BRAND_DOMAINS = {
    "amazon": ["amazon.com", "amazon.in", "amazon.co.uk", "amazon.ca", "amazon.de", "amazon.fr", "amazon.co.jp", "amazon.com.mx"],
    "google": ["google.com", "google.co.in", "gmail.com", "youtube.com", "drive.google.com", "docs.google.com", "play.google.com"],
    "apple": ["apple.com", "icloud.com", "me.com", "mac.com"],
    "microsoft": ["microsoft.com", "outlook.com", "live.com", "office.com", "microsoftonline.com", "sharepoint.com", "windows.net", "hotmail.com"],
    "paypal": ["paypal.com", "paypal.co.uk", "paypal.in"],
    "netflix": ["netflix.com"],
    "chase": ["chase.com"],
    "dhl": ["dhl.com", "dhl.de", "dhl.co.in"],
    "facebook": ["facebook.com", "fb.com"],
    "instagram": ["instagram.com"],
    "linkedin": ["linkedin.com"],
    "spotify": ["spotify.com"],
    "zoom": ["zoom.us", "zoom.com"],
    "twitter": ["twitter.com", "x.com"],
    "yahoo": ["yahoo.com", "myyahoo.com"],
    "github": ["github.com", "github.io"],
    "dropbox": ["dropbox.com"],
    "wellsfargo": ["wellsfargo.com"],
    "bankofamerica": ["bankofamerica.com"],
    "flipkart": ["flipkart.com", "flipkart.in"],
    "paytm": ["paytm.com"]
}

FREE_EMAIL_PROVIDERS = [
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "protonmail.com", "mail.com", "zoho.com", "yandex.com"
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

def extract_domain(url: str) -> str:
    if not url:
        return ""
    url_to_parse = url
    if not (url.startswith("http://") or url.startswith("https://")):
        url_to_parse = "http://" + url
    try:
        parsed = urllib.parse.urlparse(url_to_parse)
        netloc = parsed.netloc.lower()
        if ":" in netloc:
            netloc = netloc.split(":")[0]
        if netloc.startswith("www."):
            netloc = netloc[4:]
        return netloc
    except Exception:
        return ""

def check_domain_for_spoofing(domain: str) -> dict:
    if not domain:
        return {"status": "Safe", "brand": None, "reason": "No domain provided"}
    
    for brand, officials in BRAND_DOMAINS.items():
        for official in officials:
            if domain == official or domain.endswith("." + official):
                return {"status": "Safe", "brand": brand, "reason": f"Official {brand.capitalize()} domain"}
                
    domain_clean = domain.replace("-", ".").replace("_", ".")
    segments = domain_clean.split(".")
    
    for brand, officials in BRAND_DOMAINS.items():
        if brand in domain:
            return {
                "status": "Typosquatting",
                "brand": brand,
                "reason": f"Contains '{brand}' but is not an official {brand.capitalize()} domain"
            }
            
        for segment in segments:
            if len(segment) >= 3:
                dist = levenshtein_distance(segment, brand)
                max_dist = 2 if len(brand) > 5 else 1
                if dist > 0 and dist <= max_dist:
                    return {
                        "status": "Typosquatting",
                        "brand": brand,
                        "reason": f"Spelling similarity '{segment}' to brand '{brand}' (typosquatting risk)"
                    }
                    
    return {"status": "Safe", "brand": None, "reason": "Safe/Standard domain"}

def analyze_sender_email(email: str) -> dict:
    if not email or "@" not in email:
        return {"status": "Unverified", "reason": "No sender email provided"}
        
    email = email.lower().strip()
    parts = email.split("@")
    if len(parts) != 2:
        return {"status": "Unverified", "reason": "Invalid email structure"}
        
    username, domain = parts
    
    domain_analysis = check_domain_for_spoofing(domain)
    if domain_analysis["status"] == "Typosquatting":
        return {
            "status": "Suspicious",
            "reason": f"Spoofing brand '{domain_analysis['brand'].capitalize()}' in domain name"
        }
        
    if domain in FREE_EMAIL_PROVIDERS:
        for brand in BRAND_DOMAINS.keys():
            if brand in username:
                return {
                    "status": "Suspicious",
                    "reason": f"Brand impersonation '{brand.capitalize()}' using free provider"
                }
        return {
            "status": "Unverified",
            "reason": "Standard free email address"
        }
        
    if domain_analysis["status"] == "Safe" and domain_analysis["brand"] is not None:
        return {
            "status": "Verified",
            "reason": f"Verified official {domain_analysis['brand'].capitalize()} domain"
        }
        
    return {
        "status": "Unverified",
        "reason": "Unverified third-party domain"
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

def query_gemini_expert_analysis(text: str, url: str, sender_email: str) -> Optional[dict]:
    if not GEMINI_API_KEY:
        return None
        
    prompt = (
        f"You are an expert cybersecurity threat intelligence analyst.\n"
        f"Analyze the following transaction to detect phishing, social engineering, or brand typosquatting:\n\n"
        f"Sender Email Address: {sender_email}\n"
        f"Embedded Link URL: {url}\n"
        f"Email Text / Content:\n{text}\n\n"
        f"Perform these assessments:\n"
        f"1. URL Typosquatting / Spoofing: Check if the domain name mimics a famous brand (e.g. 11flipkart.com mimics Flipkart, amazon00.com mimics Amazon, paytm-refunds.com mimics Paytm, etc.) but is not an official domain of that brand.\n"
        f"2. Sender Email Verification: Check if the sender is official, a suspicious brand impersonator (e.g., using a free mail like gmail/yahoo but has brand name support), or unverified.\n"
        f"3. Threat Score & Classification: Calculate a highly realistic, genuine threat percentage (0-100%) and classify as: 'Safe', 'Suspicious', or 'Phishing'.\n"
        f"4. Red Flags: Find any suspicious words (urgent, login, verify, password, etc.).\n"
        f"5. Explanatory Insight: Provide a 2-3 sentence clear educational micro-training explanation explaining the main red flags.\n\n"
        f"You must return your analysis strictly as a JSON object with this format. Do not write any markdown code blocks, text outside the JSON, or other comments. Just the raw JSON:\n"
        f"{{\n"
        f'  "is_phishing": true,\n'
        f'  "confidence_score": 92.5,\n'
        f'  "classification": "Phishing",\n'
        f'  "sender_verification": "Verified",\n'
        f'  "sender_analysis": "reasoning...",\n'
        f'  "url_verification": "Typosquatting",\n'
        f'  "url_analysis": "reasoning...",\n'
        f'  "suspicious_words": ["urgent", "verify"],\n'
        f'  "ai_explanation": "guided micro-training explanation..."\n'
        f"}}"
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
            timeout=8
        )
        data = response.json()
        if "candidates" in data and len(data["candidates"]) > 0:
            raw_content = data["candidates"][0]["content"]["parts"][0]["text"]
            cleaned = clean_json_string(raw_content)
            parsed = json.loads(cleaned)
            
            # Simple schema validation
            required_keys = [
                "is_phishing", "confidence_score", "classification", 
                "sender_verification", "sender_analysis", 
                "url_verification", "url_analysis", 
                "suspicious_words", "ai_explanation"
            ]
            if all(k in parsed for k in required_keys):
                return parsed
        return None
    except Exception as e:
        print(f"Gemini Expert Analysis error: {e}")
        return None

class AnalyzeRequest(BaseModel):
    text: str
    url: str = ""
    sender_email: str = ""

class AnalyzeResponse(BaseModel):
    is_phishing: bool
    confidence_score: float
    suspicious_words: list[str]
    classification: str
    ai_explanation: Optional[str] = None
    sender_verification: str
    sender_analysis: str
    url_verification: str
    url_analysis: str

SUSPICIOUS_KEYWORDS = ["urgent", "verify", "click here", "suspend", "password", "login", "unauthorized", "account", "update", "action required"]

@app.get("/")
def read_root():
    return {"status": "AI Service is running"}

def run_fallback_scanner(text: str, url: str, sender_email: str) -> dict:
    suspicious_words = []
    keywords = ["urgent", "verify", "click here", "suspend", "password", "login", "unauthorized", "account", "update", "action required", "billing", "reset", "free", "win", "claim", "refund", "invoice"]
    
    text_lower = text.lower()
    for w in keywords:
        if w in text_lower:
            suspicious_words.append(w)
            
    # Calculate base score from keywords
    score = 5.0
    if len(suspicious_words) == 1:
        score = 25.0
    elif len(suspicious_words) == 2:
        score = 45.0
    elif len(suspicious_words) >= 3:
        score = 65.0
        
    is_phishing = False
    classification = "Safe"
    sender_verification = "Unverified"
    sender_analysis = "Unverified domain name"
    url_verification = "Safe"
    url_analysis = "Safe destination domain"
    
    # 1. Analyze Sender Email
    if sender_email and "@" in sender_email:
        sender_email = sender_email.lower().strip()
        parts = sender_email.split("@")
        if len(parts) == 2:
            username, domain = parts
            domain_info = check_domain_for_spoofing(domain)
            
            if domain_info["status"] == "Typosquatting":
                sender_verification = "Suspicious"
                sender_analysis = domain_info["reason"]
                is_phishing = True
                score = max(score, 98.0)
            elif domain in FREE_EMAIL_PROVIDERS:
                is_impersonating = False
                for brand in BRAND_DOMAINS.keys():
                    if brand in username:
                        sender_verification = "Suspicious"
                        sender_analysis = f"Brand impersonation '{brand.capitalize()}' using free email account ({domain})"
                        is_phishing = True
                        score = max(score, 98.0)
                        is_impersonating = True
                        break
                if not is_impersonating:
                    sender_verification = "Unverified"
                    sender_analysis = "Standard free email address"
            elif domain_info["status"] == "Safe" and domain_info["brand"] is not None:
                sender_verification = "Verified"
                sender_analysis = f"Verified official {domain_info['brand'].capitalize()} domain"
            else:
                sender_verification = "Unverified"
                sender_analysis = "Unverified third-party domain"
                
    # 2. Analyze URL
    if url:
        url_lower = url.lower().strip()
        url_domain = extract_domain(url_lower)
        if not url_domain and "." in url_lower:
            url_domain = url_lower.replace("https://", "").replace("http://", "").split("/")[0]
            
        domain_info = check_domain_for_spoofing(url_domain)
        is_http = url_lower.startswith("http://")
        
        # Check IP address usage
        has_ip = re.search(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', url_lower)
        
        if domain_info["status"] == "Typosquatting":
            url_verification = "Typosquatting"
            url_analysis = domain_info["reason"]
            is_phishing = True
            score = max(score, 98.5)
            if is_http:
                url_analysis += " (Also uses insecure unencrypted HTTP protocol)"
        elif has_ip:
            url_verification = "Malicious"
            url_analysis = "URL uses raw numerical IP address instead of domain"
            is_phishing = True
            score = max(score, 95.0)
        elif is_http:
            url_verification = "Suspicious"
            url_analysis = "Uses insecure unencrypted HTTP connection. Legitimate brands always use secure HTTPS for credentials."
            is_phishing = True
            score = max(score, 82.0)
        elif domain_info["status"] == "Safe" and domain_info["brand"] is not None:
            url_verification = "Safe"
            url_analysis = domain_info["reason"]
        else:
            url_verification = "Unverified"
            url_analysis = "Unverified domain name"
            suspicious_url_keywords = ["login", "update", "verify", "secure", "free", "win", "claim", "reset", "billing", "invoice"]
            found_kw = []
            for kw in suspicious_url_keywords:
                if kw in url_lower:
                    found_kw.append(kw)
            if found_kw:
                url_verification = "Suspicious"
                url_analysis = f"Suspicious terms in URL path: {', '.join(found_kw)}"
                score = max(score, 45.0 + 10 * len(found_kw))
                
        # Check suspicious TLDs
        suspicious_tld_regex = r'\.(xyz|su|info|click|top|tk|cf|gq|ml|ga|work|bid|date|download)$'
        if re.search(suspicious_tld_regex, url_domain):
            score = max(score, 75.0)
            if url_verification == "Safe":
                url_verification = "Suspicious"
            url_analysis += " (Hosted on a high-risk suspicious TLD)"
            
    if is_phishing or score > 45.0:
        classification = "Phishing" if score > 70.0 else "Suspicious"
        is_phishing = True
    else:
        classification = "Safe"
        
    explanation = (
        f"Diagnostic Report: This scan analyzed the transaction elements against known phishing tactics. "
        f"The sender is classified as {sender_verification} ({sender_analysis}) and the URL is classified as {url_verification} ({url_analysis}). "
        f"Legitimate companies never use spoofed domains or ask for credentials over unencrypted connections."
    )
    
    return {
        "is_phishing": is_phishing,
        "confidence_score": round(score, 2),
        "suspicious_words": suspicious_words,
        "classification": classification,
        "ai_explanation": explanation,
        "sender_verification": sender_verification,
        "sender_analysis": sender_analysis,
        "url_verification": url_verification,
        "url_analysis": url_analysis
    }

@app.post("/predict", response_model=AnalyzeResponse)
def predict(req: AnalyzeRequest):
    # 1. First attempt structured Expert analysis via Gemini
    expert_analysis = query_gemini_expert_analysis(req.text, req.url, req.sender_email)
    
    if expert_analysis is not None:
        return AnalyzeResponse(
            is_phishing=bool(expert_analysis["is_phishing"]),
            confidence_score=round(float(expert_analysis["confidence_score"]), 2),
            suspicious_words=list(expert_analysis["suspicious_words"]),
            classification=str(expert_analysis["classification"]),
            ai_explanation=str(expert_analysis["ai_explanation"]),
            sender_verification=str(expert_analysis["sender_verification"]),
            sender_analysis=str(expert_analysis["sender_analysis"]),
            url_verification=str(expert_analysis["url_verification"]),
            url_analysis=str(expert_analysis["url_analysis"])
        )
        
    # 2. Fallback to Local Heuristics scanner (Guarantees absolute consistency)
    fallback_res = run_fallback_scanner(req.text, req.url, req.sender_email)
    
    return AnalyzeResponse(
        is_phishing=fallback_res["is_phishing"],
        confidence_score=fallback_res["confidence_score"],
        suspicious_words=fallback_res["suspicious_words"],
        classification=fallback_res["classification"],
        ai_explanation=fallback_res["ai_explanation"],
        sender_verification=fallback_res["sender_verification"],
        sender_analysis=fallback_res["sender_analysis"],
        url_verification=fallback_res["url_verification"],
        url_analysis=fallback_res["url_analysis"]
    )

