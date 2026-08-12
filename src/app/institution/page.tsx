'use client';

import React, { useState } from 'react';
import PrototypeNav from '@/components/PrototypeNav';
import { mockAuditLogs, mockPredictiveZones } from '@/data/mockData';
import { 
  BarChart3, ShieldAlert, MapPin, Activity, Cpu, Sparkles, 
  CreditCard, Flame, AlertOctagon, CheckCircle2, Search, Filter, ShieldCheck, Copy
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function InstitutionalDashboardView() {
  const [auditLogs] = useState(mockAuditLogs);
  const [predictiveZones] = useState(mockPredictiveZones);
  const [activeTab, setActiveTab] = useState<'heatmaps' | 'predictive' | 'obrasocial' | 'audit'>('heatmaps');
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  const pathologyData = [
    { name: 'Diabetes T1/T2', count: 480, fill: '#ef4444' },
    { name: 'Hipertensión', count: 720, fill: '#f59e0b' },
    { name: 'Asma / EPOC', count: 310, fill: '#3b82f6' },
    { name: 'Alergias Gravedad', count: 290, fill: '#8b5cf6' },
    { name: 'Cardiopatías', count: 190, fill: '#ec4899' },
  ];

  const hourlyIncidentTrend = [
    { hour: '00:00', incidentes: 4 },
    { hour: '04:00', incidentes: 2 },
    { hour: '08:00', incidentes: 18 },
    { hour: '12:00', incidentes: 29 },
    { hour: '16:00', incidentes: 34 },
    { hour: '18:00', incidentes: 42 },
    { hour: '22:00', incidentes: 15 },
  ];

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText("AYUDAPI-OSDE-25");
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      <PrototypeNav />

      {/* Header Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-4 sm:p-5 shadow-xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-purple-950 border border-purple-800 rounded-2xl text-purple-400 shadow-md">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">NIVEL 4: ANALÍTICA & SEGURIDAD IA</span>
                <span className="text-[10px] bg-rose-950 text-rose-300 px-2.5 py-0.5 rounded-md border border-rose-800 font-mono font-bold">
                  SISTEMA CENTRO DE CONTROL
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">Dashboard Institucional AyudAPI</h1>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-3 text-sm font-bold overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('heatmaps')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'heatmaps' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-400" /> Mapa de Calor & Incidentes
          </button>
          <button
            onClick={() => setActiveTab('predictive')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'predictive' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4 text-blue-400" /> IA Predictiva SAME
          </button>
          <button
            onClick={() => setActiveTab('obrasocial')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'obrasocial' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-400" /> Obras Sociales & Beneficios
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'audit' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" /> Auditoría con IA de Seguridad
          </button>
        </div>

        {/* TAB 1: HEATMAPS & GEOSPATIAL */}
        {activeTab === 'heatmaps' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Simulated Map Container */}
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h2 className="font-black text-white text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-500" /> Mapa de Calor de Activaciones QR en Vía Pública
                  </h2>
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                    CABA & Gran Buenos Aires
                  </span>
                </div>

                {/* Simulated Leaflet Map Canvas */}
                <div className="h-80 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-4">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
                  
                  {/* Heatmap Nodes */}
                  <div className="absolute top-1/3 left-1/2 w-28 h-28 bg-red-600/40 rounded-full blur-2xl animate-pulse" />
                  <div className="absolute top-1/3 left-1/2 -translate-x-3 -translate-y-3 p-2 bg-red-600 text-white font-black text-[10px] rounded-full shadow-2xl border-2 border-white">
                    HOTSPOT: CORRIENTES & FLORIDA (SAME #42)
                  </div>

                  <div className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-amber-500/30 rounded-full blur-2xl animate-pulse" />
                  <div className="absolute bottom-1/3 left-1/3 p-1.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full shadow-lg border-2 border-white">
                    PLAZA ITALIA
                  </div>

                  <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl text-[11px] space-y-1 backdrop-blur-md">
                    <span className="font-bold text-white block">Referencias de Calor</span>
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <span className="w-3 h-3 rounded-full bg-red-500" /> Alta densidad de incidentes en tiempo real
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart: Incidents by hour */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl backdrop-blur-md">
                <h2 className="font-black text-white text-base border-b border-slate-800 pb-3">
                  Distribución Horaria de Alertas
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyIncidentTrend}>
                      <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '16px', fontSize: '12px', color: '#fff' }} />
                      <Bar dataKey="incidentes" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: AI PREDICTIVE SAME */}
        {activeTab === 'predictive' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-blue-950 border border-blue-800 rounded-2xl text-blue-400">
                    <Sparkles className="w-7 h-7 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Análisis Predictivo SAME (Capa Operativa IA)</h2>
                    <p className="text-xs text-slate-400">Optimización de unidades móviles según histórico georreferenciado y condiciones ambientales</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {predictiveZones.map((pz) => (
                  <div key={pz.id} className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl hover:border-blue-900 transition-all">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-xl text-xs font-black border ${
                        pz.riskLevel === 'ALTO' ? 'bg-red-950 text-red-300 border-red-800' : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}>
                        RIESGO PREVISTO: {pz.riskLevel}
                      </span>
                      <span className="text-xs font-mono text-slate-400 font-bold">{pz.peakTime}</span>
                    </div>

                    <h3 className="font-black text-white text-lg">{pz.zoneName}</h3>

                    <div className="text-xs space-y-1.5 text-slate-300 font-medium">
                      <p>• Incidentes estimados: <strong className="text-amber-300">{pz.predictedIncidents} eventos/turno</strong></p>
                      <p>• Recomendación IA: <strong className="text-emerald-400">{pz.suggestedAmbulanceStation}</strong></p>
                    </div>

                    <div className="pt-3 border-t border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Factores Detectados por IA</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {pz.mainRiskFactors.map((rf, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-900 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800">
                            {rf}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OBRA SOCIAL & BENEFITS */}
        {activeTab === 'obrasocial' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Pathology Prevalence Chart */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl backdrop-blur-md">
                <h2 className="font-black text-white text-lg border-b border-slate-800 pb-4">
                  Prevalencia Anonimizada de Afecciones (Obras Sociales)
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pathologyData} layout="vertical">
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={130} />
                      <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff' }} />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                        {pathologyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Benefits Card Simulation */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl backdrop-blur-md">
                <h2 className="font-black text-white text-lg border-b border-slate-800 pb-4">
                  Simulador de Tarjeta de Beneficios en Farmacias
                </h2>

                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 rounded-3xl text-white space-y-4 shadow-2xl relative overflow-hidden border border-emerald-500/40">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-black/40 px-2.5 py-0.5 rounded-md">AYUDAPI BENEFICIOS</span>
                      <h3 className="text-2xl font-black mt-1">Descuento Farmacias Red Salud</h3>
                    </div>
                    <CreditCard className="w-9 h-9 text-white/90" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-emerald-100 font-mono font-bold">CÓDIGO AFILIADO: 4892019482-01</p>
                    <p className="text-lg font-black">25% OFF EN MEDICACIÓN CONTROLADA</p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={handleCopyCoupon}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md"
                    >
                      <Copy className="w-3.5 h-3.5" /> {copiedCoupon ? '¡Cupón AYUDAPI-OSDE-25 Copiado!' : 'Copiar Cupón Farmacia'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS & AI SECURITY */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-rose-950 border border-rose-800 rounded-2xl text-rose-400">
                    <ShieldAlert className="w-7 h-7 animate-bounce" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Registro Estricto de Auditoría & IA de Seguridad</h2>
                    <p className="text-xs text-slate-400">Cumplimiento Ley 25.326 - Supervisión continua de accesos Nivel 3 y 4</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Actor / Institución</th>
                      <th className="p-4">Paciente / Destino</th>
                      <th className="p-4">Acción</th>
                      <th className="p-4">Score IA Anomalía</th>
                      <th className="p-4">Estado IA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className={log.aiFlagged ? 'bg-red-950/40 font-semibold' : 'hover:bg-slate-950/80 transition-colors'}>
                        <td className="p-4 font-mono text-[11px] text-slate-400">{log.timestamp}</td>
                        <td className="p-4">
                          <div className="font-extrabold text-white">{log.actorName}</div>
                          <div className="text-[10px] text-slate-400">{log.institution}</div>
                        </td>
                        <td className="p-4 text-slate-200">{log.targetPatientAlias}</td>
                        <td className="p-4 text-slate-300">{log.action}</td>
                        <td className="p-4 font-mono font-black">
                          <span className={log.aiAnomalyScore > 80 ? 'text-red-400 text-sm' : 'text-emerald-400 text-sm'}>
                            {log.aiAnomalyScore}/100
                          </span>
                        </td>
                        <td className="p-4">
                          {log.aiFlagged ? (
                            <span className="px-3 py-1 rounded-xl bg-red-900/90 text-red-200 font-black border border-red-700 text-[10px] shadow-sm">
                              🚨 ALERTA BLOQUEO
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                              OK LEGÍTIMO
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
