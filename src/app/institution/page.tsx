'use client';

import React, { useState } from 'react';
import PrototypeNav from '@/components/PrototypeNav';
import { useTheme } from '@/context/ThemeContext';
import { mockAuditLogs, mockPredictiveZones } from '@/data/mockData';
import { 
  BarChart3, ShieldAlert, MapPin, Activity, Cpu, Sparkles, 
  CreditCard, Flame, AlertOctagon, CheckCircle2, Search, Filter, ShieldCheck, Copy
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function InstitutionalDashboardView() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

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
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      <PrototypeNav />

      {/* Header Bar */}
      <div className={`border-b p-4 sm:p-5 shadow-sm transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl border ${
              isLight ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-purple-950 border-purple-800 text-purple-400'
            }`}>
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-purple-600 uppercase tracking-wider">NIVEL 4: ANALÍTICA & SEGURIDAD IA</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-md border font-mono font-bold ${
                  isLight ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}>
                  SISTEMA CENTRO DE CONTROL
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-0.5">Dashboard Institucional AyudAPI</h1>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">

        {/* Tab Navigation */}
        <div className={`flex border-b gap-3 text-sm font-bold overflow-x-auto pb-1 ${
          isLight ? 'border-slate-300' : 'border-slate-800'
        }`}>
          <button
            onClick={() => setActiveTab('heatmaps')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'heatmaps'
                ? isLight ? 'border-purple-600 text-purple-700 font-extrabold' : 'border-purple-500 text-purple-400'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-500" /> Mapa de Calor & Incidentes
          </button>
          <button
            onClick={() => setActiveTab('predictive')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'predictive'
                ? isLight ? 'border-purple-600 text-purple-700 font-extrabold' : 'border-purple-500 text-purple-400'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4 text-blue-500" /> IA Predictiva SAME
          </button>
          <button
            onClick={() => setActiveTab('obrasocial')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'obrasocial'
                ? isLight ? 'border-purple-600 text-purple-700 font-extrabold' : 'border-purple-500 text-purple-400'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-500" /> Obras Sociales & Beneficios
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'audit'
                ? isLight ? 'border-purple-600 text-purple-700 font-extrabold' : 'border-purple-500 text-purple-400'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
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
              <div className={`lg:col-span-2 border rounded-3xl p-6 sm:p-8 space-y-4 shadow-md relative transition-colors ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white backdrop-blur-md'
              }`}>
                <div className={`flex items-center justify-between border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <h2 className="font-black text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-500" /> Mapa de Calor de Activaciones QR en Vía Pública
                  </h2>
                  <span className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    CABA & Gran Buenos Aires
                  </span>
                </div>

                {/* Simulated Leaflet Map Canvas */}
                <div className={`h-80 rounded-2xl border relative overflow-hidden flex flex-col items-center justify-center p-4 ${
                  isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
                }`}>
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

                  <div className={`absolute bottom-3 left-3 z-10 p-3 rounded-2xl text-[11px] space-y-1 border shadow-md ${
                    isLight ? 'bg-white/95 border-slate-300 text-slate-800' : 'bg-slate-900/90 border-slate-800 text-white backdrop-blur-md'
                  }`}>
                    <span className="font-bold block">Referencias de Calor</span>
                    <div className="flex items-center gap-2 font-medium">
                      <span className="w-3 h-3 rounded-full bg-red-500" /> Alta densidad de incidentes en tiempo real
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart: Incidents by hour */}
              <div className={`border rounded-3xl p-6 space-y-4 shadow-md transition-colors ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white backdrop-blur-md'
              }`}>
                <h2 className={`font-black text-base border-b pb-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  Distribución Horaria de Alertas
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyIncidentTrend}>
                      <XAxis dataKey="hour" stroke={isLight ? '#475569' : '#94a3b8'} fontSize={11} />
                      <YAxis stroke={isLight ? '#475569' : '#94a3b8'} fontSize={11} />
                      <Tooltip contentStyle={{
                        background: isLight ? '#ffffff' : '#0f172a',
                        borderColor: isLight ? '#cbd5e1' : '#334155',
                        borderRadius: '16px',
                        fontSize: '12px',
                        color: isLight ? '#0f172a' : '#ffffff'
                      }} />
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
            <div className={`border rounded-3xl p-6 sm:p-8 space-y-6 shadow-md transition-colors ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white backdrop-blur-md'
            }`}>
              <div className={`flex items-center justify-between border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-2xl border ${
                    isLight ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-950 border-blue-800 text-blue-400'
                  }`}>
                    <Sparkles className="w-7 h-7 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Análisis Predictivo SAME (Capa Operativa IA)</h2>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Optimización de unidades móviles según histórico georreferenciado y condiciones ambientales</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {predictiveZones.map((pz) => (
                  <div key={pz.id} className={`p-6 rounded-3xl border space-y-4 shadow-sm transition-all ${
                    isLight ? 'bg-slate-50 border-slate-200 hover:border-blue-300' : 'bg-slate-950 border-slate-800 hover:border-blue-900'
                  }`}>
                    <div className={`flex items-center justify-between gap-2 border-b pb-3 ${
                      isLight ? 'border-slate-200' : 'border-slate-800'
                    }`}>
                      <span className={`px-3 py-1 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap shrink-0 border inline-flex items-center gap-1.5 ${
                        pz.riskLevel === 'ALTO'
                          ? isLight ? 'bg-red-100 text-red-800 border-red-300' : 'bg-red-950 text-red-300 border-red-800'
                          : isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}>
                        {pz.riskLevel === 'ALTO' ? '🔥 RIESGO ALTO' : '⚠️ RIESGO MEDIO'}
                      </span>
                      <span className={`text-[11px] font-mono font-bold whitespace-nowrap shrink-0 ${
                        isLight ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        ⏰ {pz.peakTime}
                      </span>
                    </div>


                    <h3 className="font-black text-lg">{pz.zoneName}</h3>

                    <div className={`text-xs space-y-1.5 font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      <p>• Incidentes estimados: <strong className="text-amber-600">{pz.predictedIncidents} eventos/turno</strong></p>
                      <p>• Recomendación IA: <strong className="text-emerald-600">{pz.suggestedAmbulanceStation}</strong></p>
                    </div>

                    <div className={`pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                      <span className={`text-[10px] font-bold uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Factores Detectados por IA</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {pz.mainRiskFactors.map((rf, idx) => (
                          <span key={idx} className={`text-[10px] px-2.5 py-1 rounded-lg border ${
                            isLight ? 'bg-white text-slate-800 border-slate-300' : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}>
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
              <div className={`border rounded-3xl p-6 sm:p-8 space-y-4 shadow-md transition-colors ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white backdrop-blur-md'
              }`}>
                <h2 className={`font-black text-lg border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  Prevalencia Anonimizada de Afecciones (Obras Sociales)
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pathologyData} layout="vertical">
                      <XAxis type="number" stroke={isLight ? '#475569' : '#94a3b8'} fontSize={11} />
                      <YAxis dataKey="name" type="category" stroke={isLight ? '#475569' : '#94a3b8'} fontSize={11} width={130} />
                      <Tooltip contentStyle={{
                        background: isLight ? '#ffffff' : '#0f172a',
                        borderColor: isLight ? '#cbd5e1' : '#334155',
                        borderRadius: '16px',
                        color: isLight ? '#0f172a' : '#ffffff'
                      }} />
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
              <div className={`border rounded-3xl p-6 sm:p-8 space-y-5 shadow-md transition-colors ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white backdrop-blur-md'
              }`}>
                <h2 className={`font-black text-lg border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  Simulador de Tarjeta de Beneficios en Farmacias
                </h2>

                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 rounded-3xl text-white space-y-4 shadow-xl relative overflow-hidden border border-emerald-500/40">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-black/40 px-2.5 py-0.5 rounded-md text-white">AYUDAPI BENEFICIOS</span>
                      <h3 className="text-2xl font-black mt-1 text-white">Descuento Farmacias Red Salud</h3>
                    </div>
                    <CreditCard className="w-9 h-9 text-white/90" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-emerald-100 font-mono font-bold">CÓDIGO AFILIADO: 4892019482-01</p>
                    <p className="text-lg font-black text-white">25% OFF EN MEDICACIÓN CONTROLADA</p>
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
            <div className={`border rounded-3xl p-6 sm:p-8 space-y-6 shadow-md transition-colors ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white backdrop-blur-md'
            }`}>
              <div className={`flex items-center justify-between border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-2xl border ${
                    isLight ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-rose-950 border-rose-800 text-rose-400'
                  }`}>
                    <ShieldAlert className="w-7 h-7 animate-bounce" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Registro Estricto de Auditoría & IA de Seguridad</h2>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Cumplimiento Ley 25.326 - Supervisión continua de accesos Nivel 3 y 4</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className={`w-full text-left text-xs ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  <thead className={`font-mono uppercase text-[10px] border-b ${
                    isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}>
                    <tr>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Actor / Institución</th>
                      <th className="p-4">Paciente / Destino</th>
                      <th className="p-4">Acción</th>
                      <th className="p-4">Score IA Anomalía</th>
                      <th className="p-4">Estado IA</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/80'}`}>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className={
                        log.aiFlagged
                          ? isLight ? 'bg-red-50/90 font-semibold' : 'bg-red-950/40 font-semibold'
                          : isLight ? 'hover:bg-slate-50 transition-colors' : 'hover:bg-slate-950/80 transition-colors'
                      }>
                        <td className={`p-4 font-mono text-[11px] whitespace-nowrap ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{log.timestamp}</td>
                        <td className="p-4">
                          <div className={`font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{log.actorName}</div>
                          <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{log.institution}</div>
                        </td>
                        <td className="p-4">{log.targetPatientAlias}</td>
                        <td className="p-4">{log.action}</td>
                        <td className="p-4 font-mono font-black whitespace-nowrap">
                          <span className={log.aiAnomalyScore > 80 ? 'text-red-600 text-sm' : 'text-emerald-600 text-sm'}>
                            {log.aiAnomalyScore}/100
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {log.aiFlagged ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white font-black text-[10px] uppercase tracking-wider shadow-sm whitespace-nowrap">
                              <AlertOctagon className="w-3.5 h-3.5 text-white" /> BLOQUEADO POR IA
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border text-[10px] uppercase tracking-wider whitespace-nowrap ${
                              isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            }`}>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ACCESO LEGÍTIMO
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
