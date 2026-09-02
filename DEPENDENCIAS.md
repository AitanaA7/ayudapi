# AyudAPI — Instalación y Dependencias

Guía para que cada integrante del equipo levante el proyecto y corra el linter
exactamente igual en su máquina.

## Requisitos previos

- **Node.js**: v20.19+ / v22.12+ / v24.16+ (probado con Node v24.16.0).
- **npm**: v10 o superior (probado con npm 12.0.2).

> El proyecto se instala con `npm` (se usa `package-lock.json`, que fija las
> versiones exactas). No usar pnpm: el rango de versiones está calibrado para npm.

## Pasos para instalar

```bash
# 1. Dentro de la carpeta del proyecto
npm install

# 2. Verificar que todo quedó bien
npm run lint     # linter de ESLint + TypeScript
npm run build    # compilación de producción
npm run dev      # servidor de desarrollo (Vite)
```

### Si `npm install` falla

Borrar `node_modules` y el lockfile local y reintentar:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Tabla de versiones fijada (compatibilidad verificada)

| Paquete                | Versión |
| ---------------------- | ------- |
| typescript             | 6.0.3   |
| eslint                 | 9.39.5  |
| @eslint/js             | 9.39.5  |
| typescript-eslint      | 8.68.0  |
| eslint-plugin-react    | 7.37.5  |
| globals                | 17.11.0 |
| eslint-plugin-security      | 4.0.1   |
| eslint-plugin-perfectionist | 5.11.0  |
| react                  | 18.3.1  |
| react-dom              | 18.3.1  |
| @types/react           | 18.3.31 |
| @types/react-dom       | 18.3.7  |
| vite                   | 6.4.3   |
| @vitejs/plugin-react   | 4.7.0   |

> El resto de las dependencias (MUI, Radix, etc.) se instalan con las versiones
> exactas declaradas en `package.json` / `package-lock.json`.

## Por qué estas versiones (no cambiar)

Estos rangos resuelven incompatibilidades que rompen `npm install` y `npm run lint`:

1. **TypeScript `^6.0.3`, no `7.x`**:
   `typescript-eslint@8.68.0` exige `typescript >=4.8.4 <6.1.0`. TypeScript 7 es el
   nuevo port nativo y aún no es soportado por el plugin (tracking:
   https://github.com/typescript-eslint/typescript-eslint/issues/10940).

2. **ESLint `^9.39.5`, no `10.x`**:
   `eslint-plugin-react@7.37.5` solo acepta `eslint <=9.7`. ESLint 10 provoca
   conflicto de peer dependency al instalar.

3. **React 18 como dependencia real**:
   antes react/react-dom estaban solo como peerDependencies opcionales y
   `npm install` fallaba porque `@emotion/react` no encontraba React.
   `react` y `react-dom` deben estar en `dependencies` (versión 18.3.1), y los
   tipos `@types/react@18` / `@types/react-dom@18` deben coincidir con esa versión
   (no usar `@types/react@19`).

4. **Config de ESLint** (`eslint.config.js`):
   - `react/react-in-jsx-scope` está **off**: el proyecto usa el JSX transform
     automático de Vite (`"jsx": "react-jsx"`), no necesita importar React.
   - `react/prop-types` está **off**: el proyecto es TypeScript y las props ya
     están tipadas.
   - `settings.react.version: "detect"` para que eslint-plugin-react detecte la
     versión de React instalada (evita el warning).
   - Se ignora la carpeta `dist/` (salida del build) para que `npm run lint`
     no analice los bundles minificados.

5. **Seguridad activada** (`eslint-plugin-security@4.0.1`):
   se usa `security.configs.recommended` (14 reglas: eval, regexp inseguras,
   timings, inyección de objetos, etc.). Los hallazgos quedan como *warnings*
   para no frenar el desarrollo pero sí visibilizar riesgos.

6. **Uniformidad del código** (`eslint-plugin-perfectionist@5.11.0`):
   reglas activadas como *warnings* (vigilancia sin bloquear):
   - `sort-imports`, `sort-exports`, `sort-object-types`, `sort-jsx-props`
     (orden natural ascendente, case-insensitive).
   - Garantizan el mismo orden en imports, propiedades y props JSX en todo el
     repo; cualquier desorden queda reportado en el lint.

## Métricas (reporte de lint para el trabajo)

El linter genera reportes utilizables como métricas de calidad:

```bash
# Reporte en consola (resumen por archivo + reglas)
npm run lint

# Reporte en JSON (métricas: #archivos, #errores, #warnings por regla)
npx eslint . --format json > reporte-lint.json
```

Última corrida de referencia (al activar seguridad + uniformidad):
- 54 archivos analizados, 0 errores, 499 warnings
- `sort-jsx-props`: 427 · `sort-imports`: 51 · `sort-object-types`: 18
- `security/detect-object-injection`: 3 (claves dinámicas sobre objetos
  locales/tipeados — revisados, riesgo bajo, sin entrada de usuario directa)

## Scripts disponibles

| Comando        | Qué hace                             |
| -------------- | ------------------------------------ |
| `npm run dev`  | Levanta Vite en modo desarrollo      |
| `npm run build`| Compila la app de producción a `dist`|
| `npm run lint` | Corre ESLint sobre todo el proyecto  |