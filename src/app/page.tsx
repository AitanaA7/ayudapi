'use client';

import React from 'react';
import Link from 'next/link';
import PrototypeNav from '@/components/PrototypeNav';
import { useTheme } from '@/context/ThemeContext';
import { 
  Shield, User, AlertTriangle, Stethoscope, BarChart3, ArrowRight, 
  Sparkles, Lock, Radio, Cpu, FileCheck, PlayCircle
} from 'lucide-react';

export default function HomePage() {
  const { theme } = useTheme();

  const prototypeViews = [
    {
      step: 'Paso 1',
      title: 'Pantalla 1: Módulo del Usuario (Paciente)',
      href: '/patient',
      icon: User,
      level: 'Nivel 2 (Privado)',
      color: 'from-rose-500 via-red-500 to-rose-600',
      borderColor: theme === 'light' ? 'border-rose-200' : 'border-rose-500/40',
      badgeBg: theme === 'light' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-rose-950 text-rose-300 border-rose-800',
      description: 'Gestión de perfil crítico (alergias, patologías, medicación), recordatorios de salud cotidiana, anulación instantánea de tokens QR por pérdida y consentimiento explícito Ley 25.326.'
    },
    {
      step: 'Paso 2',
      title: 'Pantalla 2: Interfaz de Emergencia (Interviniente)',
      href: '/emergency',
      icon: AlertTriangle,
      level: 'Nivel 1 (Público)',
      color: 'from-red-600 via-rose-600 to-amber-600',
      borderColor: theme === 'light' ? 'border-red-200' : 'border-red-500/40',
      badgeBg: theme === 'light' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-red-950 text-red-300 border-red-800',
      description: 'Página de alto contraste accesible por cualquier persona sin instalar apps. Botones de despacho directo al SAME con GPS, alerta familiar ICE, respaldo legal (Art. 34 y 108) y llamadas 107/911.'
    },
    {
      step: 'Paso 3',
      title: 'Pantalla 3: Acceso para Profesionales (SAME)',
      href: '/medic',
      icon: Stethoscope,
      level: 'Nivel 3 (API Gateway)',
      color: 'from-blue-500 via-indigo-500 to-blue-600',
      borderColor: theme === 'light' ? 'border-blue-200' : 'border-blue-500/40',
      badgeBg: theme === 'light' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-blue-950 text-blue-300 border-blue-800',
      description: 'Vista de tablet para ambulancias con datos sensibles extendidos (grupo sanguíneo, donación, vacunas), visor de estudios médicos desde MinIO y exportador de payloads JSON de triage.'
    },
    {
      step: 'Paso 4',
      title: 'Pantalla 4: Dashboard Institucional (Analítica & IA)',
      href: '/institution',
      icon: BarChart3,
      level: 'Nivel 4 (Analítico)',
      color: 'from-purple-500 via-indigo-500 to-purple-600',
      borderColor: theme === 'light' ? 'border-purple-200' : 'border-purple-500/40',
      badgeBg: theme === 'light' ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-purple-950 text-purple-300 border-purple-800',
      description: 'Mapa de calor de incidentes, módulo de IA predictiva de emergencias SAME por horario/zona, siniestralidad para Obras Sociales (descuentos farmacias) y auditoría con IA de seguridad.'
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      <PrototypeNav />

      {/* Hero Section */}
      <section className={`relative py-12 sm:py-16 overflow-hidden border-b transition-colors ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-rose-500/10 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold shadow-sm border ${
            theme === 'light' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-950/80 border-rose-800/80 text-rose-300'
          }`}>
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Materia: Ingeniería y Calidad de Software • 4to Año</span>
          </div>

          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            AyudAPI: Ecosistema de Respuesta Médica <span className="bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 bg-clip-text text-transparent">Georreferenciada</span>
          </h1>

          <p className={`text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-300'
          }`}>
            Transformando información estática en un recurso accesible durante el <strong>"minuto de oro"</strong> de una emergencia médica en la vía pública a través de tokens QR de alta resiliencia y privacidad.
          </p>

          {/* Direct CTA Guided Workflow */}
          <div className="pt-2 flex justify-center">
            <Link
              href="/patient"
              className="px-6 py-3.5 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-2xl shadow-xl flex items-center gap-3 active:scale-95 transition-all cursor-pointer"
            >
              <PlayCircle className="w-5 h-5 text-white animate-pulse" />
              <span>Iniciar Flujo Completo del Caso de Uso (Paso 1 a 4)</span>
            </Link>
          </div>

          {/* Quick Quality Specs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-bold pt-2">
            <div className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 shadow-sm ${
              theme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <Lock className="w-3.5 h-3.5 text-emerald-500" /> Ley 25.326 Datos Personales
            </div>
            <div className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 shadow-sm ${
              theme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <Radio className="w-3.5 h-3.5 text-rose-500" /> Geolocalización Reactiva
            </div>
            <div className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 shadow-sm ${
              theme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <Cpu className="w-3.5 h-3.5 text-blue-500" /> 3 Capas de IA Integrada
            </div>
            <div className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 shadow-sm ${
              theme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <FileCheck className="w-3.5 h-3.5 text-amber-500" /> Art. 34 & 108 Código Penal
            </div>
          </div>
        </div>
      </section>

      {/* Main Prototype Navigation Cards */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10 sm:py-14 space-y-8">
        <div className="text-center space-y-1.5">
          <h2 className={`text-xl sm:text-2xl font-black ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>Maquetado Interactivo de las 4 Pantallas Principales</h2>
          <p className={`text-xs sm:text-sm ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-400'
          }`}>Explora de forma directa cualquiera de las aplicaciones o sigue la secuencia cronológica:</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prototypeViews.map((view) => {
            const Icon = view.icon;
            return (
              <Link
                key={view.href}
                href={view.href}
                className={`group p-7 rounded-3xl border transition-all duration-300 shadow-xl hover:-translate-y-1 flex flex-col justify-between space-y-6 relative overflow-hidden cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 text-slate-900 hover:border-slate-300 shadow-slate-200/60'
                    : 'bg-slate-900/90 border-slate-800 text-slate-100 hover:border-slate-700 shadow-2xl backdrop-blur-md'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${view.color} text-white shadow-md group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-xs font-black uppercase font-mono px-2.5 py-1 rounded-lg border ${
                        theme === 'light' ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-slate-950 text-amber-400 border-slate-800'
                      }`}>
                        {view.step}
                      </span>
                    </div>
                    <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-xl border ${view.badgeBg}`}>
                      {view.level}
                    </span>
                  </div>

                  <div>
                    <h3 className={`text-lg sm:text-xl font-black group-hover:text-rose-500 transition-colors ${
                      theme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>
                      {view.title}
                    </h3>
                    <p className={`text-xs sm:text-sm mt-2 leading-relaxed font-normal ${
                      theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                    }`}>
                      {view.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-black text-rose-500 group-hover:translate-x-1.5 transition-transform pt-2">
                  <span>Abrir Prototipo Interactivo</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-xs font-medium ${
        theme === 'light' ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-950 border-slate-800 text-slate-400'
      }`}>
        <p>Prototipo UX/UI • Ingeniería y Calidad de Software • Sistema AyudAPI</p>
      </footer>
    </div>
  );
}


