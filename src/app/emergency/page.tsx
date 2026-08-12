'use client';

import React, { useState } from 'react';
import PrototypeNav from '@/components/PrototypeNav';
import { mockUserProfile } from '@/data/mockData';
import { 
  AlertTriangle, PhoneCall, MapPin, Shield, Scale, Send, CheckCircle2, 
  Clock, AlertOctagon, Heart, Radio, RefreshCw, Volume2
} from 'lucide-react';

export default function EmergencyIntervenerView() {
  const [profile] = useState(mockUserProfile);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [sameSending, setSameSending] = useState(false);
  const [sameSent, setSameSent] = useState(false);
  const [iceSending, setIceSending] = useState(false);
  const [iceSent, setIceSent] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  const captureGps = () => {
    // Simulated high precision GPS capture in Buenos Aires
    setGpsLocation({
      lat: -34.6037,
      lng: -58.3816,
      address: 'Av. Corrientes 1240 (Esquina Florida), San Nicolás, CABA'
    });
  };

  const handleSendSameAlert = () => {
    setSameSending(true);
    captureGps();
    setTimeout(() => {
      setSameSending(false);
      setSameSent(true);
    }, 1500);
  };

  const handleSendIceAlert = () => {
    setIceSending(true);
    captureGps();
    setTimeout(() => {
      setIceSending(false);
      setIceSent(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <PrototypeNav />

      {/* Emergency Header Banner - Ultra High Contrast */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-4 shadow-xl border-b border-red-500">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur animate-pulse">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded">
                PERFIL MÉDICO DE SOCORRO
              </span>
              <h1 className="text-xl font-black tracking-tight mt-0.5">MODO EMERGENCIA VÍA PÚBLICA</h1>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-xs font-mono font-bold bg-black/30 px-3 py-1 rounded-full border border-white/20">
              TOKEN: {profile.tokenCode}
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-6">

        {/* Token Revoked Warning If Appliccable */}
        {profile.tokenStatus === 'REVOCADO' && (
          <div className="p-4 rounded-2xl bg-red-950 border-2 border-red-600 text-red-200 flex items-center gap-4 animate-bounce">
            <AlertOctagon className="w-8 h-8 text-red-400 shrink-0" />
            <div>
              <h3 className="font-bold text-base">ESTE TOKEN HA SIDO REVOCADO POR EL USUARIO</h3>
              <p className="text-xs">Los datos a continuación pueden no estar actualizados. Comuníquese directamente al 107 SAME.</p>
            </div>
          </div>
        )}

        {/* Patient Alias & Critical Banner */}
        <div className="bg-slate-900 border-2 border-rose-600/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-rose-400 font-bold uppercase tracking-wider">Identificador de la persona</span>
              <h2 className="text-3xl font-black text-white">{profile.alias}</h2>
              <p className="text-xs text-slate-400">Grupo Sanguíneo: <strong className="text-rose-400 text-sm font-extrabold">{profile.bloodType}</strong></p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLegalModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2"
              >
                <Scale className="w-4 h-4 text-amber-400" />
                Respaldo Legal (Art. 34 y 108)
              </button>
            </div>
          </div>

          {/* CRITICAL ALERTS BOX */}
          <div className="space-y-3">
            <span className="text-xs font-extrabold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" /> ALERTAS MÉDICAS CRÍTICAS DE ENTRADA
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.pathologies.map(p => (
                <div key={p.id} className="p-4 rounded-xl bg-red-950/80 border-2 border-red-600/90 text-white font-extrabold text-base flex flex-col justify-between shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    <span>{p.name}</span>
                  </div>
                  <span className="text-xs text-red-200 font-normal italic mt-2">"{p.notes}"</span>
                </div>
              ))}

              {profile.allergies.map((allergy, i) => (
                <div key={i} className="p-4 rounded-xl bg-amber-950/90 border-2 border-amber-500 text-amber-100 font-extrabold text-base flex items-center gap-3">
                  <AlertOctagon className="w-6 h-6 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-amber-300 uppercase font-mono block">ALERGIA GRAVE CONTRAINDICADA</span>
                    <span>{allergy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TWO PRIMARY EMERGENCY ACTION BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Action 1: SAME Dispatch */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-rose-500 font-black text-sm uppercase">
                <Radio className="w-5 h-5 animate-pulse" /> Alerta Directa al SAME (Ambulancia)
              </div>
              <h3 className="text-lg font-bold text-white">Despachar Alerta Georreferenciada 107</h3>
              <p className="text-xs text-slate-400">
                Captura automáticamente la posición GPS actual del interviniente y transmite la ubicación y el perfil de auxilio a la central del SAME.
              </p>
            </div>

            {sameSent ? (
              <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" /> ALERTA SAME ENVIADA A CENTRAL
                </div>
                <p className="text-slate-300">Ubicación fijada: <strong>{gpsLocation?.address}</strong></p>
                <span className="text-[10px] text-emerald-400 font-mono block">Ticket #SAME-2026-9021 • Móvil asignado</span>
              </div>
            ) : (
              <button
                onClick={handleSendSameAlert}
                disabled={sameSending}
                className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-extrabold text-base shadow-xl shadow-rose-900/40 flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                {sameSending ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Obteniendo GPS y Despachando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> ALERTA SAME + GPS AHORA
                  </>
                )}
              </button>
            )}
          </div>

          {/* Action 2: ICE Family Contact */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-black text-sm uppercase">
                <PhoneCall className="w-5 h-5" /> Alerta Círculo Íntimo (Familia ICE)
              </div>
              <h3 className="text-lg font-bold text-white">Notificar a {profile.iceContacts[0]?.name}</h3>
              <p className="text-xs text-slate-400">
                Envía un aviso de incidente por WhatsApp/SMS con las coordenadas GPS al contacto de emergencia designado por el paciente.
              </p>
            </div>

            {iceSent ? (
              <div className="p-4 rounded-xl bg-blue-950 border border-blue-700 text-blue-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" /> AVISO FAMILIAR ENVIADO
                </div>
                <p className="text-slate-300">Mensaje enviado a: <strong>{profile.iceContacts[0]?.phone}</strong></p>
              </div>
            ) : (
              <button
                onClick={handleSendIceAlert}
                disabled={iceSending}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-extrabold text-base shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                {iceSending ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Enviando mensaje...
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-5 h-5" /> AVISAR A LA FAMILIA (ICE)
                  </>
                )}
              </button>
            )}
          </div>

        </div>

        {/* RESILIENCE PLAN B (PHONE FALLBACK) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Shield className="w-4 h-4" /> PLAN B - RESILIENCIA EN CASO DE FALLA DE CONEXIÓN O GPS
            </div>
            <p className="text-xs text-slate-300">
              Si la señal celular es débil, realice inmediatamente una llamada directa a las líneas gratuitas de auxilio nacional.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <a
              href="tel:107"
              className="flex-1 md:flex-none px-6 py-3 bg-red-950 hover:bg-red-900 border border-red-700 text-red-100 rounded-xl font-black text-sm text-center"
            >
              📞 LLAMAR AL 107 (SAME)
            </a>
            <a
              href="tel:911"
              className="flex-1 md:flex-none px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-black text-sm text-center"
            >
              📞 LLAMAR AL 911
            </a>
          </div>
        </div>

      </main>

      {/* LEGAL BACKING MODAL */}
      {showLegalModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3 text-amber-400">
                <Scale className="w-7 h-7" />
                <h3 className="text-xl font-bold text-white">Marco y Respaldo Legal para el Interviniente</h3>
              </div>
              <button onClick={() => setShowLegalModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 max-h-96 overflow-y-auto pr-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="font-bold text-amber-300 text-sm">Artículo 34 - Código Penal Argentino (Estado de Necesidad)</h4>
                <p className="text-slate-300">
                  "No es punible el que causare un mal por evitar otro mayor inminente a que ha sido extraño."
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Protege al tercero que brinda ayuda de buena fe para salvaguardar la vida o integridad física del accidentado.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="font-bold text-amber-300 text-sm">Artículo 108 - Código Penal Argentino (Omisión de Auxilio)</h4>
                <p className="text-slate-300">
                  "Establece sanciones para quien encontrando perdido o desamparado a un menor o a una persona herida o amenazada de cualquier peligro, omitiere prestarle el auxilio necesario o dar aviso a la autoridad."
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowLegalModal(false)}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs"
              >
                Comprendido - Volver al Socorro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
