# Relevamiento Técnico Exhaustivo – AyudAPI

Fecha: 2025-10-17  
Alcance: Código fuente actual del repositorio `C:\Ayudapi` (Next.js 15 + Supabase).

## 1. Stack Tecnológico Real

### 1.1 Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| **Next.js** | ^15.3.0 | Framework principal con **App Router** (`src/app/`). Runtime Node.js en rutas API con `export const runtime = "nodejs"`. |
| **React** | 18.3.1 | UI components |
| **TypeScript** | ^6.0.3 | Tipado estricto (ver `tsconfig.json`) |
| **Tailwind CSS** | 4.1.12 | Estilos con `@tailwindcss/postcss`. CSS global en `src/styles/index.css`. |
| **shadcn/ui + Radix UI** | Múltiples (@radix-ui/*) | Componentes accesibles (accordion, dialog, dropdown, tabs, tooltip, etc.). |
| **Material UI (MUI)** | 7.3.5 | Componentes adicionales (`@mui/material`, `@mui/icons-material`). |
| **Lucide React** | 0.487.0 | Iconografía. |
| **Motion** | 12.23.24 | Animaciones. |
| **Recharts** | 2.15.2 | Gráficos (panel institucional). |
| **React Hook Form** | 7.55.0 | Formularios. |
| **Zod** | ^4.6.5 | Validación de schemas (`src/lib/validation/schemas.ts`). |
| **sonner** | 2.0.3 | Toasts/notifications. |
| **qrcode / qrcode.react** | ^1.5.4 / ^4.2.0 | Generación/visualización de QR. |
| **html5-qrcode** | ^2.3.8 | Escaneo QR desde cámara (panel médico). |

### 1.2 Backend (API)

| Tecnología | Versión | Uso |
|---|---|---|
| **Next.js Route Handlers** | 15.3.0 | API REST bajo `src/app/api/**/route.ts` (GET/POST/PUT/PATCH/DELETE según caso). |
| **Supabase SSR** | ^0.12.7 | Clientes con cookies sincronizadas entre Server Components, Route Handlers y middleware (`@supabase/ssr`). |
| **Supabase JS** | ^2.47.0 | `createClient` para anon/admin (`src/lib/supabase/server.ts`, `browser.ts`). |
| **Node.js runtime** | (Next) | Muchas rutas fuerzan `runtime = "nodejs"` (p. ej. `api/medico/paciente/[slug]/route.ts`, `api/auth/login/route.ts`, `api/qr/generate/route.ts`). |

### 1.3 Base de Datos

| Tecnología | Estado | Uso |
|---|---|---|
| **PostgreSQL (Supabase)** | Activo | Motor principal. |
| **PostGIS** | Habilitado | Extensión `postgis` (`supabase/schema.sql` línea ~5). Soporta `geometry(Point,4326)` en `incidentes`. |
| **Esquema completo** | Activo | Ver `supabase/schema.sql` (tablas, enums, triggers, RPC `crear_perfil_inicial`, RLS implícito según diseño). |
| **Tipos/Enums** | Activo | `rol_usuario_t` (`paciente|medico|institucion|admin`), `severidad_t`, `estado_incidente_t`, `tipo_estudio_t`. |

Tablas principales (según schema): `roles_usuario`, `perfiles_institucion`, `perfiles_paciente`, `perfiles_medico`, `pacientes_institucion`, `tokens_qr`, `incidentes`, `escaneos_qr`, `atenciones`, `registros_medicos`, `estudios`, `notificaciones`, `logs_auditoria`.

### 1.4 Autenticación

| Elemento | Estado | Detalle |
|---|---|---|
| **Supabase Auth** | Activo | Email/contraseña + Google OAuth. |
| **Múltiples roles** | Activo | Tabla `roles_usuario` con constraint `(usuario_id, rol)` único. Soporta **rol dual** (p. ej. médico-paciente). Lógica en `src/lib/auth/session.ts` (`getRolesForUser`, `prioridadPrincipal`). |
| **JWT Bearer** | Activo | Validación vía `getBearerToken` + `getSessionUser` en rutas protegidas. |
| **SISA / Verificación médico** | Activo | `src/lib/auth/sisa.ts`, `sisa-vinculo.ts`, `verificacion-medico.ts`. Validación/etiquetado de estado (`estado_verificacion`) y blindaje por DNI vinculado. |
| **Invitación médico** | Activo | Soporta `invite_modo = 'codigo'` en `perfiles_medico` (marcado por `MEDICO_INVITE_CODE`). Detectado con `inviteModoMedico()` y registrado en auditoría. |
| **Dev bypass** | Presente | `src/lib/auth/dev-bypass.ts` (control por email para entornos desarrollo). |
| **Persistencia sesión** | Controlada | Política "cerrar pestaña destruye sesión" gestionada vía `persistencia-sesion.ts` + `use-session.ts`. Cliente SSR ignora `auth.storage` intencionalmente (ver comentario en `browser.ts`). |
| **Auto-provisión / confirmar cuenta** | Activo | `confirmarYProvisionar()` en `registro.ts` usado por `GET /api/profile` para completar alta diferida (Google/email sin confirmación previa). |

### 1.5 Almacenamiento de Archivos

| Elemento | Estado | Detalle |
|---|---|---|
| **Supabase Storage (implícito)** | Activo | Estudios subidos/gestionados vía `src/app/api/estudios/*`. Uso de **signed URLs** (300s) con `createSignedUrl` (mencionado en contexto ERS). **NO se detecta MinIO** en código/config actual. |
| **Bucket privado** | Implícito | Estudios clínicos accedidos solo con autorización (guard rol médico + permisos). |

### 1.6 Seguridad / Criptografía

| Elemento | Estado | Detalle |
|---|---|---|
| **AES-256-GCM** | Activo | `src/lib/security/cipher.ts` (`encryptSensitiveValue`, `decryptSensitiveValue`). Usado para cifrar `medicacion` y `notas_medicas` en `perfiles_paciente` (ver `api/profile/route.ts` PUT). |
| **Headers anti-caché** | Activo | `NO_STORE_HEADERS` en `session.ts` aplicado por `jsonOk/jsonError`. Middleware añade `Cache-Control: no-store, no-cache, must-revalidate, private`, `Pragma: no-cache`, `Expires: 0` para rutas críticas (`/api/*`, `/mi-perfil`, `/crear-perfil`, `/medico/*`, `/auth/*`, `/e/*`). Next.config.mjs replica headers para las mismas rutas. |
| **Seguridad HTTP** | Activo | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` en `next.config.mjs`. |
| **Validación Zod** | Activo | Schemas estrictos (`dniSchema`, `telefonoSchema`, `perfilPacienteSchema`, `medicoAltaSchema`, `institucionAltaSchema`, etc.) + `detalle400DesdeZod`. |
| **Minimización por niveles** | Activo | Niveles N1–N4 aplicados (emergencia vs médico vs institucional). |

### 1.7 Otras Librerías/Servicios Clave

| Elemento | Estado | Detalle |
|---|---|---|
| **QR Seguro** | Activo | `src/lib/qr/slug.ts` genera slug único (12 chars, alfabeto sin ambiguos). `tokens_qr` con `slug`, `url_publica`, `activo`, `revocado_en`. Revocación masiva al generar nuevo QR. |
| **Escaneo médico + auditoría** | Activo | `api/medico/verificar-qr` registra `escaneos_qr` (token_qr_id, paciente_id, usuario_id, rol_en_momento, lat/lng) y `logs_auditoria` con `accion: "verificar_qr"` + `invite_modo` si aplica. Acceso a historial registra `accion: "acceso_historial_clinico"`. |
| **Emergencia pública** | Activo | Ruta pública `/e/[slug]` (server page) consulta vía lógica interna datos mínimos. Botón alerta SAME + GPS reactivo (`components/emergency/activating-alert.tsx`). |
| **REFEPS (scraper)** | Presente (auxiliar) | `scraper/` con `lib/refeps.js`, `server.js`, tests (`test/refeps.test.js`). Servicio independiente (no invocado directamente desde rutas principales según inspección). |
| **Monitoreo** | Presente | `monitoring/prometheus.yml`, `monitoring/docker-compose.yml`, `monitoring/README.md`. Endpoint `/api/metrics` expone métricas (gauge de negocio según contexto). |
| **Webhooks** | Presente | `src/app/api/webhooks/email/route.ts`. |
| **Auditoría** | Activo | `logs_auditoria` con `usuario_id`, `paciente_id`, `institucion_id`, `accion`, `direccion_ip`, `detalles`, `creado_en`. |

### 1.8 Configuración Entorno/Build

| Archivo | Uso |
|---|---|
| `package.json` | Scripts: `dev`, `build`, `start`, `lint`, `typecheck`. Dependencias Next 15 + Supabase + Radix + MUI + Tailwind 4. |
| `next.config.mjs` | Headers seguridad + anti-caché global/rutas críticas. |
| `tsconfig.json` | Config TS (paths `@/*` → `./src/*`). |
| `eslint.config.js` | Linting. |
| `middleware.ts` | Sincroniza cookies Supabase SSR + añade headers anti-caché a rutas críticas + `supabase.auth.getUser()` para refresco sesión. |
| `.env.local` | Variables requeridas (según uso): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `CRYPTO_ENCRYPTION_KEY`, `BREVO_*`, `NOTIFICACIONES_EMAIL_WEBHOOK_URL`, `MEDICO_INVITE_CODE`, `INSTITUCION_INVITE_CODE`, `DEV_ADMIN_EMAILS`. |

## 2. Mapa de Funciones y Módulos Principales

### 2.1 Módulo Autenticación (`src/app/api/auth/`, `src/lib/auth/`)

| Componente | Descripción |
|---|---|
| `auth/login/route.ts` | Login email+password. Detecta "email no confirmado" y auto-confirma vía `admin.auth.admin.generateLink` + `updateUserById` (fallback robusto). Aplica `bloqueoPanelMedico` (rechazo explícito bloquea; `pendiente` permite acceso en etapa desarrollo). Registra `inicio_sesion` en auditoría/actividad. |
| `auth/register/route.ts` | Registro con validación Zod (rol: paciente/medico/institucion). Usa `crear_perfil_inicial` (RPC security definer) para provisionar roles+perfiles. Controla invitación médico (`MEDICO_INVITE_CODE`) seteando `invite_modo='codigo'`. Verificación SISA/DNI según flujo. |
| `auth/google/route.ts` | OAuth Google (PKCE). |
| `auth/rol/route.ts` | Gestión/consulta de rol actual. |
| `auth/vincular-rol/route.ts` | Vinculación de rol adicional (rol dual). |
| `auth/estado/route.ts` | Estado de sesión/roles. |
| `auth/confirmar-sesion/route.ts` | Confirmación de sesión. |
| `auth/notificar-actividad/route.ts` | Registro de actividad de sesión. |
| `lib/auth/session.ts` | Helpers auth: `getSessionUser`, `getRolesForUser`, `getRoleForUser`, `getBearerToken`, `jsonOk/jsonError` (con NO_STORE), guards `requireUserIn`. |
| `lib/auth/registro.ts` | `confirmarYProvisionar`, `prioridadPrincipal`, `normalizarRol`. |
| `lib/auth/invitacion.ts` | `inviteModoMedico` (detecta invitado por código). |
| `lib/auth/sisa*.ts`, `verificacion-medico.ts` | Integración/verificación SISA + vinculación DNI. |
| `lib/auth/actividad*.ts`, `persistencia-sesion.ts`, `ruteo.ts`, `destino.ts` | Soporte sesión/actividad/navegación. |

### 2.2 Módulo Paciente (`src/app/api/profile/`, `src/app/api/qr/`)

| Componente | Descripción |
|---|---|
| `api/profile/route.ts` (GET) | Obtiene perfil completo por usuario. Auto-provisiona vía `confirmarYProvisionar` si no hay rol. Devuelve `perfil` (paciente, con `medicacion`/`notas_medicas` **descifrados**), `perfil_medico` (si rol médico/dual), `perfil_institucion` (si rol institución), `rol`. |
| `api/profile/route.ts` (PUT) | Crea/actualiza `perfiles_paciente`. **Validaciones**: obligatorios (alias, fecha_nacimiento, genero, grupo_sanguineo), `dniSchema` estricto (7–8 dígitos). **Unicidad global DNI** (`verificarDniGlobal`) → 409 si conflicto. **Blindaje DNI vinculado SISA** (`exigirDniVinculado`) → 403 si intento alterar DNI bloqueado. **Cifrado**: `medicacion` (array) → `encryptSensitiveValue`; `notas_medicas` (string) → cifrado o `null`. **Upsert rol paciente** (garantiza acceso QR incluso rol dual). |
| `api/profile/paciente/asociar-institucion/route.ts` | Asociación paciente–institución (`pacientes_institucion`) con `obra_social`, `nro_afilado`, `validado`. |
| `api/qr/generate/route.ts` (GET) | Requiere perfil paciente completo (alias>=2 + fecha_nacimiento + genero + grupo_sanguineo). Genera `slug` único (máx 6 intentos con retry por conflicto `23505`). Inserta nuevo `tokens_qr` (`activo=true`). **Revoca** todos los tokens activos previos (`activo=false`, `revocado_en=now()`) del mismo paciente. Actualiza `perfiles_paciente.qr_activo=true`, `slug_qr=slug`. Retorna `{slug, url_publica, qr_activo}`. |
| `api/qr/revoke/route.ts` | Revoca token activo actual del paciente (setea `activo=false`, `revocado_en`, `qr_activo=false`, `slug_qr=null`). |
| `api/qr/download/route.ts` | Genera imagen QR (PNG/SVG) con alta resolución. |
| `/e/[slug]` (página pública) | Vista emergencia pública: muestra datos mínimos N1, contactos ICE, botón alerta SAME + GPS reactivo, aviso legal (Arts. 34/108 CP). |

### 2.3 Módulo Médico (`src/app/api/medico/`)

| Componente | Descripción |
|---|---|
| `medico/verificar-qr/route.ts` | Verifica QR escaneado. Requiere rol `medico`. Valida `slug`: token existe, `activo=true`. Valida perfil paciente: `qr_activo=true`, `med_access=true`. Ejecuta `inviteModoMedico` en paralelo. **Auditoría**: `logs_auditoria` con `accion="verificar_qr"`, incluye `token_qr_id` y `invite_modo` si aplica. **Historial escaneos**: inserta `escaneos_qr` con `usuario_id`, `paciente_id`, `token_qr_id`, `rol_en_momento="medico"`, `lat/lng` si provistos. Retorna datos mínimos verificación (`paciente_id`, `alias`, `nombre_completo`, `grupo_sanguineo`, `qr_activo`, `med_access`). |
| `medico/paciente/[slug]/route.ts` (GET) | Acceso a **historial clínico completo** (Nivel 3). Requiere rol `medico`. Valida QR activo + `med_access`. Ejecuta `inviteModoMedico`. **Auditoría**: `logs_auditoria` con `accion="acceso_historial_clinico"`, `origen` (`qr-emergencia` o `panel-medico`), `invite_modo` si aplica. **Descifrado**: `medicacion` vía `descifrarLista<Medicamento>` (AES-GCM con fallback JSON), `notas_medicas` vía `descifrarTexto`. Retorna `PacienteClinico` completo. |
| `medico/paciente/[slug]/estudios/route.ts` | Lista estudios del paciente asociado al slug (acceso autorizado médico). |
| `medico/escaneos/route.ts` | Historial de escaneos del médico autenticado. |
| `medico/me/route.ts` | Datos perfil médico del usuario logueado. |

### 2.4 Módulo Institución (`src/app/api/institucion/`)

| Componente | Descripción |
|---|---|
| `institucion/dashboard/metricas/route.ts` | Métricas agregadas para panel institucional. |
| `institucion/dashboard/heatmap/route.ts` | Datos heatmap (incidentes georreferenciados). |

### 2.5 Módulo Estudios Clínicos (`src/app/api/estudios/`)

| Componente | Descripción |
|---|---|
| `estudios/route.ts` (GET/POST) | Gestión de estudios (`public.estudios`). Control acceso por rol. |
| `estudios/[id]/route.ts` | Acceso/descarga estudio individual (con validación autorización). |

### 2.6 Módulo Alerta / Emergencia (`src/app/api/alertas/`)

| Componente | Descripción |
|---|---|
| `alertas/emergencia/route.ts` | Creación/registro de alerta de emergencia (vincula `incidente`, genera `notificaciones` con estado `pendiente`). Según ERS, envío real a contactos ICE es parcial (solo inserción). |

### 2.7 Auditoría, Usuarios, Métricas, Webhooks

| Componente | Descripción |
|---|---|
| `api/audit/logs/route.ts` | Consulta logs auditoría (`logs_auditoria`). (Nota ERS: restricción por rol admin/auditor pendiente de reforzar – ver riesgo RF-AUD-02). |
| `api/usuarios/[id]/suspender/route.ts` | Suspensión de usuario por admin. |
| `api/metrics/route.ts` | Endpoint Prometheus metrics (métricas negocio). |
| `api/webhooks/email/route.ts` | Webhook notificaciones email (Brevo u otro proveedor). |

### 2.8 Núcleo Librerías (`src/lib/`)

| Ruta | Descripción |
|---|---|
| `lib/supabase/server.ts` | Clientes server: `createAnonServerClient` (sin persistencia), `createAdminServerClient` (service role, sin persistencia), `createServerSupabaseClient` (SSR con cookies). |
| `lib/supabase/browser.ts` | Cliente browser singleton con `createSsrBrowserClient`. |
| `lib/supabase/database.ts` | Tipos TS mapeados a schema: `RolUsuario`, `PerfilPacienteRow`, `PerfilMedicoRow`, `PerfilInstitucionRow`, `TokenQrRow`, `EstudioRow`, `LogsAuditoriaRow`, `TipoEstudio`, etc. |
| `lib/security/cipher.ts` | AES-256-GCM encrypt/decrypt con key desde `CRYPTO_ENCRYPTION_KEY`. |
| `lib/validation/*` | Schemas Zod, validadores perfil/teléfono/fecha. |
| `lib/api/*` | `http.ts` (`parseJsonBody`), `client.ts` (`apiFetch`). |
| `lib/qr/slug.ts` | Generador slug QR. |
| `lib/auth/*` | (ver 2.1). |

### 2.9 UI/Componentes (`src/components/`, `src/app/*` páginas)

| Ruta | Descripción |
|---|---|
| `src/app/page.tsx` | Landing/Home. Detecta sesión + QR real (`/api/profile`). |
| `src/app/crear-perfil/`, `src/app/mi-perfil/` | Wizard creación/perfil paciente (validación, generación QR, revocación). |
| `src/app/medico/*` | Panel médico: escaneo QR, verificación, acceso paciente, historial escaneos. |
| `src/app/institucional/*` | Panel institución (métricas, heatmap). |
| `src/app/auth/*` | Flujos auth (login/register/google según UI). |
| `src/app/e/*` | Emergencia pública. |
| `components/layout/*` | Navbar/Footer. |
| `components/emergency/*` | Componentes vista emergencia + alerta. |
| `components/qr/*` | Visualización/descarga QR. |

## 3. Conexiones y Endpoints de la API

### 3.1 Autenticación

| Método | Ruta | Auth | Roles | Descripción | Servicios |
|---|---|---|---|---|---|
| `POST` | `/api/auth/login` | Pública | — | Login email+password. Auto-confirma si email sin confirmar. Bloquea médico rechazado. Registra actividad. | Supabase Auth (anon+admin), `roles_usuario`, `perfiles_medico`. |
| `POST` | `/api/auth/register` | Pública | — | Registro por rol. Usa RPC `crear_perfil_inicial`. Soporta invitación médico. | Supabase Admin, `crear_perfil_inicial`. |
| `GET/POST` | `/api/auth/google` | Pública | — | OAuth Google (PKCE). | Supabase Auth. |
| `GET/POST` | `/api/auth/rol` | Bearer | Cualquiera autenticado | Consulta/gestión rol. | Supabase (user+admin según uso). |
| `POST` | `/api/auth/vincular-rol` | Bearer | Autenticado | Vincula rol adicional (rol dual). | Admin + `roles_usuario`. |
| `GET` | `/api/auth/estado` | Bearer/opcional | — | Estado sesión/roles. | Session helpers. |
| `POST` | `/api/auth/confirmar-sesion` | Bearer | Autenticado | Confirmación sesión. | Supabase. |
| `POST` | `/api/auth/notificar-actividad` | Bearer | Autenticado | Registra actividad sesión. | Admin + `logs_auditoria`/actividad. |

### 3.2 Perfil Paciente

| Método | Ruta | Auth | Roles | Descripción | Servicios |
|---|---|---|---|---|---|
| `GET` | `/api/profile` | Bearer | Autenticado | Obtiene perfiles por usuario. Auto-provisióna si falta rol. Devuelve paciente (descifrado) + médico/institución si aplica. | Admin, `confirmarYProvisionar`, `roles_usuario`, `perfiles_*`, cipher decrypt. |
| `PUT` | `/api/profile` | Bearer | Autenticado | UPSERT `perfiles_paciente`. Valida obligatorios+DNI. Unicidad global DNI + blindaje SISA. Cifra `medicacion`/`notas_medicas`. Garantiza rol `paciente`. | Admin, `verificarDniGlobal`, `exigirDniVinculado`, cipher encrypt. |
| `POST` | `/api/profile/paciente/asociar-institucion` | Bearer | `paciente` | Asocia a institución. | Admin, `pacientes_institucion`. |

### 3.3 QR Paciente

| Método | Ruta | Auth | Roles | Descripción | Servicios |
|---|---|---|---|---|---|
| `GET` | `/api/qr/generate` | Bearer | `paciente` | Genera nuevo slug único. Revoca tokens activos previos. Activa QR en perfil. | Admin, `tokens_qr`, `perfiles_paciente`, `generateQrSlug`. |
| `POST` | `/api/qr/revoke` | Bearer | `paciente` | Revoca QR activo. | Admin, `tokens_qr`, `perfiles_paciente`. |
| `GET` | `/api/qr/download` | Bearer | `paciente` | Descarga PNG/SVG alta resolución. | Generación QR (qrcode). |

### 3.4 Médico

| Método | Ruta | Auth | Roles | Descripción | Servicios |
|---|---|---|---|---|---|
| `GET` | `/api/medico/verificar-qr` | Bearer | `medico` | Verifica slug QR. Valida activo+med_access. Audita (`verificar_qr`) + registra `escaneos_qr` con geo opcional. | Admin, `tokens_qr`, `perfiles_paciente`, `escaneos_qr`, `logs_auditoria`, `inviteModoMedico`. |
| `GET` | `/api/medico/paciente/[slug]` | Bearer | `medico` | Historial clínico completo. Valida QR. Audita (`acceso_historial_clinico`, incluye origen+invite_modo). Descifra medicación/notas. | Admin, `tokens_qr`, `perfiles_paciente`, `logs_auditoria`, cipher decrypt, `inviteModoMedico`. |
| `GET` | `/api/medico/paciente/[slug]/estudios` | Bearer | `medico` | Lista estudios del paciente. | Admin, `estudios`, `tokens_qr`. |
| `GET` | `/api/medico/escaneos` | Bearer | `medico` | Historial escaneos propio. | Admin, `escaneos_qr`. |
| `GET` | `/api/medico/me` | Bearer | `medico` | Perfil médico propio. | Admin, `perfiles_medico`. |

### 3.5 Estudios

| Método | Ruta | Auth | Roles | Descripción | Servicios |
|---|---|---|---|---|---|
| `GET/POST` | `/api/estudios` | Bearer | Autenticado (según lógica) | Listado/alta estudios. Acceso autorizado. | Admin, `estudios`, Supabase Storage (signed URLs implícito). |
| `GET/PUT/PATCH/DELETE` | `/api/estudios/[id]` | Bearer | Autenticado (autorizado) | Operaciones sobre estudio específico. | Admin, `estudios`. |

### 3.6 Institución (Dashboard)

| Método | Ruta | Auth | Roles | Descripción | Servicios |
|---|---|---|---|---|---|
| `GET` | `/api/institucion/dashboard/metricas` | Bearer | `institucion`/autorizado | Métricas agregadas panel institucional. | Admin/queries agregadas (`perfiles_paciente`, `escaneos_qr`, `incidentes`, etc.). |
| `GET` | `/api/institucion/dashboard/heatmap` | Bearer | `institucion`/autorizado | Datos heatmap con coordenadas PostGIS. | Admin, `incidentes` (geometry/lat/lng). |

### 3.7 Alertas, Auditoría, Administración, Sistema

| Método | Ruta | Auth | Roles | Descripción | Servicios |
|---|---|---|---|---|---|
| `POST` | `/api/alertas/emergencia` | Variable (según uso) | — | Registra alerta emergencia: crea `incidente` + `notificaciones` (estado `pendiente`). | Admin, `incidentes`, `notificaciones`. |
| `GET` | `/api/audit/logs` | Bearer | Requiere autorización | Consulta `logs_auditoria`. (Revisar restricción estricta a admin/auditor según política). | Admin, `logs_auditoria`. |
| `POST` | `/api/usuarios/[id]/suspender` | Bearer | `admin` (esperado) | Suspende usuario. | Admin (Supabase Auth + DB). |
| `GET` | `/api/metrics` | Pública/opcional | — | Métricas Prometheus (gauge negocio). | Lectura estado aplicación/DB según implementación. |
| `POST` | `/api/webhooks/email` | Webhook | — | Webhook proveedor email. | Procesamiento eventos email. |

### 3.8 Rutas Públicas Críticas

| Ruta | Tipo | Descripción | Notas |
|---|---|---|---|
| `/e/[slug]` | Página (App Router) | Vista emergencia pública N1. | Sin auth. Muestra datos mínimos, contactos ICE, alerta SAME+GPS, aviso legal. Headers anti-caché aplicados (middleware+next.config). |
| `/api/metrics` | API | Exposición métricas. | Puede requerir token según config (ver `METRICS_TOKEN` en contexto). |

### 3.9 Notas sobre Consumo de Servicios

- **Supabase Auth**: login/register/google + admin ops (confirmar cuenta, update user).
- **Supabase DB (Postgres)**: todas las tablas vía `createAdminServerClient` (service role) en rutas servidor, con RLS implícito según schema/políticas (múltiples tablas con RLS mencionadas en ERS).
- **Supabase SSR**: sincronización cookies sesión cliente–servidor.
- **Cipher (AES-256-GCM)**: cifrado/descifrado on-the-fly para datos sensibles.
- **PostGIS**: consultas georreferenciadas (`incidentes.ubicacion`, heatmap).
- **Signed URLs (Storage)**: acceso controlado a estudios.
- **REFEPS scraper**: componente auxiliar (no llamado desde endpoints inspeccionados).
- **Prometheus**: scraping `/api/metrics`.

## 4. Observaciones Fieles al Código

- **Sin MinIO**: No existe referencia a MinIO en código, configs o dependencias. El almacenamiento de estudios apunta a Supabase Storage (signed URLs).
- **Rol dual soportado**: `getRolesForUser` + consulta perfiles por pertenencia a rol (no solo rol principal) – coherente con `profile/route.ts` GET.
- **Auditoría con etiqueta invitado**: `inviteModoMedico` se ejecuta **en paralelo** con lectura QR y se añade a `detalles` (`verificar_qr`, `acceso_historial_clinico`) – trazabilidad Ley 25.326.
- **Protección DNI SISA**: `exigirDniVinculado` impide alterar DNI cuando existe vínculo validado (médico con credencial SISA).
- **Auto-recuperación login**: lógica de auto-confirmación ante "email no confirmado" evita bloqueo cuentas preexistentes.
- **Anti-caché estricto**: aplicado tanto en middleware como `next.config.mjs` y headers por respuesta JSON – evita bfcache/cross-user.
- **Descifrado defensivo**: `descifrarLista`/`descifrarTexto` intentan AES-GCM, con fallback JSON parse – resiliente a datos legados.
- **Revocación atómica**: generación QR revoca **todos** los tokens activos previos del paciente antes de activar nuevo.
- **Runtime Node.js**: forzado en rutas con acceso admin/cipher/auditoría para evitar edge constraints.

**Conclusión:** El stack es **Next.js 15 (App Router) + TypeScript + Tailwind 4 + Supabase (Auth/DB+PostGIS/Storage) + Zod + Radix/MUI**. Arquitectura modular por roles (paciente/médico/institución/admin), con QR revocable, cifrado AES-256-GCM, auditoría integral, georreferenciación PostGIS y monitoreo Prometheus. Endpoints REST bajo `app/api` con validación Bearer + control por rol.