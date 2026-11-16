# Evaluación Estática de Código — AyudAPI

> **Proyecto:** AyudAPI (Next.js 15 + TypeScript + Supabase)
> **Sección del documento de pruebas de calidad:** Evaluación Estática de Código
> **Fecha de relevamiento:** 17/10/2026

---

## 1. Configuración del Entorno

### 1.1 `eslint.config.js` (completo)

```js
import js from "@eslint/js";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import perfectionist from "eslint-plugin-perfectionist";
import security from "eslint-plugin-security";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  { ignores: ["dist/**", "dist", ".next/**", ".next", "next-env.d.ts"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  ...nextCoreWebVitals,
  tseslint.configs.recommended,
  security.configs.recommended,
  {
    settings: { react: { version: "detect" } },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { perfectionist },
    rules: {
      "perfectionist/sort-imports": ["warn", { type: "natural", order: "asc", ignoreCase: true }],
      "perfectionist/sort-exports": ["warn", { type: "natural", order: "asc", ignoreCase: true }],
      "perfectionist/sort-object-types": ["warn", { type: "natural", order: "asc", ignoreCase: true }],
      "perfectionist/sort-jsx-props": ["warn", { type: "natural", order: "asc", ignoreCase: true }],
    },
  },
  {
    files: ["src/components/estudios/study-manager.tsx", "src/app/components/figma/**"],
    rules: { "@next/next/no-img-element": "off" },
  },
  {
    files: ["middleware.ts", "src/app/api/**/*.ts", "src/lib/**/*.ts", "scraper/**/*.js"],
    languageOptions: { globals: globals.node },
  },
]);
```

### 1.2 `package.json` — sección `scripts`

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit"
}
```

### 1.3 `package.json` — `devDependencies` (linting / typechecking)

```json
"devDependencies": {
  "@eslint/eslintrc": "^3.3.7",
  "@eslint/js": "^9.39.5",
  "@types/node": "^22.10.0",
  "@types/qrcode": "^1.5.5",
  "@types/react": "^18.3.31",
  "@types/react-dom": "^18.3.7",
  "eslint": "^9.39.5",
  "eslint-config-next": "^16.3.5",
  "eslint-plugin-perfectionist": "^5.11.0",
  "eslint-plugin-react": "^7.37.5",
  "eslint-plugin-security": "^4.0.1",
  "globals": "^17.11.0",
  "typescript": "^6.0.3",
  "typescript-eslint": "^8.68.0"
}
```

### 1.4 `tsconfig.json` (completo)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

> **Nota QA:** `"strict": true` está **habilitado** (línea 7).

---

## 2. Ejecución de Linter (ESLint)

**Comando:** `npm run lint`

**Salida de terminal:**

```text
> ayudapi@1.0.0 lint
> eslint .
```

**Código de salida:** `0`

> **Resultado:** ✅ Sin errores y sin warnings. La ejecución finalizó limpia.

---

## 3. Ejecución de Verificación de Tipos (TypeScript)

**Comando:** `npm run typecheck`

**Salida de terminal:**

```text
> ayudapi@1.0.0 typecheck
> tsc --noEmit
```

**Código de salida:** `0`

> **Resultado:** ✅ Comando terminado con éxito, sin errores de tipos.

---

## Resumen

| Verificación | Comando | Errores | Warnings | Estado |
|---|---|---|---|---|
| ESLint | `npm run lint` | 0 | 0 | ✅ Aprobado |
| TypeScript | `npm run typecheck` | 0 | — | ✅ Aprobado |
| Modo estricto TS | `tsconfig.json` → `"strict": true` | — | — | ✅ Habilitado |

**Conclusión QA:** ESLint y TypeScript reportan **0 errores / 0 warnings**. El modo estricto de TypeScript está activo. La evaluación estática del código se aprueba sin observaciones.
