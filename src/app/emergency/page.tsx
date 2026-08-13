'use client';

import React, { useState } from 'react';
import PrototypeNav from '@/components/PrototypeNav';
import { useTheme } from '@/context/ThemeContext';
import { mockUserProfile } from '@/data/mockData';
import { 
  AlertTriangle, PhoneCall, MapPin, Shield, Scale, Send, CheckCircle2, 
  Clock, AlertOctagon, Heart, Radio, RefreshCw, Volume2, ShieldAlert
} from 'lucide-react';

export default function EmergencyIntervenerView() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [profile] = useState(mockUserProfile);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [sameSending, setSameSending] = useState(false);
  const [sameSent, setSameSent] = useState(false);
  const [iceSending, setIceSending] = useState(false);
  const [iceSent, setIceSent] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  const captureGps = () => {
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
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      <PrototypeNav />

      {/* Emergency Header Banner - Ultra High Contrast */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-4 sm:p-5 shadow-xl border-b border-red-500">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur animate-pulse shadow-md">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-black/40 px-2.5 py-0.5 rounded-md text-white">
                PERFIL MÉDICO DE SOCORRO
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5 text-white">EMERGENCIA VÍA PÚBLICA</h1>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-xs font-mono font-black bg-black/40 px-3 py-1 rounded-xl border border-white/20 text-white">
              TOKEN: {profile.tokenCode}
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">

        {/* Token Revoked Warning */}
        {profile.tokenStatus === 'REVOCADO' && (
          <div className="p-5 rounded-3xl bg-red-600 text-white border-2 border-red-700 flex items-center gap-4 animate-bounce shadow-xl">
            <AlertOctagon className="w-9 h-9 text-white shrink-0" />
            <div>
              <h3 className="font-extrabold text-base">ESTE TOKEN HA SIDO REVOCADO POR EL USUARIO</h3>
              <p className="text-xs text-red-100 mt-0.5">Los datos a continuación pueden no estar actualizados. Comuníquese directamente al 107 SAME.</p>
            </div>
          </div>
        )}

        {/* Patient Alias & Critical Banner */}
        <div className={`border-2 border-rose-600 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden space-y-5 transition-colors ${
          isLight ? 'bg-white text-slate-900' : 'bg-slate-900/90 text-white backdrop-blur-md'
        }`}>

          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5 ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <div>
              <span className="text-xs text-rose-600 font-extrabold uppercase tracking-wider">Identificador de la persona</span>
              <h2 className={`text-3xl sm:text-4xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{profile.alias}</h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Grupo Sanguíneo: <strong className="text-rose-600 text-base font-black">{profile.bloodType}</strong></p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLegalModal(true)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-sm border ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Scale className="w-4 h-4 text-amber-500" />
                Respaldo Legal (Art. 34 y 108)
              </button>
            </div>
          </div>

          {/* CRITICAL ALERTS BOX */}
          <div className="space-y-4">
            <span className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" /> ALERTAS MÉDICAS CRÍTICAS DE ENTRADA
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.pathologies.map(p => (
                <div key={p.id} className={`p-5 rounded-2xl border-2 font-black text-lg flex flex-col justify-between shadow-md ${
                  isLight ? 'bg-red-50 border-red-500 text-red-900' : 'bg-red-950/90 border-red-600 text-white'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping" />
                    <span>{p.name}</span>
                  </div>
                  {p.notes && <span className={`text-xs font-normal italic mt-3 ${isLight ? 'text-red-700' : 'text-red-200'}`}>"{p.notes}"</span>}
                </div>
              ))}

              {profile.allergies.map((allergy, i) => (
                <div key={i} className={`p-5 rounded-2xl border-2 font-black text-lg flex items-center gap-3 shadow-md ${
                  isLight ? 'bg-amber-50 border-amber-500 text-amber-900' : 'bg-amber-950/90 border-amber-500 text-amber-100'
                }`}>
                  <AlertOctagon className="w-7 h-7 text-amber-600 shrink-0" />
                  <div>
                    <span className={`text-[10px] uppercase font-mono block ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>ALERGIA GRAVE CONTRAINDICADA</span>
                    <span>{allergy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TWO PRIMARY EMERGENCY ACTION BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Action 1: SAME Dispatch */}
          <div className={`border rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-md transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-wider">
                <Radio className="w-5 h-5 animate-pulse" /> Alerta Directa SAME (Ambulancia)
              </div>
              <h3 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Despachar Alerta Georreferenciada 107</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Captura la posición GPS actual del interviniente y transmite las coordenadas junto con la ficha de auxilio a la central del SAME.
              </p>
            </div>

            {sameSent ? (
              <div className={`p-5 rounded-2xl border text-xs space-y-2 shadow-inner ${
                isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-emerald-950 border-emerald-700 text-emerald-300'
              }`}>
                <div className="flex items-center gap-2 font-black text-sm text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" /> ALERTA SAME DESPACHADA A CENTRAL
                </div>
                <p>Ubicación fijada: <strong>{gpsLocation?.address}</strong></p>
                <span className="text-[10px] font-mono font-bold block">Ticket #SAME-2026-9021 • Móvil asignado</span>
              </div>
            ) : (
              <button
                onClick={handleSendSameAlert}
                disabled={sameSending}
                className="w-full min-h-[56px] py-4 px-6 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl font-black text-base shadow-xl flex items-center justify-center gap-3 cursor-pointer active:scale-95 transition-all"
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
          <div className={`border rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-md transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-wider">
                <PhoneCall className="w-5 h-5" /> Alerta Círculo Íntimo (Familia ICE)
              </div>
              <h3 className={`text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Notificar a {profile.iceContacts[0]?.name}</h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Envía un aviso de incidente con coordenadas GPS en tiempo real al contacto de emergencia designado por el paciente.
              </p>
            </div>

            {iceSent ? (
              <div className={`p-5 rounded-2xl border text-xs space-y-2 shadow-inner ${
                isLight ? 'bg-blue-50 border-blue-300 text-blue-900' : 'bg-blue-950 border-blue-700 text-blue-300'
              }`}>
                <div className="flex items-center gap-2 font-black text-sm text-blue-600">
                  <CheckCircle2 className="w-5 h-5" /> AVISO FAMILIAR ENVIADO
                </div>
                <p>Mensaje enviado a: <strong>{profile.iceContacts[0]?.phone}</strong></p>
              </div>
            ) : (
              <button
                onClick={handleSendIceAlert}
                disabled={iceSending}
                className="w-full min-h-[56px] py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-base shadow-xl flex items-center justify-center gap-3 cursor-pointer active:scale-95 transition-all"
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
        <div className={`border rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-md overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 text-amber-600 font-extrabold text-xs">
              <Shield className="w-4 h-4 shrink-0" /> PLAN B - RESILIENCIA EN CASO DE FALLA DE SEÑAL O GPS
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Si la señal celular es débil, realice una llamada telefónica directa a las líneas gratuitas de auxilio nacional.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto shrink-0">
            <a
              href="tel:107"
              className="flex-1 sm:flex-none px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs sm:text-sm text-center whitespace-nowrap transition-all cursor-pointer shadow-md active:scale-95"
            >
              📞 LLAMAR AL 107 (SAME)
            </a>
            <a
              href="tel:911"
              className={`flex-1 sm:flex-none px-5 py-3 border rounded-2xl font-black text-xs sm:text-sm text-center whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
              }`}
            >
              📞 LLAMAR AL 911
            </a>
          </div>
        </div>


      </main>

      {/* LEGAL BACKING MODAL */}
      {showLegalModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`border rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-3 text-amber-600">
                <Scale className="w-7 h-7" />
                <h3 className="text-xl font-black">Marco y Respaldo Legal para el Interviniente</h3>
              </div>
              <button onClick={() => setShowLegalModal(false)} className={`font-bold cursor-pointer ${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'}`}>✕</button>
            </div>

            <div className="space-y-4 text-xs max-h-96 overflow-y-auto pr-2">
              <div className={`p-5 rounded-2xl border space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <h4 className="font-extrabold text-amber-700 text-sm">Artículo 34 - Código Penal Argentino (Estado de Necesidad)</h4>
                <p className={`leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  "No es punible el que causare un mal por evitar otro mayor inminente a que ha sido extraño."
                </p>
                <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Protege al tercero que brinda ayuda de buena fe para salvaguardar la vida o integridad física del accidentado.
                </p>
              </div>

              <div className={`p-5 rounded-2xl border space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <h4 className="font-extrabold text-amber-700 text-sm">Artículo 108 - Código Penal Argentino (Omisión de Auxilio)</h4>
                <p className={`leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  "Establece sanciones para quien encontrando perdido o desamparado a un menor o a una persona herida o amenazada de cualquier peligro, omitiere prestarle el auxilio necesario o dar aviso a la autoridad."
                </p>
              </div>
            </div>

            <div className={`flex justify-end pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <button
                onClick={() => setShowLegalModal(false)}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all shadow-lg"
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
