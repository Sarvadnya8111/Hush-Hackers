
import { GoogleGenAI, Type } from "@google/genai";
import { FraudDNA, RegistryResponse } from "../types";

const SYSTEM_INSTRUCTION = `You are the FraudGenome Behavioral Engine v3.0. Your primary objective is to differentiate between Legitimate/Trusted communications and Fraudulent/Spam tactics with surgical precision.

### CORE BEHAVIORAL RUBRIC

#### 1. THE "SAFE" PROFILE (Risk Score: 0-20)
- **Tone**: Informational, professional, consistent, and respectful.
- **Urgency**: No "immediate" threats. Standard billing cycles or routine updates.
- **Identity**: Consistent with the sender's stated domain. No spoofing.
- **Action**: Directs user to known official portals (e.g., "Log in to your dashboard" without a hidden link).
- **Markers**: "Thank you for being a customer", "Your monthly statement is ready", "Newsletter update".

#### 2. THE "SPAM/SUSPICIOUS" PROFILE (Risk Score: 21-60)
- **Tone**: Salesy, generic, or slightly off-brand.
- **Urgency**: "Limited time offer", "Don't miss out".
- **Action**: Excessive links, "Click here" buttons, tracking pixels.
- **Markers**: Unsolicited marketing, newsletter without unsubscribe, "Win $500".

#### 3. THE "FRAUD/SCAM" PROFILE (Risk Score: 61-100)
- **Tone**: High-pressure, fear-inducing, or overly friendly (love bombing).
- **Urgency**: "ACCOUNT SUSPENDED", "LEGAL ACTION PENDING", "OTP REQUIRED NOW".
- **Tactics**: 
    - Authority Impersonation (Banks, Tax Dept, Police).
    - Technical Support Scams (Virus detected).
    - Advance Fee (Lottery, Inheritance).
    - Data Phishing (Verification required).
- **Markers**: Poor grammar, mismatched email headers, requests for sensitive data, unusual attachments.

### OUTPUT REQUIREMENTS:
- **Accuracy**: If an email is a standard "Welcome to the team" or "Meeting invitation", it MUST be scored below 10.
- **Logic**: Explain the reasoning in the 'threat_indicators' field.
- **Registry**: When 'MODE: REGISTRY' is requested, provide the Repeat Offender list using 'demo_entries'.

KNOWN REPEAT OFFENDER REGISTRY:
- Julian Vance (j.vance88@example-mail.com)
- Elena Rios (elena.rios.test@mocklink.net)
- Marcus Chen (mchen_92@fakespace.org)
- Sarah Jenkins (s.jenkins.dev@demo-inbox.com)
- Arlo Sterling (asterling_44@sample-net.io)
- Fiona Gallagher (fiona.g.test@example-mail.com)
- Silas Thorne (sthorne_alpha@mocklink.net)
- Nadia Petrov (nadia.p89@fakespace.org)
- Victor Hugo (v.hugo.demo@demo-inbox.com)
- Maya Patel (mpatel_dev@sample-net.io)
- Leo Maxwell (l.maxwell21@example-mail.com)
- Clara Oswald (c.oswald.test@mocklink.net)
- Dante Alighieri (dante_alpha@fakespace.org)
- Ivy Winters (i.winters.demo@demo-inbox.com)
- Oscar Wilde (owilde_dev@sample-net.io)`;

/**
 * Initialize the Gemini client using the mandatory process.env.API_KEY.
 */
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchRegistryDemo = async (): Promise<RegistryResponse> => {
  const ai = getAI();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "MODE: REGISTRY. Output 10 unique entries from the Repeat Offender list into the 'demo_entries' JSON array.",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          demo_entries: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                flag_id: { type: Type.STRING },
                email_address: { type: Type.STRING },
                impersonates: { type: Type.STRING },
                total_victims_reported: { type: Type.INTEGER },
                total_emails_sent: { type: Type.INTEGER },
                risk_score: { type: Type.INTEGER },
                risk_level: { type: Type.STRING },
                risk_color: { type: Type.STRING },
                risk_badge: { type: Type.STRING },
                confidence_score: { type: Type.INTEGER },
                scam_types_used: { type: Type.ARRAY, items: { type: Type.STRING } },
                threat_summary: { type: Type.STRING }
              },
              required: ["flag_id", "email_address", "risk_score", "risk_level"]
            }
          }
        }
      }
    }
  });

  const rawText = response.text.trim();
  try {
    const data = JSON.parse(rawText) as RegistryResponse;
    if (!data.demo_entries && (data as any).flagged_senders) {
      data.demo_entries = (data as any).flagged_senders;
    }
    return data;
  } catch (e) {
    console.error("Registry parse error", e);
    throw new Error("Unable to sync with the global threat registry.");
  }
};

export const analyzeFraudText = async (text: string, image?: { data: string; mimeType: string }): Promise<FraudDNA> => {
  const ai = getAI();

  const userParts: any[] = [];
  if (image) {
    userParts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
  }
  userParts.push({ text: `Analyze this content for behavioral Fraud DNA. If it is a routine, professional, or standard transactional message, give it a very low score (0-15). If it uses manipulation tactics, give it a high score. Content: ${text}` });

  const response = await ai.models.generateContent({
    // Use gemini-3-pro-preview for complex reasoning and threat analysis
    model: 'gemini-3-pro-preview',
    contents: { parts: userParts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          timestamp: { type: Type.STRING },
          analysis_type: { type: Type.STRING },
          scam_type: { type: Type.STRING },
          scam_family: { type: Type.STRING },
          risk_score: { type: Type.INTEGER },
          risk_level: { type: Type.STRING },
          threat_indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
          primary_emotion: { type: Type.STRING },
          urgency_level: { type: Type.STRING },
          manipulation_tactics: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommended_action: { type: Type.STRING },
          prevention_tip: { type: Type.STRING },
          report_authority: { type: Type.STRING },
          verdict: { type: Type.STRING },
          impersonation_entity: { type: Type.STRING },
          email_metadata: {
            type: Type.OBJECT,
            properties: {
              sender_domain: { type: Type.STRING },
              sender_verdict: { type: Type.STRING },
              sender_trust_score: { type: Type.NUMBER },
              is_trusted_sender: { type: Type.BOOLEAN },
              domain_spoofing_detected: { type: Type.BOOLEAN },
              display_name_mismatch: { type: Type.BOOLEAN }
            }
          }
        },
        required: ["risk_score", "scam_type", "verdict", "risk_level"]
      }
    }
  });

  const raw = response.text.trim();
  try {
    const result = JSON.parse(raw);
    result.id = result.id || `DNA-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    result.timestamp = result.timestamp || new Date().toISOString();
    
    // Safety check for risk levels based on score
    if (result.risk_score <= 20) result.risk_level = 'LOW';
    else if (result.risk_score <= 60) result.risk_level = 'MEDIUM';
    else if (result.risk_score <= 85) result.risk_level = 'HIGH';
    else result.risk_level = 'CRITICAL';

    return result as FraudDNA;
  } catch (e) {
    console.error("Analysis parse error", e);
    throw new Error("The intelligence engine encountered an error parsing this message.");
  }
};
