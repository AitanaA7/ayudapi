'use client';

import React, { useState } from 'react';
import PrototypeNav from '@/components/PrototypeNav';
import { useTheme } from '@/context/ThemeContext';
import { mockUserProfile, mockEmergencyEvents } from '@/data/mockData';
import { 
  Stethoscope, FileText, Download, ShieldCheck, Database, 
  ExternalLink, Lock, CheckCircle2, Copy, FileSpreadsheet, Eye, UserCheck, Clock, Shield
} from 'lucide-react';

export default function MedicProfessionalView() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [profile] = useState(mockUserProfile);
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
    setTimeout(() => setCopiedJson(false), 2500);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      <PrototypeNav />

      {/* Header Bar - Certified Medical Professional Interface */}
      <div className={`border-b p-4 sm:p-5 shadow-sm transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl border ${
              isLight ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-blue-950 border-blue-800 text-blue-400'
            }`}>
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">MODO PROFESIONAL CERTIFICADO</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-md border font-mono font-bold ${
                  isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}>
                  MN 114.920 VALIDADA
                </span>
              </div>
              <h1 className={`text-xl sm:text-2xl font-black mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Nivel 3: Portal Clínico SAME
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJsonModal(true)}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" /> Exportar JSON Triage (Interoperabilidad)
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">

        {/* Extended Clinical Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Extended Patient Card */}
            <div className={`border rounded-3xl p-6 sm:p-8 space-y-5 shadow-md transition-colors ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white'
            }`}>
              <div className={`flex items-center justify-between border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <h2 className="text-lg font-black flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" /> Antecedentes y Ficha Médica Completa
                </h2>
                <span className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border ${
                  isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-950/60 text-amber-300 border-amber-800'
                }`}>
                  TOKEN: {profile.tokenCode}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}>
                  <span className={`block font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Nombre Completo</span>
                  <span className={`font-extrabold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{profile.fullName}</span>
                </div>
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'}`}>
                  <span className={`block font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>DNI</span>
                  <span className={`font-extrabold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{profile.dni}</span>
                </div>
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-950 border-rose-900/80 text-rose-300'}`}>
                  <span className={`block font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Grupo y Factor</span>
                  <span className="font-black text-rose-600 text-lg">{profile.bloodType}</span>
                </div>
                <div className={`p-4 rounded-2xl border ${isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-950 border-slate-800 text-emerald-400'}`}>
                  <span className={`block font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Donante Órganos</span>
                  <span className="font-extrabold text-emerald-600 text-sm">{profile.organDonor ? 'SÍ' : 'NO'}</span>
                </div>
              </div>

              {/* Pathologies & Medications */}
              <div className="space-y-3 pt-2">
                <h3 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Patologías en Tratamiento Activo</h3>
                <div className="space-y-2.5">
                  {profile.pathologies.map(p => (
                    <div key={p.id} className={`p-4 border rounded-2xl text-xs space-y-1 transition-all ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                    }`}>
                      <div className="flex justify-between font-bold">
                        <span className={isLight ? 'text-slate-900' : 'text-white'}>{p.name}</span>
                        <span className="text-red-600 font-extrabold">{p.severity}</span>
                      </div>
                      {p.notes && <p className={`text-[11px] italic pl-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>"{p.notes}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MinIO Storage Files Viewer */}
            <div className={`border rounded-3xl p-6 sm:p-8 space-y-5 shadow-md transition-colors ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white'
            }`}>
              <div className={`flex items-center justify-between border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl border ${
                    isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-indigo-950 border-indigo-800 text-indigo-400'
                  }`}>
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black">Estudios Adjuntos (Servidor MinIO)</h2>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Acceso cifrado con URLs prefirmadas temporales (válidas 5 minutos)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {profile.studies.map((study) => (
                  <div key={study.id} className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black border ${
                          isLight ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                        }`}>
                          {study.category}
                        </span>
                        <h4 className="font-extrabold text-base">{study.title}</h4>
                      </div>
                      <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {study.institution} • Fecha: {study.date} • Peso: {study.fileSize}
                      </p>
                      <span className={`text-[10px] font-mono block ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
                        MinIO Key: <code>{study.minioKey}</code>
                      </span>
                    </div>

                    <a
                      href={study.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2.5 border rounded-2xl text-xs font-extrabold flex items-center gap-2 shrink-0 cursor-pointer active:scale-95 transition-all shadow-sm ${
                        isLight
                          ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-300 text-indigo-800'
                          : 'bg-indigo-950 hover:bg-indigo-900 border-indigo-800 text-indigo-200'
                      }`}
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
            <div className={`border rounded-3xl p-6 space-y-4 shadow-md transition-colors ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white'
            }`}>
              <h2 className={`text-base font-black border-b pb-3 flex items-center gap-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <Clock className="w-4 h-4 text-emerald-600" /> Servicio en Curso - Móvil #42
              </h2>
              <div className={`p-4 rounded-2xl border space-y-3 text-xs ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
              }`}>
                <div>
                  <span className={`block font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Ubicación del Incidente</span>
                  <span className="font-extrabold text-sm">{mockEmergencyEvents[0].address}</span>
                </div>
                <div>
                  <span className={`block font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Hora Recepción Alerta</span>
                  <span className={`font-mono font-bold ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>{mockEmergencyEvents[0].timestamp}</span>
                </div>
                <div>
                  <span className={`block font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Estado Móvil SAME</span>
                  <span className="font-extrabold text-emerald-600">{mockEmergencyEvents[0].status}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* JSON TRIAGE INTEROPERABILITY MODAL */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-5 shadow-2xl ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-3 text-indigo-600">
                <FileSpreadsheet className="w-7 h-7" />
                <h3 className="text-xl font-black">Payload JSON de Interoperabilidad para Triage</h3>
              </div>
              <button onClick={() => setShowJsonModal(false)} className={`font-bold cursor-pointer ${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'}`}>✕</button>
            </div>

            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Formato estandarizado HL7-FHIR listo para inyectar directamente en el software de la ambulancia o del hospital de destino.
            </p>

            <pre className="p-5 rounded-2xl border font-mono text-[11px] max-h-96 overflow-y-auto bg-slate-900 border-slate-800 text-emerald-400">
              {JSON.stringify(jsonPayload, null, 2)}
            </pre>

            <div className={`flex justify-end gap-3 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <button
                onClick={handleCopyJson}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer active:scale-95 transition-all shadow-lg"
              >
                <Copy className="w-4 h-4 text-white" /> {copiedJson ? '¡Copiado al Portapapeles!' : 'Copiar JSON Payload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
