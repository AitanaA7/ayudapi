'use client';

import React, { useState } from 'react';
import PrototypeNav from '@/components/PrototypeNav';
import { mockUserProfile } from '@/data/mockData';
import { 
  User, QrCode, AlertOctagon, BellRing, ShieldCheck, HeartPulse, 
  Pill, FileText, Lock, Plus, Trash2, CheckCircle2, AlertCircle, PhoneCall, RefreshCw, Eye, Sparkles
} from 'lucide-react';

export default function PatientDashboard() {
  const [profile, setProfile] = useState(mockUserProfile);
  const [activeTab, setActiveTab] = useState<'profile' | 'qr' | 'preventive' | 'privacy'>('profile');
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleMedication = (id: string) => {
    setProfile(prev => {
      const updated = prev.medications.map(m => {
        if (m.id === id) {
          const nextState = !m.takenToday;
          showToast(nextState ? `Medicación "${m.name}" marcada como tomada.` : `Medicación "${m.name}" marcada como pendiente.`);
          return { ...m, takenToday: nextState };
        }
        return m;
      });
      return { ...prev, medications: updated };
    });
  };

  const handleRevokeToken = () => {
    const nextStatus = profile.tokenStatus === 'ACTIVO' ? 'REVOCADO' : 'ACTIVO';
    setProfile(prev => ({ ...prev, tokenStatus: nextStatus }));
    setShowRevokeModal(false);
    showToast(nextStatus === 'ACTIVO' ? 'Token QR reactivado exitosamente.' : 'Token QR anulado/revocado por seguridad.');
  };

  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllergy.trim()) return;
    const formatted = newAllergy.trim().toUpperCase();
    setProfile(prev => ({ ...prev, allergies: [...prev.allergies, formatted] }));
    setNewAllergy('');
    showToast(`Alergia "${formatted}" registrada.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      <PrototypeNav />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header Profile Summary Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 via-red-600 to-amber-600 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-rose-950/60">
                {profile.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                profile.tokenStatus === 'ACTIVO' ? 'bg-emerald-500 shadow-lg shadow-emerald-950' : 'bg-red-500 shadow-lg shadow-red-950 animate-pulse'
              }`} title={`QR ${profile.tokenStatus}`}>
                {profile.tokenStatus === 'ACTIVO' ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <AlertOctagon className="w-3.5 h-3.5 text-white" />}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{profile.fullName}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300">
                  DNI: {profile.dni}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-950 text-rose-300 border border-rose-800">
                  Grupo: {profile.bloodType}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5 flex flex-wrap items-center gap-2">
                <span>Obra Social: <strong className="text-slate-200">{profile.medicalInsurance}</strong> ({profile.affiliateNumber})</span>
                <span>•</span>
                <span>Token QR: <code className="text-amber-300 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{profile.tokenCode}</code></span>
              </p>
            </div>
          </div>

          {/* Quick Token Status Badge & Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className={`px-4 py-3 rounded-2xl border flex items-center gap-3 transition-all ${
              profile.tokenStatus === 'ACTIVO'
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                : 'bg-red-950/40 border-red-800/80 text-red-300'
            }`}>
              <QrCode className="w-6 h-6" />
              <div>
                <p className="text-[10px] uppercase font-mono font-bold tracking-widest opacity-80">Estado Código QR</p>
                <p className="text-sm font-black tracking-wide">{profile.tokenStatus}</p>
              </div>
            </div>

            <button
              onClick={() => setShowRevokeModal(true)}
              className={`px-5 py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 border cursor-pointer active:scale-95 shadow-lg ${
                profile.tokenStatus === 'ACTIVO'
                  ? 'bg-red-950 hover:bg-red-900 border-red-800 text-red-200 hover:text-white'
                  : 'bg-emerald-950 hover:bg-emerald-900 border-emerald-800 text-emerald-200 hover:text-white'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              {profile.tokenStatus === 'ACTIVO' ? 'Anular / Revocar QR' : 'Reactivar Token QR'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-3 text-sm font-bold overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            Perfil Médico Crítico
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'qr'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Tokens & QR Físicos
          </button>
          <button
            onClick={() => setActiveTab('preventive')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'preventive'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BellRing className="w-4 h-4" />
            Salud Preventiva & Remedios
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-rose-500 text-rose-400'
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
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-950 text-rose-400 border border-rose-800">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <h2 className="font-bold text-lg text-white">Patologías y Condiciones Críticas</h2>
                  </div>
                  <span className="text-[11px] font-bold text-rose-400 bg-rose-950/80 px-3 py-1 rounded-full border border-rose-900">
                    Visibles en Emergencias
                  </span>
                </div>

                <div className="space-y-3">
                  {profile.pathologies.map((path) => (
                    <div key={path.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start justify-between hover:border-slate-700 transition-all">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${path.severity === 'Crítica' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                          <h3 className="font-extrabold text-slate-100 text-base">{path.name}</h3>
                        </div>
                        {path.notes && <p className="text-xs text-slate-400 mt-1.5 pl-5 italic">"{path.notes}"</p>}
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-xl bg-red-950/90 text-red-300 border border-red-800 shadow-sm">
                        {path.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Severe Allergies */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <h2 className="font-bold text-lg text-white">Alergias Severas / Contraindicaciones</h2>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {profile.allergies.map((allergy, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-950/60 text-amber-200 border border-amber-800/80 text-xs font-extrabold shadow-sm">
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
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 transition-all"
                  />
                  <button type="submit" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all">
                    <Plus className="w-4 h-4" /> Agregar
                  </button>
                </form>
              </div>
            </div>

            {/* Column 2: ICE Emergency Contacts */}
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-950 text-blue-400 border border-blue-800">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <h2 className="font-bold text-lg text-white">Contactos ICE</h2>
                  </div>
                </div>

                <div className="space-y-3">
                  {profile.iceContacts.map((contact) => (
                    <div key={contact.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-blue-900 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{contact.relationship}</span>
                        {contact.isPrimary && (
                          <span className="text-[10px] font-bold bg-blue-950 text-blue-300 px-2.5 py-0.5 rounded-md border border-blue-800">
                            Primario
                          </span>
                        )}
                      </div>
                      <p className="font-extrabold text-slate-100 text-sm">{contact.name}</p>
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
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 max-w-3xl mx-auto space-y-6 shadow-2xl backdrop-blur-md">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white">Gestión de Tokens y QR Físicos</h2>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                Tu token interactivo en la vía pública solo expone los datos estrictos de auxilio. Puedes revocar el acceso inmediatamente desde este panel si pierdes la pulsera.
              </p>
            </div>

            {/* QR Card Simulation */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 justify-around shadow-2xl relative">
              
              {/* QR Image Mock */}
              <div className="p-5 bg-white rounded-3xl shadow-2xl border-4 border-rose-500/40 flex flex-col items-center group">
                <div className="w-52 h-52 bg-slate-900 rounded-2xl p-4 flex flex-col justify-between items-center relative overflow-hidden">
                  <div className="w-full h-full border-4 border-dashed border-rose-500 rounded-xl flex flex-col items-center justify-center p-2 text-center bg-slate-950 group-hover:border-amber-400 transition-colors">
                    <QrCode className="w-28 h-28 text-rose-500 group-hover:scale-105 transition-transform" />
                    <span className="text-[10px] font-mono text-slate-300 mt-2 font-bold">{profile.tokenCode}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-800 font-mono mt-3 font-extrabold tracking-wider">ESCANEAR EN EMERGENCIA</span>
              </div>

              {/* Physical Support Details */}
              <div className="space-y-4 text-left max-w-xs">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Token Único de Seguridad</span>
                  <p className="text-2xl font-mono font-black text-amber-300 mt-0.5">{profile.tokenCode}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Soportes Físicos Vinculados</span>
                  <ul className="text-xs text-slate-300 space-y-1.5 mt-1.5 font-medium">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Pulsera de Silicona Médica #892
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> Adhesivo para Casco / Billetera
                    </li>
                  </ul>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setShowRevokeModal(true)}
                    className="w-full py-3 px-4 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-lg"
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
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-black text-xl text-white">Asistente Cotidiano - Recordatorio de Medicamentos</h2>
                    <p className="text-xs text-slate-400">Haz clic en cualquier medicamento para marcarlo como tomado.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {profile.medications.map((med) => (
                  <div
                    key={med.id}
                    onClick={() => toggleMedication(med.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between hover:scale-[1.02] active:scale-95 ${
                      med.takenToday
                        ? 'bg-emerald-950/40 border-emerald-700/90 text-emerald-200 shadow-lg shadow-emerald-950/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900 text-slate-200 font-bold border border-slate-800">
                          ⏰ {med.scheduleTime} hs
                        </span>
                        {med.takenToday ? (
                          <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" /> Tomado
                          </span>
                        ) : (
                          <span className="text-xs font-extrabold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">Pendiente</span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-lg text-white">{med.name}</h3>
                      <p className="text-xs text-slate-400 font-medium">{med.dosage} • {med.frequency}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Privacy & Consent Ley 25.326 */}
        {activeTab === 'privacy' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 max-w-3xl mx-auto space-y-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
              <div className="p-3 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Protección de Datos Personales (Ley 25.326)</h2>
                <p className="text-xs text-slate-400">
                  Usted mantiene el control total de sus datos sensibles en cumplimiento estricto de las leyes de salud digital.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white text-base">Consentimiento Explícito de Visualización de Emergencia</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Permite que terceros visualicen solo el Alias y las patologías críticas tras escanear el QR.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.consentLey25326}
                  onChange={(e) => {
                    setProfile(prev => ({ ...prev, consentLey25326: e.target.checked }));
                    showToast(e.target.checked ? 'Consentimiento explícito otorgado.' : 'Consentimiento revocado.');
                  }}
                  className="w-6 h-6 accent-rose-500 rounded-lg cursor-pointer"
                />
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Lock className="w-4 h-4" /> Política de No Rastreo Geográfico Permanente
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  AyudAPI <strong>no rastrea su ubicación en segundo plano</strong>. Las coordenadas GPS solo se capturan y envían en tiempo real cuando el interviniente presiona deliberadamente el botón de auxilio SAME o el botón de aviso familiar.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Revoke Token Confirmation Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-500">
              <AlertOctagon className="w-8 h-8 shrink-0" />
              <h3 className="text-xl font-extrabold text-white">¿Confirmar Acción sobre Token QR?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Si anula el token <code className="text-amber-300 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded">{profile.tokenCode}</code>, las pulseras y adhesivos físicos asociados dejarán de ser legibles en la vía pública ante una emergencia.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowRevokeModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleRevokeToken}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-lg shadow-red-950 cursor-pointer active:scale-95 transition-all"
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
