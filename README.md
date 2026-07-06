# MaketAR

MaketAR es una aplicacion web libre, autohosteable e instalable como PWA para crear wireframes, diagramas de flujo, mapas visuales y documentacion tecnica en un entorno local-first.

La app esta pensada para uso personal o de equipos pequenos: corre en tu maquina o servidor, guarda datos localmente y no depende de servicios pagos, cuentas externas, certificados ni instaladores nativos.

## Caracteristicas

- Editor mixto de wireframes y diagramas de flujo.
- Canvas con zoom, grid, snap, seleccion multiple, copiar/pegar, duplicar, undo/redo y menu contextual.
- Formas de wireframe: rectangulo, circulo, texto, boton, textbox, navbar, tabla e imagen/SVG.
- Diagramas de flujo: inicio/fin, proceso, decision, entrada/salida, texto, imagen, iconos y grupos visuales de fondo.
- Flechas reconectables, etiquetas, lineas solidas, rayadas y punteadas.
- Templates de wireframe y templates de flujo actualizados.
- Paquetes de iconos integrados orientados a UI, desarrollo, cloud y arquitectura.
- Paquetes propios de iconos SVG guardados en el navegador.
- Panel de propiedades para posicion, tamano, texto, color, borde, opacidad, tipografia y conexion.
- Exportacion a JSON, PNG, SVG y PDF.
- Importacion de backups JSON desde el dashboard.
- PWA instalable desde el navegador.
- Persistencia local-first con IndexedDB y PostgreSQL opcional via Docker.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Zustand
- React Flow / XYFlow
- Prisma
- PostgreSQL
- Docker Compose
- Vitest
- Playwright

## Requisitos

Para desarrollo local:

- Node.js 22 o superior
- npm
- PostgreSQL local si quieres usar la API con base de datos

Para autohost con Docker:

- Docker
- Docker Compose

## Inicio Rapido Con Docker

Este es el modo recomendado para probar o autohostear MaketAR.

```bash
git clone <URL_DEL_REPOSITORIO>
cd MaketAR
docker compose up --build
```

Abre:

```txt
http://localhost
```

El contenedor web expone la app en el puerto `80` por defecto y levanta PostgreSQL en otro contenedor.

Si el puerto `80` esta ocupado:

```bash
MAKETAR_HTTP_PORT=8080 docker compose up --build
```

Abre:

```txt
http://localhost:8080
```

Para detener:

```bash
docker compose down
```

Para borrar tambien los datos de PostgreSQL:

```bash
docker compose down -v
```

## Desarrollo Local

Instala dependencias:

```bash
npm install
```

Copia variables de entorno:

```bash
cp .env.example .env
```

Si usas PostgreSQL local, verifica `DATABASE_URL` en `.env`.

Genera Prisma Client:

```bash
npm run db:generate
```

Sincroniza el schema con la base:

```bash
npm run db:push
```

Levanta la app:

```bash
npm run dev
```

Abre:

```txt
http://localhost:3000
```

## Variables De Entorno

Ejemplo disponible en `.env.example`.

```env
DATABASE_URL="postgresql://maketar:maketar@localhost:5432/maketar?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost"
MAKETAR_HTTP_PORT=80
```

En Docker Compose, `DATABASE_URL` apunta al servicio interno `postgres`.

## Instalar Como App

MaketAR esta configurada como PWA. Es la misma app web, pero el navegador puede instalarla en una ventana propia.

1. Levanta MaketAR con Docker o en desarrollo.
2. Abre `http://localhost` o `http://localhost:3000`.
3. Instala desde el navegador:
   - Chrome / Edge / Chromium: icono de instalacion en la barra de direcciones o menu `Instalar MaketAR`.
   - Safari en macOS: `Archivo` -> `Agregar al Dock` cuando este disponible.
   - Linux: usa un navegador compatible con PWA.

No hace falta Electron, Tauri, certificados, firma de codigo ni tienda de apps.

## Persistencia Y Backups

MaketAR usa una estrategia local-first:

- IndexedDB guarda proyectos, documentos, paquetes de iconos propios y preferencias en el navegador.
- PostgreSQL guarda proyectos y documentos cuando la API esta disponible.
- El editor escribe primero en local y luego sincroniza con la API.
- Si el servidor local no esta disponible, puedes seguir conservando datos del navegador.
- El formato JSON sirve como backup manual portable.

Para exportar:

1. Abre un proyecto.
2. Usa `Exportar`.
3. Elige `JSON`, `PNG`, `SVG` o `PDF`.

Para restaurar:

1. Vuelve al dashboard.
2. Usa `Importar JSON`.
3. Selecciona un backup exportado desde MaketAR.

## Scripts

```bash
npm run dev          # desarrollo
npm run build        # build de produccion
npm run start        # servir build local de Next
npm run lint         # eslint
npm run test         # tests unitarios con Vitest
npm run test:watch   # tests en watch mode
npm run e2e          # tests end-to-end con Playwright (UI mockeada)
npm run e2e:api      # test e2e opcional contra API real (requiere DATABASE_URL)
npm run verify       # lint + test + build + e2e
npm run db:generate  # generar Prisma Client
npm run db:push      # aplicar schema Prisma a la DB
npm run db:studio    # abrir Prisma Studio
```

### Tests de API (opcional)

El smoke e2e principal mockea `/api/projects`. Para probar la API real contra PostgreSQL:

```bash
docker compose up -d
cp .env.example .env
npm run db:push
npm run dev

# En otra terminal, con DATABASE_URL configurada:
DATABASE_URL="postgresql://maketar:maketar@localhost:5432/maketar" npm run e2e:api
```

El test en `tests/e2e/api-projects.spec.ts` se omite automáticamente si no hay `DATABASE_URL`.

## Estructura Del Proyecto

```txt
src/
├── app/                 # Next.js App Router, layout, PWA y API routes
├── entities/            # Tipos y logica de dominio: flow, project, wireframe
├── features/            # Modulos de UI y comportamiento por funcionalidad
├── lib/                 # Storage, utilidades y compatibilidad
├── server/              # Prisma, repositorios y acceso a datos
├── shared/              # Config, helpers y componentes compartidos
├── stores/              # Zustand stores
└── types/               # Tipos compartidos de proyecto/documento

prisma/
└── schema.prisma

tests/
└── e2e/
```

## Arquitectura

```txt
Navegador / PWA
├── React + Next.js
├── Zustand
├── IndexedDB
└── Service Worker

API local Next.js
├── /api/projects
├── /api/projects/[id]
└── /api/projects/[id]/document

Persistencia
├── PostgreSQL
└── Prisma ORM
```

El proyecto no usa autenticacion remota. Para el modo local se crea un usuario interno fijo (`local@maketar.app`) que asocia los proyectos de la instancia.

## Docker Compose

Servicios incluidos:

- `maketar-web`: Next.js standalone en produccion.
- `maketar-postgres`: PostgreSQL local.
- `postgres_data`: volumen persistente de base de datos.

El contenedor web ejecuta:

```bash
npx prisma db push && node server.js
```

Esto mantiene la base local alineada con `prisma/schema.prisma` al iniciar.

## Publicar Tu Fork

Checklist recomendado antes de subir a Git:

```bash
npm run verify
docker compose config
docker compose build --pull=false web
```

Revisa que no estes subiendo secretos:

```bash
git status --short
```

No subas `.env`. Usa `.env.example` como referencia publica.

## Licencia

MaketAR se distribuye bajo licencia MIT. Consulta `LICENSE`.

El codigo de la aplicacion es libre. Algunas marcas, nombres o iconos de terceros, como proveedores cloud o tecnologias de desarrollo, pueden estar protegidos por sus respectivas marcas registradas y se usan solo con fines de identificacion visual.

## Contribuir

Contribuciones, issues y forks son bienvenidos.

Antes de proponer cambios:

```bash
npm run verify
```

Mantener prioridades del proyecto:

- App autohosteable.
- Experiencia local-first.
- Sin dependencias de servicios pagos.
- UI simple, practica y estable.
- Backups JSON portables.

