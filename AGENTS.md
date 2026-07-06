<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MaketAR — Guía para agentes

MaketAR es una aplicación web **libre, autohosteable e instalable como PWA** para crear **wireframes**, **diagramas de flujo** y documentación visual técnica. Diseño **local-first**: escribe primero en IndexedDB del navegador y sincroniza con PostgreSQL cuando la API está disponible. Sin cuentas externas ni servicios de pago.

Repositorio: `https://github.com/Higanws/MaketAR.git` · Rama principal: `main`

---

## Stack

| Capa | Tecnología |
|------|------------|
| Framework | Next.js **16** (App Router), React **19**, TypeScript |
| Estilos | Tailwind CSS **4** |
| Estado UI wireframe | Zustand (`src/stores/editor/editor-store.ts`) |
| Diagramas de flujo | `@xyflow/react` v12 (React Flow) |
| Persistencia remota | Prisma 7 + PostgreSQL |
| Persistencia local | IndexedDB (`src/lib/storage/indexed-db.ts`) |
| Tests | Vitest (unit), Playwright (e2e) |
| Deploy | Docker Compose (`web` + `postgres`) |

**Node.js ≥ 22** · Puerto Docker por defecto: **80** → contenedor `3000`

---

## Pantallado de la aplicación

```
┌─────────────────────────────────────────────────────────────────────────┐
│  MaketAR (PWA, tema claro/oscuro vía FloatingSettings)                  │
└─────────────────────────────────────────────────────────────────────────┘

VISTA 1: DASHBOARD  (AppShell → Dashboard)
┌─────────────────────────────────────────────────────────────────────────┐
│  Header: logo, buscador, "Nuevo proyecto", "Importar JSON"              │
├─────────────────────────────────────────────────────────────────────────┤
│  Sección "Plantillas wireframe"                                         │
│    [Dashboard SaaS] [Landing] [Mobile] [Formulario] [Arquitectura]      │
├─────────────────────────────────────────────────────────────────────────┤
│  Sección "Plantillas de flujo"                                          │
│    [Flujo compra] [Flujo aprobación] [Flujo soporte]                    │
├─────────────────────────────────────────────────────────────────────────┤
│  Lista de proyectos guardados (abrir / renombrar / eliminar)            │
└─────────────────────────────────────────────────────────────────────────┘
     │
     │ abrir proyecto
     ▼
VISTA 2: EDITOR  (AppShell → EditorShell)
┌─────────────────────────────────────────────────────────────────────────┐
│  TopToolbar: ← volver · modo Wireframe|Flujo · undo/redo · zoom · grid  │
│              · snap · guardar · exportar (JSON/PNG/SVG/PDF)             │
├──────────────┬──────────────────────────────────────┬───────────────────┤
│ LibraryPanel │         LIENZO CENTRAL               │ PropertiesPanel   │
│ (izquierda)  │                                      │ (derecha)         │
│              │  MODO WIREFRAME:                     │                   │
│ · Formas UI  │    WireframeCanvas (canvas propio)   │ Posición, tamaño, │
│ · Templates  │    shapes, drag, resize, rotate,     │ texto, colores,   │
│ · Iconos     │    marquee, guías de alineación      │ tipografía, borde │
│   built-in   │                                      │ (wireframe)       │
│ · Iconos     │  MODO FLUJO (diagram):               │                   │
│   custom     │    DiagramCanvas (React Flow)        │ Etiqueta, colores,│
│              │    nodos, flechas, reconexión        │ tamaño, alineación│
│ En modo      │                                      │ de texto (flujo)  │
│ flujo:       │                                      │                   │
│ DiagramInsert│                                      │                   │
│ Panel        │                                      │                   │
│ (nodos flujo)│                                      │                   │
└──────────────┴──────────────────────────────────────┴───────────────────┘

OVERLAYS GLOBALES
  · FloatingSettings (esquina): tema claro/oscuro
  · Diálogos: crear / renombrar / eliminar proyecto
  · Menús contextuales en canvas (copiar, pegar, duplicar, eliminar)
```

### Modos del editor (`DiagramMode`)

| Modo | Valor store | Canvas | Estado principal |
|------|-------------|--------|------------------|
| Wireframe | `"wireframe"` | `WireframeCanvas` | `pages[]` → `shapes[]` en Zustand |
| Flujo | `"diagram"` | `DiagramCanvas` + React Flow | `diagramNodes` + `diagramEdges` en estado local de EditorShell |

Un proyecto **mixed** contiene ambos: páginas wireframe y grafo de flujo en el mismo `EditorDocument`.

---

## Arquitectura de datos

```
Navegador (PWA)
├── React + Next.js
├── Zustand (wireframe: shapes, páginas, undo/redo, zoom, grid)
├── React Flow state (nodos/edges del flujo en EditorShell)
├── IndexedDB (proyectos, documentos, iconos custom, sync pendiente)
└── Service Worker (PWA)

API Next.js (opcional, Docker)
├── GET/POST        /api/projects
├── GET/PATCH/DELETE /api/projects/[id]
└── PATCH           /api/projects/[id]/document

PostgreSQL + Prisma
└── Usuario interno fijo local@maketar.app (sin auth remota)
```

### `EditorDocument` (unidad de persistencia)

Definido en `src/types/project.ts`. Campos clave:

- `version` — debe coincidir con `editorStorageVersion` (`src/shared/config/editor.ts`, actualmente **5**)
- `pages` — array de `WirePage` con `shapes`
- `currentPageId`, `mode`, `zoom`, `showGrid`, `snapToGrid`, `gridSize`
- `diagramNodes`, `diagramEdges` — grafo de flujo (serializado)
- `updatedAt` — resolución de conflictos local vs remoto

Flujo de guardado: `saveProjectDocument()` → IndexedDB primero → PATCH API si online.

---

## Estructura del código

```
src/
├── app/
│   ├── page.tsx              # Entrada: AppShell
│   ├── layout.tsx            # Layout raíz, metadata PWA
│   ├── pwa-register.tsx      # Registro service worker
│   └── api/
│       └── projects/         # CRUD proyectos + documento
├── entities/
│   ├── flow/
│   │   ├── flow.types.ts     # FlowNodeVariant, FlowNodeData, edges
│   │   └── flow-templates.ts # Defaults, plantillas, handles, normalización edges
│   ├── wireframe/
│   │   ├── wireframe.types.ts
│   │   └── table.ts          # Lógica tablas en shapes
│   └── project/
│       └── project.types.ts
├── features/
│   ├── app-shell/AppShell.tsx       # Orquestador dashboard ↔ editor
│   ├── dashboard/Dashboard.tsx      # UI proyectos y plantillas
│   ├── editor/                      # Editor modularizado
│   │   ├── EditorShell.tsx          # Orquestador (~630 líneas)
│   │   ├── flow/                    # FlowNode, DiagramCanvas, utilidades texto
│   │   ├── wireframe/               # WireframeCanvas, CanvasShape, guías
│   │   ├── panels/                  # Biblioteca y propiedades
│   │   ├── library/                 # Drag-drop, IconTile
│   │   └── hooks/                   # useDiagramClipboard
│   ├── editor-toolbar/TopToolbar.tsx
│   ├── export/                      # JSON, PNG, SVG, PDF
│   ├── icons/icon-catalog.ts        # Lucide, cloud-icons, custom SVG
│   └── projects/project-client.ts   # Capa local-first + API
├── lib/
│   ├── editor-store.ts              # Re-export del store Zustand
│   └── storage/indexed-db.ts
├── server/
│   ├── db/prisma.ts
│   ├── http/                        # ApiError, withRouteHandler
│   ├── schemas/                     # Validación Zod (project, document)
│   └── projects/                    # Repositorio dividido (mapper, document, local-user)
├── shared/
│   ├── config/editor.ts
│   ├── ui/                          # Button, Modal, property-controls…
│   └── lib/export-utils.ts
└── stores/editor/
    └── editor-store.ts              # Estado wireframe (shapes, history, templates)

public/
├── icons/                  # Favicon, PWA, logo app (B/N)
└── cloud-icons/            # SVG AWS/GCP empaquetados

prisma/schema.prisma
docker-compose.yml
Dockerfile
```

---

## Dominio: Wireframe

### Tipos de shape (`WireShape.type`)

Rectángulo, círculo, texto, botón, input, card, navbar, tabla, modal, mobile/desktop frame, imagen, iconos cloud (aws/azure/gcp), kubernetes, database, network, process, decision, uml, devops, mindmap, server, storage, api, org, icon.

### Capacidades del canvas (`WireframeCanvas`)

- Zoom, pan, grid, snap
- Selección simple y múltiple (marquee)
- Drag, resize (8 handles), rotate
- Guías de alineación al mover/redimensionar
- Drag & drop desde biblioteca (`LIBRARY_DRAG_MIME`)
- Undo/redo vía snapshots en Zustand
- Tipografía, colores, bordes, sombras, opacidad — control total en panel de propiedades

### Plantillas wireframe (`TemplateType`)

`dashboard` · `landing` · `mobile` · `form` · `architecture`

---

## Dominio: Flujo (diagramas)

### Variantes de nodo (`FlowNodeVariant`)

| Variante | Forma | Notas |
|----------|-------|-------|
| `start` | Óvalo verde | Inicio/fin |
| `process` | Rectángulo | Paso estándar |
| `decision` | Rombo SVG | Handles en 4 lados (`*-source` único por lado) |
| `data` | Paralelogramo | Entrada/salida de datos |
| `document` | Rectángulo ondulado abajo | |
| `text` | Sin borde | Alineación H/V configurable en panel |
| `image` | Imagen + etiqueta | Sin handles de conexión |
| `icon` | Icono escalable + etiqueta opcional | Handles en 4 lados |
| `group` | Marco punteado | Fondo z-index -1, sin handles |

### Comportamiento importante del flujo

- **Texto escala con el nodo**: `getFlowNodeTextScale` + `useInternalNode` en `FlowNode` — el `fontSize` es proporcional a `min(ancho, alto)` respecto al default del tipo. Mínimo 8px. Sin scroll en nodos pequeños.
- **Texto centrado** en figuras estándar; nodo `text` respeta alineación del panel.
- **Handles**: 14px, un handle visible por lado (`top-source`, `right-source`, etc.). Targets reutilizan el mismo id (`resolveFlowHandleId`).
- **Edges**: `smoothstep`, reconectables, etiquetas (doble clic), estilos `solid` / `dashed` / `dotted`.
- **Sincronización**: `FlowDiagramSync` + `useUpdateNodeInternals` + `useNodesInitialized` — esperar `diagramFlowReady` antes de auto-guardar para evitar flechas mal ancladas en rombos al primer render.
- **Drag & drop**: payloads `flow-node` y `flow-icon` en `LIBRARY_DRAG_MIME`.

### Plantillas de flujo (`FlowTemplateType`)

`purchase-flow` · `approval-flow` · `support-flow`

Definidas en `src/entities/flow/flow-templates.ts` (`makeFlowTemplateState`).

---

## Drag & drop (biblioteca → canvas)

MIME: `application/maketar-library-item`

| Payload `kind` | Destino |
|----------------|---------|
| `wireframe-shape` | WireframeCanvas |
| `wireframe-template` | WireframeCanvas |
| `wireframe-icon` / `wireframe-custom-icon` | WireframeCanvas |
| `flow-node` | DiagramCanvas |
| `flow-icon` | DiagramCanvas |

Inserción con posición centrada en el punto de drop (`screenToFlowPosition` en flujo; coordenadas de canvas en wireframe).

---

## Convenciones para cambios de código

1. **Alcance mínimo** — No mezclar refactors no solicitados. `EditorShell.tsx` es grande; tocar solo la sección relevante (wireframe vs flujo).
2. **Wireframe vs flujo** — Tipografía del wireframe se controla en panel (`fontSize` en `ShapeStyle`). El flujo escala texto automáticamente al redimensionar; no aplicar la misma lógica al wireframe salvo que se pida.
3. **Next.js 16** — Consultar `node_modules/next/dist/docs/` ante dudas de API; no asumir convenciones de Next 13/14.
4. **Persistencia** — Si cambias la forma del documento, evaluar subir `editorStorageVersion` y migración en `indexed-db.ts`.
5. **Estilo UI** — Tailwind, paleta slate/blue, clases existentes (`toolbar-button`, `property-input`, `property-label`).
6. **Iconos** — `lucide-react`, paquete `cloud-icons`, custom en localStorage (`customIconsStorageKey`).
7. **Tests** — `npm run lint && npm run test` como mínimo. `npm run verify` antes de PR grande.
8. **Commits** — Conventional commits (`feat`, `fix`, `chore`, `docs`). Mensajes en español o inglés según el historial reciente del área.
9. **No commitear** `.env` ni secretos.

---

## Comandos útiles

```bash
npm run dev              # http://localhost:3000
npm run lint
npm run test
npm run e2e
npm run verify           # lint + test + build + e2e
npm run db:generate
npm run db:push

docker compose up --build -d    # producción en :80
docker compose down
```

Push remoto: si `git push origin` falla por HTTPS, usar  
`git push git@github.com:Higanws/MaketAR.git main`

---

## Archivos críticos por tarea

| Tarea | Archivos |
|-------|----------|
| UI editor / canvas wireframe | `src/features/editor/EditorShell.tsx` → `WireframeCanvas`, `CanvasShape` |
| Nodos y canvas de flujo | `EditorShell.tsx` → `FlowNode`, `DiagramCanvas`, `FlowDiagramSync` |
| Defaults y plantillas flujo | `src/entities/flow/flow-templates.ts` |
| Estado wireframe | `src/stores/editor/editor-store.ts` |
| Persistencia | `src/features/projects/project-client.ts`, `src/lib/storage/indexed-db.ts` |
| API | `src/app/api/projects/**` |
| Dashboard / proyectos | `src/features/app-shell/AppShell.tsx`, `src/features/dashboard/Dashboard.tsx` |
| Exportación | `src/features/export/` |
| PWA / iconos app | `public/icons/`, `src/app/layout.tsx`, `scripts/generate-app-icons.mjs` |
| Prisma | `prisma/schema.prisma` |

---

## Prioridades del producto

- Autohosteable sin dependencias de pago
- Local-first con backups JSON portables
- UI práctica y estable para wireframes y flujos
- PWA instalable desde el navegador
- Docker como forma recomendada de despliegue
