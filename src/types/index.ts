export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface ICEContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface Pathology {
  id: string;
  name: string;
  severity: 'Crítica' | 'Moderada' | 'Leve';
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  scheduleTime: string;
  takenToday: boolean;
}

export interface MedicalStudy {
  id: string;
  title: string;
  category: 'Radiografía' | 'Laboratorio' | 'Cardiología' | 'Informe';
  date: string;
  doctor: string;
  institution: string;
  minioKey: string;
  fileSize: string;
  downloadUrl: string;
}

export interface UserProfile {
  id: string;
  tokenCode: string;
  fullName: string;
  alias: string;
  dni: string;
  birthDate: string;
  bloodType: BloodType;
  organDonor: boolean;
  medicalInsurance: string;
  affiliateNumber: string;
  pathologies: Pathology[];
  allergies: string[];
  medications: Medication[];
  iceContacts: ICEContact[];
  studies: MedicalStudy[];
  tokenStatus: 'ACTIVO' | 'REVOCADO';
  consentLey25326: boolean;
  lastUpdated: string;
}

export interface EmergencyEvent {
  id: string;
  tokenCode: string;
  patientAlias: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  address: string;
  eventType: 'SAME' | 'ICE_FAMILIAR';
  status: 'DESPACHADO' | 'EN_CAMINO' | 'RESUELTO';
  assignedUnit?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: 'Médico SAME' | 'Enfermero Triage' | 'Auditor Obra Social' | 'Desconocido';
  institution: string;
  targetPatientAlias: string;
  action: string;
  ipAddress: string;
  aiAnomalyScore: number; // 0 to 100
  aiFlagged: boolean;
  aiReason?: string;
}

export interface PredictiveRiskZone {
  id: string;
  zoneName: string;
  lat: number;
  lng: number;
  riskLevel: 'ALTO' | 'MEDIO' | 'BAJO';
  predictedIncidents: number;
  peakTime: string;
  suggestedAmbulanceStation: string;
  mainRiskFactors: string[];
}
