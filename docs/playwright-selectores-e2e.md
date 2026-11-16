# Extractores exactos para Playwright

**Hallazgo clave:** no existe formulario tradicional de registro/login con email+contraseña. La app usa **Google OAuth**. Los tests (`tests/auth.spec.ts`, `tests/medico.spec.ts`) asumen rutas y textos que no coinciden con la UI actual — eso explica los fallos de selectores.

---

## 1. Registro — `/auth/elegir-rol` (no hay `/register`)

**Archivo:** `src/app/auth/elegir-rol/page.tsx`

No hay inputs de Email/Contraseña (auth vía Google). Tras el OAuth se elige rol con botones (no radios):

| Elemento | Selector Playwright |
|---|---|
| Tab Paciente | `page.getByRole('button', { name: 'Paciente' })` |
| Tab Médico/a | `page.getByRole('button', { name: 'Médico/a' })` |
| Tab Institución | `page.getByRole('button', { name: 'Institución' })` |
| DNI (paciente) | `page.getByPlaceholder('Ej: 30123456 (7 u 8 dígitos, sin puntos)')` |
| Nombre completo | `page.getByPlaceholder('Tu nombre legal')` |
| Alias público | `page.getByPlaceholder('Ej: Carlos')` |
| Especialidad (médico) | `page.getByPlaceholder('Clínica, Pediatría…')` |
| Teléfono (médico) | `page.getByPlaceholder('+54 11 XXXX-XXXX')` |
| Botón envío | `page.getByRole('button', { name: 'Continuar' })` (guardando: `'Vinculando…'`) |

## 2. Login — modal, no hay `/login`

**Archivo:** `src/components/auth/login-modal.tsx`

No hay inputs de email/password. Selectores:

```ts
page.getByRole('button', { name: 'Iniciar sesión con Google' })
page.getByRole('button', { name: 'Crear cuenta con Google' })
page.getByRole('button', { name: 'Cerrar' })          // aria-label="Cerrar"
page.getByRole('heading', { name: 'Iniciar sesión' }) // assert de apertura
```

## 3. Emergencia — `/e/[slug]`

**Archivos:** `src/app/e/[slug]/page.tsx`, `src/components/emergency/activating-alert.tsx`

| Elemento | Selector Playwright |
|---|---|
| Botón SAME (`<button>`) | `page.getByRole('button', { name: 'Alertar al SAME / Ambulancia' })` |
| Fallback 107 (QR inactivo, `<a>`) | `page.locator('a[href="tel:107"]', { hasText: 'Llamar al 107 (SAME)' })` |
| Fallback 911 (QR inactivo, `<a>`) | `page.locator('a[href="tel:911"]', { hasText: 'Llamar al 911' })` |
| 107 (vista activa, tras alerta) | `page.locator('a[href="tel:107"]', { hasText: 'SAME 107' })` |
| 911 (vista activa) | `page.locator('a[href="tel:911"]', { hasText: '911' })` |
| Sección ICE | `page.getByText('Contactos ICE')` |
| Teléfono ICE | `page.locator('a[href^="tel:"]')` — href con dígitos limpiados (`replace(/[^\d+]/g,"")`), texto conserva formato original |

## 4. Panel médico — `/medico/escanear`

**Archivo:** `src/app/medico/escanear/page.tsx` — **sí hay** input manual de código QR:

```ts
page.getByLabel('Código del paciente')          // htmlFor="codigo-paciente"
page.locator('#codigo-paciente')                 // input#codigo-paciente, type="text"
page.getByPlaceholder('Ej: abc123xyz')
page.getByRole('button', { name: 'Buscar' })     // o presionar Enter en el input
page.getByRole('heading', { name: 'Buscar paciente por código' })
```

No se renderiza el scanner de cámara (`src/components/medico/camera-scanner.tsx` existe pero no se importa en la página).

---

**Acción sugerida:** actualizar `tests/auth.spec.ts` y `tests/medico.spec.ts` para eliminar las referencias a `/register`, email/password y botón "ingresar" — reemplazarlos por los selectores OAuth/de rol y los de arriba.
