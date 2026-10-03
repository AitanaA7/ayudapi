Informe de Análisis — Proyecto AyudAPI
Alcance: lectura completa de src/ (134 archivos), supabase/schema.sql, monitoring/, configuración raíz y los artefactos de la ERS. Verificado ejecutando npm run typecheck y npm run lint.
1. Qué es AyudAPI
Aplicación web de respuesta médica georreferenciada para el "minuto de oro" de una emergencia. El paciente genera un QR personal (pulseras, tarjetas, adhesivos) que permite a terceros y personal de salud acceder a datos críticos en segundos, sorteando teléfonos bloqueados y falta de protocolos.
Equipo: 5 integrantes (FRD.UTN, Ingeniería y Calidad de Software, 2026).
2. ERS: estándares, normativa y distribución de requisitos
2.1 Marco normativo
Norma	Aplicación en el código
ISO/IEC/IEEE 29148:2018	Método de especificación (propósito, alcance, definiciones, perspectiva del producto, distribución de requisitos)
Ley 25.326 (Datos Personales)	Cifrado AES-256-GCM de columnas sensibles, minimización de datos por niveles, auditoría de accesos
CP Art. 34 (Estado de Necesidad) y 108 (Obligación de Socorro)	Aviso legal en /e/[slug] — respaldo jurídico del interviniente
2.2 Los 4 niveles de acceso (eje central del diseño)
Nivel	Ámbito	Contenido	Estado
N1	Público/Emergencia	Alias, alergias/patologías Críticas, grupo sanguíneo, contactos ICE	✅ Implemented vía RPC anon get_perfil_emergencia
N2	Privado/Usuario	Perfil completo, consentimientos, revocación de token	✅ Completo
N3	Institucional/API	Historial, estudios, medicación descifrada	✅ Completo
N4	Analítico/Logs	Agregados anonimizados para dashboards	⚠️ Parcial — fuga cross-tenant (ver §9.1)
2.3 Matriz de trazabilidad ERS → implementación (20 RF)
RF	Requisito	Estado	Evidencia
RF-AUT-01	Registro email/contraseña + Google OAuth	✅	api/auth/{register,google}/route.ts
RF-AUT-02	JWT validado en cada petición a la API	✅	lib/auth/session.ts:62-86 + Bearer en los 28 handlers
RF-AUT-03	Rol gestionado por RLS	⚠️	roles_usuario correcto, pero 13 tablas con RLS y solo 8 políticas
RF-AUT-04	Suspensión de usuario por admin	✅	api/usuarios/[id]/suspender
RF-PER-01	Perfil: alergias, tripulación, medicación, ICE	✅	api/profile/route.ts
RF-PER-02	Cifrado de columnas sensibles	✅	lib/security/cipher.ts (AES-256-GCM)
RF-PER-03	Descargar QR en imagen	✅	api/qr/download (PNG 2048px / SVG)
RF-PER-04	Revocar token en cualquier momento	✅	api/qr/revoke
RF-QR-01	QR único con slug seguro + URL pública	✅	lib/qr/slug.ts — 12 chars, alfabeto sin ambiguos, ~58,7 bits
RF-QR-02	QR de alta resolución	✅	errorCorrectionLevel: "H", 2048px
RF-EME-01	Página pública con alias, alertas críticas, ICE	✅	app/e/[slug]/page.tsx (Server Component)
RF-EME-02	Botón Alerta SAME + GPS	✅	components/emergency/activating-alert.tsx
RF-EME-03	Alerta a contactos de emergencia	⚠️	Inserta en notificaciones como 'enviado' sin envío real
RF-EME-04	Artículos 34 y 108 del CP	✅	Aviso en vista de emergencia
RF-EME-05	Fallback 107/911	✅	Botones tel: directos
RF-API-01	Endpoints REST + JWT para Nivel 3	✅	api/medico/paciente/[slug]
RF-API-02	Validar rol antes de devolver datos	✅	Guards en los 28 handlers; triple-check médico
RF-API-03	URLs firmadas5 min	✅	createSignedUrl(..., 300)
RF-DASH-01	Dashboards con mapas de calor + estadísticas	⚠️	Existe, pero heatmap es rejilla CSS, no mapa; 2 de 6 métricas en 0
RF-DASH-02	Filtros por fecha, zona y afección	⚠️	Filtro por período (1m/6m/12m) ✅; no por zona ni afección
RF-DASH-03	Datos anonimizados (Ley 25.326)	❌	Falla — RPCs sin filtro por institución (§9.1)
RF-AUD-01	Log de cada acceso con usuario, IP, fecha, acción	⚠️	Implementado, pero IP falsificable vía x-forwarded-for
RF-AUD-02	Logs solo para admins y auditorías externas	❌	Falla — rol institucion lee toda la auditoría (§9.2)
RF-GEO-01	GPS solo reactivo (trigger explícito)	✅	Sin rastreo en segundo plano
RF-GEO-02	Coordenadas en PostGIS	✅	geometry(Point,4326)
RF-MON-01	Métricas de rendimiento con Prometheus	⚠️	7 gauges de negocio, sin latencia/CPU/errores
RF-MON-02	Dashboards técnicos + de negocio	⚠️	Grafana operativo vía README; sin provisioned dashboards
Resultado: 16 cumplidos · 7 parciales · 3 incumplidos (RF-DASH-03, RF-AUD-02, y el envío real de RF-EME-03).
3. Pautas del equipo (reglas de trabajo）
Extraídas de # CONTEXTO DEL PROYECTO AYUDAPI.txt:
1. Rol declarado antes de generar código — el desarrollador indica si es Dev1, Dev2 o Dev3 para activar los endpoints de su módulo.
2. Formato de entrega endpoint → método, ruta, autenticación, roles permitidos, parámetros, ejemplo de cuerpo, respuesta, y lógica paso a paso.
3. TypeScript estricto, Route Handlers de App Router, @supabase/supabase-js.
4. Códigos modulares, componentes reutilizables, consistencia con el resto del equipo.
5. ⚠️ Regla activa y estricta: "Después de realizar cualquier modificación en el código fuente, ejecuta automáticamente npm run lint. Si el linter devuelve errores o advertencias, corrígelos antes de finalizar."
6. Restricciones de dependencias (DEPENDENCIAS.md): prohibido subir TypeScript 7.x, ESLint 10, React 19.
3.1 Desviación documental
guidelines/Guidelines.md sigue siendo la plantilla vacía de Cursor ("Add your own guidelines here"). Todas las reglas del equipo viven dispersas en los .txt de la raíz y en comentarios JSDoc. Las pautas no están consolidadas en un lugar que una IA o un dev nuevo encuentre de forma evidente.
4. Stack tecnológico
Capa	Tecnología	Versión
Framework	Next.js (App Router)	^15.3.0
Runtime	React / react-dom	18.3.1
Lenguaje	TypeScript strict: true	^6.0.3
Estilos	Tailwind CSS + tw-animate-css	4.1.12
UI base	shadcn/ui sobre Radix	—
Validación	Zod 4 + validadores propios	^4.6.5
BaaS	Supabase (supabase-js, @supabase/ssr)	^2.47.0 / ^0.12.7
Formularios	react-hook-form	7.55.0
QR	qrcode, qrcode.react, html5-qrcode	^1.5.4 / ^4.2.0 / ^2.3.8
Cifrado	node:crypto AES-256-GCM (propio)	—
Calidad	ESLint + typescript-eslint + security + perfectionist	9.39.5
Monitorización	Prometheus + Grafana (Docker)	—
Scripts: dev, build, start, lint, typecheck. Alias: @/* → ./src/*.
4.1 Estado de calidad — verificado ahora
npm run typecheck  →  0 errores
npm run lint       →  134 archivos · 0 errores · 0 warnings
El proyecto está más limpio que lo documentado (DEPENDENCIAS.md y reporte-lint.json registran 499 warnings; hoy es 0).
4.2 Dependencias muertas
@mui/material, @mui/icons-material, @emotion/*, motion, recharts, vaul, embla-carousel, cmdk, input-otp, react-day-picker, react-resizable-panels, html5-qrcode están instaladas pero sin uso real en el producto. Todo src/app/components/ui/ (shadcn, ~50 archivos) es inalcanzable salvo tipos.
5. Arquitectura
5.1 Estructura de directorios
src/
├── app/
│   ├── page.tsx                 Landing pública
│   ├── layout.tsx               Server · metadata + estilos
│   ├── error.tsx / loading.tsx
│   ├── auth/callback            Canje PKCE OAuth
│   ├── auth/elegir-rol          Vinculación de rol
│   ├── crear-perfil/            Wizard 4 pasos (paciente)
│   ├── mi-perfil/               Dashboard Nivel 2
│   ├── qr-exito/                Post-generación QR
│   ├── e/[slug]/                ⭐ Server Component · emergencia pública
│   ├── emergencia/              Demo estática desconectada
│   ├── medico/escanear          Gate + entrada manual
│   ├── medico/completar-perfil  Regularización de credentials
│   ├── medico/paciente/[slug]/ Historial Nivel 3 auditado
│   ├── acceso-medico/           Puerta de entrada médico
│   ├── institucional/            Panel analítico (~1.150 líneas)
│   ├── buscar-paciente/         → redirect (legacy)
│   ├── paciente/[id]/           → redirect (legacy)
│   ├── components/ui/           shadcn (código muerto)
│   └── api/                     28 Route Handlers · runtime nodejs
├── components/
│   ├── auth/login-modal.tsx     Único entry-point (Google OAuth)
│   ├── emergency/               Alerta SAME, acceso discreto, preview
│   ├── estudios/study-manager   Upload/list/preview/delete
│   ├── medico/camera-scanner    Escaneo QR (CÓDIGO MUERTO)
│   ├── layout/                  navbar, footer
│   ├── brand/logo.tsx
│   └── shared/                  toggle, step-indicator
├── lib/
│   ├── supabase/                browser · server · database (tipos)
│   ├── auth/14 módulos (session, registro, ruteo,
│   │                            destino, sisa, invitacion, dev-bypass,
│   │                            institucion, verificacion-medico, actividad…)
│   ├── validation/              profile.ts (validadores) + schemas.ts (Zod)
│   ├── security/cipher.ts       AES-256-GCM
│   ├── qr/slug.ts               Generador de slug
│   └── api/                     client.ts (fetch + Bearer) · http.ts
└── middleware.ts                ⭐ Refresco de sesión + anti-caché
supabase/schema.sql              Fuente de verdad DDL + RPC + RLS
monitoring/                      prometheus.yml + docker-compose + README
Dev1/ Dev2/ Dev3/                Diagramas RF-* del ERS
5.2 Patrón arquitectónico dominante
Monolito full-stack con BaaS. El Next.js unifica frontend y backend en un solo despliegue (Vercel), lo que la ERS justifica por "rapidez y simplicidad operativa, críticos en una aplicación de emergencias".
Modelo de autorización en dos capas:
Capa 1 — Middleware (Edge, src/middleware.ts)
   └─ Refresca sesión Supabase (getUser) + cabeceras no-store
   └─ NO hace RBAC (requeriría SUPABASE_SERVICE_ROLE_KEY en Edge → insecure)
   └─ Matcher global: /((?!_next/static|_next/image|favicon.ico|.*\.(svg|png|…)$).*)

Capa 2 — Route Handlers (Node, runtime nodejs)  ← FRONTERA REAL
   └─ getBearerToken() → 401
   └─ getSessionUser() → 401
   └─ getRolesForUser() → 403
   └─ Verificaciones de propiedad / triple-check
   └─ SUBAY con createAdminServerClient() (service_role) → bypasea RLS
Implicación arquitectónica central: la RLS está habilitada pero es defensa en profundidad, no el mecanismo primario. La autorización real reside en el código de aplicación. Consecuencia: una ruta nueva bajo /api/ que olvide llamar a un guard queda pública.
6. Modelo de datos
6.1 Tablas (14)
Tabla	Propósito	Notas
roles_usuario	Fuente de verdad RBAC	UNIQUE(usuario_id, rol) → rol dual médico-paciente
perfiles_paciente	Perfil clínico	slug_qr UNIQUE, qr_activo, flags de consentimiento
perfiles_medico	Credenciales profesionales	matricula UNIQUE + jurisdiccion, dni, estado_verificacion, invite_modo
perfiles_institucion	Datos de la organización	cuit, documentacion jsonb
pacientes_institucion	N:N paciente↔institución	obra_social, nro_afilado, validado
tokens_qr	Historial de QR	slug UNIQUE, 1 activo por paciente
incidentes	Alertas de emergencia	estado enum, geometry(Point,4326)
escaneos_qr	Historial de escaneos	rol_en_momento, lat/lng
atenciones	Registro clínico de atención	⚠️ Nunca escrita
registros_medicos	Nivel 3 extendido	⚠️ Nunca escrita
estudios	Metadatos de archivos	→ bucket privado estudios
notificaciones	Envíos a contactos ICE	⚠️ Estado 'enviado' sin envío real
logs_auditoria	Trazabilidad legal	accion, direccion_ip, detalles jsonb
padron_profesionales	Nuevo — padrón SISA/REFEPS	UNIQUE(dni, matricula, jurisdiccion), activo
6.2 Funciones de seguridad
Función	Tipo	Grants	Nota
crear_perfil_inicial	SECURITY DEFINER	service_role, authenticated	⚠️ No valida p_usuario_id = auth.uid()
get_perfil_emergencia	STABLE + DEFINER	anon, authenticated	✅ Minimización por diseño
activar_alerta_emergencia	DEFINER	service_role, anon	⚠️ Invocable sin pasar por la API
dashboard_metricas	DEFINER	service_role	⚠️ Sin filtro por institución
incidentes_heatmap	DEFINER	service_role	⚠️ Sin filtro por institución
punto_lng/lat, zona_id, zona_centro_*, patologias_array	IMMUTABLE	service_role	Agregación en celdas de 0,5°
Todas usan set search_path = public → mitigación correcta de search-path hijacking.
6.3 RLS — estado real
13 tablas con RLS habilitada, solo 8 políticas.
Con política ✅	Sin política ❌
roles_usuario (select propia)	incidentes
perfiles_paciente (all propia)	atenciones
perfiles_medico (all propia)	registros_medicos
perfiles_institucion (all propia)	notificaciones
estudios (vía perfiles_paciente)	pacientes_institucion
tokens_qr (propio)	 
escaneos_qr (insert + select propios)	 
logs_auditoria (select propia)	 
padron_profesionales tiene RLS sin políticas → deny-all. Correcto (solo service_role la lee).
6.4 Storage
Bucket privado estudios (creado on-demand). Ruta {paciente_id}/{uuid}.{ext} — el nombre de archivo del usuario nunca entra en la ruta. Signed URLs de 300 s.
7. Funcionalidad en marcha
7.1 Autenticación y RBAC
- UI activa: solo Google OAuth vía LoginModal → POST /api/auth/google → /auth/callback.
- Email/contraseña existe en la API sin UI.
- Rol dual médico-paciente: un médico recibe también perfil de paciente (asegurarPerfilPaciente) y un paciente puede sumar rol médico desde /acceso-medico sin perder el previo.
- Callback: canjea ?code (PKCE) o #access_token → /api/auth/estado → si roles=[] va a /auth/elegir-rol, si existe → /api/auth/confirmar-sesion → rutaPorRol().
- Validación profesional SISA/REFEPS (funcionalidad nueva, no documentada): coincidencia exacta de trío dni + matricula + jurisdiccion contra padron_profesionales (fuente prioritaria) o SISA_PADRON_JSON (fallback). Fail-closed en los 5 caminos.
- Altas por invitación con MEDICO_INVITE_CODE / INSTITUCION_INVITE_CODE (fail-closed en producción).
- Bypass de desarrollo (dev-bypass.ts): DEV_ADMIN_EMAILS + DEV_ALLOW_BYPASS_IN_PROD.
7.2 Flujo de emergencia (el corazón del producto)
Escaneo QR → /e/[slug]  (Server Component, anon)
  ├─ RPC get_perfil_emergencia → solo Nivel 1 filtrado por severidad='Crítico'
  ├─ null → 410 QrInactivo
  ├─ Botones SAME 107 / 911 (tel: sanitizado)
  ├─ ActivarAlerta → geolocation opcional (3s timeout) → POST /api/alertas/emergencia
  │ └─ RPC activar_alerta_emergencia → INSERT incidentes + ST_MakePoint
  │           + loop contactos → INSERT notificaciones → {incidente_id, notificaciones}
  ├─ Aviso legal Ley 25.326 + CP art. 34/108
  └─ AccesoMedicoDiscreto (botón sutil al pie)
        ├─ rol médico → /medico/paciente/[slug]?origen=qr-emergencia
        └─ sino → LoginModal con redirectTo → fallback a /auth/elegir-rol
Minimización de datos por diseño: la RPC anónima devuelve alias, grupo_sanguineo, genero, alergias/patologías solo Críticas, contactos ICE y share_location. Nada más.
7.3 Escaneo médico
camera-scanner (html5-qrcode) con clasificación de errores + entrada manual. GET /api/medico/verificar-qr exige rol médico + triple check:
1. tokens_qr.activo → 404 / 410 revocado
2. perfiles_paciente.qr_activo → 410
3. perfiles_paciente.med_access → 403
Luego escribe en logs_auditoria (verificar_qr) y escaneos_qr.
7.4 Estudios clínicos
POST /api/estudios (multipart): tipo enum, 0 < size ≤ 10 MB (413), MIME ∈ {dicom, pdf, jpeg, png} (415), extensión whitelist (415), descripción ≤ 300. Upload a bucket privado con rollback de storage si falla el insert. DELETE verifica propiedad (id + paciente_id).
7.5 Panel institucional (/institucional)
~1.150 líneas, 5 pestañas: resumen · incidentes · zonas · condiciones · auditoria. Guard de rol institucion|admin. Período conmutable 1m/6m/12m. Consume metricas, heatmap y audit/logs.
7.6 Monitorización
monitoring/ con prometheus.yml + docker-compose.yml + README. GET /api/metrics expone 7 gauges sin labels:
Métrica	Tabla
ayudapi_incidentes_total	incidentes
ayudapi_incidentes_resueltos	incidentes (estado)
ayudapi_incidentes_en_curso	incidentes (estado)
ayudapi_escaneos_total	escaneos_qr
ayudapi_qr_activos	tokens_qr
ayudapi_atenciones_total	atenciones
ayudapi_usuarios_activos	perfiles_paciente
8. Lo que funciona bien
1. La vista de emergencia /e/[slug] es la mejor pieza del sistema: Server Component, force-dynamic + revalidate = 0, RPC anon con minimización de datos, caché bloqueada correctamente.
2. Triple check médico consistente y bien ordenado en los 3 endpoints clínicos, con 410 para QR revocado (semánticamente correcto).
3. Puertas fail-closed en SISA (5 caminos), invitaciones (producción) y bypass dev.
4. Cifrado AES-256-GCM con versionado de formato v1.* y fallback a JSON.parse para migración de datos en claro.
5. Anti-caché en dos niveles: next.config.mjs + middleware.ts + NO_STORE_HEADERS en jsonOk/jsonError.
6. Rutas de Storage no derivan del input del usuario — {paciente_id}/{uuid}.{ext}.
7. Validación compartida cliente/servidor con los mismos predicados de lib/validation/profile.ts.
8. Auditoría real de accesos médicos (verificar_qr, acceso_historial_clinico, acceso_estudios, registro, inicio_sesion, consulta_dashboard).
9. **`
INFORME TÉCNICO — PROYECTO AYUDAPI
Lectura completa del repositorio C:\ayudapi: configuración, 28 Route Handlers, 16 páginas, 12 componentes, 19 módulos de lib/, schema.sql (772 líneas), monitoring/, guidelines y la ERS v2. Sin modificar nada.
1. QUÉ ES AYUDAPI
AyudAPI es un ecosistema de respuesta médica georreferenciada que usa un código QR personal como token de seguridad. Ante una emergencia ("minuto de oro"), cualquier persona que escanee el QR accede a datos clínicos mínimos del paciente sin autenticación, y un médico autenticado accede al historial completo. Todo con auditoría de cada acceso.
Equipo: 5 integrantes (Arostegui, Campos, Cáceres, De Cia, García). UTN, Ingeniería en Sistemas, cátedra Ingeniería y Calidad de Software 2026. Despliegue en Vercel.
2. NORMATIVA Y PAUTAS VIGENTES
2.1 ERS (ISO/IEC/IEEE 29148:2018)
La ERS v2 (30/07/2026 y 15/08/2026, autores Campos/García y Arostegui/Cáceres/De Cia) define 20 requisitos funcionales trazados a8 módulos. Este es el contrato de alcance:
Código	Módulo	Requisito
RF-AUT-01/02/03/04	Autenticación	Login email+contraseña y Google OAuth · JWT validado por request · roles vía RLS · suspensión por admin
RF-PER-01/02/03/04	Perfil	CRUD alergias/patologías/medicación/grupo sanguíneo/ICE · cifrado de columnas sensibles · descarga de QR · revocación
RF-QR-01/02	QR	Slug seguro + URL pública · QR de alta resolución
RF-EME-01/02/03/04/05	Emergencia	Página pública con alias + alertas críticas + ICE · botón SAME con GPS · alerta a ICE · art. 34 y 108 del Código Penal · fallback 107/911
RF-API-01/02/03	API	REST con JWT · validación de rol antes de devolver datos · URLs firmadas 5 min
RF-DASH-01/02/03	Dashboards	Mapas de calor y estadísticas · filtros por fecha/zona/afección · anonimización Ley 25.326
RF-AUD-01/02	Auditoría	Log de cada acceso con usuario/IP/fecha/acción · accesible solo a administradores y auditorías externas
RF-GEO-01/02	Geo	GPS solo bajo evento (reactiva) · coordenadas en PostGIS
RF-MON-01/02	Monitorización	Prometheus (tiempos de respuesta, errores, CPU) · Grafana técnico y de negocio
Leyes citadas como cumplimiento: Ley 25.326 (Protección de Datos Personales), Código Penal art. 34 (Estado de Necesidad) y art. 108 (Obligación de Socorro).
2.2 Modelo de 4 niveles de acceso (núcleo del diseño de datos)
Nivel	Contenido	Quién
1 Público/Emergencia	alias, grupo sanguíneo, alergias/patologías Críticas, contactos ICE	cualquiera con el QR, sin login
2 Privado/Usuario	perfil completo, consentimientos, revocación de token	paciente autenticado
3 Institucional/API	medicación cifrada, notas, estudios con URL firmada	médico autenticado
4 Analítico/Logs	agregados anonimizados por celda de 0,5°	institución / admin
Minimización de datos real: la RPC get_perfil_emergencia (schema.sql:368-396) filtra por severidad = 'Crítico' en SQL, no en la app.
2.3 Pautas de trabajo del equipo
En # CONTEXTO DEL PROYECTO AYUDAPI.txt:129:
"Después de realizar cualquier modificación en el código fuente, ejecuta automáticamente npm run lint. Si el linter devuelve errores o advertencias, corrígelos antes de finalizar."
En DEPENDENCIAS.md (secciones57-97): prohibido subir TypeScript a 7.x, ESLint a 10.x ni React 19, con justificación de compatibilidades verificadas.
3. STACK Y ESTADO DE SALUD TÉCNICA
Capa	Tecnología	Versión
Framework	Next.js App Router	^15.3.0
UI	React / react-dom	18.3.1
Lenguaje	TypeScript strict: true	^6.0.3
Estilos	Tailwind CSS + tw-animate-css	4.1.12
Base de datos	Supabase Postgres + PostGIS	—
Auth	@supabase/supabase-js / @supabase/ssr	^2.47.0 / ^0.12.7
Validación	Zod 4.6.5 + validadores propios	—
QR	qrcode, qrcode.react, html5-qrcode	^1.5.4 / ^4.2.0 / ^2.3.8
Cifrado	AES-256-GCM sobre node:crypto	propio
Lint	ESLint + typescript-eslint + security + perfectionist	9.39.5 / 8.68.0 / 4.0.1 / 5.11.0
Verificación ejecutada en esta revisión:
- npm run typecheck → 0 errores
- npm run lint → 134 archivos, 0 errores, 0 warnings
Esto es una mejora sustancial respecto a lo documentado: DEPENDENCIAS.md:112 y CONTEXTO_PROYECTO.txt:229 hablan de "499 warnings". El código fue normalizado y reporte-lint.json (1 MB, en raíz) quedó obsoleto. La calidad de código está en su mejor momento histórico.
4. ARQUITECTURA
4.1 Estructura
src/
├── middleware.ts              # solo refresco de sesión + anti-caché. NO hace RBAC
├── app/
│   ├── page.tsx               # landing pública
│   ├── layout.tsx             # metadata + estilos
│   ├── page.tsx|error.tsx|loading.tsx
│   ├── crear-perfil/          # wizard (Nivel 2)
│   ├── mi-perfil/             # dashboard paciente (5 endpoints)
│   ├── qr-exito/              # post-generación
│   ├── e/[slug]/              # Server Component · emergencia pública · noindex
│   ├── emergencia/            # demo estática desconectada
│   ├── medico/escanear|completar-perfil|paciente/[slug]
│   ├── acceso-medico/         # puerta de entrada médico
│   ├── institucional/         # panel analítico · ~1.150 líneas · 5 pestañas
│   ├── auth/callback|elegir-rol
│   ├── buscar-paciente/       # legacy → redirect
│   ├── paciente/[id]/         # legacy → redirect
│   ├── api/                   # 28 Route Handlers, runtime nodejs
│   └── components/ui/         # shadcn/ui (45 componentes)
├── components/                # auth, emergency, estudios, medico, layout, brand, shared
├── lib/
│   ├── supabase/{browser,server,database}.ts
│   ├── auth/                  # 13 módulos
│   ├── validation/{profile,schemas}.ts
│   ├── security/cipher.ts
│   ├── qr/slug.ts
│   └── api/{client,http}.ts
supabase/schema.sql            # fuente de verdad: DDL + RPC + RLS + migraciones
monitoring/                    # Prometheus + Grafana en Docker
Dev1/, Dev2/, Dev3/            # diagramas RF-* de la ERS
4.2 Patrón de seguridad: el RBAC vive en los Route Handlers, no en el middleware
Esta es la decisión arquitectónica más importante y está bien razonada:
- El middleware corre en runtime Edge y solo tiene la anon key (pública por diseño). El RBAC requiere leer roles_usuario, que solo es accesible con SUPABASE_SERVICE_ROLE_KEY. Poner la service key en Edge la expondría.
- Por eso: src/middleware.ts:4-53 únicamente refresca cookies (await supabase.auth.getUser(), cuyo resultado se descarta) y aplica no-store.
- Cada endpoint hace: getBearerToken() → getSessionUser(token) (valida JWT vía auth.getUser) → getRolesForUser(userId) con service role → chequeo de rol → requireUserIn().
Consecuencia asumida: cualquier endpoint nuevo que olvide llamar a un guard queda público. Es un control por convención, no por defecto.
Segundo patrón: service_role como norma. De28 endpoints, la gran mayoría lee y escribe con createAdminServerClient(), lo que anula por completo las políticas RLS. La RLS solo protege accesos directos desde el navegador. Toda la autorización real está en TypeScript.
Tercero patrón: "administración transparente". asegurarPerfilPaciente() (registro.ts:134-165) crea perfil de paciente y otorga el rol paciente on-demand. Permite que un médico con rol dual use estudios sin flujo extra. Coherente con el requisito de que "todo profesional conserva las funcionalidades del paciente", pero implica que un admin o institucion que llame a /api/profile o /api/estudios termina con rol paciente.
4.3 Anti-caché:initiative en4 capas
next.config.mjs:20-29 + middleware.ts:43-50 + session.ts:27-31 (NO_STORE_HEADERS) + api/client.ts:27-33 (cache: "no-store"). /e/[slug] añade force-dynamic + revalidate = 0. Es una defensa sólida y bien pensada contra bfcache y sesiones cruzadas — un riesgo real en apps de datos de salud.
5. MODELO DE DATOS
14 tablas + padron_profesionales (15). Enums: rol_usuario_t, severidad_t (con acento: Crítico), estado_incidente_t, tipo_estudio_t.
Estructura de perfiles_paciente (la tabla crítica):
- Identidad: usuario_id UNIQUE, alias, dni, nombre_completo, fecha_nacimiento, genero
- Clínico: grupo_sanguineo, altura_cm, peso_kg, alergias/patologias jsonb, medicacion TEXT cifrado, notas_medicas TEXT cifrado, contactos_emergencia jsonb
- QR: slug_qr UNIQUE, qr_activo
- 4 consentimientos con default true: share_location, public_profile, med_access; obra_reports default false
- Trigger trg_perfiles_paciente_actualizado mantiene actualizado_en
9 funciones de seguridad en Postgres:
Función	Tipo	Grant
crear_perfil_inicial	SECURITY DEFINER	service_role, authenticated ⚠️
activar_alerta_emergencia	SECURITY DEFINER	service_role, anon
get_perfil_emergencia	SECURITY DEFINER + STABLE	anon, authenticated
dashboard_metricas	SECURITY DEFINER	service_role ✅
incidentes_heatmap	SECURITY DEFINER	service_role ✅
punto_lng/punto_lat/zona_id/zona_centro_*/patologias_array	IMMUTABLE	service_role
set_actualizado_en	trigger	—
Todas con set search_path = public → mitigación correcta de search path hijacking.
5.1 Cifrado (RF-PER-02)
src/lib/security/cipher.ts — AES-256-GCM, node:crypto, IV de 12 bytes aleatorio, formato versionado v1.<iv>.<authTag>.<ct> en base64url. Los descifradores tienen fallback a JSON.parse para migrar datos históricos en claro. Correcto. Limitaciones: sin AAD (un ciphertext es intercambiable entre columnas), clave única global sin versionado ni rotación.
5.2 Anonimización del dashboard (RF-DASH-03)
El diseño es correcto y es de las mejores piezas del proyecto. zona_id(lng, lat) (schema.sql:587-595) agrega en celdas de 0,5° (~55 km) y expone solo el centroide de la celda, nunca la coordenada exacta. Una institución nunca ve un punto individual. dashboard_metricas y incidentes_heatmap están grantadas solo a service_role.
6. FUNCIONALIDAD EN FUNCIONAMIENTO
6.1 Autenticación y RBAC dual — operativo
8 endpoints en api/auth/. Google OAuth es el único flujo con UI activa (login-modal.tsx). El flujo completo funciona: /api/auth/google → /auth/callback (canje PKCE con fallback por hash) → /api/auth/estado (distingue nuevo vs. existente, no provisiona) → /auth/elegir-rol o POST /api/auth/confirmar-sesion → rutaPorRol().
Rol dual médico-paciente bien resuelto: vincular-rol entrega perfil + rol paciente a todo médico (asegurarPerfilPaciente), y un paciente puede sumar rol médico desde /acceso-medico sin perder el previo. roles_usuario tiene UNIQUE(usuario_id, rol) — N roles por usuario.
Ruteo (lib/auth/ruteo.ts:7-49) con defensa anti open-redirect: rechaza URLs externas, protocol-relative // y la página actual. Prioridad admin > medico > institucion > paciente, destino pendiente gana si es interno.
6.2 Validación de credenciales médicas (SISA/REFEPS) — operativo, fail-closed
src/lib/auth/sisa.ts (182 líneas) implementa una abstracción local del padrón profesional:
1. Normaliza DNI / jurisdicción (sin acentos) / matrícula
2. Triple coincidencia exacta AND contra padron_profesionales (dni + matricula + jurisdiccion)
3. Si la tabla existe y no coincide → bloquea sin mirar el fallback
4. Si la relación no existe → cae a SISA_PADRON_JSON (env)
5. Si no hay ninguna fuente → console.warn + bloquea
src/lib/auth/invitacion.ts implementa MEDICO_INVITE_CODE / INSTITUCION_INVITE_CODE: con secreto configurado, fail-closed al 100%; sin secreto en producción, 403.
src/lib/auth/dev-bypass.ts: DEV_ADMIN_EMAILS + DEV_ALLOW_BYPASS_IN_PROD, fail-closed, permite matrículas TEST- y autoasigna estado_verificacion = 'verificado'.
src/lib/validation/profile.ts (17 KB) + schemas.ts (11 KB): DNI ^\d{7,8}$ estricto, 24 jurisdicciones, MATRICULA_REAL_REGEX, teléfono 8-15 dígitos. Los mismos validadores corren en cliente y servidor (importados por crear-perfil/page.tsx) — patrón correcto.
Nota importante: CONTEXTO_PROYECTO.txt:206 afirma "Búsqueda de 'bypass|mock|test-user|dev-mode' solo trae @playwright/test (sin uso real)" y :404 "TODO /api/medico/ exige Bearer + rol médico"*. Ambas afirmaciones están desactualizadas: dev-bypass.ts existe y es funcional. El doc de contexto miente en este punto.
6.3 Vista pública de emergencia (RF-EME-01..05) — operativo, la pieza mejor resuelta
src/app/e/[slug]/page.tsx es el único Server Component real del producto: force-dynamic, revalidate = 0, RPC anónima, y devuelve QrInactivo (410) si el QR está revocado.
Implementa los5 requisitos EME: alias + mínimo vital crítico + contactos ICE (enlaces tel: sanitizados), botón SAME107 / 911 con GPS reactivo (timeout 3 s, degrada a exacta: false), ActivarAlerta, y el respaldo legal de los art. 34 y 108 del Código Penal.
AccesoMedicoDiscreto: botón sutil al pie. Si el usuario es médico → /medico/paciente/[slug]?origen=qr-emergencia. Si no → LoginModal con redirectTo. La auditoría ocurre en el endpoint de servidor, no en la UI. Correcto.
6.4 Acceso médico y triple check — operativo
GET /api/medico/verificar-qr, GET /api/medico/paciente/[slug], GET /api/medico/paciente/[slug]/estudios aplican los3 checks en orden:
1. tokens_qr.activo → 404 no existe / 410 revocado
2. perfiles_paciente.qr_activo → 410
3. perfiles_paciente.med_access → 403
Y luego escriben en logs_auditoria (verificar_qr, acceso_historial_clinico, acceso_estudios) y escaneos_qr. /api/medico/escaneos devuelve los 30 últimos con el flag disponible = qr_activo && med_access.
Minimización de datos bien hecha: la respuesta de /api/medico/paciente/[slug] usa select("*") internamente pero whitelistea 15 columnas en la salida, por lo que dni, slug_qr y los flags de consentimiento no se filtran.
6.5 Estudios clínicos (RF-API-03) — operativo
POST /api/estudios: multipart con tipo (enum), descripcion (≤300), archivo ≤10 MB, MIME en {application/dicom, application/pdf, image/jpeg, image/png}, extensión en {pdf,jpg,jpeg,png,dcm,dicom,dim}. Ruta de storage {paciente_id}/{randomUUID()}.{ext} — no contiene input del usuario. Bucket privado estudios. Rollback correcto: si el insert falla, storage.remove(). Signed URLs de 300 s.
6.6 QR (RF-QR-01/02) — operativo
generateQrSlug(12): alfabeto de 30 caracteres sin ambiguos (sin i,l,o,0,1), ~58,7 bits de entropía. Descarga PNG (2048 px, corrección de error H) y SVG vía qrcode con format en allowlist. Un solo token activo; generate revoca los previos.
6.7 Geolocalización reactiva (RF-GEO-01/02) — operativo
incidentes.ubicacion geometry(Point,4326) se puebla con ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326) solo si p_exacta. Los3 campos punto_lng/punto_lat manejan correctamente el fallback a i.lng/i.lat cuando la geometría es NULL. Sin rastreo permanente: el GPS se captura exclusivamente al pulsar el botón.
6.8 Panel institucional — parcialmente operativo
src/app/institucional/page.tsx, ~1.150 líneas, 5 pestañas (resumen / incidentes / zonas / condiciones / auditoría), consume los 3 endpoints con caché no-store. Guarda de rol: institucion o admin, redirige al resto. Período conmutable 1m/6m/12m con whitelist en servidor.
6.9 Monitorización (RF-MON-01) — operativo
monitoring/ con docker-compose.yml + prometheus.yml (scrape 30 s) + README. GET /api/metrics expone 7 gauges:
Métrica	Tabla
ayudapi_incidentes_total	incidentes
ayudapi_incidentes_resueltos	incidentes (estado=resuelto)
ayudapi_incidentes_en_curso	incidentes (estado=en_curso)
ayudapi_escaneos_total	escaneos_qr
ayudapi_qr_activos	tokens_qr (activo)
ayudapi_atenciones_total	atenciones
ayudapi_usuarios_activos	perfiles_paciente (qr_activo)
Sin labels, todas gauge, totales históricos acumulados (no del período). Content-Type text/plain; version=0.0.4.
7. MATRIZ DE CUMPLIMIENTO DE LA ERS
Requisito	Estado	Evidencia / brecha
RF-AUT-01	✅	Google OAuth activo; email/contraseña en API sin UI
RF-AUT-02	✅	getSessionUser valida JWT por request
RF-AUT-03	⚠️ Parcial	roles_usuario +8 políticas RLS. Pero el100% de los accesos sensibles pasa por service_role, que anula la RLS. Además RF-API-02 dice "aplicando las políticas RLS" y eso no ocurre en la práctica
RF-AUT-04	✅	PUT /api/usuarios/[id]/suspender
RF-PER-01	✅	Wizard + PUT /api/profile
RF-PER-02	✅	AES-256-GCM en medicacion y notas_medicas
RF-PER-03	✅	/api/qr/download PNG/SVG
RF-PER-04	✅	DELETE /api/qr/revoke
RF-QR-01	✅	Slug 12 chars, tokens_qr
RF-QR-02	✅	PNG 2048 px, error correction H
RF-EME-01	✅	/e/[slug] + RPC con filtro severidad='Crítico'
RF-EME-02	✅	SAME + GPS reactivo
RF-EME-03	⚠️ Parcial	activar_alerta_emergencia inserta en notificaciones con estado='enviado', pero no hay envío real de SMS/push. El ERS dice "notificaciones push o correo"
RF-EME-04	✅	Art. 34 y 108 visibles
RF-EME-05	✅	Fallback 107/911
RF-API-01	✅	REST + JWT
RF-API-02	⚠️ Parcial	Rol validado en cada handler ✅, pero no "aplicando las políticas RLS" ❌ (service_role)
RF-API-03	✅	Signed URLs 300 s en bucket privado
RF-DASH-01	⚠️ Parcial	Hay heatmap y métricas, pero no hay Grafana con "mapas de calor" reales: es una rejilla CSS, no un mapa. Y no hay "mapas de incidentes"
RF-DASH-02	⚠️ Parcial	Filtro por periodo ✅, por condición ✅, por zona ❌ (se muestra, no se filtra)
RF-DASH-03	✅	Agregación por celda de 0,5° con centroide
RF-AUD-01	⚠️ Parcial	Se audita acceso a historial y QR, pero NO: generación/revocación de QR, cambios de consentimiento (med_access), subida/borrado de estudios, ni asociación a institución
RF-AUD-02	❌ Incumplido	El ERS dice "accesibles solo para administradores y auditorías externas". La implementación autoriza institucion O admin y devuelve emails de médicos, matrículas, IPs crudas y pseudónimos de pacientes
RF-GEO-01	✅	Solo bajo evento
RF-GEO-02	✅	geometry(Point,4326)
RF-MON-01	⚠️ Parcial	Hay 7 gauges de negocio, pero no hay tiempos de respuesta, ni errores, ni CPU (que es lo que pide el ERS)
RF-MON-02	⚠️ Parcial	Stack listo; falta provisionar los dashboards
Resumen: 16 cumplidos · 8 parciales · 1 incumplido (RF-AUD-02).
8. HALLAZGOS CRÍTICOS
8.1 SeguridadC1 — Escalación de privilegios vía RPC (CRÍTICO).
crear_perfil_inicial es SECURITY DEFINER y está grantada a service_role, authenticated (schema.sql:308), pero no valida p_usuario_id = auth.uid(). Cualquier usuario autenticado puede llamar directamente a POST /rest/v1/rpc/crear_perfil_inicial con p_rol: 'admin' y un usuario_id arbitrario, y obtener el rol admin. Toda la validación Zod/SISA/invitación de los handlers es irrelevante porque la garantía real está en el cliente, no en la base de datos.
→ Fix: revocar el grant a authenticated y agregar if p_usuario_id <> auth.uid() then raise exception; end if; (con una vía separada para service_role).
C2 — Fuga cross-tenant en el panel institucional (ALTO).
autenticarInstitucional() resuelve institucionId (institucion.ts:62-73) pero metricas y heatmap nunca lo pasan a la RPC, y dashboard_metricas/incidentes_heatmap no filtran por institución en ninguna subconsulta. Una obra social ve incidentes, escaneos, atenciones, patologías y clusters geográficos de toda la plataforma. Además por_patologia itera select distinct sobre perfiles_paciente sin filtro de fecha ni de institución → filtra el catálogo global de diagnósticos.
→ Fix: añadir p_institucion_id uuid a ambas funciones y filtrar en cada subconsulta.
C3 — GET /api/audit/logs filtra toda la auditoría si falta el perfil (ALTO).
audit/logs/route.ts:158-160 aplica .eq("institucion_id", ...) solo si es truthy, y institucion.ts fija institucionId = null sin error cuando .maybeSingle() no devuelve fila. Un usuario con rol institucion en roles_usuario pero sin fila en perfiles_institucion recibe los logs de todas las instituciones, con emails de médicos, IPs y pseudónimos de pacientes.
C4 — Confianza en user_metadata.app_rol para aprovisionar (ALTO).
confirmarYProvisionar (registro.ts:41) lee el rol de usuario.appRol, que session.ts:68-73 extrae de user_metadata.app_rol, un campo escribible por el propio usuario vía auth.updateUser({data}). GET /api/auth/rol:39 y GET /api/profile:86-95 llaman a esta función sin opciones, así que un app_rol: 'medico' persistido crea un perfiles_medico completo saltándose SISA, unicidad e invitación. Encadenado con register/route.ts:344-352 (escribe el metadata antes de provisionar y traga el error de la RPC, respondiendo 201 con sesión válida pero sin roles), es una escalada en 2 pasos.
C5 — Fail-open en endpoints de autorización (ALTO).
- webhooks/email/route.ts:70-76: si NOTIFICACIONES_EMAIL_SECRETO no está definida, el chequeo se salta y cualquiera puede enviar correo desde el dominio AyudAPI.
- metrics/route.ts:29-30: if (!expected) return true → público sin token. Y prometheus.yml:17-20 tiene el bearer_token comentado.
- login/route.ts:44-59 y register/route.ts:71-74: los guards descartan el error, así que un fallo de BD = "todo permitido".
- invitacion.ts:58: sin secreto en no-producción devuelve ok:true — contradice el docstring del propio archivo (líneas 13-15) que promete fail-closed.
- countRows (metrics:47-52) convierte cualquier error de Postgres en 0 → las alertas de "todo bien" se disparan durante un incidente de seguridad.
C6 — Ausencia total de rate limiting. Cero resultados en todo el repo. Impacto: fuerza bruta de contraseñas, oráculo403/200 para fuerza bruta de MEDICO_INVITE_CODE, enumeración de emails (register devuelve 409 explícito), y spam de incidentes vía /api/alertas/emergencia (que es anónimo por diseño).
C7 — RLS incompletas. 13 tablas con enable row level security, pero solo 8 políticas. Sin ninguna política: incidentes, atenciones, registros_medicos, notificaciones, pacientes_institucion. Hoy el riesgo es bajo (todo pasa por service_role), pero cualquier cliente Supabase directo quedaría expuesto. padron_profesionales sí está correctamente en deny-all (0 políticas).
C8 — estado_verificacion inyectable. confirmar-sesion/route.ts:98-101 ignora un rol ausente o inválido en lugar de rechazarlo, y en ese caso se salta los tres bloques Zod. datos arbitrario fluye a user_metadata.app_datos y a crear_perfil_inicial, que hace coalesce(p_datos->>'estado_verificacion','pendiente') (schema.sql:276) → el cliente puede fijar "verificado".
C9 — Restricción de unicidad de matrícula ineficaz. perfiles_medico.matricula es text not null unique a nivel de tabla (schema.sql:77), y luego se añade create unique index ... (matricula, jurisdiccion) (schema.sql:512). La restricción de tabla es más fuerte: el índice compuesto nunca puede permitir la misma matrícula en dos jurisdicciones. La intención de diseño (matrícula única por jurisdicción) no se materializa.
8.2 Privacidad
P1 — PII real en auditoría. audit/logs devuelve nombreRealDeCuenta que cae a cuenta.email (route.ts:60), ${nombre} · MP ${matricula} (línea 130), y direccion_ip cruda sin enmascarar (línea 183). Contrasta directamente con la pseudonimización aplicada al paciente.
P2 — Pseudonimización débil del paciente. PAC-****-${uuid.slice(-4)} son16 bits de espacio de búsqueda y un pseudónimo estable, que permite seguimiento longitudinal trivial de un paciente a través de todos los logs.
P3 — ipDeRequest() confía en x-forwarded-for del cliente → direccion_ip de logs_auditoria es falsificable, degradando la evidencia forense que la Ley 25.326 exige.
8.3 Funcional
F1 — 2 de las 6 métricas del panel son permanentemente 0 (VERIFICADO).
Grep sobre todo src/: atenciones y registros_medicos aparecen solo en lecturas y conteos — institucional/page.tsx, api/metrics/route.ts, api/institucion/dashboard/metricas/route.ts. Ningún archivo inserta jamás en esas dos tablas. Por lo tanto "Atenciones", "Registros médicos", z.atenciones, "Atenciones por condición" y "Atenciones asociadas" siempre muestran 0. Es ~1 de cada 3 widgets del panel.
F2 — La landing promete analítica inexistente. page.tsx:247 anuncia "reportes de siniestralidad, mapas de incidentes, tiempos de respuesta" y page.tsx:89 un "50% reducción en tiempo de respuesta". Ninguna de las tres existe: dashboard_metricas no devuelve serie temporal ni tiempos de respuesta, y no hay mapa.
F3 — /qr-exito se queda en loading eterno sin sesión. El useEffect hace return temprano cuando no hay sesión antes del finally → spinner infinito sin CTA de login.
F4 — El QR se regenera en cada montaje y revoca el anterior. Recargar la página invalida un slug ya impreso o compartido por WhatsApp.
F5 — Descargas de QR sin validar res.ok. Si el servidor devuelve 401/500 con JSON, el usuario descarga un .png corrupto y el error pasa inadvertido (qr-exito:37, mi-perfil:151).
F6 — /acceso-medico anuncia capacidades que no tiene (cámara y búsqueda por nombre); el flujo real es solo ingreso manual. camera-scanner.tsx existe pero no está montado en ninguna parte (código muerto).
F7 — /emergencia es una maqueta desconectada con datos hardcodeados y sin etiqueta de "demo".
F8 — Operaciones no atómicas. qr/generate y qr/revoke no son transaccionales: dos peticiones concurrentes pueden dejar tokens_qr sin tokens activos mientras qr_activo = true, o dos tokens activos. estudios/[id] borra de Storage antes del DELETE en BD sin compensar → fila huérfana.
F9 — Descifrado fail-soft silencioso. Si CRYPTO_ENCRYPTION_KEY falta o es inválida, el catch cae a JSON.parse → falla → null, y el médico recibe un historial sin medicación sin ninguna señal. Puede concluir "no tiene medicación registrada".
9. DEUDA TÉCNICA Y DESVIACIONES DOCUMENTALES
#	Hallazgo	Ubicación
D1	CONTEXTO_PROYECTO.txt está desactualizado en puntos críticos: afirma que no hay bypass (existe dev-bypass.ts), no menciona Zod, SISA/REFEPS, invitaciones, padron_profesionales, el panel institucional (dice "solo placeholder"), ni los endpoints metrics/audit/webhooks	raíz
D2	DEPENDENCIAS.md habla de Vite: "Vite en modo desarrollo", "Compila la app de producción a dist", tabla con vite 6.4.3. El proyecto es Next.js	DEPENDENCIAS.md:23, 51-52, 119-122
D3	guidelines/Guidelines.md es la plantilla vacía de opencode — todo el contenido está comentado. No hayuinguna guía de diseño ni de código escrita por el equipo	guidelines/
D4	reporte-lint.json (1 MB) obsoleto: documenta 499 warnings, hoy hay 0	raíz
D5	Dependencias muertas: MUI, @emotion/*, motion, recharts, vaul, cmdk, react-day-picker, html5-qrcode. No hay ni un solo gráfico en el producto; todo app/components/ui/ (45 componentes shadcn) es inalcanzable salvo tipos	package.json:14-43
D6	ImageWithFallback.tsx sin "use client" (error latente de build), alt en inglés fijo, didError no se resetea al cambiar src. Sin consumidores	components/figma/
D7	dynamic = "force-dynamic" inerte ×3 (solo afecta a Server Components; estas páginas son Client)	mi-perfil:34, medico/escanear:38, medico/paciente/[slug]:42
D8	Cero tests automatizados. Solo typecheck + lint. Para un sistema de datos de salud con requisitos de auditoría, es la mayor carencia	repo
D9	Duplicación: descifrarLista/descifrarTexto literalmente duplicados en 2 archivos; el bloque de auth medico/* duplicado en 4	varios
D10	.env.local solo tiene 2 variables. Faltan SUPABASE_SERVICE_ROLE_KEY, CRYPTO_ENCRYPTION_KEY, NEXT_PUBLIC_SITE_URL, METRICS_TOKEN, códigos de invitación y Brevo (probablemente en Vercel)	raíz
D11	Desviación del ERS: el ERS especifica MinIO en EC2; la implementación usa Supabase Storage (bucket privado + signed URLs). Funcionalmente equivalente, pero la ERS no se actualizó	ERS vs código
D12	El ERS marca DICOM como "en versión futura", pero el código ya acepta .dcm/.dicom/.dim y application/dicom	ERS vs código
D13	Accesibilidad: toggle.tsx sin aria-label ni focus-visible; step-indicator.tsx sin nav/ol/aria-current="step"; sin aria-live en dashboard, escáner ni ficha	components/shared/
10. LO QUE ESTÁ BIEN HECHO1. Minimización de datos en SQL, no en la app. get_perfil_emergencia filtra severidad='Crítico' dentro de la función. Difícil de evadir.
 2. Anonimización por grilla con centroide. El diseño de zona_id/zona_centro_* es una solución correcta y bien pensada para RF-DASH-03.
 3. Triple check de acceso médico replicado y consistente en 3 endpoints, con 410 distinto de 403/404.
 4. search_path = public en todas las funciones SECURITY DEFINER.
 5. Bucket privado + signed URLs de 300 s, con ruta de archivo que no contiene input del usuario y rollback de storage en la subida.
 6. SISA/invitaciones/bypass fail-closed con console.warn explícito cuando no hay padrón configurado.
 7. Anti-caché en 4 capas — defensa real contra sesiones cruzadas en bfcache.
 8. Anti open-redirect en ruteo.ts con 3 criterios.
 9. Validación compartida cliente/servidor con los mismos predicados.
10. El middleware NO hace RBAC, y está razonado en un comentario. Muchos equipos meterían la service key en Edge por comodidad.
11. Rol dual médico-paciente resuelto con elegancia (asegurarPerfilPaciente).
12. 0 errores y 0 warnings de lint en 134 archivos.
11. RECOMENDACIONES PRIORIZADAS
P0 — Bloqueantes antes de producción
1. C1: revocar authenticated del grant de crear_perfil_inicial + validar p_usuario_id = auth.uid() dentro de la función.
2. C2: añadir p_institucion_id a dashboard_metricas e incidentes_heatmap y filtrar en todas las subconsultas.
3. C3: exigir perfil de institución (403 si falta) o denegar el filtro para rol institucion sin fila.
4. C4: nunca aprovisionar desde user_metadata.app_rol; exigir credenciales por rol o rol ya persistido.
5. C5: hacer fail-closed los 5 puntos (webhook, metrics, guards de unicidad, invitacion.ts:58, countRows).
6. C6: rate limiting por IP/slug en /api/alertas/emergencia y en los endpoints de auth/invitación.
7. F1: decidir el destino de atenciones y registros_medicos — escribirlas o sacarlas del panel y de la RPC. Publicar ceros fijos es peor que no mostrarlos.
P1 — Corrección de alcance
 8. A2/RF-AUD-02: restringir /api/audit/logs a admin, enmascarar IPs y dejar de exponer emails de operadores (o documentar la excepción).
 9. C7: añadir políticas RLS a incidentes, notificaciones, pacientes_institucion, atenciones, registros_medicos.
10. C9: decidir la unicidad de matrícula — eliminar el unique de tabla o el índice compuesto, no ambos.
11. F2: alinear la copy de la landing con lo que el panel realmente muestra.
12. F3/F4/F5: try/finally en qr-exito, generación idempotente (GET primero), validar res.ok antes de descargar.
13. C8: rechazar rol inválido en confirmar-sesion en vez de ignorarlo.
P2 — Calidad y mantenimiento
14. D1/D2/D3: actualizar CONTEXTO_PROYECTO.txt (o eliminarlo), corregir DEPENDENCIAS.md a Next.js, escribir guidelines/Guidelines.md.
15. D5: purgar MUI/Emotion/motion/recharts/html5-qrcode si siguen sin uso, o montar el CameraScanner y un gráfico real.
16. D8: tests automatizados, empezando por la lógica de validación compartida y el triple check.
17. D7/D6/D9/D13: limpieza de código muerto, a11y y factorización.
18. D11/D12: alinear la ERS con MinIO→Supabase Storage y con el soporte DICOM ya implementado.
12. RESUMEN EJECUTIVO
AyudAPI es un proyecto bien ingenciado en su arquitectura de seguridad y con una base de datos thoughtful — la minimización de datos en SQL, la anonimización por grilla de 0,5° con centroide y el triple check de acceso médico son decisiones de diseño maduras que revelan criterio real. El código está impecable en términos mecánicos (0 errores, 0 warnings, typecheck limpio).
El problema no es la calidad del código: es la brecha entre la圃 ERS y la implementación, y entre la documentación interna y el código real. CONTEXTO_PROYECTO.txt describe un sistema noticeably más simple y con afirmaciones ya falsas (negando la existencia del bypass). La ERS promete analítica institucional —evolución temporal, tiempos de respuesta, mapas de incidentes— que no existe; y dos de las seis métricas del panel son ceros permanentes porque las tablas que las alimentan nunca se escriben.
Los tres riesgos que corregiré primero: C1 (cualquier usuario autenticado puede convertirse en admin llamando una RPC pública), C2 (cada obra social ve los datos de todas las demás), y C5 (varios endpoints de autorización fallan abiertos si falta una variable de entorno).
Por último, la brecha más urgente de todo el proyecto: no hay un solo test automatizado en un sistema que maneja datos clínicos sensibles y tiene obligations legales de auditoría bajo la Ley 25.326.