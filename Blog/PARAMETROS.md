# Parámetros de trabajo (arquitectura y hoja de ruta)

Guía breve para mantener el proyecto ordenado y escalable.

## Filosofía
- Separar por dominio/feature antes que por tipo de archivo.
- Capas claras: UI ➜ lógica de vista ➜ servicios/datos ➜ utils/lib.
- Evitar dependencias cruzadas entre features; compartir solo por `components/`, `hooks/`, `lib/`, `utils/`.

## Contexto del proyecto (resumen maestro)
- Plataforma personal (blog profesional + portafolio/página personal) con automatización de contenido (n8n) y administración completa.
- Backend: Supabase (Postgres, RLS, policies por rol, Storage, PostgREST, triggers moddatetime).
- Frontend: React + Vite + HeroUI, routing (React Router), estado global (Zustand o Redux Toolkit), data fetching (SWR/React Query), editor markdown/richtext (TipTap recomendado).
- Automatización: n8n para scraping TI, generación de resúmenes, clasificación por tags, inserción de borradores y medios.
- Infra: Vercel/Netlify, GitHub, CI/CD básico.
- Roles: Admin (todo), Editor (artículos), Viewer (lectura interna), Público (solo publicado).
- Páginas clave: `/blog`, `/blog/:slug`, `/me` (portafolio), dashboard interno.
- Requisitos clave: SEO avanzado, métricas de visitas, control editorial (pendiente/aprobado/rechazado), versionado automático, RLS por tabla.

### Requerimientos funcionales (resumen)
- Blogging: CRUD de artículos, borradores, publicación/programación, categorías/tags, control editorial, versionado, YouTube links, medios, SEO por artículo, buscador interno, métricas de visitas.
- Automatización (n8n): generar artículos e imágenes, insertar como borradores, sugerir videos, clasificar por tags.
- Portafolio / página personal: página pública `/me` administrable con biografía, experiencia, proyectos, habilidades, redes sociales, páginas personalizadas en JSON y CRUD completo.
- Administración: dashboard, control de roles, restricción de accesos, CRUD de perfiles, logs de actividad.

### Requerimientos no funcionales (resumen)
- Rendimiento: consultas optimizadas, índices por SEO/slug/fecha/estado.
- Seguridad: RLS por tabla, lectura pública solo de contenido publicado.
- Mantenibilidad: código modular, componentes desacoplados.
- Escalabilidad: BD normalizada, API REST de Supabase.
- Confiabilidad: versionado automático de artículos.
- Usabilidad: dashboard administrable, UI limpia y accesible.

### Flujo operativo (alto nivel)
- Creación: autor crea borrador, añade categorías/tags, guarda versiones, videos, publica.
- Automatización: n8n obtiene noticias TI, genera contenido, inserta en Supabase y notifica.
- Visualización pública: `/blog` lista publicados; `/blog/:slug` muestra detalle + SEO + videos; `/me` muestra la página personal/portafolio con experiencia, proyectos, habilidades, redes.
- Roles: Admin (todo), Editor (artículos), Viewer (lectura interna), Público (publicado).

## Parámetros para generar o modificar código
- Revisar antes de tocar: leer archivos y difs relevantes; entender el estado actual y los requisitos de `PARAMETROS.md`.
- Aprender de errores: documentar en notas internas (commits/mensajes) qué falló y cómo se corrigió; evitar repetirlos.
- Cambios limpios: seguir la arquitectura de carpetas, tipado claro, separación de responsabilidades y uso de HeroUI + Tailwind.
- Guardrails de calidad: no romper roles/RLS/SEO/flujo editorial; no dejar TODOs sin contexto; evitar dependencias cruzadas entre features.
- Preflight: antes de generar código, validar que no existan conflictos con configuraciones previas (tailwind, rutas, providers); preferir componentes reutilizables.
- Postcambio: revisar el diff, asegurar que el código sea legible, sin warnings conocidos, y coherente con los requerimientos funcionales y no funcionales.

## Capas y carpetas (ya creadas)
- `src/app`: composición raíz, providers globales, rutas.
- `src/components/ui`: piezas de UI genéricas (sin lógica de negocio).
- `src/components/layout`: cascarones/maquetación.
- `src/features`: cada dominio con sus componentes, hooks y servicios específicos.
- `src/services`: acceso a APIs/integraciones (fetch/axios); sin lógica de UI.
- `src/store`: estado global (zustand/redux) y slices.
- `src/hooks`: hooks reutilizables entre features.
- `src/lib`: helpers agnósticos al framework (formatos, validaciones).
- `src/utils`: utilidades ligeras, helpers pequeños.
- `src/styles`: estilos globales, tokens, extensiones Tailwind.
- `src/assets`: estáticos (imágenes, íconos, fuentes).
- `src/types`: contratos y modelos compartidos.

## Flujo para agregar una feature nueva
1) Crear carpeta en `src/features/<feature>` con:
   - `components/` (UI específica del feature).
   - `hooks/` (hooks del feature).
   - `services/` o `api/` (llamadas de datos).
   - `types/` (modelos del feature) si aplica.
2) UI genérica que pueda reutilizarse va a `components/ui` o `components/layout`.
3) Estado compartido va en `store` (o en el feature si no cruza dominios).
4) Expone la ruta en `app/routes` y conecta providers globales en `app/providers` si se necesitan (tema, query client, auth, etc.).

## Reglas rápidas
- Componentes:
  - Dejar la lógica de datos fuera de los componentes de UI genéricos.
  - Prefiere props explícitas y tipos definidos en `types/`.
- Datos/servicios:
  - Encapsula fetch/axios en `services`; no llames APIs directo desde el componente.
  - Define contratos en `types`.
- Estado:
  - Estado local en el componente; global solo si cruza pantallas/feature.
- Estilos:
  - Usa clases de Tailwind + componentes de HeroUI.
  - Tokens/temas globales en `styles`; evita CSS suelto por feature salvo que sea scoped.
- Utils/lib:
  - `lib`: funciones puras más grandes o reutilizables entre apps.
  - `utils`: helpers chicos, sin dependencias pesadas.

## HeroUI + Tailwind
- Tailwind ya está configurado con el plugin `heroui` en `tailwind.config.js`.
- Usa componentes de `@heroui/react`; agrega `className` o props de estilo en vez de CSS manual.
- Mantén `darkMode: "class"` (ya definido).

## Cómo razonar cambios (checklist corto)
- ¿Es parte de un feature? → va dentro de `src/features/<feature>`.
- ¿Se puede reutilizar en otros features? → súbelo a `components/ui` o `components/layout`.
- ¿Necesita datos remotos? → crea función en `services` y tipos en `types`.
- ¿Estado global es necesario? → slice en `store`; si no, estado local.
- ¿Estilos? → Tailwind/HeroUI primero; tokens globales en `styles`.
- ¿Helper puro? → `lib` (agnóstico) o `utils` (ligero).

## Convenciones mínimas
- Nombres en inglés para código (components, hooks, variables).
- Un archivo por responsabilidad clara; evita God components.
- Prefiere composición sobre herencia.
- Evita imports relativos quebradizos (`../../..`); si usas path aliases, defínelos en `vite.config.js` y `jsconfig/tsconfig`.
