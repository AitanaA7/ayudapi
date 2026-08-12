'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, User, AlertTriangle, Stethoscope, BarChart3, ShieldAlert, Radio } from 'lucide-react';

export default function PrototypeNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: '1. Panel Paciente',
      href: '/patient',
      icon: User,
      badge: 'Nivel 2',
      description: 'Gestión de perfil, QR y tokens'
    },
    {
      label: '2. Interfaz Emergencia',
      href: '/emergency',
      icon: AlertTriangle,
      badge: 'Nivel 1 Público',
      highlight: true,
      description: 'Vista pública para el interviniente'
    },
    {
      label: '3. Médicos / Ambulancia',
      href: '/medic',
      icon: Stethoscope,
      badge: 'Nivel 3 API',
      description: 'Datos extendidos y triage'
    },
    {
      label: '4. Dashboard & IA',
      href: '/institution',
      icon: BarChart3,
      badge: 'Nivel 4 IA',
      description: 'Analítica, Obras Sociales y Auditoría IA'
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & App Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/40 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  AyudAPI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60">
                  Prototipo 4to Año
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Ecosistema de Respuesta Médica Georreferenciada</p>
            </div>
          </Link>

          {/* Core Prototype Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-900/30'
                      : item.highlight
                      ? 'text-rose-300 hover:bg-slate-800/80 hover:text-white'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                  title={item.description}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                    isActive ? 'bg-black/30 text-rose-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* System Quality Indicators */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-medium text-[11px]">Ley 25.326 & GPS Reactivo</span>
            </div>
            <div className="flex items-center gap-2 text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 font-medium transition-colors">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Modo Simulación</span>
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer Bar */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-800/60 gap-1 overflow-x-auto text-[11px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md shrink-0 font-medium ${
                  isActive ? 'bg-rose-600 text-white' : 'text-slate-300 bg-slate-850'
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
