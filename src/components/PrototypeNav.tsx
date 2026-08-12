'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, User, AlertTriangle, Stethoscope, BarChart3, ShieldAlert, Radio, Sparkles } from 'lucide-react';

export default function PrototypeNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: '1. Paciente',
      href: '/patient',
      icon: User,
      badge: 'Nivel 2',
      color: 'rose',
      description: 'Gestión de perfil médico, tokens QR y privacidad'
    },
    {
      label: '2. Emergencia Vía Pública',
      href: '/emergency',
      icon: AlertTriangle,
      badge: 'Nivel 1 Público',
      highlight: true,
      color: 'red',
      description: 'Página de socorro inmediata sin instalación ni app'
    },
    {
      label: '3. Médicos SAME',
      href: '/medic',
      icon: Stethoscope,
      badge: 'Nivel 3 API',
      color: 'blue',
      description: 'Datos extendidos, estudios MinIO y triage ambulancia'
    },
    {
      label: '4. Dashboard & IA',
      href: '/institution',
      icon: BarChart3,
      badge: 'Nivel 4 Analítico',
      color: 'purple',
      description: 'Mapas de calor, IA predictiva SAME y auditoría de seguridad'
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-white shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & App Brand */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer focus:outline-none">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/80 group-hover:scale-105 group-active:scale-95 transition-all">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white group-hover:text-rose-400 transition-colors">
                  AyudAPI
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-800/80">
                  Prototipo UX/UI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Respuesta Médica Georreferenciada</p>
            </div>
          </Link>

          {/* Core Prototype Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/80 scale-[1.02]'
                      : item.highlight
                      ? 'text-rose-300 hover:bg-slate-800 hover:text-white active:scale-95'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95'
                  }`}
                  title={item.description}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                    isActive ? 'bg-black/30 text-rose-100' : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}>
                    {item.badge}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* System Quality Status Pills */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs shadow-sm">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-semibold text-[11px]">Ley 25.326 & GPS Reactivo</span>
            </div>
            <div className="flex items-center gap-2 text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-800 font-semibold transition-all">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Modo Simulación UI</span>
            </div>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-800/80 gap-1 overflow-x-auto text-[11px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl shrink-0 font-bold transition-all ${
                  isActive ? 'bg-rose-600 text-white shadow-md' : 'text-slate-300 bg-slate-900 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label.split('.')[1]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
