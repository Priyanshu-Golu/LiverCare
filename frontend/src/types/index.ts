export interface User {
  id: number;
  username: string;
  email: string;
  role: 'patient' | 'clinician';
  first_name: string;
  last_name: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: 'patient' | 'clinician';
}

export interface Prediction {
  id: number;
  created_at: string;
  features: Record<string, any>;
  result: number;
  confidence: number;
  status: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export interface Hospital {
  id: number;
  name: string;
  address: string;
  phone: string;
  specialty: string;
}

export interface ConsentStatus {
  id: number;
  user: number;
  consent_given: boolean;
  consent_date: string | null;
  consent_type: string;
}

export interface AdminMetrics {
  total_patients: number;
  total_predictions: number;
  predictions_today: number;
  accuracy_rate: number;
  active_users: number;
}