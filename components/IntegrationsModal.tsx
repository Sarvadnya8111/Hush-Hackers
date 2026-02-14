import React, { useState } from 'react';
import { X, Copy, Check, Code, Play } from 'lucide-react';

interface IntegrationsModalProps {
  onClose: () => void;
}

const APPS_SCRIPT_CODE = `// ================================================================
// FRAUDGENOME GMAIL AUTO-MONITOR
// Paste this entire file into script.google.com
// ================================================================

const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
const ALERT_EMAIL    = 'YOUR_ALERT_EMAIL';
const LABEL_FRAUD    = 'FraudGenome/FRAUD-DETECTED';
const LABEL_SAFE     = 'FraudGenome/VERIFIED-SAFE';
const LABEL_SUSPECT  = 'FraudGenome/SUSPICIOUS';
const CHECK_HOURS    = 1; // scan emails from last N hours

// ── YARA Dictionary ──
const YARA = {
  5: ['lottery winner','you have won','claim your prize','urgent action required',
      'account suspended','bank account update','verify your identity',
      'social security number','otp verification','login credentials',
      'guaranteed returns','double your money','send money urgently'],
  4: ['jackpot','reward notification','verify immediately','final warning',
      'confirm your payment','refund pending','transaction failed',
      'update your password','package delivery failed','customs clearance fee',
      'easy money','download attachment','reset your account','security alert',
      'military officer abroad'],
  3: ['limited time offer','crypto investment','track your shipment',
      'work from home opportunity','click the link below']
};

const TRUSTED_DOMAINS = [
  'google.com','gmail.com','amazon.com','amazon.in','sbi.co.in',
  'hdfcbank.com','icicibank.com','irctc.co.in','incometax.gov.in',
  'gov.in','nic.in','npci.org.in','uidai.gov.in','flipkart.com',
  'paytm.com','phonepe.com','zomato.com','swiggy.in'
];

// ── ENTRY POINT: called by time-trigger ──
function scanInbox() {
  ensureLabels();
  const since = new Date(Date.now() - CHECK_HOURS * 60 * 60 * 1000);
  const threads = GmailApp.search('is:unread newer_than:1h', 0, 30);
  let alertCount = 0;

  threads.forEach(thread => {
    const msg   = thread.getMessages()[0];
    const msgId = msg.getId();
    if (wasAlreadyScanned(msgId)) return;

    const emailData = {
      sender:  msg.getFrom(),
      subject: msg.getSubject(),
      body:    msg.getPlainBody().substring(0, 2000)
    };

    const dna = analyzeWithGemini(emailData);
    if (!dna) return;

    markEmailScanned(msgId);
    applyGmailLabel(thread, dna.verdict);

    if (dna.should_alert) {
      sendFraudAlert(emailData, dna);
      alertCount++;
    }

    logResult(emailData, dna);
  });

  console.log('Scan complete. Alerts sent: ' + alertCount);
}

// ── Call Gemini API ──
function analyzeWithGemini(emailData) {
  const prompt = buildPrompt(emailData);
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY;

  const payload = {
    system_instruction: { parts: [{ text: getSystemPrompt() }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
  };

  try {
    const res  = UrlFetchApp.fetch(url, {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    const json = JSON.parse(res.getContentText());
    let   raw  = json.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    raw = raw.replace(/\\\`\\\`\\\`json|\\\`\\\`\\\`/g, '').trim();
    return JSON.parse(raw);
  } catch(e) {
    console.error('Gemini error:', e.message);
    return null;
  }
}

// ── Build prompt for each email ──
function buildPrompt(e) {
  return 'Analyze this email and return Fraud DNA JSON:\\\\n\\\\n' +
    'SENDER: ' + e.sender + '\\\\n' +
    'SUBJECT: ' + e.subject + '\\\\n' +
    'BODY: ' + e.body;
}

// ── Send fraud alert email ──
function sendFraudAlert(email, dna) {
  const priority = dna.alert_priority;
  const emoji    = priority === 'URGENT' ? '🚨' : priority === 'HIGH' ? '⚠️' : '⚡';
  const subject  = emoji + ' FraudGenome Alert [' + priority + ']: ' + dna.scam_type + ' detected — ' + dna.risk_score + '/100';

  const body = \`
FRAUDGENOME GMAIL INTELLIGENCE ALERT
=====================================
Detected At : \${new Date().toLocaleString('en-IN')}
Alert Level : \${dna.alert_priority}
Verdict     : \${dna.verdict}

── ORIGINAL EMAIL ──
From    : \${email.sender}
Subject : \${email.subject}

── FRAUD DNA ──
DNA ID          : \${dna.id}
Risk Score      : \${dna.risk_score}/100
Risk Level      : \${dna.risk_level}
Scam Type       : \${dna.scam_type}
Scam Family     : \${dna.scam_family}
Primary Emotion : \${dna.primary_emotion}
Urgency Level   : \${dna.urgency_level}

── SENDER ANALYSIS ──
Sender Domain        : \${dna.email_metadata?.sender_domain}
Sender Verdict       : \${dna.email_metadata?.sender_verdict}
Domain Spoofing      : \${dna.email_metadata?.domain_spoofing_detected ? 'YES ⚠️' : 'No'}
Display Name Mismatch: \${dna.email_metadata?.display_name_mismatch ? 'YES ⚠️' : 'No'}

── YARA KEYWORD MATCHES ──
\${(dna.matched_keywords || []).map(k => '• ' + k.keyword + ' [Risk ' + k.risk_level + '/5] in ' + k.found_in).join('\\\\n') || 'None'}

── THREAT INDICATORS ──
\${(dna.threat_indicators || []).map(t => '• ' + t).join('\\\\n') || 'None'}

── SUSPICIOUS CONTENT ──
URLs    : \${(dna.suspicious_urls || []).join(', ') || 'None'}
Numbers : \${(dna.suspicious_numbers || []).join(', ') || 'None'}

── RISK FLAGS ──
Financial Threat  : \${dna.financial_threat ? '✅ YES' : 'No'}
Data Theft Risk   : \${dna.data_theft_risk ? '✅ YES' : 'No'}
Identity Theft    : \${dna.identity_theft_risk ? '✅ YES' : 'No'}
Malware Risk      : \${dna.malware_risk ? '✅ YES' : 'No'}

── WHAT YOU SHOULD DO ──
\${dna.recommended_action}

── REPORT TO ──
\${dna.report_authority}

── AI ANALYSIS NOTES ──
\${dna.analysis_notes}

────────────────────────────────────
This alert was generated automatically by FraudGenome Gmail Intelligence.
DNA Fingerprint: \${dna.similarity_fingerprint} | Confidence: \${dna.confidence_score}%
\`;

  GmailApp.sendEmail(ALERT_EMAIL, subject, body);
  console.log('Alert sent for: ' + email.subject);
}

// ── Apply Gmail label based on verdict ──
function applyGmailLabel(thread, verdict) {
  const labelName = verdict === 'SAFE' || verdict === 'LOW_RISK'
    ? LABEL_SAFE
    : verdict === 'SUSPICIOUS'
    ? LABEL_SUSPECT
    : LABEL_FRAUD;

  const label = GmailApp.getUserLabelByName(labelName);
  if (label) thread.addLabel(label);
}

// ── Track scanned message IDs to avoid duplicate alerts ──
function wasAlreadyScanned(msgId) {
  const props = PropertiesService.getScriptProperties();
  return props.getProperty('scanned_' + msgId) === 'true';
}

function markEmailScanned(msgId) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('scanned_' + msgId, 'true');
}

// ── Create Gmail labels on first run ──
function ensureLabels() {
  [LABEL_FRAUD, LABEL_SAFE, LABEL_SUSPECT].forEach(name => {
    if (!GmailApp.getUserLabelByName(name)) {
      GmailApp.createLabel(name);
    }
  });
}

// ── Log to spreadsheet (optional) ──
function logResult(email, dna) {
  try {
    const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID');
    if (!sheet) return;
    const ws = sheet.getSheetByName('FraudLog') || sheet.insertSheet('FraudLog');
    if (ws.getLastRow() === 0) {
      ws.appendRow(['Timestamp','DNA ID','Verdict','Risk Score','Scam Type','Sender','Subject','Alert Sent']);
    }
    ws.appendRow([
      new Date(), dna.id, dna.verdict, dna.risk_score,
      dna.scam_type, email.sender, email.subject, dna.should_alert
    ]);
  } catch(e) {
    console.log('Spreadsheet logging skipped (optional).');
  }
}

// ── System prompt for Gemini ──
function getSystemPrompt() {
  return \`You are FraudGenome Gmail Intelligence AI. Analyze emails and return ONLY valid JSON.
YARA KEYWORDS - Risk5: lottery winner, you have won, claim your prize, urgent action required, account suspended, bank account update, verify your identity, social security number, otp verification, login credentials, guaranteed returns, double your money, send money urgently
Risk4: jackpot, reward notification, verify immediately, final warning, confirm your payment, refund pending, transaction failed, update your password, package delivery failed, customs clearance fee, easy money, download attachment, reset your account, security alert, military officer abroad
Risk3: limited time offer, crypto investment, track your shipment, work from home opportunity, click the link below
TRUSTED DOMAINS: google.com, amazon.com, amazon.in, sbi.co.in, hdfcbank.com, icicibank.com, gov.in, nic.in
Return exactly this JSON schema with all fields:
{\\"id\\":\\"FD-XXXXXX\\",\\"timestamp\\":\\"ISO8601\\",\\"analysis_type\\":\\"EMAIL\\",\\"email_metadata\\":{\\"sender_address\\":\\"\\",\\"sender_display_name\\":\\"\\",\\"sender_domain\\":\\"\\",\\"is_trusted_sender\\":false,\\"domain_spoofing_detected\\":false,\\"display_name_mismatch\\":false,\\"sender_trust_score\\":0,\\"sender_verdict\\":\\"TRUSTED|SUSPICIOUS|DANGEROUS|UNKNOWN\\"},\\"risk_score\\":0,\\"risk_level\\":\\"LOW|MEDIUM|HIGH|CRITICAL\\",\\"dictionary_score\\":0,\\"behavioral_score\\":0,\\"sender_adjustment\\":0,\\"matched_keywords\\":[],\\"scam_type\\":\\"\\",\\"scam_family\\":\\"\\",\\"fraud_category\\":\\"\\",\\"emotion\\":[],\\"primary_emotion\\":\\"\\",\\"manipulation_tactics\\":[],\\"keywords\\":[],\\"trigger_phrases\\":[],\\"suspicious_urls\\":[],\\"suspicious_numbers\\":[],\\"tone\\":\\"\\",\\"language\\":\\"\\",\\"urgency_level\\":\\"LOW|MEDIUM|HIGH|EXTREME\\",\\"target_group\\":\\"\\",\\"target_platform\\":\\"Email\\",\\"threat_indicators\\":[],\\"impersonation_entity\\":\\"\\",\\"action_demanded\\":\\"\\",\\"financial_threat\\":false,\\"data_theft_risk\\":false,\\"identity_theft_risk\\":false,\\"malware_risk\\":false,\\"similarity_fingerprint\\":\\"\\",\\"fraud_evolution_stage\\":\\"\\",\\"verdict\\":\\"SAFE|LOW_RISK|SUSPICIOUS|PHISHING|CRITICAL_THREAT\\",\\"should_alert\\":false,\\"alert_priority\\":\\"NONE|LOW|MEDIUM|HIGH|URGENT\\",\\"recommended_action\\":\\"\\",\\"report_authority\\":\\"\\",\\"prevention_tip\\":\\"\\",\\"confidence_score\\":0,\\"analysis_notes\\":\\"\\"}
RETURN ONLY JSON. NOTHING ELSE.\`;
}

// ── First-time setup: create time trigger ──
function setup() {
  // Delete existing triggers
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  // Create new 15-minute trigger
  ScriptApp.newTrigger('scanInbox')
    .timeBased()
    .everyMinutes(15)
    .create();
  ensureLabels();
  console.log('FraudGenome Gmail Monitor activated. Scanning every 15 minutes.');
  console.log('Labels created: FraudGenome/FRAUD-DETECTED, FraudGenome/VERIFIED-SAFE, FraudGenome/SUSPICIOUS');
}`;

export default function IntegrationsModal({ onClose }: IntegrationsModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code className="w-6 h-6 text-indigo-500" />
              Gmail Auto-Monitor Integration
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Connect FraudGenome Intelligence directly to your personal Gmail inbox.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
           
           <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30 p-4 rounded-xl">
             <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest mb-2">How it works</h3>
             <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
               This Google Apps Script runs automatically in your Google Cloud account. It scans your unread emails every 15 minutes using the Gemini API and labels them as 
               <span className="font-mono text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded mx-1">VERIFIED-SAFE</span>, 
               <span className="font-mono text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded mx-1">SUSPICIOUS</span>, or 
               <span className="font-mono text-xs bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded mx-1">FRAUD-DETECTED</span>.
             </p>
           </div>

           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">1</div>
                 <div className="text-sm text-slate-600 dark:text-slate-300">
                    Go to <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">script.google.com</a> and click <strong>New Project</strong>.
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">2</div>
                 <div className="text-sm text-slate-600 dark:text-slate-300">
                    Delete the default code and paste the script below entirely.
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">3</div>
                 <div className="text-sm text-slate-600 dark:text-slate-300">
                    Replace <span className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-1 rounded">YOUR_GEMINI_API_KEY</span> with your actual API key.
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">4</div>
                 <div className="text-sm text-slate-600 dark:text-slate-300">
                    Run the <span className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-1 rounded flex-inline items-center gap-1"><Play className="w-3 h-3 inline" /> setup</span> function once to authorize Gmail permissions.
                 </div>
              </div>
           </div>

           <div className="relative group">
              <div className="absolute top-4 right-4 z-10">
                 <button 
                   onClick={handleCopy}
                   className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors shadow-lg"
                 >
                   {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                   {copied ? 'Copied!' : 'Copy Code'}
                 </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-300 rounded-xl overflow-x-auto text-xs font-mono border border-slate-800 h-64 custom-scrollbar">
                <code>{APPS_SCRIPT_CODE}</code>
              </pre>
           </div>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
           >
             Done
           </button>
        </div>
      </div>
    </div>
  );
}