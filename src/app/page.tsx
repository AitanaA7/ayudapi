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
      color: 'from-rose-500 to-red-600',
      borderColor: 'border-rose-500/40',
      description: 'Gestión de perfil crítico (alergias, patologías, medicación), recordatorios de salud cotidiana, anulación instantánea de tokens QR por pérdida y consentimiento explícito Ley 25.326.'
    },
    {
      title: 'Pantalla 2: Interfaz de Emergencia (Interviniente en Vía Pública)',
      href: '/emergency',
      icon: AlertTriangle,
      level: 'Nivel 1 (Público)',
      color: 'from-amber-500 to-red-600',
      borderColor: 'border-amber-500/40',
      description: 'Página de alto contraste accesible por cualquier persona sin instalar apps. Botones de despacho directo al SAME con GPS, alerta familiar ICE, respaldo legal (Art. 34 y 108) y llamadas 107/911.'
    },
    {
      title: 'Pantalla 3: Acceso para Profesionales (Médicos SAME)',
      href: '/medic',
      icon: Stethoscope,
      level: 'Nivel 3 (API Gateway)',
      color: 'from-blue-500 to-indigo-600',
      borderColor: 'border-blue-500/40',
      description: 'Vista de tablet para ambulancias con datos sensibles extendidos (grupo sanguíneo, donación, vacunas), visor de estudios médicos desde MinIO y exportador de payloads JSON de triage.'
    },
    {
      title: 'Pantalla 4: Dashboard Institucional (Analítica & IA)',
      href: '/institution',
      icon: BarChart3,
      level: 'Nivel 4 (Analítico)',
      color: 'from-purple-500 to-indigo-600',
      borderColor: 'border-purple-500/40',
      description: 'Mapa de calor de incidentes, módulo de IA predictiva de emergencias SAME por horario/zona, siniestralidad para Obras Sociales (descuentos farmacias) y auditoría con IA de seguridad.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <PrototypeNav />

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden border-b border-slate-800 bg-slate-900/60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-rose-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-bold shadow-lg">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>Materia: Ingeniería y Calidad de Software • 4to Año</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            AyudAPI: Ecosistema de Respuesta Médica <span className="bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 bg-clip-text text-transparent">Georreferenciada</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto">
            Transformando información estática en un recurso accesible durante el <strong>"minuto de oro"</strong> de una emergencia médica en la vía pública a través de tokens QR de alta resiliencia y privacidad.
          </p>

          {/* Quick Quality Specs */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold pt-4">
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" /> Ley 25.326 Datos Personales
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-400 animate-pulse" /> Geolocalización Reactiva
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" /> 3 Capas de IA Integrada
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-400" /> Art. 34 & 108 Código Penal
            </div>
          </div>
        </div>
      </section>

      {/* Main Prototype Navigation Cards */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Maquetado Interactivo de las 4 Pantallas Principales</h2>
          <p className="text-slate-400 text-sm">Selecciona cualquiera de los roles a continuación para explorar la experiencia de usuario:</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prototypeViews.map((view) => {
            const Icon = view.icon;
            return (
              <Link
                key={view.href}
                href={view.href}
                className={`group p-6 rounded-2xl bg-slate-900 border ${view.borderColor} hover:border-slate-600 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between space-y-6 relative overflow-hidden`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${view.color} text-white shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                      {view.level}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors">
                      {view.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {view.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-rose-400 group-hover:translate-x-1 transition-transform">
                  <span>Abrir Prototipo Interactivo</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <p>Prototipo de Ingeniería y Calidad de Software • Sistema AyudAPI • Universidad Tecnológica Nacional (UTN)</p>
      </footer>
    </div>
  );
}
