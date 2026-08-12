'use client';

import React from 'react';
import Link from 'next/link';
import PrototypeNav from '@/components/PrototypeNav';
import { 
  Shield, User, AlertTriangle, Stethoscope, BarChart3, ArrowRight, 
  CheckCircle2, Sparkles, Lock, Radio, Cpu, FileCheck
} from 'lucide-react';

export default function HomePage() {
  const prototypeViews = [
    {
      title: 'Pantalla 1: Módulo del Usuario (Paciente)',
      href: '/patient',
      icon: User,
      level: 'Nivel 2 (Privado)',
      color: 'from-rose-500 via-red-500 to-rose-600',
      borderColor: 'border-rose-500/40',
      badgeBg: 'bg-rose-950 text-rose-300 border-rose-800',
      description: 'Gestión de perfil crítico (alergias, patologías, medicación), recordatorios de salud cotidiana, anulación instantánea de tokens QR por pérdida y consentimiento explícito Ley 25.326.'
    },
    {
      title: 'Pantalla 2: Interfaz de Emergencia (Interviniente)',
      href: '/emergency',
      icon: AlertTriangle,
      level: 'Nivel 1 (Público)',
      color: 'from-red-600 via-rose-600 to-amber-600',
      borderColor: 'border-red-500/40',
      badgeBg: 'bg-red-950 text-red-300 border-red-800',
      description: 'Página de alto contraste accesible por cualquier persona sin instalar apps. Botones de despacho directo al SAME con GPS, alerta familiar ICE, respaldo legal (Art. 34 y 108) y llamadas 107/911.'
    },
    {
      title: 'Pantalla 3: Acceso para Profesionales (SAME)',
      href: '/medic',
      icon: Stethoscope,
      level: 'Nivel 3 (API Gateway)',
      color: 'from-blue-500 via-indigo-500 to-blue-600',
      borderColor: 'border-blue-500/40',
      badgeBg: 'bg-blue-950 text-blue-300 border-blue-800',
      description: 'Vista de tablet para ambulancias con datos sensibles extendidos (grupo sanguíneo, donación, vacunas), visor de estudios médicos desde MinIO y exportador de payloads JSON de triage.'
    },
    {
      title: 'Pantalla 4: Dashboard Institucional (Analítica & IA)',
      href: '/institution',
      icon: BarChart3,
      level: 'Nivel 4 (Analítico)',
      color: 'from-purple-500 via-indigo-500 to-purple-600',
      borderColor: 'border-purple-500/40',
      badgeBg: 'bg-purple-950 text-purple-300 border-purple-800',
      description: 'Mapa de calor de incidentes, módulo de IA predictiva de emergencias SAME por horario/zona, siniestralidad para Obras Sociales (descuentos farmacias) y auditoría con IA de seguridad.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      <PrototypeNav />

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-rose-600/10 blur-[130px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-extrabold shadow-xl">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>Materia: Ingeniería y Calidad de Software • 4to Año</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight">
            AyudAPI: Ecosistema de Respuesta Médica <span className="bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 bg-clip-text text-transparent">Georreferenciada</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
            Transformando información estática en un recurso accesible durante el <strong>"minuto de oro"</strong> de una emergencia médica en la vía pública a través de tokens QR de alta resiliencia y privacidad.
          </p>

          {/* Quick Quality Specs */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold pt-4">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 flex items-center gap-2 shadow-md">
              <Lock className="w-4 h-4 text-emerald-400" /> Ley 25.326 Datos Personales
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 flex items-center gap-2 shadow-md">
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" /> Geolocalización Reactiva
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 flex items-center gap-2 shadow-md">
              <Cpu className="w-4 h-4 text-blue-400" /> 3 Capas de IA Integrada
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 flex items-center gap-2 shadow-md">
              <FileCheck className="w-4 h-4 text-amber-400" /> Art. 34 & 108 Código Penal
            </div>
          </div>
        </div>
      </section>

      {/* Main Prototype Navigation Cards */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12 sm:py-16 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Maquetado Interactivo de las 4 Pantallas Principales</h2>
          <p className="text-slate-400 text-sm">Selecciona cualquiera de los roles a continuación para explorar la experiencia de usuario:</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prototypeViews.map((view) => {
            const Icon = view.icon;
            return (
              <Link
                key={view.href}
                href={view.href}
                className={`group p-8 rounded-3xl bg-slate-900/90 border ${view.borderColor} hover:border-slate-600 transition-all duration-300 shadow-2xl hover:shadow-rose-950/20 hover:-translate-y-1.5 flex flex-col justify-between space-y-6 relative overflow-hidden backdrop-blur-md cursor-pointer`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${view.color} text-white shadow-xl group-hover:scale-105 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border ${view.badgeBg}`}>
                      {view.level}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-rose-400 transition-colors">
                      {view.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed font-normal">
                      {view.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-black text-rose-400 group-hover:translate-x-1.5 transition-transform">
                  <span>Abrir Prototipo Interactivo</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-400 font-medium">
        <p>Prototipo UX/UI • Ingeniería y Calidad de Software • Sistema AyudAPI</p>
      </footer>
    </div>
  );
}
