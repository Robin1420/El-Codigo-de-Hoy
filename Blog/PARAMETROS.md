# ParÃ¡metros de trabajo (arquitectura y hoja de ruta)

GuÃ­a breve para mantener el proyecto ordenado y escalable.

## FilosofÃ­a
- Separar por dominio/feature antes que por tipo de archivo.
- Capas claras: UI â†’ lÃ³gica de vista â†’ servicios/datos â†’ utils/lib.
- Evitar dependencias cruzadas entre features; compartir solo por `components/`, `hooks/`, `lib/`, `utils/`.

## Contexto del proyecto (resumen maestro)
- Proyecto â€œEl CÃ³digo de Hoyâ€: plataforma personal (blog profesional + portafolio/pÃ¡gina personal) donde se publican a diario las Ãºltimas noticias del mundo de la tecnologÃ­a y TI, con automatizaciÃ³n de contenido (n8n) y administraciÃ³n completa.
- Backend: Supabase (Postgres, RLS, policies por rol, Storage, PostgREST, triggers moddatetime).
- Frontend: React + Vite + HeroUI; routing (React Router); estado global (Zustand o Redux Toolkit); data fetching (SWR/React Query); editor markdown/richtext (TipTap recomendado).
- AutomatizaciÃ³n: n8n para scraping TI, generaciÃ³n de resÃºmenes, clasificaciÃ³n por tags, inserciÃ³n de borradores y medios.
- Infra: Vercel/Netlify, GitHub, CI/CD bÃ¡sico.
- Roles: Admin (todo), Editor (artÃ­culos), Viewer (lectura interna), PÃºblico (solo publicado).
- PÃ¡ginas clave: `/blog`, `/blog/:slug`, `/me` (portafolio), dashboard interno.
- Requisitos clave: SEO avanzado, mÃ©tricas de visitas, control editorial (pendiente/aprobado/rechazado), versionado automÃ¡tico, RLS por tabla.

### Requerimientos funcionales (resumen)
- Blogging: CRUD de artÃ­culos, borradores, publicaciÃ³n/programaciÃ³n, categorÃ­as/tags, control editorial, versionado, enlaces YouTube, medios, SEO por artÃ­culo, buscador interno, mÃ©tricas de visitas.
- AutomatizaciÃ³n (n8n): generar artÃ­culos e imÃ¡genes, insertar como borradores, sugerir videos, clasificar por tags.
- Portafolio / pÃ¡gina personal: pÃ¡gina pÃºblica `/me` administrable con biografÃ­a, experiencia, proyectos, habilidades, redes sociales, pÃ¡ginas personalizadas en JSON y CRUD completo.
- AdministraciÃ³n: dashboard, control de roles, restricciÃ³n de accesos, CRUD de perfiles, logs de actividad.

### Requerimientos no funcionales (resumen)
- Rendimiento: consultas optimizadas, Ã­ndices por SEO/slug/fecha/estado.
- Seguridad: RLS por tabla, lectura pÃºblica solo de contenido publicado.
- Mantenibilidad: cÃ³digo modular, componentes desacoplados.
- Escalabilidad: BD normalizada, API REST de Supabase.
- Confiabilidad: versionado automÃ¡tico de artÃ­culos.
- Usabilidad: dashboard administrable, UI limpia y accesible.

### Flujo operativo (alto nivel)
- CreaciÃ³n: autor crea borrador, aÃ±ade categorÃ­as/tags, guarda versiones, agrega videos, publica.
- AutomatizaciÃ³n: n8n obtiene noticias TI, genera contenido, inserta en Supabase y notifica.
- VisualizaciÃ³n pÃºblica: `/blog` lista publicados; `/blog/:slug` muestra detalle + SEO + videos; `/me` muestra la pÃ¡gina personal/portafolio con experiencia, proyectos, habilidades, redes.
- Roles: Admin (todo), Editor (artÃ­culos), Viewer (lectura interna), PÃºblico (publicado).

## ParÃ¡metros para generar o modificar cÃ³digo
- Revisar antes de tocar: leer archivos y difs relevantes; entender el estado actual y los requisitos de `PARAMETROS.md`.
- Aprender de errores: documentar quÃ© fallÃ³ y cÃ³mo se corrigiÃ³; evitar repetirlos.
- Cambios limpios: seguir la arquitectura de carpetas, tipado claro, separaciÃ³n de responsabilidades y uso de HeroUI + Tailwind.
- Guardrails de calidad: no romper roles/RLS/SEO/flujo editorial; no dejar TODOs sin contexto; evitar dependencias cruzadas entre features.
- Preflight: antes de generar cÃ³digo, validar que no existan conflictos con configuraciones previas (tailwind, rutas, providers); preferir componentes reutilizables.
- Postcambio: revisar el diff, asegurar que el cÃ³digo sea legible, sin warnings conocidos, y coherente con los requerimientos funcionales y no funcionales.

## Capas y carpetas (ya creadas)
- `src/app`: composiciÃ³n raÃ­z, providers globales, rutas.
- `src/components/ui`: piezas de UI genÃ©ricas (sin lÃ³gica de negocio).
- `src/components/layout`: cascarones/maquetaciÃ³n.
- `src/features`: cada dominio con sus componentes, hooks y servicios especÃ­ficos.
- `src/services`: acceso a APIs/integraciones (fetch/axios); sin lÃ³gica de UI.
- `src/store`: estado global (zustand/redux) y slices.
- `src/hooks`: hooks reutilizables entre features.
- `src/lib`: helpers agnÃ³sticos al framework (formatos, validaciones).
- `src/utils`: utilidades ligeras, helpers pequeÃ±os.
- `src/styles`: estilos globales, tokens, extensiones Tailwind.
- `src/assets`: estÃ¡ticos (imÃ¡genes, Ã­conos, fuentes).
- `src/types`: contratos y modelos compartidos.

## Flujo para agregar una feature nueva
1) Crear carpeta en `src/features/<feature>` con:
   - `components/` (UI especÃ­fica del feature).
   - `hooks/` (hooks del feature).
   - `services/` o `api/` (llamadas de datos).
   - `types/` (modelos del feature) si aplica.
2) UI genÃ©rica que pueda reutilizarse va a `components/ui` o `components/layout`.
3) Estado compartido va en `store` (o en el feature si no cruza dominios).
4) Expone la ruta en `app/routes` y conecta providers globales en `app/providers` si se necesitan (tema, query client, auth, etc.).

## Reglas rÃ¡pidas
- Componentes:
  - Dejar la lÃ³gica de datos fuera de los componentes de UI genÃ©ricos.
  - Prefiere props explÃ­citas y tipos definidos en `types/`.
- Datos/servicios:
  - Encapsula fetch/axios en `services`; no llames APIs directo desde el componente.
  - Define contratos en `types`.
- Estado:
  - Estado local en el componente; global solo si cruza pantallas/feature.
- Estilos:
  - Usa clases de Tailwind + componentes de HeroUI.
  - Tokens/temas globales en `styles`; evita CSS suelto por feature salvo que sea scoped.
- Utils/lib:
  - `lib`: funciones puras mÃ¡s grandes o reutilizables entre apps.
  - `utils`: helpers chicos, sin dependencias pesadas.

## Routing
- React Router v6+ para toda la navegación.
- BrowserRouter en main.jsx y rutas declaradas en un router central.
- Rutas públicas: / (landing/login), /login (si se separa), blog público.
- Rutas protegidas: /dashboard y subsecciones; guard que lea el rol desde profiles (admin obligatorio) y redirija si no cumple.
- Layouts por sección: público y dashboard (sidebar + header).
- Fallback 404 con redirección a landing o página de error.

## UI/UX y estilos
- Estilo moderno y minimalista; evitar saturaciÃ³n visual.
- Todo debe ser responsive (mobile-first).
- Modo claro/oscuro siempre disponible; mantener `darkMode: "class"` y colocar un toggle visible en la UI.
- Toggle de tema reutilizable (ThemeToggle) en `components/ui`, usable en todas las pÃ¡ginas (posiciÃ³n tÃ­pica: esquina superior derecha; si se usa fijo, `position: fixed; top: 10px; right: 10px; z-index: 50`).
- Accesibilidad y jerarquÃ­a visual claras (contrastes, tipografÃ­a legible, estados de foco).
- Fondos: modo claro `#EEEEEF`, modo oscuro `#2C2C32`; paneles oscuros alrededor de `#1f2026`.
- Botones principales con el color primario `#F4320B` (hover `#C82909`).
- Paleta de color â€œEl CÃ³digo de Hoyâ€ (custom properties sugeridas):
  ```
  --color-50:  #FEEBE7;
  --color-100: #FCC6BB;
  --color-200: #FAA18F;
  --color-300: #F87C63;
  --color-400: #F54927;
  --color-500: #F4320B; // Primario (rojo intenso)
  --color-600: #C82909;
  --color-700: #9C2007;
  --color-800: #701705;
  --color-900: #440E03;
  --color-950: #180501;
  ```
  - Primario: `--color-500` (#F4320B) para botones principales, links, headers.
  - Secundario: `--color-300` (#F87C63) para botones secundarios y Ã©nfasis suave.
  - Fondos: `--color-50` (#FEEBE7) principal; `--color-100` (#FCC6BB) tarjetas/secciones; `--color-200` (#FAA18F) hover/destacado.
  - Texto/headers: `--color-700` (#9C2007), `--color-800` (#701705), `--color-900` (#440E03), `--color-950` (#180501) para textos en fondos claros.
  - Acento/alerta: `--color-400` (#F54927); error/hover primario: `--color-600` (#C82909).

### Estándar visual del Dashboard (mantener)
- Evitar un “panel” único que envuelva todo el contenido del dashboard.
- El `main` debe ser solo layout (con `gap`); cada bloque debe ser su propia card.
- Cada sección/bloque debe ir en un contenedor tipo card con:
  - `theme-surface`
  - `bg-[var(--panel-color)]`
  - `rounded-2xl`
  - `shadow-sm`
  - Evitar bordes/líneas marcadas (no usar `border` salvo necesidad).
- Mobile-first: en móvil preferir cards/stack; evitar tablas con líneas. En desktop se puede mostrar “tabla” pero sin líneas duras (cards por fila).
- No modificar el padding del contenedor de navegación del dashboard (se considera “fijo”): `paddingLeft: "4px"` y `paddingRight: "4px"` en `src/components/dashboard/DashboardLayout.jsx`.

## Supabase Storage (imágenes)
- Las imágenes (portadas, medios) se manejan con **Supabase Storage**, no en Postgres.
- Bucket estándar para portadas de posts: `covers` (público para desarrollo).
- Al crear/editar un post, la portada se sube a Storage y la URL se guarda en `posts.cover_image_url`.
- Convención de ruta: `posts/{userId}/{uuid}.{ext}`.
- Validación mínima en frontend: solo `image/*` y máximo 15MB por archivo (recomendado optimizar a WebP y ~1600px de ancho para mejor rendimiento).

## HeroUI + Tailwind
- Tailwind ya estÃ¡ configurado con el plugin `heroui` en `tailwind.config.js`.
- Usa componentes de `@heroui/react`; agrega `className` o props de estilo en vez de CSS manual.
- MantÃ©n `darkMode: "class"` (ya definido).

## CÃ³mo razonar cambios (checklist corto)
- Â¿Es parte de un feature? â†’ va dentro de `src/features/<feature>`.
- Â¿Se puede reutilizar en otros features? â†’ sÃºbelo a `components/ui` o `components/layout`.
- Â¿Necesita datos remotos? â†’ crea funciÃ³n en `services` y tipos en `types`.
- Â¿Estado global es necesario? â†’ slice en `store`; si no, estado local.
- Â¿Estilos? â†’ Tailwind/HeroUI primero; tokens globales en `styles`.
- Â¿Helper puro? â†’ `lib` (agnÃ³stico) o `utils` (ligero).

## Convenciones mÃ­nimas
- Nombres en inglÃ©s para cÃ³digo (components, hooks, variables).
- Un archivo por responsabilidad clara; evita God components.
- Prefiere composiciÃ³n sobre herencia.
- Evita imports relativos quebradizos (`../../..`); si usas path aliases, defÃ­nelos en `vite.config.js` y `jsconfig/tsconfig`.
