'use client';

import React, { useState } from 'react';
import PrototypeNav from '@/components/PrototypeNav';
import { mockUserProfile, mockEmergencyEvents } from '@/data/mockData';
import { 
  Stethoscope, FileText, Download, ShieldCheck, Database, 
  ExternalLink, Lock, CheckCircle2, Copy, FileSpreadsheet, Eye, UserCheck
} from 'lucide-react';

export default function MedicProfessionalView() {
  const [profile] = useState(mockUserProfile);
  const [selectedStudy, setSelectedStudy] = useState<string | null>(null);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const jsonPayload = {
    interoperabilityStandard: "HL7-FHIR-v4.0.1 / AyudAPI-Nivel3",
    timestamp: new Date().toISOString(),
    ambulanceUnit: "Móvil SAME #42 (Base Durand)",
    certifiedDoctor: "Dra. Carmen Benítez (MN 114.920)",
    patient: {
      fullName: profile.fullName,
      dni: profile.dni,
      bloodType: profile.bloodType,
      organDonor: profile.organDonor,
      medicalInsurance: profile.medicalInsurance,
      affiliateNumber: profile.affiliateNumber,
      pathologies: profile.pathologies,
      allergies: profile.allergies,
      medications: profile.medications
    },
    minioObjectStorage: {
      bucket: "medical-records",
      presignedUrls: profile.studies.map(s => ({
        title: s.title,
        key: s.minioKey,
        expiresInSeconds: 300,
        url: s.downloadUrl
      }))
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonPayload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <PrototypeNav />

      {/* Header Bar - Certified Medical Professional Interface */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-950 border border-blue-800 rounded-xl text-blue-400">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">MODO PROFESIONAL CERTIFICADO</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                  SESIÓN VALIDADAS MN 114.920
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-white">Nivel 3: Portal Clínico de Ambulancia SAME</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJsonModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-900/30 flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" /> Exportar JSON Triage (Interoperabilidad)
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">

        {/* Extended Clinical Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Extended Patient Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-400" /> Antecedentes y Ficha Médica Completa
                </h2>
                <span className="text-xs font-mono text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800">
                  TOKEN: {profile.tokenCode}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-medium">Nombre Completo</span>
                  <span className="font-bold text-white text-sm">{profile.fullName}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-medium">DNI</span>
                  <span className="font-bold text-white text-sm">{profile.dni}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-rose-900/60">
                  <span className="text-slate-400 block font-medium">Grupo y Factor</span>
                  <span className="font-black text-rose-400 text-base">{profile.bloodType}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-medium">Donante Órganos</span>
                  <span className="font-bold text-emerald-400 text-sm">{profile.organDonor ? 'SÍ' : 'NO'}</span>
                </div>
              </div>

              {/* Pathologies & Medications */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Patologías en Tratamiento Activo</h3>
                <div className="space-y-2">
                  {profile.pathologies.map(p => (
                    <div key={p.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-bold text-white">
                        <span>{p.name}</span>
                        <span className="text-red-400">{p.severity}</span>
                      </div>
                      {p.notes && <p className="text-slate-400 text-[11px]">{p.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MinIO Storage Files Viewer */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h2 className="text-lg font-bold text-white">Estudios Médicos Adjuntos (Servidor MinIO)</h2>
                    <p className="text-xs text-slate-400">Acceso cifrado con URLs temporales de 5 minutos</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {profile.studies.map((study) => (
                  <div key={study.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                          {study.category}
                        </span>
                        <h4 className="font-bold text-white text-sm">{study.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400">
                        {study.institution} • Fecha: {study.date} • Peso: {study.fileSize}
                      </p>
                      <span className="text-[10px] text-amber-300/80 font-mono block">
                        MinIO Key: <code>{study.minioKey}</code>
                      </span>
                    </div>

                    <a
                      href={study.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-200 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
                    >
                      <Download className="w-4 h-4" /> Ver / Descargar
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar: Active Dispatch Info */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                📍 Servicio en Curso - Movil #42
              </h2>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Ubicación del Incidente</span>
                  <span className="font-bold text-white">{mockEmergencyEvents[0].address}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Hora de Recepción Alerta</span>
                  <span className="font-mono text-amber-300">{mockEmergencyEvents[0].timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Estado del Móvil</span>
                  <span className="font-bold text-emerald-400">{mockEmergencyEvents[0].status}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* JSON TRIAGE INTEROPERABILITY MODAL */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3 text-indigo-400">
                <FileSpreadsheet className="w-6 h-6" />
                <h3 className="text-xl font-bold text-white">Payload JSON de Interoperabilidad para Tablet Triage</h3>
              </div>
              <button onClick={() => setShowJsonModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Formato estandarizado listo para inyectar directamente en el software de la ambulancia o del hospital de destino.
            </p>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 max-h-96 overflow-y-auto">
              {JSON.stringify(jsonPayload, null, 2)}
            </pre>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleCopyJson}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <Copy className="w-4 h-4" /> {copiedJson ? '¡Copiado al Portapapeles!' : 'Copiar JSON'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
