'use client';

import React, { useState } from 'react';
import PrototypeNav from '@/components/PrototypeNav';
import { mockAuditLogs, mockPredictiveZones } from '@/data/mockData';
import { 
  BarChart3, ShieldAlert, MapPin, Activity, Cpu, Sparkles, 
  CreditCard, Flame, AlertOctagon, CheckCircle2, Search, Filter, ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function InstitutionalDashboardView() {
  const [auditLogs] = useState(mockAuditLogs);
  const [predictiveZones] = useState(mockPredictiveZones);
  const [activeTab, setActiveTab] = useState<'heatmaps' | 'predictive' | 'obrasocial' | 'audit'>('heatmaps');

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <PrototypeNav />

      {/* Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-950 border border-purple-800 rounded-xl text-purple-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">NIVEL 4: ANALÍTICA & SEGURIDAD IA</span>
                <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800 font-mono">
                  SISTEMA CENTRO DE CONTROL
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-white">Dashboard Institucional AyudAPI</h1>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('heatmaps')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'heatmaps' ? 'border-purple-500 text-purple-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-400" /> Mapa de Calor & Incidentes
          </button>
          <button
            onClick={() => setActiveTab('predictive')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'predictive' ? 'border-purple-500 text-purple-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4 text-blue-400" /> IA Predictiva SAME
          </button>
          <button
            onClick={() => setActiveTab('obrasocial')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'obrasocial' ? 'border-purple-500 text-purple-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-400" /> Obras Sociales & Beneficios
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'audit' ? 'border-purple-500 text-purple-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
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
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-500" /> Mapa de Calor de Activaciones QR en Vía Pública
                  </h2>
                  <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    CABA & Gran Buenos Aires
                  </span>
                </div>

                {/* Simulated Leaflet Map Canvas */}
                <div className="h-80 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-4">
                  {/* Background grid simulation */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
                  
                  {/* Heatmap Nodes */}
                  <div className="absolute top-1/3 left-1/2 w-24 h-24 bg-red-600/40 rounded-full blur-xl animate-pulse" />
                  <div className="absolute top-1/3 left-1/2 -translate-x-3 -translate-y-3 p-2 bg-red-600 text-white font-extrabold text-[10px] rounded-full shadow-lg border border-white">
                    HOTSPOT: CORRIENTES & FLORIDA (SAME #42)
                  </div>

                  <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-amber-500/30 rounded-full blur-xl animate-pulse" />
                  <div className="absolute bottom-1/3 left-1/3 p-1.5 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full shadow border border-white">
                    PLAZA ITALIA
                  </div>

                  <div className="absolute bottom-2 left-2 z-10 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-[11px] space-y-1">
                    <span className="font-bold text-white block">Referencias de Calor</span>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="w-3 h-3 rounded-full bg-red-500" /> Alta densidad (Emergencias simultáneas)
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart: Incidents by hour */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <h2 className="font-bold text-white text-sm border-b border-slate-800 pb-3">
                  Distribución Horaria de Alertas
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyIncidentTrend}>
                      <XAxis dataKey="hour" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                      <Bar dataKey="incidentes" fill="#f43f5e" radius={[4, 4, 0, 0]} />
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-950 border border-blue-800 rounded-xl text-blue-400">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Análisis Predictivo de Incidentes SAME (Capa Operativa IA)</h2>
                    <p className="text-xs text-slate-400">Optimización preventiva de distribución de unidades móviles según historial georreferenciado</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {predictiveZones.map((pz) => (
                  <div key={pz.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                        pz.riskLevel === 'ALTO' ? 'bg-red-950 text-red-300 border-red-800' : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}>
                        RIESGO PREVISTO: {pz.riskLevel}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{pz.peakTime}</span>
                    </div>

                    <h3 className="font-bold text-white text-base">{pz.zoneName}</h3>

                    <div className="text-xs space-y-1 text-slate-300">
                      <p>• Incidentes estimados: <strong className="text-amber-300">{pz.predictedIncidents} eventos/turno</strong></p>
                      <p>• Recomendación IA: <strong className="text-emerald-400">{pz.suggestedAmbulanceStation}</strong></p>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Factores Detectados por IA</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pz.mainRiskFactors.map((rf, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
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
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <h2 className="font-bold text-white text-base border-b border-slate-800 pb-3">
                  Prevalencia Anonimizada de Afecciones (Gestión Obras Sociales)
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pathologyData} layout="vertical">
                      <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={120} />
                      <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {pathologyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Benefits Card Simulation */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <h2 className="font-bold text-white text-base border-b border-slate-800 pb-3">
                  Simulador de Tarjeta de Beneficios en Farmacias
                </h2>

                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 rounded-2xl text-white space-y-4 shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded">AYUDAPI BENEFICIOS</span>
                      <h3 className="text-xl font-bold mt-1">Descuento Farmacias Red Salud</h3>
                    </div>
                    <CreditCard className="w-8 h-8 text-white/80" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-emerald-100 font-mono">CÓDIGO AFILIADO: 4892019482-01</p>
                    <p className="text-lg font-bold">25% OFF EN MEDICATION CONTROLADA (GLUCORESISTENCIA)</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS & AI SECURITY */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-950 border border-rose-800 rounded-xl text-rose-400">
                    <ShieldAlert className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Registro Estricto de Auditoría & IA de Seguridad en Tiempo Real</h2>
                    <p className="text-xs text-slate-400">Cumplimiento Ley 25.326 - Supervisión continua de accesos por API Nivel 3 y 4</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Actor / Institución</th>
                      <th className="p-3">Paciente / Destino</th>
                      <th className="p-3">Acción</th>
                      <th className="p-3">Score IA Anomalía</th>
                      <th className="p-3">Estado IA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className={log.aiFlagged ? 'bg-red-950/40 font-semibold' : 'hover:bg-slate-950'}>
                        <td className="p-3 font-mono text-[11px] text-slate-400">{log.timestamp}</td>
                        <td className="p-3">
                          <div className="font-bold text-white">{log.actorName}</div>
                          <div className="text-[10px] text-slate-400">{log.institution}</div>
                        </td>
                        <td className="p-3 text-slate-200">{log.targetPatientAlias}</td>
                        <td className="p-3 text-slate-300">{log.action}</td>
                        <td className="p-3 font-mono font-bold">
                          <span className={log.aiAnomalyScore > 80 ? 'text-red-400' : 'text-emerald-400'}>
                            {log.aiAnomalyScore}/100
                          </span>
                        </td>
                        <td className="p-3">
                          {log.aiFlagged ? (
                            <span className="px-2 py-1 rounded bg-red-900/80 text-red-200 font-bold border border-red-700 text-[10px]">
                              🚨 ALERTA BLOQUEO
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
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
