import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Heart,
  ChevronRight,
  ChevronLeft,
  QrCode,
  Phone,
  FileText,
  Shield,
  Star,
  Zap,
  MapPin,
  Users,
  Activity,
  Check,
  Plus,
  Upload,
  Share2,
  Download,
  Eye,
  X,
  Lock,
  AlertTriangle,
  User,
  Stethoscope,
  ArrowRight,
  Search,
  Clock,
  Pill,
  History,
  LogOut,
  ChevronDown,
  ChevronUp,
  Bell,
  BookOpen,
} from "lucide-react";

type Page =
  | "home"
  | "create-profile"
  | "qr-success"
  | "login"
  | "emergency"
  | "medical-login"
  | "medical-search"
  | "medical-patient";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
        checked ? "bg-blue-600" : "bg-gray-300"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

const STEPS = ["Datos personales", "Condiciones médicas", "Contactos", "Permisos y QR"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 py-5 px-4">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2",
                  done
                    ? "bg-green-500 border-green-500 text-white"
                    : active
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                )}
              >
                {done ? <Check size={14} /> : step}
              </div>
              <span
                className={cn(
                  "text-xs mt-1 font-medium text-center leading-tight max-w-[72px]",
                  active ? "text-blue-600" : done ? "text-green-600" : "text-gray-400"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-12 sm:w-20 mx-1 mb-5",
                  done ? "bg-green-500" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ loggedIn, onNavigate }: { loggedIn: boolean; onNavigate: (p: Page) => void }) {
  return (
    <nav className="bg-white/95 backdrop-blur border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-1.5">
          <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
            <Heart size={14} className="text-white fill-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg leading-none">
            Ayud<span className="font-black">API</span>
          </span>
        </button>
        <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-600">
          {loggedIn && (
            <button className="hover:text-gray-900 transition-colors">Mi perfil</button>
          )}
          <button
            onClick={() => onNavigate("medical-login")}
            className="hover:text-gray-900 transition-colors"
          >
            Acceso médico
          </button>
          <button className="hover:text-gray-900 transition-colors">Institucional</button>
        </div>
        <button
          onClick={() => onNavigate("create-profile")}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Crear mi QR gratis
        </button>
      </div>
    </nav>
  );
}

// ─── Login Modal ──────────────────────────────────────────────────────────────

function LoginModal({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Heart size={14} className="text-white fill-white" />
          </div>
          <span className="font-black text-xl text-gray-900">AyudAPI</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {mode === "login"
            ? "Accedé a tu perfil médico de emergencia"
            : "Registrate gratis. Tarda menos de 5 minutos."}
        </p>
        <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-4">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.31z"/>
          </svg>
          Continuar con Google
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">o con email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={onLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </button>
        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === "login" ? (
            <>
              ¿No tenés cuenta?{" "}
              <button onClick={() => setMode("register")} className="text-blue-600 font-medium hover:underline">
                Registrate gratis
              </button>
            </>
          ) : (
            <>
              ¿Ya tenés cuenta?{" "}
              <button onClick={() => setMode("login")} className="text-blue-600 font-medium hover:underline">
                Iniciá sesión
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage({
  loggedIn,
  onNavigate,
}: {
  loggedIn: boolean;
  onNavigate: (p: Page) => void;
}) {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
      <Navbar loggedIn={loggedIn} onNavigate={onNavigate} />

      {/* Hero */}
      <section
        className="relative min-h-[580px] flex flex-col justify-center overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1564947471495-f427662213cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#0F1929]/85" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/80 text-xs px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Sistema activo en 12 zonas de Argentina
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4 max-w-2xl">
            Tu información médica,{" "}
            <span className="text-red-500">disponible en el minuto que más importa.</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-lg mb-8">
            AyudAPI transforma un código QR en un sistema de emergencia completo. Condiciones
            críticas, medicación y contactos accesibles sin desbloquear tu celular, en segundos.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate("create-profile")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Crear mi perfil gratuito <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate("emergency")}
              className="flex items-center gap-2 bg-white/10 border border-white/30 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <QrCode size={16} /> Ver demo de emergencia
            </button>
          </div>
        </div>

        {/* Stats bar — solo desktop, layout fijo */}
        <div className="relative bg-[#0F1929] border-t border-white/10 hidden sm:block">
          <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-4 gap-4">
            {[
              { icon: <Zap size={14} className="text-red-400" />, value: "50%", label: "Reducción en tiempo de respuesta" },
              { icon: <Heart size={14} className="text-red-400 fill-red-400" />, value: "847", label: "Vidas asistidas en 2025" },
              { icon: <Users size={14} className="text-red-400" />, value: "4.2k+", label: "Usuarios registrados" },
              { icon: <MapPin size={14} className="text-red-400" />, value: "12", label: "Zonas con cobertura activa" },
            ].map(({ icon, value, label }) => (
              <div key={label} className="flex items-center gap-2">
                {icon}
                <div>
                  <div className="text-white font-bold text-lg leading-none">{value}</div>
                  <div className="text-white/50 text-xs mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-red-600 text-xs font-bold tracking-widest uppercase mb-2">¿Cómo funciona?</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Simple, rápido y seguro</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-12">
            Configuralo en minutos. Funciona sin que estés consciente, sin que tu celular esté desbloqueado.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n: "01", icon: <FileText size={20} className="text-red-500" />, title: "Registrá tu perfil", desc: "Cargá tus datos médicos críticos: alergias, medicación, condiciones y contactos de emergencia." },
              { n: "02", icon: <QrCode size={20} className="text-red-500" />, title: "Generá tu QR", desc: "Obtené un código QR seguro y revocable. Imprimilo en una pulsera, tarjeta o llevalo en tu celular." },
              { n: "03", icon: <Phone size={20} className="text-red-500" />, title: "En una emergencia", desc: "Cualquier persona que escanee el QR accede en segundos a tu información vital y puede alertar al SAME." },
            ].map(({ n, icon, title, desc }) => (
              <div key={n} className="border border-gray-100 rounded-2xl p-6 text-left hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-5xl font-black text-gray-100 leading-none">{n}</span>
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">{icon}</div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-red-600 text-xs font-bold tracking-widest uppercase mb-2">El ecosistema completo</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Diseñado para cada actor de la emergencia
          </h2>
          <p className="text-gray-500 max-w-md mx-auto mb-12">
            Desde el paciente hasta la obra social, cada rol tiene su interfaz optimizada para el momento crítico.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                role: "SOY PACIENTE",
                icon: <QrCode size={18} className="text-blue-600" />,
                iconBg: "bg-blue-50",
                title: "Cargá tu perfil médico y generá tu QR",
                desc: "Registrá tus condiciones críticas, medicación, alergias y contactos de emergencia. Generá tu código QR personalizado para llevar siempre con vos.",
                btn: "Crear mi perfil",
                btnClass: "bg-blue-600 hover:bg-blue-700 text-white",
                onClick: () => onNavigate("create-profile"),
              },
              {
                role: "ESTOY AYUDANDO A ALGUIEN",
                icon: <Heart size={18} className="text-red-600 fill-red-600" />,
                iconBg: "bg-red-50",
                title: "Escaneé un QR o ingresá el código",
                desc: "Accedé al perfil de emergencia de la persona que necesita ayuda. Ver condiciones críticas, contactos ICE y alertar al SAME con geolocalización.",
                btn: "Ver demo de emergencia",
                btnClass: "bg-red-600 hover:bg-red-700 text-white",
                onClick: () => onNavigate("emergency"),
              },
              {
                role: "SOY MÉDICO / PARAMÉDICO",
                icon: <Activity size={18} className="text-emerald-600" />,
                iconBg: "bg-emerald-50",
                title: "Acceso profesional certificado",
                desc: "Iniciá sesión con tu matrícula profesional para acceder a datos clínicos completos: medicación, estudios, notas del paciente e historial de alertas.",
                btn: "Acceso médico",
                btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
                onClick: () => onNavigate("medical-login"),
              },
              {
                role: "OBRA SOCIAL / HOSPITAL",
                icon: <Shield size={18} className="text-violet-600" />,
                iconBg: "bg-violet-50",
                title: "Panel institucional y analytics",
                desc: "Accedé a reportes de siniestralidad, mapas de incidentes, tiempos de respuesta y dashboards para optimizar la distribución de recursos.",
                btn: "Panel institucional",
                btnClass: "bg-violet-600 hover:bg-violet-700 text-white",
                onClick: () => {},
              },
            ].map(({ role, icon, iconBg, title, desc, btn, btnClass, onClick }) => (
              <div key={role} className="bg-white border border-gray-100 rounded-2xl p-5 text-left flex flex-col">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", iconBg)}>{icon}</div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{role}</p>
                <h3 className="font-bold text-gray-900 text-sm mb-2 leading-snug">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">{desc}</p>
                <button
                  onClick={onClick}
                  className={cn("w-full py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1", btnClass)}
                >
                  {btn} <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: <Shield size={16} className="text-blue-600" />, title: "Privacidad por diseño", desc: "Cumplimiento estricto con la Ley 25.326 de protección de datos personales. Sin rastreo permanente, sin venta de datos." },
            { icon: <Star size={16} className="text-emerald-600" />, title: "Respaldo legal para el interviniente", desc: "Encuadrado en el Estado de Necesidad (Art. 34 CP) y la Obligación de Socorro (Art. 108 CP). Ayudá con tranquilidad." },
            { icon: <Zap size={16} className="text-amber-500" />, title: "Tokens revocables", desc: "Si perdés tu pulsera o tarjeta QR, invalidala al instante desde tu perfil. El QR viejo queda inutilizable de forma inmediata." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">{icon}</div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-red-600 py-16 px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Tu QR puede salvar tu vida.</h2>
        <p className="text-white/80 max-w-xl mx-auto mb-8">
          En un accidente de tránsito, una crisis diabética o una reacción alérgica, cada segundo cuenta. Registrarte es gratis y toma menos de 5 minutos.
        </p>
        <button
          onClick={() => onNavigate("create-profile")}
          className="inline-flex items-center gap-2 bg-white text-red-700 font-bold px-8 py-3 rounded-xl hover:bg-red-50 transition-colors border-2 border-white/50"
        >
          Crear mi perfil AyudAPI gratis <ArrowRight size={16} />
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F1929] py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center">
              <Heart size={12} className="text-white fill-white" />
            </div>
            <span className="text-white font-bold text-sm">AyudAPI</span>
          </div>
          <p className="text-white/40 text-xs">Sistema de asistencia médica de emergencia · Argentina · 2025</p>
          <p className="text-white/40 text-xs">Ley 25.326 · Art. 34 y 108 CP</p>
        </div>
      </footer>
    </div>
  );
}

// ─── Create Profile Wizard ────────────────────────────────────────────────────

interface Condition { id: number; type: string; severity: string; description: string; }
interface Medication { id: number; name: string; dose: string; frequency: string; }
interface Contact { id: number; name: string; relation: string; phone: string; }
interface ProfileData {
  alias: string; fullName: string; birthDate: string; gender: string;
  bloodGroup: string; height: string; weight: string;
  conditions: Condition[]; medications: Medication[]; medNotes: string;
  contacts: Contact[];
  shareLocation: boolean; publicProfile: boolean; medAccess: boolean; obraReports: boolean;
}

function CreateProfilePage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ProfileData>({
    alias: "", fullName: "", birthDate: "", gender: "", bloodGroup: "",
    height: "170", weight: "70", conditions: [], medications: [], medNotes: "",
    contacts: [{ id: 1, name: "", relation: "", phone: "" }],
    shareLocation: true, publicProfile: true, medAccess: true, obraReports: false,
  });
  const [condType, setCondType] = useState("Enfermedad crónica");
  const [condSev, setCondSev] = useState("Crítico");
  const [condDesc, setCondDesc] = useState("");
  const [medName, setMedName] = useState("");
  const [medDose, setMedDose] = useState("");
  const [medFreq, setMedFreq] = useState("");

  function addCondition() {
    if (!condDesc.trim()) return;
    setData((d) => ({ ...d, conditions: [...d.conditions, { id: Date.now(), type: condType, severity: condSev, description: condDesc }] }));
    setCondDesc("");
  }
  function removeCondition(id: number) { setData((d) => ({ ...d, conditions: d.conditions.filter((c) => c.id !== id) })); }
  function addMedication() {
    if (!medName.trim()) return;
    setData((d) => ({ ...d, medications: [...d.medications, { id: Date.now(), name: medName, dose: medDose, frequency: medFreq }] }));
    setMedName(""); setMedDose(""); setMedFreq("");
  }
  function removeMedication(id: number) { setData((d) => ({ ...d, medications: d.medications.filter((m) => m.id !== id) })); }
  function addContact() { setData((d) => ({ ...d, contacts: [...d.contacts, { id: Date.now(), name: "", relation: "", phone: "" }] })); }
  function updateContact(id: number, field: keyof Contact, value: string) {
    setData((d) => ({ ...d, contacts: d.contacts.map((c) => (c.id === id ? { ...c, [field]: value } : c)) }));
  }

  const sevColor: Record<string, string> = {
    Crítico: "text-amber-900 bg-amber-100 border-amber-300",
    Moderado: "text-amber-700 bg-amber-50 border-amber-200",
    Leve: "text-blue-700 bg-blue-50 border-blue-200",
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "Inter, sans-serif" }}>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 flex items-center gap-3 h-14">
          <button onClick={() => onNavigate("home")} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center">
              <Heart size={12} className="text-white fill-white" />
            </div>
            <span className="font-black text-gray-900 text-base">AyudAPI</span>
          </div>
          <span className="text-gray-300 text-sm">·</span>
          <span className="text-gray-500 text-sm">Crear perfil médico</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-4">
        <StepIndicator current={step} />

        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <User size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Datos personales</h2>
                <p className="text-sm text-gray-500">Tu información básica para identificación en emergencia</p>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Alias público <span className="text-red-500">*</span></label>
                <p className="text-xs text-gray-400 mb-1.5">Nombre que verá quien te asista. Puede ser solo tu nombre de pila por privacidad.</p>
                <input type="text" value={data.alias} onChange={(e) => setData({ ...data, alias: e.target.value })}
                  placeholder="Ej: Carlos M. o simplemente Carlos"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-gray-700">Nombre completo</label>
                  <span className="text-xs text-blue-600">⊙ Opcional, solo para médicos autorizados</span>
                </div>
                <input type="text" value={data.fullName} onChange={(e) => setData({ ...data, fullName: e.target.value })}
                  placeholder="Tu nombre legal completo"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Fecha de nacimiento <span className="text-red-500">*</span></label>
                  <input type="date" value={data.birthDate} onChange={(e) => setData({ ...data, birthDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Género <span className="text-red-500">*</span></label>
                  <select value={data.gender} onChange={(e) => setData({ ...data, gender: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Seleccionar</option>
                    <option>Masculino</option><option>Femenino</option>
                    <option>No binario</option><option>Prefiero no decir</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Grupo sanguíneo <span className="text-red-500">*</span></label>
                  <select value={data.bloodGroup} onChange={(e) => setData({ ...data, bloodGroup: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">— Seleccionar —</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Altura (cm)</label>
                  <input type="number" value={data.height} onChange={(e) => setData({ ...data, height: e.target.value })} placeholder="170"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Peso (kg)</label>
                  <input type="number" value={data.weight} onChange={(e) => setData({ ...data, weight: e.target.value })} placeholder="70"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={18} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Condiciones y alergias críticas</h2>
                  <p className="text-sm text-amber-600 font-medium">Aparecerán destacadas en amarillo en tu perfil de emergencia</p>
                </div>
              </div>
              <div className="border border-gray-100 rounded-xl p-4 mb-3">
                <p className="text-sm font-semibold text-gray-600 mb-3">Agregar condición</p>
                <div className="flex gap-2 mb-2">
                  <select value={condType} onChange={(e) => setCondType(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Enfermedad crónica</option><option>Alergia</option>
                    <option>Condición cardíaca</option><option>Trastorno neurológico</option><option>Otra</option>
                  </select>
                  <select value={condSev} onChange={(e) => setCondSev(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Crítico</option><option>Moderado</option><option>Leve</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input type="text" value={condDesc} onChange={(e) => setCondDesc(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCondition()}
                    placeholder="Ej: PENICILINA — RIESGO DE ANAFILAXIA"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={addCondition} className="w-9 h-9 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center justify-center transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              {data.conditions.map((c) => (
                <div key={c.id} className={cn("flex items-center justify-between border rounded-lg px-3 py-2 mb-2 text-sm", sevColor[c.severity] || "bg-gray-50 border-gray-200")}>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">{c.type}</span>
                    <p className="font-semibold">{c.description}</p>
                  </div>
                  <button onClick={() => removeCondition(c.id)} className="opacity-40 hover:opacity-70"><X size={14} /></button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Activity size={18} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Medicación actual</h2>
                  <p className="text-sm text-gray-500">Lista de medicamentos que tomás regularmente</p>
                </div>
              </div>
              <div className="border border-dashed border-gray-200 rounded-xl p-4 mb-3">
                <p className="text-sm font-semibold text-gray-600 mb-3">Agregar medicamento</p>
                <div className="flex gap-2">
                  <input type="text" value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="Nombre del medicamento"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" value={medDose} onChange={(e) => setMedDose(e.target.value)} placeholder="Dosis (ej: 50mg)"
                    className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="text" value={medFreq} onChange={(e) => setMedFreq(e.target.value)} placeholder="Frecuencia"
                    className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={addMedication} className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              {data.medications.map((m) => (
                <div key={m.id} className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2 mb-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-900">{m.name}</span>
                    {m.dose && <span className="text-gray-500 ml-2">· {m.dose}</span>}
                    {m.frequency && <span className="text-gray-400 ml-2">· {m.frequency}</span>}
                  </div>
                  <button onClick={() => removeMedication(m.id)} className="text-gray-300 hover:text-gray-500"><X size={14} /></button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <FileText size={18} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Notas para el personal médico</h2>
                  <p className="text-sm text-blue-500">Información clave que debería saber quien te atienda</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-3">Solo visible para médicos y paramédicos certificados (Nivel 3 de acceso).</p>
              <textarea rows={4} value={data.medNotes} onChange={(e) => setData({ ...data, medNotes: e.target.value })}
                placeholder="Ej: En caso de inconsciencia NO administrar insulina. Verificar glucemia antes de cualquier intervención..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <Phone size={18} className="text-green-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Contactos de emergencia</h2>
                  <p className="text-sm text-gray-500">Serán alertados con tu ubicación si se activa una alarma</p>
                </div>
              </div>
              {data.contacts.map((contact, idx) => (
                <div key={contact.id} className={cn("rounded-xl p-4 mb-3", idx === 0 ? "bg-blue-50 border border-blue-100" : "bg-gray-50 border border-gray-100")}>
                  <p className="text-xs font-bold text-blue-600 mb-3">{idx === 0 ? "Contacto principal (ICE)" : `Contacto adicional ${idx + 1}`}</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Nombre completo</label>
                      <input type="text" value={contact.name} onChange={(e) => updateContact(contact.id, "name", e.target.value)}
                        placeholder="María González"
                        className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Relación</label>
                      <input type="text" value={contact.relation} onChange={(e) => updateContact(contact.id, "relation", e.target.value)}
                        placeholder="Esposa / Hijo / Médico..."
                        className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Teléfono de contacto</label>
                    <input type="tel" value={contact.phone} onChange={(e) => updateContact(contact.id, "phone", e.target.value)}
                      placeholder="+54 11 XXXX-XXXX"
                      className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              ))}
              <button onClick={addContact}
                className="w-full border border-dashed border-gray-200 rounded-xl py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                <Plus size={14} /> Agregar otro contacto
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-1">Estudios médicos (opcional)</h2>
              <p className="text-sm text-gray-500 mb-4">
                Subí estudios relevantes como ECG, <span className="text-blue-500">análisis de sangre</span>, etc. Solo los médicos autorizados podrán verlos.
              </p>
              <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center mb-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Arrastrá tus archivos o hacé click para subir</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG · Max 10MB por archivo</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Electrocardiograma", "Análisis de sangre", "Ecocardiograma", "Otro"].map((t) => (
                  <button key={t} className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                    <FileText size={11} /> {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Lock size={18} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Permisos y privacidad</h2>
                  <p className="text-sm text-blue-500">Controlá qué información compartís y con quién</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { key: "shareLocation" as const, title: "Compartir ubicación en emergencias", badge: "Requerido", badgeColor: "bg-red-100 text-red-700", desc: "Al presionar el botón de alerta, se enviará tu ubicación GPS al SAME y tus contactos ICE.", locked: true },
                  { key: "publicProfile" as const, title: "Perfil público de emergencia", badge: "Requerido", badgeColor: "bg-red-100 text-red-700", desc: "Cualquier persona con tu QR puede ver tu alias, condiciones críticas y contactos ICE.", locked: true },
                  { key: "medAccess" as const, title: "Acceso ampliado para médicos certificados", badge: null, desc: "Los médicos y paramédicos con matrícula verificada pueden acceder a tu historial completo.", locked: false },
                  { key: "obraReports" as const, title: "Reportes a obra social (anonimizado)", badge: null, desc: "Permite que tu obra social reciba datos de siniestralidad anónimos para mejorar la cobertura.", locked: false },
                ].map(({ key, title, badge, badgeColor, desc, locked }) => (
                  <div key={key} className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-gray-900">{title}</span>
                        {badge && <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", badgeColor)}>{badge}</span>}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                    <Toggle checked={data[key]} onChange={(v) => !locked && setData({ ...data, [key]: v })} />
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Autorización legal:</strong> Al registrarte en AyudAPI autorizás expresamente a que cualquier persona que encuentre tu código QR en tu persona revise tus pertenencias en caso de emergencia, conforme el Art. 34 del Código Penal (Estado de Necesidad) y el Art. 108 (Obligación de Socorro). Ley 25.326.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
              <h3 className="font-bold text-gray-900 mb-1">Vista previa de tu QR</h3>
              <p className="text-sm text-blue-500 mb-5">Al confirmar, se generará tu QR único y seguro</p>
              <div className="inline-block p-3 border border-gray-100 rounded-xl opacity-40 grayscale">
                <QRCodeSVG value="https://ayudapi.ar/e/preview" size={120} />
              </div>
              <p className="text-xs text-gray-400 mt-3">El QR final se generará al guardar tu perfil</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pb-8">
          <button onClick={() => (step === 1 ? onNavigate("home") : setStep(step - 1))}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ChevronLeft size={16} />{step === 1 ? "Volver al inicio" : "Anterior"}
          </button>
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors">
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={() => onNavigate("qr-success")}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors">
              <Check size={16} /> Crear mi perfil y QR
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── QR Success Page ──────────────────────────────────────────────────────────

function QRSuccessPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const token = "ayudapi-7x9k2m";
  const qrUrl = `https://ayudapi.ar/e/${token}`;
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
            <Check size={28} className="text-green-600 stroke-[2.5]" />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-2">¡Tu perfil está listo!</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Tu código QR fue generado. Guardalo en tu celular, imprimilo en una{" "}
          <span className="text-blue-500">tarjeta</span> o <span className="text-blue-500">pulsera</span> para tener siempre a mano.
        </p>
        <div className="flex justify-center mb-2">
          <div className="border border-gray-100 rounded-2xl p-4">
            <QRCodeSVG value={qrUrl} size={160} level="H" />
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center mb-5">Escaneá para ver tu perfil de emergencia</p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
          <p className="text-xs text-amber-800 leading-relaxed text-center">
            <strong>Aviso:</strong> Quien escanee este QR solo está autorizado a acceder a esta información
            en el contexto de esta emergencia. Queda expresamente prohibido cualquier otro uso de los datos.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
          <p className="text-xs font-bold text-blue-800 mb-1">Token de seguridad</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-blue-600 font-mono">{token}</span>
            <span className="text-gray-300 text-xs">·</span>
            <span className="text-xs text-gray-500">Token válido</span>
            <span className="text-gray-300 text-xs">·</span>
            <span className="text-xs text-green-600 font-semibold">Activo</span>
          </div>
          <p className="text-xs text-blue-500 mt-1">Podés revocar este QR en cualquier momento desde tu perfil.</p>
        </div>
        <div className="space-y-2.5">
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
            <Download size={16} /> Descargar QR (PDF)
          </button>
          <button className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-colors text-sm">
            <Share2 size={16} /> Compartir enlace de emergencia
          </button>
          <button
            onClick={() => onNavigate("emergency")}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-red-50 text-red-600 font-semibold py-3 rounded-xl transition-colors text-sm">
            <Eye size={16} /> Ver cómo me verán en emergencia
          </button>
        </div>
        <button onClick={() => onNavigate("home")}
          className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors mt-5 flex items-center justify-center gap-1">
          <ChevronLeft size={12} /> Volver al inicio
        </button>
      </div>
    </div>
  );
}

// ─── Dev 2: Emergency Profile Page ───────────────────────────────────────────

const DEMO_CONDITIONS_CRITICAL = [
  { type: "ALERGIA", label: "PENICILINA — RIESGO DE ANAFILAXIA" },
  { type: "ENFERMEDAD", label: "DIABÉTICO TIPO 2 — INSULINODEPENDIENTE" },
];
const DEMO_CONDITIONS_OTHER = [
  { type: "ENFERMEDAD", label: "HIPERTENSIÓN ARTERIAL" },
  { type: "ALERGIA", label: "IBUPROFENO — INTOLERANCIA GÁSTRICA" },
];
const DEMO_CONTACTS = [
  { name: "María Méndez", relation: "Esposa", phone: "+54 11 4523-8871" },
  { name: "Dr. Roberto López", relation: "Médico de cabecera", phone: "+54 11 5230-4490" },
  { name: "Lucía Méndez", relation: "Hija", phone: "+54 11 6781-2234" },
];

function EmergencyPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [alertSent, setAlertSent] = useState(false);
  const [iceExpanded, setIceExpanded] = useState(false);
  const [legalExpanded, setLegalExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F1929] flex justify-center" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="w-full max-w-sm">
        {/* Red header bar */}
        <div className="bg-red-600 px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-xs font-black tracking-widest uppercase">Perfil de emergencia activo</span>
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
          <p className="text-white/80 text-xs">AyudAPI · Sistema de Asistencia Médica</p>
        </div>

        <div className="px-3 py-3 space-y-3">
          {/* Aviso al socorrista */}
          <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl px-4 py-3">
            <p className="text-amber-300 text-xs font-semibold text-center leading-relaxed">
              ⊙ Solo autorizado para esta emergencia. Queda prohibido cualquier otro uso de la información.
            </p>
          </div>

          {/* Patient card */}
          <div className="bg-white rounded-2xl p-4">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Persona que necesita asistencia</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-gray-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Carlos M.</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    <Heart size={10} className="fill-red-700" /> A+
                  </span>
                  <span className="text-gray-500 text-xs">Masculino</span>
                  <span className="text-gray-400 text-xs">·</span>
                  <span className="text-gray-500 text-xs">178cm · 82kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Critical conditions */}
          <div>
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <AlertTriangle size={12} className="text-amber-400" />
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest">Condiciones críticas</p>
            </div>
            {DEMO_CONDITIONS_CRITICAL.map(({ type, label }) => (
              <div key={label} className="bg-amber-500 rounded-xl px-4 py-3 mb-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle size={13} className="text-amber-900/80" />
                  <span className="text-amber-900/80 text-xs font-bold uppercase tracking-wide">{type}</span>
                </div>
                <p className="text-amber-900 font-black text-sm tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          {/* Other conditions */}
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 px-1">Otras condiciones</p>
            {DEMO_CONDITIONS_OTHER.map(({ type, label }) => (
              <div key={label} className="bg-amber-500 rounded-xl px-4 py-3 mb-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-white/80 text-xs font-bold uppercase tracking-wide">⊙ {type}</span>
                </div>
                <p className="text-white font-bold text-sm">{label}</p>
              </div>
            ))}
          </div>

          {/* Emergency actions */}
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 px-1">Acciones de emergencia</p>

            {/* SAME alert button */}
            {!alertSent ? (
              <button
                onClick={() => { setAlertSent(true); setIceExpanded(true); }}
                className="w-full bg-red-600 hover:bg-red-700 rounded-xl px-4 py-4 mb-2 flex items-center gap-3 transition-colors"
              >
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell size={18} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-bold text-sm">Alertar al SAME / Ambulancia</p>
                  <p className="text-white/70 text-xs">Envía alerta con geolocalización al servicio de emergencias</p>
                </div>
              </button>
            ) : (
              <div className="bg-green-600 rounded-xl px-4 py-4 mb-2 flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">¡Alerta enviada al SAME!</p>
                  <p className="text-white/80 text-xs">Ubicación GPS enviada · Unidad más cercana notificada</p>
                </div>
              </div>
            )}

            {/* ICE contacts */}
            <div className="bg-green-700 rounded-xl mb-2 overflow-hidden">
              <button
                onClick={() => setIceExpanded(!iceExpanded)}
                className="w-full px-4 py-4 flex items-center gap-3"
              >
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-bold text-sm">Llamar al contacto ICE</p>
                  <p className="text-green-200 text-xs">{DEMO_CONTACTS[0].name} · {DEMO_CONTACTS[0].relation}</p>
                </div>
                {iceExpanded ? <ChevronUp size={16} className="text-white/60" /> : <ChevronDown size={16} className="text-white/60" />}
              </button>
              {iceExpanded && (
                <div className="bg-[#1a2a1a] px-3 pb-3 space-y-2">
                  {DEMO_CONTACTS.map((c) => (
                    <div key={c.name} className="flex items-center justify-between py-2.5 border-b border-white/10 last:border-0">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-green-400" />
                        <div>
                          <p className="text-white text-sm font-semibold">{c.name}</p>
                          <p className="text-green-300 text-xs">{c.relation}</p>
                        </div>
                      </div>
                      <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="text-green-400 text-sm font-mono font-semibold hover:text-green-300">
                        {c.phone}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 911 */}
            <div className="bg-[#1e2d3a] rounded-xl px-4 py-4 mb-2 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone size={18} className="text-white/70" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Llamar al 911</p>
                <p className="text-gray-400 text-xs">Emergencias policiales y bomberos</p>
              </div>
            </div>

            {/* GPS confirmation */}
            {alertSent && (
              <div className="bg-green-900/60 border border-green-600/40 rounded-xl px-4 py-3 mb-2 flex items-start gap-2">
                <MapPin size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-400 text-xs font-bold">Ubicación GPS capturada y enviada</p>
                  <p className="text-green-300/70 text-xs mt-0.5">La unidad de emergencias más cercana fue notificada. Permanecé junto a la persona afectada.</p>
                </div>
              </div>
            )}

            {/* Legal */}
            <div className="bg-[#1e2d3a] rounded-xl overflow-hidden mb-2">
              <button onClick={() => setLegalExpanded(!legalExpanded)}
                className="w-full px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={15} className="text-gray-400" />
                  <span className="text-white/80 text-sm font-medium">Autorización legal del titular</span>
                </div>
                {legalExpanded ? <ChevronUp size={15} className="text-gray-500" /> : <ChevronDown size={15} className="text-gray-500" />}
              </button>
              {legalExpanded && (
                <div className="px-4 pb-4">
                  <p className="text-gray-400 text-xs leading-relaxed">
                    El titular de este perfil autorizó expresamente, al momento del registro, que cualquier persona que encuentre este QR en su persona pueda revisar sus pertenencias en caso de emergencia, conforme el Art. 34 del Código Penal (Estado de Necesidad) y el Art. 108 (Obligación de Socorro). Ley 25.326.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pb-4 pt-2 border-t border-white/10">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <div className="w-5 h-5 bg-red-600 rounded-md flex items-center justify-center">
                <Heart size={10} className="text-white fill-white" />
              </div>
              <span className="text-white/60 text-xs font-semibold">AyudAPI · Sistema de Asistencia Médica</span>
            </div>
            <button
              onClick={() => onNavigate("medical-login")}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              Soy médico/paramédico → acceder a datos clínicos completos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dev 3: Medical Login ─────────────────────────────────────────────────────

function MedicalLoginPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [email, setEmail] = useState("");
  const [matricula, setMatricula] = useState("");
  const [institucion, setInstitucion] = useState("");

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "#0d3b38", fontFamily: "Inter, sans-serif" }}
    >
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#1a5c56" }}>
            <Stethoscope size={28} className="text-emerald-300" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-white text-center mb-1">
          Acceso médico profesional
        </h1>
        <p className="text-emerald-200/70 text-sm text-center mb-8">
          Portal exclusivo para personal de <span className="text-emerald-300">salud certificado</span>
        </p>

        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <div className="space-y-4 mb-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Email profesional <span className="text-red-500">*</span>
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="dr.apellido@hospital.org.ar"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Matrícula profesional <span className="text-red-500">*</span>
              </label>
              <input type="text" value={matricula} onChange={(e) => setMatricula(e.target.value)}
                placeholder="MP 123456 / ME 789012"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <p className="text-xs text-gray-400 mt-1">Médico, paramédico, enfermero u otro personal de salud habilitado</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Institución</label>
              <input type="text" value={institucion} onChange={(e) => setInstitucion(e.target.value)}
                placeholder="Hospital Italiano, SAME, Clínica..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <button
            onClick={() => onNavigate("medical-search")}
            className="w-full flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            style={{ background: "#0d9488" }}
          >
            <ArrowRight size={16} /> Acceder al sistema
          </button>

          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
            <Shield size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Acceso auditado:</strong> Cada consulta queda registrada con fecha, hora y matrícula. El acceso a datos sensibles está sujeto al consentimiento del paciente y al marco legal vigente. Ley 25.326.
            </p>
          </div>
        </div>

        <button onClick={() => onNavigate("home")}
          className="mt-6 flex items-center justify-center gap-1 text-sm text-emerald-300/70 hover:text-emerald-300 transition-colors w-full">
          <ChevronLeft size={14} /> Volver al inicio
        </button>
      </div>
    </div>
  );
}

// ─── Dev 3: Medical Search ────────────────────────────────────────────────────

function MedicalSearchPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#0d9488" }}>
              <Stethoscope size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">Portal Médico · AyudAPI</p>
              <p className="text-xs text-gray-400">Sesión verificada · MP 123456</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Sesión activa
            </div>
            <button onClick={() => onNavigate("medical-login")} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <LogOut size={13} /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Search size={28} className="text-emerald-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Buscar paciente</h1>
        <p className="text-gray-500 text-sm mb-8">
          Ingresá el código QR escaneado, el ID del paciente o el token de emergencia
        </p>

        <div className="flex gap-2 max-w-lg mx-auto mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onNavigate("medical-patient")}
            placeholder="ID, código QR o token · Ej: ayudapi-demo-001"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={() => onNavigate("medical-patient")}
            className="flex items-center gap-2 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
            style={{ background: "#0d9488" }}
          >
            <Search size={15} /> Buscar
          </button>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 max-w-lg mx-auto text-left">
          <p className="font-bold text-emerald-800 text-sm mb-1">Demo rápida</p>
          <p className="text-emerald-700/80 text-xs mb-3">Usá este ID para ver un paciente de ejemplo con datos clínicos completos</p>
          <button
            onClick={() => onNavigate("medical-patient")}
            className="text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            style={{ background: "#0d9488" }}
          >
            Abrir paciente demo: ayudapi-demo-001
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dev 3: Medical Patient Detail ───────────────────────────────────────────

type MedTab = "resumen" | "medicacion" | "estudios" | "historial";

function MedicalPatientPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [tab, setTab] = useState<MedTab>("resumen");
  const [showToast, setShowToast] = useState(true);
  const now = new Date();
  const timeStr = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("es-AR");

  useEffect(() => {
    const t = setTimeout(() => setShowToast(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const tabs: { key: MedTab; label: string; icon: JSX.Element }[] = [
    { key: "resumen", label: "Resumen clínico", icon: <Activity size={13} /> },
    { key: "medicacion", label: "Medicación", icon: <Pill size={13} /> },
    { key: "estudios", label: "Estudios", icon: <FileText size={13} /> },
    { key: "historial", label: "Historial", icon: <History size={13} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate("medical-search")} className="text-gray-400 hover:text-gray-600">
              <ChevronLeft size={18} />
            </button>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#0d9488" }}>
              <Stethoscope size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">Portal Médico · ayudapi-demo-001</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 border border-emerald-300 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
              <Shield size={11} /> Acceso auditado
            </div>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={11} /> {timeStr} p.m.
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pb-20">
        {/* Patient card (teal) */}
        <div className="rounded-2xl p-5 mt-4 mb-4 text-white" style={{ background: "#0d9488" }}>
          <p className="text-emerald-200/80 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Lock size={10} /> Datos Nivel 3 — Solo personal certificado
          </p>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Carlos Méndez</h1>
              <p className="text-emerald-200 text-xs">Alias público: Carlos M.</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {["Masculino","51 años","178cm · 82kg"].map((t) => (
                  <span key={t} className="bg-white/15 text-white text-xs px-2 py-0.5 rounded-full">{t}</span>
                ))}
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Heart size={9} className="fill-white" /> Grupo A+
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-3">
            {[{ label: "Condiciones críticas", value: "2" }, { label: "Medicamentos", value: "4" }, { label: "Estudios", value: "4" }].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-emerald-200/70 text-xs">{label}</p>
                <p className="text-white text-2xl font-extrabold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-1 justify-center",
                  tab === key
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* ── Resumen clínico ── */}
            {tab === "resumen" && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle size={15} className="text-amber-600" /> Condiciones y alergias
                  </h3>
                  <div className="space-y-2">
                    {[
                      { type: "ALERGIA", sev: "CRÍTICO", sevColor: "bg-amber-100 text-amber-800", label: "PENICILINA — RIESGO DE ANAFILAXIA", border: "border-amber-300 bg-amber-50" },
                      { type: "ENFERMEDAD", sev: "CRÍTICO", sevColor: "bg-amber-100 text-amber-800", label: "DIABÉTICO TIPO 2 — INSULINODEPENDIENTE", border: "border-amber-300 bg-amber-50" },
                      { type: "ENFERMEDAD", sev: "MODERADO", sevColor: "bg-amber-100 text-amber-700", label: "HIPERTENSIÓN ARTERIAL", border: "border-amber-200 bg-amber-50" },
                      { type: "ALERGIA", sev: "LEVE", sevColor: "bg-blue-100 text-blue-700", label: "IBUPROFENO — INTOLERANCIA GÁSTRICA", border: "border-blue-200 bg-blue-50" },
                    ].map(({ type, sev, sevColor, label, border }) => (
                      <div key={label} className={cn("border rounded-xl px-4 py-3", border)}>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-gray-500 uppercase">{type}</span>
                          <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded", sevColor)}>{sev}</span>
                        </div>
                        <p className="font-bold text-gray-900 text-sm">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <BookOpen size={15} className="text-gray-500" /> Notas clínicas del paciente
                  </h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs text-amber-900 leading-relaxed">
                      Paciente con antecedentes de hipoglucemia severa. En caso de inconsciencia,{" "}
                      <strong>NO administrar insulina</strong>. Verificar glucemia antes de cualquier intervención.
                      Portador de glucómetro en bolso/mochila.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Phone size={15} className="text-gray-500" /> Contactos de emergencia
                  </h3>
                  <div className="space-y-2">
                    {DEMO_CONTACTS.map((c) => (
                      <div key={c.name} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                            <Phone size={13} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                            <p className="text-xs text-gray-500">{c.relation}</p>
                          </div>
                        </div>
                        <span className="text-sm font-mono text-emerald-600">{c.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
                  ⊙ Este acceso quedó registrado con tu matrícula · MP 123456 &nbsp;·&nbsp; Última actualización: 2025-05-01
                </p>
              </div>
            )}

            {/* ── Medicación ── */}
            {tab === "medicacion" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Medicación actual (4)</h3>
                  <span className="text-xs text-gray-400">Actualizado: 2025-05-01</span>
                </div>
                <div className="space-y-3">
                  {[
                    { n: "#01", name: "Insulina Glargina", dose: "20 UI", freq: "Una vez por día (nocturna)", warn: "⚠ Conservar en frío" },
                    { n: "#02", name: "Metformina", dose: "500 mg", freq: "2 veces por día (con comidas)", warn: null },
                    { n: "#03", name: "Losartán", dose: "50 mg", freq: "1 vez por día (mañana)", warn: null },
                    { n: "#04", name: "AAS (Aspirina)", dose: "100 mg", freq: "1 vez por día (preventivo cardiovascular)", warn: null },
                  ].map(({ n, name, dose, freq, warn }) => (
                    <div key={n} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Pill size={14} className="text-emerald-600" />
                          </div>
                          <p className="font-bold text-gray-900">{name}</p>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">{n}</span>
                      </div>
                      <p className="text-xs text-gray-500 ml-10">
                        Dosis: <span className="text-gray-700 font-medium">{dose}</span>
                        &nbsp;&nbsp;Frecuencia: <span className="text-emerald-600 font-medium">{freq}</span>
                      </p>
                      {warn && (
                        <div className="ml-10 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                          <p className="text-xs text-amber-700 font-semibold">{warn}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-800 mb-1">Nota para el profesional</p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Esta información fue provista por el paciente y no ha sido validada clínicamente por AyudAPI. Verificar siempre con el paciente o su médico de cabecera ante dudas. Ver notas clínicas para información adicional crítica.
                  </p>
                </div>
              </div>
            )}

            {/* ── Estudios ── */}
            {tab === "estudios" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Estudios médicos (4)</h3>
                  <span className="text-xs text-gray-400">Ordenados por fecha (más reciente primero)</span>
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Ecocardiograma Doppler", date: "19 de febrero de 2025", size: "PDF · 3.4 MB" },
                    { name: "Perfil Lipídico Completo", date: "9 de enero de 2025", size: "PDF · 1.1 MB" },
                    { name: "Hemoglobina Glicosilada (HbA1c)", date: "30 de noviembre de 2024", size: "PDF · 0.8 MB" },
                    { name: "Electrocardiograma en reposo", date: "14 de noviembre de 2024", size: "PDF · 1.2 MB" },
                  ].map(({ name, date, size }) => (
                    <div key={name} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3.5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText size={14} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{name}</p>
                          <p className="text-xs text-gray-400">{date} · {size}</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 whitespace-nowrap">
                        <Download size={12} /> Ver estudio
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Historial ── */}
            {tab === "historial" && (
              <div>
                <h3 className="font-bold text-gray-900 mb-4">Historial de activaciones del QR</h3>
                <div className="space-y-0">
                  {[
                    { dot: "bg-red-500", label: "Alerta SAME enviada", date: "12/05/2025 14:32", sub: "CABA · Av. Corrientes 2500 · Interviniente anónimo" },
                    { dot: "bg-blue-500", label: "QR escaneado", date: "12/05/2025 14:31", sub: "CABA · Interviniente anónimo" },
                    { dot: "bg-emerald-500", label: "Datos consultados", date: "03/04/2025 09:15", sub: "Hospital Italiano · Dr. M. Torres · MP 98765" },
                    { dot: "bg-blue-500", label: "QR escaneado", date: "15/02/2025 16:40", sub: "GBA Norte · Interviniente anónimo" },
                  ].map(({ dot, label, date, sub }, i) => (
                    <div key={i} className="flex gap-3 pb-4">
                      <div className="flex flex-col items-center">
                        <div className={cn("w-3 h-3 rounded-full flex-shrink-0 mt-1", dot)} />
                        {i < 3 && <div className="w-0.5 bg-gray-200 flex-1 mt-1" />}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-sm font-semibold text-gray-900">{label}</p>
                          <span className="text-xs text-gray-400">{date}</span>
                        </div>
                        <p className="text-xs text-gray-500">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center border-t border-gray-100 pt-4">
                  <p className="text-sm font-semibold text-gray-400">Fin del historial disponible</p>
                  <p className="text-xs text-gray-400 mt-1">Los accesos anteriores al registro están archivados. Contactá soporte para historial extendido.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audit toast */}
      {showToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-emerald-800 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium z-50 whitespace-nowrap">
          <Check size={13} className="text-emerald-300" />
          Acceso auditado registrado &nbsp;·&nbsp; {dateStr}, {timeStr}
        </div>
      )}
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [loggedIn, setLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  function navigate(p: Page) {
    if (p === "login") { setShowLogin(true); return; }
    setPage(p);
    window.scrollTo(0, 0);
  }

  return (
    <>
      {page === "home" && <HomePage loggedIn={loggedIn} onNavigate={navigate} />}
      {page === "create-profile" && <CreateProfilePage onNavigate={navigate} />}
      {page === "qr-success" && <QRSuccessPage onNavigate={navigate} />}
      {page === "emergency" && <EmergencyPage onNavigate={navigate} />}
      {page === "medical-login" && <MedicalLoginPage onNavigate={navigate} />}
      {page === "medical-search" && <MedicalSearchPage onNavigate={navigate} />}
      {page === "medical-patient" && <MedicalPatientPage onNavigate={navigate} />}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={() => { setLoggedIn(true); setShowLogin(false); navigate("create-profile"); }}
        />
      )}
    </>
  );
}
