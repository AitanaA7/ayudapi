import { UserProfile, EmergencyEvent, AuditLog, PredictiveRiskZone } from '@/types';

export const mockUserProfile: UserProfile = {
  id: 'usr_8921',
  tokenCode: 'AYUD-8921-QR',
  fullName: 'Carlos Alberto Rossi',
  alias: 'Carlos R.',
  dni: '32.450.891',
  birthDate: '1986-04-14',
  bloodType: 'O+',
  organDonor: true,
  medicalInsurance: 'OSDE 310',
  affiliateNumber: '4892019482-01',
  tokenStatus: 'ACTIVO',
  consentLey25326: true,
  lastUpdated: '2026-08-10 14:30',
  pathologies: [
    { id: 'p1', name: 'DIABÉTICO - INSULINODEPENDIENTE (Tipo 1)', severity: 'Crítica', notes: 'Requiere monitoreo glucémico inmediato en convulsión/inconsciencia' },
    { id: 'p2', name: 'HIPERTENSIÓN ARTERIAL CRÓNICA', severity: 'Moderada', notes: 'Bajo tratamiento continuo' }
  ],
  allergies: [
    'ALÉRGICO A LA PENICILINA (SHOCK ANAFILÁCTICO)',
    'DERIVADOS DE SULFAS'
  ],
  medications: [
    { id: 'm1', name: 'Insulina Glargina (Lantus)', dosage: '22 UI', frequency: 'Cada 24 hs (Noche)', scheduleTime: '22:00', takenToday: true },
    { id: 'm2', name: 'Insulina Aspártica (Novorapid)', dosage: 'Pre-comidas', frequency: '3 veces al día', scheduleTime: '13:00', takenToday: false },
    { id: 'm3', name: 'Enalapril 10mg', dosage: '1 comprimido', frequency: 'Cada 12 hs', scheduleTime: '08:00', takenToday: true }
  ],
  iceContacts: [
    { id: 'c1', name: 'María Laura Rossi', relationship: 'Esposa (Contacto Primario ICE)', phone: '+54 9 11 5432-8901', isPrimary: true },
    { id: 'c2', name: 'Dr. Fernando Gómez', relationship: 'Médico de Cabecera (Diabetólogo)', phone: '+54 9 11 4981-2200', isPrimary: false }
  ],
  studies: [
    {
      id: 'st_01',
      title: 'Electrocardiograma de Control',
      category: 'Cardiología',
      date: '2026-06-15',
      doctor: 'Dr. Fernando Gómez',
      institution: 'Hospital Italiano de Buenos Aires',
      minioKey: 'studies/usr_8921/ecg_2026_06.pdf',
      fileSize: '2.4 MB',
      downloadUrl: 'https://minio.internal.ayudapi.org/buckets/medical-records/usr_8921/ecg_2026_06.pdf?X-Amz-Expires=300'
    },
    {
      id: 'st_02',
      title: 'Hemograma Completo y HbA1c (7.2%)',
      category: 'Laboratorio',
      date: '2026-07-02',
      doctor: 'Dra. Patricia Varela',
      institution: 'Laboratorio Stamboulian',
      minioKey: 'studies/usr_8921/lab_hba1c_2026.pdf',
      fileSize: '1.1 MB',
      downloadUrl: 'https://minio.internal.ayudapi.org/buckets/medical-records/usr_8921/lab_hba1c_2026.pdf?X-Amz-Expires=300'
    },
    {
      id: 'st_03',
      title: 'Radiografía de Tórax F y P',
      category: 'Radiografía',
      date: '2026-03-20',
      doctor: 'Dr. Roberto Fernández',
      institution: 'Sanatorio Güemes',
      minioKey: 'studies/usr_8921/rx_torax.dcm',
      fileSize: '14.8 MB',
      downloadUrl: 'https://minio.internal.ayudapi.org/buckets/medical-records/usr_8921/rx_torax.dcm?X-Amz-Expires=300'
    }
  ]
};

export const mockEmergencyEvents: EmergencyEvent[] = [
  {
    id: 'emg_101',
    tokenCode: 'AYUD-8921-QR',
    patientAlias: 'Carlos R.',
    timestamp: '2026-08-11 21:15:02',
    latitude: -34.6037,
    longitude: -58.3816,
    address: 'Av. Corrientes y Florida, San Nicolás, CABA',
    eventType: 'SAME',
    status: 'EN_CAMINO',
    assignedUnit: 'Móvil SAME #42 (Base Durand)'
  },
  {
    id: 'emg_102',
    tokenCode: 'AYUD-4410-QR',
    patientAlias: 'Lucía M.',
    timestamp: '2026-08-11 20:42:19',
    latitude: -34.5889,
    longitude: -58.4103,
    address: 'Plaza Italia, Palermo, CABA',
    eventType: 'ICE_FAMILIAR',
    status: 'RESUELTO',
    assignedUnit: 'Contacto Familiar Avisado'
  },
  {
    id: 'emg_103',
    tokenCode: 'AYUD-9923-QR',
    patientAlias: 'Esteban P.',
    timestamp: '2026-08-11 19:10:44',
    latitude: -34.6181,
    longitude: -58.4411,
    address: 'Estación Acoyte, Caballito, CABA',
    eventType: 'SAME',
    status: 'RESUELTO',
    assignedUnit: 'Móvil SAME #18 (Base Ramos Mejía)'
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'log_901',
    timestamp: '2026-08-11 21:16:10',
    actorName: 'Dra. Carmen Benítez (MN 114.920)',
    actorRole: 'Médico SAME',
    institution: 'Central SAME CABA (Ambulancia #42)',
    targetPatientAlias: 'Carlos R. (AYUD-8921-QR)',
    action: 'Acceso Nivel 3 - Datos Sanitarios Extendidos + MinIO URL Estudios',
    ipAddress: '190.210.45.12 (SAME Mobile Gateway)',
    aiAnomalyScore: 4,
    aiFlagged: false,
    aiReason: 'Acceso legítimo por despacho de alerta de emergencia geolocalizada'
  },
  {
    id: 'log_902',
    timestamp: '2026-08-11 18:05:22',
    actorName: 'Sistema API Gateway (Desconocido)',
    actorRole: 'Desconocido',
    institution: 'IP Externa No Registrada (VPN)',
    targetPatientAlias: 'Ráfaga de 140 Perfiles Médicos',
    action: 'Intento de consulta masiva por API Nivel 3 sin token JWT firmado',
    ipAddress: '45.182.190.5 (Servidor No Autorizado)',
    aiAnomalyScore: 98,
    aiFlagged: true,
    aiReason: 'ALERTA IA SEGURIDAD: Frecuencia anómala de barrido de tokens (+120 requ/min). Bloqueo automático activado (Ley 25.326).'
  },
  {
    id: 'log_903',
    timestamp: '2026-08-11 16:30:15',
    actorName: 'Lic. Matías Sola',
    actorRole: 'Auditor Obra Social',
    institution: 'OSDE Casa Central',
    targetPatientAlias: 'Informe de Siniestralidad Agregado (Anonimizado)',
    action: 'Consulta Nivel 4 - Estadísticas de Afecciones por Zona',
    ipAddress: '200.55.12.99',
    aiAnomalyScore: 2,
    aiFlagged: false,
    aiReason: 'Acceso analítico anonimizado dentro de rango de trabajo'
  }
];

export const mockPredictiveZones: PredictiveRiskZone[] = [
  {
    id: 'pz_1',
    zoneName: 'Nodo Microcentro / Constitución (CABA)',
    lat: -34.6037,
    lng: -58.3816,
    riskLevel: 'ALTO',
    peakTime: '17:00 - 20:00 (Hora Pico)',
    predictedIncidents: 14,
    suggestedAmbulanceStation: 'Retén Móvil SAME Plaza de Mayo',
    mainRiskFactors: ['Alta densidad peatonal', 'Afecciones cardíacas por estrés térmico/físico', 'Tráfico elevado']
  },
  {
    id: 'pz_2',
    zoneName: 'Nodo Palermo / Plaza Italia',
    lat: -34.5889,
    lng: -58.4103,
    riskLevel: 'MEDIO',
    peakTime: '12:00 - 15:00',
    predictedIncidents: 8,
    suggestedAmbulanceStation: 'Base Ambulancia Rivadavia',
    mainRiskFactors: ['Eventos al aire libre', 'Deshidratación / Glucemia']
  },
  {
    id: 'pz_3',
    zoneName: 'Nodo Liniers / Estación Transferencia',
    lat: -34.6401,
    lng: -58.5276,
    riskLevel: 'ALTO',
    peakTime: '07:00 - 09:30',
    predictedIncidents: 11,
    suggestedAmbulanceStation: 'Móvil de Apoyo Santojanni',
    mainRiskFactors: ['Transbordo masivo de pasajeros', 'Incidentes cardiovasculares']
  }
];
