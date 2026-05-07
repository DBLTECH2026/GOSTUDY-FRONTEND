# GOSTUDY — Frontend (Next.js 16)

App del Sistema de Matrícula Digital del Colegio Trilce.

## Stack
- Next.js 16 (App Router) + React 19
- TypeScript estricto
- Tailwind CSS 4
- ESLint
- Auth dual: admin (email+password) y portal estudiante (DNI+PIN)

## Setup local

```bash
git clone git@github.com:DBLTECH2026/GOSTUDY-FRONTEND.git
cd GOSTUDY-FRONTEND
npm install
cp .env.example .env.local
npm run dev
```

App en `http://localhost:3000`. Backend debe correr en `http://localhost:8000`.

## Estructura modular

```
src/
├── app/
│   ├── (public)/inscripcion/   ← B (form sin auth)
│   ├── (auth)/admin-login/     ← A
│   ├── (auth)/portal-login/    ← A
│   ├── (app)/                  ← Panel admin/docente
│   │   ├── dashboard/          ← shared
│   │   ├── estudiantes/        ← A
│   │   ├── docentes/           ← A
│   │   ├── inscripciones/      ← B
│   │   ├── catalogos/          ← B (niveles/grados/secciones/periodos/cursos)
│   │   ├── matricula/          ← B
│   │   ├── pagos/              ← C
│   │   └── reportes/           ← C
│   └── (portal)/               ← Portal estudiante
│       ├── inicio/             ← C
│       ├── mi-matricula/       ← C
│       ├── mis-pagos/          ← C
│       └── mis-cursos/         ← C
├── modules/
│   ├── auth/         ← A   (hooks, api, ProtectedRoute)
│   ├── personas/     ← A
│   ├── inscripcion/  ← B
│   ├── catalogos/    ← B
│   ├── matricula/    ← B
│   ├── pagos/        ← C
│   ├── portal/       ← C
│   └── reportes/     ← C
└── shared/
    ├── components/   ← UI común (Button, Input, Modal...) — consensuar antes
    ├── hooks/
    ├── lib/
    │   ├── api.ts              ← cliente fetch base
    │   └── sidebar-registry.ts ← NO TOCAR (registra desde cada módulo)
    └── types/
```

## Reglas anti-conflicto

1. **No tocar `src/shared/lib/sidebar-registry.ts`** ni layouts compartidos.
   Para añadir items al sidebar, edita TU `src/modules/<modulo>/sidebar.config.ts`.
2. **Tu carpeta es tu carpeta.** No metas archivos en `src/modules/<otro-modulo>/`.
3. **Componentes compartidos** (`src/shared/components/`) requieren consenso antes de modificarse.
4. **Antes de instalar dep nueva** (`npm install`), avisa al grupo. Una persona consolida `package.json` semanalmente en un PR único.
5. **Imports**: usar alias `@/` (mapeado a `src/`). No imports relativos largos `../../../`.
6. **Server Components por defecto.** Solo poner `'use client'` cuando hay interactividad real (formularios, hooks de estado).
7. **Validación**: react-hook-form + zod (cuando se instalen — ver regla 4).
8. **Errores de API**: usar `ApiError` del `shared/lib/api.ts` y mostrar con toast.
9. **Nunca push directo a `main` ni `develop`.** PR siempre.

## Branching

```
main          ← protegida
└── develop   ← integración
    ├── feat/A-auth-ui
    ├── feat/A-personas-ui
    ├── feat/B-catalogos-ui
    ├── feat/B-inscripcion-ui
    ├── feat/B-matricula-ui
    ├── feat/C-pagos-ui
    ├── feat/C-portal-ui
    └── feat/C-reportes-ui
```

## Convenciones

- Componentes: `PascalCase.tsx`
- Hooks: `useThing.ts`
- TypeScript estricto, NO usar `any`
- Tailwind para estilos (no CSS modules)
- Commits: `feat(auth-ui): página de login admin`

## Documentación adicional

Ver carpeta `../docs/` en el repo monorepo (o el README del backend):
- `00_PLANIFICACION_EQUIPO.md`
- `01_MODELO_DATOS.md`
- `02_API_CONTRATO.md`
