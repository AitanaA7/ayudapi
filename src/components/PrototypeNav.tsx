'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, User, AlertTriangle, Stethoscope, BarChart3, Eye, Sparkles, ChevronRight, SlidersHorizontal, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function PrototypeNav() {
  const pathname = usePathname();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(true);
  const { theme, toggleTheme } = useTheme();

  const isLight = theme === 'light';

  const navItems = [
    {
      step: 'Paso 1',
      label: 'Paciente',
      href: '/patient',
      icon: User,
      badge: 'Nivel 2',
      color: 'rose',
      description: 'Configuración de datos de salud y QR'
    },
    {
      step: 'Paso 2',
      label: 'Vía Pública',
      href: '/emergency',
      icon: AlertTriangle,
      badge: 'Nivel 1',
      highlight: true,
      color: 'red',
      description: 'Página de socorro inmediata sin app'
    },
    {
      step: 'Paso 3',
      label: 'Médicos SAME',
      href: '/medic',
      icon: Stethoscope,
      badge: 'Nivel 3',
      color: 'blue',
      description: 'Portal de ambulancia y triage HL7-FHIR'
    },
    {
      step: 'Paso 4',
      label: 'Centro Control & IA',
      href: '/institution',
      icon: BarChart3,
      badge: 'Nivel 4',
      color: 'purple',
      description: 'IA predictiva y mapas de calor'
    }
  ];

  return (
    <header className={`sticky top-0 z-50 border-b backdrop-blur-xl shadow-md transition-colors duration-200 ${
      isLight
        ? 'bg-white/95 border-slate-200 text-slate-900'
        : 'bg-slate-950/95 border-slate-800 text-white shadow-2xl'
    }`}>
      {/* Top Academic Banner */}
      <div className={`px-4 py-1.5 text-[11px] border-b flex items-center justify-between transition-colors ${
        isLight
          ? 'bg-slate-100 border-slate-200 text-slate-700'
          : 'bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border-slate-800/80 text-slate-300'
      }`}>
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Ingeniería & Calidad de Software</span>
          <span className={`hidden sm:inline ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>• Entregable de Prototipos UI/UX</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold transition-all border cursor-pointer shadow-sm ${
              isLight
                ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Alternar entre Modo Oscuro y Modo Claro"
          >
            {isLight ? (
              <>
                <Moon className="w-3 h-3 text-indigo-600" />
                <span>Modo Oscuro</span>
              </>
            ) : (
              <>
                <Sun className="w-3 h-3 text-amber-400" />
                <span>Modo Claro</span>
              </>
            )}
          </button>

          {/* Academic Evaluator Toggle */}
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold transition-all border cursor-pointer shadow-sm ${
              isLight
                ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Alterna la visibilidad de badges técnicos y anotaciones académicas"
          >
            <SlidersHorizontal className="w-3 h-3 text-rose-500" />
            <span>{showTechnicalDetails ? 'Modo Evaluador' : 'Vista Real'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & App Brand */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer focus:outline-none">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-black text-lg tracking-tight transition-colors group-hover:text-rose-500 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                AyudAPI
              </span>
              {showTechnicalDetails && (
                <span className={`hidden md:inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                  isLight
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-rose-950 text-rose-300 border-rose-800/80'
                }`}>
                  Prototipo 4 Niveles
                </span>
              )}
            </div>
          </Link>

          {/* Stepper Flow Navigation */}
          <nav className={`hidden lg:flex items-center gap-1 p-1 rounded-xl border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <React.Fragment key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-950 scale-[1.02]'
                        : item.highlight
                        ? isLight ? 'text-rose-700 hover:bg-slate-200' : 'text-rose-300 hover:bg-slate-800 hover:text-white'
                        : isLight ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    title={item.description}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.highlight ? 'text-rose-500' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {showTechnicalDetails && (
                      <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono uppercase font-black ${
                        isActive
                          ? 'bg-black/30 text-rose-100'
                          : isLight ? 'bg-white text-slate-600 border border-slate-300' : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                  {idx < navItems.length - 1 && (
                    <ChevronRight className={`w-3 h-3 shrink-0 ${isLight ? 'text-slate-400' : 'text-slate-700'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Navigation Home CTA */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-rose-500" />
              <span>Portada Prototipo</span>
            </Link>
          </div>

        </div>

        {/* Mobile Stepper Drawer */}
        <div className={`lg:hidden flex items-center justify-around py-2 border-t gap-1 overflow-x-auto text-[11px] ${
          isLight ? 'border-slate-200' : 'border-slate-800/80'
        }`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl shrink-0 font-bold transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md'
                    : isLight
                    ? 'text-slate-800 bg-slate-100 border border-slate-300'
                    : 'text-slate-300 bg-slate-900 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}



