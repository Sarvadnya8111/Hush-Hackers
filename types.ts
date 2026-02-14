
export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  dob: string;
  idType?: string;
  idNumber?: string;
  isVerified?: boolean;
}

export interface FraudDNA {
  id: string;
  timestamp: string;
  analysis_type: string;
  scam_type: string;
  scam_family: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  threat_indicators: string[];
  primary_emotion: string;
  urgency_level: string;
  manipulation_tactics: string[];
  recommended_action: string;
  prevention_tip: string;
  report_authority: string;
  verdict: string;
  impersonation_entity?: string;
  flag_score?: number;
  risk_color?: string;
  risk_badge?: string;
  email_metadata?: {
    sender_domain: string;
    sender_verdict: 'TRUSTED' | 'SUSPICIOUS' | 'DANGEROUS' | 'UNKNOWN';
    sender_trust_score: number;
    is_trusted_sender: boolean;
    domain_spoofing_detected: boolean;
    display_name_mismatch: boolean;
  };
}

export interface FlagEntry {
  flag_id: string;
  email_address: string;
  impersonates?: string;
  total_victims_reported: number;
  total_emails_sent: number;
  risk_score: number;
  risk_level: string;
  risk_color: string;
  risk_badge: string;
  confidence_score: number;
  scam_types_used: string[];
  threat_summary: string;
  linked_phone_numbers?: string[];
  linked_upi_ids?: string[];
  linked_domains?: string[];
  domain_type?: string;
}

export interface RegistryResponse {
  demo_entries?: FlagEntry[];
  flagged_senders?: FlagEntry[];
}

export interface AnalysisState {
  loading: boolean;
  data: FraudDNA | null;
  registry: RegistryResponse | null;
  error: string | null;
}
