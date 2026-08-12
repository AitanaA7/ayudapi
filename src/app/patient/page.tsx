'use client';

import React, { useState } from 'react';
import PrototypeNav from '@/components/PrototypeNav';
import { mockUserProfile } from '@/data/mockData';
import { 
  User, QrCode, AlertOctagon, BellRing, ShieldCheck, HeartPulse, 
  Pill, FileText, Lock, Plus, Trash2, CheckCircle2, AlertCircle, PhoneCall, RefreshCw, Eye
} from 'lucide-react';

export default function PatientDashboard() {
  const [profile, setProfile] = useState(mockUserProfile);
  const [activeTab, setActiveTab] = useState<'profile' | 'qr' | 'preventive' | 'privacy'>('profile');
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');

  const toggleMedication = (id: string) => {
    setProfile(prev => ({
      ...prev,
      medications: prev.medications.map(m => m.id === id ? { ...m, takenToday: !m.takenToday } : m)
    }));
  };

  const handleRevokeToken = () => {
    setProfile(prev => ({ ...prev, tokenStatus: prev.tokenStatus === 'ACTIVO' ? 'REVOCADO' : 'ACTIVO' }));
    setShowRevokeModal(false);
  };

  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllergy.trim()) return;
    setProfile(prev => ({ ...prev, allergies: [...prev.allergies, newAllergy.trim().toUpperCase()] }));
    setNewAllergy('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <PrototypeNav />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header Profile Summary Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-rose-900/40">
                {profile.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                profile.tokenStatus === 'ACTIVO' ? 'bg-emerald-500' : 'bg-red-500'
              }`} title={`QR ${profile.tokenStatus}`}>
                {profile.tokenStatus === 'ACTIVO' ? <CheckCircle2 className="w-3 h-3 text-white" /> : <AlertOctagon className="w-3 h-3 text-white" />}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">{profile.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                  DNI: {profile.dni}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                  Grupo: {profile.bloodType}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                <span>Obra Social: <strong className="text-slate-200">{profile.medicalInsurance}</strong> ({profile.affiliateNumber})</span>
                <span>•</span>
                <span className="text-xs text-slate-400">Token ID: <code className="text-amber-300 font-mono">{profile.tokenCode}</code></span>
              </p>
            </div>
          </div>

          {/* Quick Token Status Badge & Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${
              profile.tokenStatus === 'ACTIVO'
                ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300'
                : 'bg-red-950/50 border-red-800/80 text-red-300'
            }`}>
              <QrCode className="w-5 h-5" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider opacity-75">Estado Código QR</p>
                <p className="text-sm font-extrabold">{profile.tokenStatus}</p>
              </div>
            </div>

            <button
              onClick={() => setShowRevokeModal(true)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 border ${
                profile.tokenStatus === 'ACTIVO'
                  ? 'bg-red-950/60 hover:bg-red-900 border-red-800 text-red-200'
                  : 'bg-emerald-950/60 hover:bg-emerald-900 border-emerald-800 text-emerald-200'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              {profile.tokenStatus === 'ACTIVO' ? 'Anular / Revocar QR' : 'Reactivar Token QR'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            Perfil Médico Crítico
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'qr'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Tokens & QR Físicos
          </button>
          <button
            onClick={() => setActiveTab('preventive')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'preventive'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BellRing className="w-4 h-4" />
            Salud Preventiva & Remedios
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'privacy'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Privacidad (Ley 25.326)
          </button>
        </div>

        {/* Tab 1: Profile Management */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Pathologies & Critical Alerts */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Pathologies */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <HeartPulse className="w-5 h-5 text-rose-500" />
                    <h2 className="font-bold text-lg text-white">Patologías y Condiciones Críticas</h2>
                  </div>
                  <span className="text-xs text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-900 font-medium">
                    Visibles en Emergencias
                  </span>
                </div>

                <div className="space-y-3">
                  {profile.pathologies.map((path) => (
                    <div key={path.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${path.severity === 'Crítica' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                          <h3 className="font-bold text-slate-100">{path.name}</h3>
                        </div>
                        {path.notes && <p className="text-xs text-slate-400 mt-1 italic pl-4">"{path.notes}"</p>}
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-950/80 text-red-300 border border-red-800">
                        {path.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Severe Allergies */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    <h2 className="font-bold text-lg text-white">Alergias Severas / Medicamentos Contraindicados</h2>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.allergies.map((allergy, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/60 text-amber-200 border border-amber-800 text-xs font-bold">
                      <span>{allergy}</span>
                    </div>
                  ))}
                </div>

                {/* Add Allergy Form */}
                <form onSubmit={handleAddAllergy} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Añadir otra alergia (ej: AINES, LÁTEX)..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                  <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Agregar
                  </button>
                </form>
              </div>
            </div>

            {/* Column 2: ICE Emergency Contacts */}
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <PhoneCall className="w-5 h-5 text-blue-400" />
                    <h2 className="font-bold text-lg text-white">Contactos ICE (En Caso de Emergencia)</h2>
                  </div>
                </div>

                <div className="space-y-3">
                  {profile.iceContacts.map((contact) => (
                    <div key={contact.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{contact.relationship}</span>
                        {contact.isPrimary && (
                          <span className="text-[10px] font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                            Primario
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-slate-100 text-sm">{contact.name}</p>
                      <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
                        <span>📱 {contact.phone}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Tokens & QR Management */}
        {activeTab === 'qr' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Gestión de Tokens y Soportes Físicos QR</h2>
              <p className="text-sm text-slate-400">
                Tu token interactivo en la vía pública no guarda tu nombre completo ni tu dirección, solo los datos de socorro necesarios.
              </p>
            </div>

            {/* QR Card Simulation */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8 justify-around shadow-2xl relative">
              
              {/* QR Image Mock */}
              <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-rose-500/30 flex flex-col items-center">
                {/* SVG QR Code Simulation */}
                <div className="w-48 h-48 bg-slate-900 rounded-xl p-3 flex flex-col justify-between items-center relative overflow-hidden">
                  <div className="w-full h-full border-4 border-dashed border-rose-500 rounded-lg flex flex-col items-center justify-center p-2 text-center bg-slate-950">
                    <QrCode className="w-24 h-24 text-rose-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-slate-300 mt-2 font-bold">{profile.tokenCode}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-700 font-mono mt-2 font-bold">ESCANEAR PARA SOCORRO</span>
              </div>

              {/* Physical Support Details */}
              <div className="space-y-4 text-left max-w-xs">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Token Único de Seguridad</span>
                  <p className="text-xl font-mono font-extrabold text-amber-300">{profile.tokenCode}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Soportes Físicos Vinculados</span>
                  <ul className="text-xs text-slate-300 space-y-1 mt-1">
                    <li>• Pulsera de Silicona Médica #892</li>
                    <li>• Adhesivo para Casco / Billetera</li>
                  </ul>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setShowRevokeModal(true)}
                    className="w-full py-2.5 px-4 bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <AlertOctagon className="w-4 h-4 text-red-400" />
                    Revocar Token por Pérdida
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Preventive Health & Reminders */}
        {activeTab === 'preventive' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <Pill className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h2 className="font-bold text-lg text-white">Asistente Cotidiano - Recordatorio de Medicamentos</h2>
                    <p className="text-xs text-slate-400">Marca los medicamentos que ya hayas tomado en el día de hoy.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile.medications.map((med) => (
                  <div
                    key={med.id}
                    onClick={() => toggleMedication(med.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      med.takenToday
                        ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                          ⏰ {med.scheduleTime} hs
                        </span>
                        {med.takenToday ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" /> Tomado
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-400">Pendiente</span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-white">{med.name}</h3>
                      <p className="text-xs text-slate-400">{med.dosage} • {med.frequency}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Privacy & Consent Ley 25.326 */}
        {activeTab === 'privacy' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Protección de Datos Personales (Ley 25.326)</h2>
                <p className="text-xs text-slate-400">
                  Usted mantiene el control total de sus datos sensibles en cumplimiento estricto de las leyes argentinas de salud digital.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Consentimiento Explícito de Visualización de Emergencia</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Permite que terceros visualicen solo el Alias y las patologías críticas tras escanear el QR.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.consentLey25326}
                  onChange={(e) => setProfile(prev => ({ ...prev, consentLey25326: e.target.checked }))}
                  className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Lock className="w-4 h-4" /> Política de No Rastreo Geográfico Permanente
                </div>
                <p className="text-xs text-slate-400">
                  AyudAPI <strong>no rastrea su ubicación en segundo plano</strong>. Las coordenadas GPS solo se capturan y envían en tiempo real cuando el interviniente presiona deliberadamente el botón de auxilio SAME o el botón de aviso familiar.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Revoke Token Confirmation Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500">
              <AlertOctagon className="w-8 h-8" />
              <h3 className="text-xl font-bold text-white">¿Confirmar Acción sobre Token QR?</h3>
            </div>
            <p className="text-xs text-slate-300">
              Si anula el token <code className="text-amber-300 font-mono">{profile.tokenCode}</code>, las pulseras y adhesivos físicos asociados dejarán de ser legibles en la vía pública ante una emergencia.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowRevokeModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleRevokeToken}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-900/40"
              >
                {profile.tokenStatus === 'ACTIVO' ? 'Sí, Anular Token' : 'Sí, Reactivar Token'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
