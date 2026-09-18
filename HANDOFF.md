# Handoff — Minka Web

Actualizado: 17 de septiembre de 2026  
Estado de la rama: `main`, último commit al redactar: `60f8d93`.

## Prompt listo para Claude

```text
Continúa el desarrollo de Minka Web. Antes de editar, lee por completo HANDOFF.md y CLAUDE.md en la raíz del repositorio. Respeta las decisiones de producto, los dominios, el flujo de publicación y las integraciones descritas allí. No expongas ni reemplaces secretos; usa variables de entorno en Cloudflare para cualquier integración externa.

Trabaja en la rama main, preserva cambios ajenos, usa TypeScript y la arquitectura existente con App Router/Vinext. Para cada iteración: inspecciona el estado de Git, implementa el cambio solicitado, ejecuta `npm run lint` y `npm run build`, prueba visualmente los cambios responsivos relevantes y solo entonces haz commit con un mensaje claro y publica en GitHub. El despliegue de producción se activa desde GitHub/Cloudflare automáticamente.

Minka es un software para administrar urbanizaciones, condominios y edificios en Ecuador. La propuesta comercial es personalizada según capacidad y necesidades de cada comunidad: no reintroduzcas planes públicos, precios fijos ni una página indexable de precios sin una instrucción explícita del propietario.
```

## Proyecto y acceso local

| Recurso | Valor |
| --- | --- |
| Carpeta local del repositorio | `C:\Users\USER\Documents\Codex\2026-09-01\ne\minka-web-new` |
| Repositorio GitHub | `https://github.com/diegoheredia593/minka-web-new` |
| Rama de trabajo | `main` |
| Desarrollo local | `http://localhost:3000/` (`npm run dev`) |
| Dominio público principal y canónico | `https://appminka.com/` |
| Login de la aplicación | `https://appminka.com/login` |
| Despliegue anterior de Workers | `https://minka-web.herediadiego963.workers.dev/` |
| Sitio de BeBrand al que apunta el footer | `https://bebrand-dev.herediadiego963.workers.dev/` |

## Stack y comandos

- React 19 + TypeScript + App Router sobre **Vinext/Vite**.
- Tailwind CSS 4, shadcn y CSS propio en `app/globals.css`.
- Cloudflare Workers/Vite para ejecución y API routes.
- Node requerido: `>=22.13.0`.

```bash
npm install
npm run dev       # desarrollo en localhost:3000
npm run lint      # oxlint
npm run build     # compilación de producción
npm run start     # prueba el worker generado con Wrangler
```

No se ha configurado un comando de publicación manual como fuente de verdad: Cloudflare está conectado al repositorio y debe desplegar automáticamente los pushes a `main`. Si el despliegue no aparece, revisar el panel de Cloudflare y su conexión GitHub, no sustituirla por un deploy manual sin autorización.

## Decisiones de producto vigentes

1. Minka se presenta como software para administrar **urbanizaciones, condominios y edificios en Ecuador**.
2. El mensaje central del demo es: “Administra tu urbanización sin caos”.
3. La propuesta se cotiza a medida según unidades/capacidad, procesos, módulos e implementación. No hay precios ni planes públicos.
4. La ruta histórica `/planes` se conserva para enlaces existentes, pero ahora presenta una propuesta a medida, tiene `noindex` y no se incluye en el sitemap.
5. El formulario promociona “Enlístate ahora y recibe 60 días gratis”; el copy se podrá iterar posteriormente.
6. La prioridad visual del sitio es el demo interactivo del hero. Los nombres de sus pestañas son: Panel, Reservas, Residentes, Comunidad, Cobranza y Configuración.
7. El footer muestra “Desarrollado por bebrand.dev”, sin exhibir la URL de Workers. El enlace abre en una pestaña nueva.

## Mapa del código

| Ubicación | Responsabilidad |
| --- | --- |
| `app/layout.tsx` | Metadatos globales, GA4, JSON-LD y favicon. |
| `app/page.tsx` | Página principal. |
| `app/globals.css` | Sistema visual, responsive y estilos principales. Revisar con cuidado por su alcance global. |
| `components/minka-landing.tsx` | Secciones de la landing y formulario de demo. |
| `components/live-demo.tsx` | Hero/demostración interactiva y pantallas móvil/escritorio. |
| `components/site-header.tsx` | Header fijo, navegación y menú móvil. |
| `components/site-footer.tsx` | Footer y crédito BeBrand. |
| `components/planes-page.tsx` | Página residual de propuesta a medida, sin precios fijos. |
| `app/planes/page.tsx` | Metadatos `noindex` de la ruta `/planes`. |
| `app/sitemap.ts`, `app/robots.ts` | SEO técnico. |
| `lib/analytics.ts` | Eventos GA4. |
| `app/api/demo-request/route.ts` | Endpoint del formulario. |
| `lib/capsule.ts` | Integración con Capsule CRM (contacto + nota con el mensaje). |
| `.github/workflows/publish-android-apk.yml` | Reemplaza el APK de la release desde Google Drive cuando se ejecuta manualmente. |

## Detalles importantes de UI

### Menú móvil

El botón hamburguesa debe abrir y cerrar el menú. Hubo un bug de especificidad CSS: `.site-header nav { display: none; }` vencía a `.mobile-nav { display: grid; }`. La solución actual usa `.site-header .mobile-nav` dentro de los media queries. No simplificar el selector sin volver a probar en un viewport menor a `980px`.

Al probar cualquier ajuste responsive, verificar:

- escritorio;
- ancho móvil aproximado de 390 px;
- apertura/cierre de hamburguesa;
- enlaces del menú y CTA;
- demo móvil y sus controles.

### Diseño y componentes

- Preferir los componentes existentes de `components/ui` y los iconos de `lucide-react`.
- Mantener el encabezado fijo a lo largo de toda la página.
- El hero/demo usa animación y comportamiento interactivo. Evitar convertirlo en una imagen o contenido estático.
- Las tarjetas de planes existieron y se ocultaron; no restaurarlas como precios fijos salvo instrucción expresa.

## SEO, analítica y búsqueda

### Ya implementado

- Dominio canónico: `https://appminka.com/`.
- Sitemap dinámico: `https://appminka.com/sitemap.xml`, hoy solo contiene la página principal.
- Robots: `https://appminka.com/robots.txt`; bloquea `/api/` y `/login`.
- Google Search Console: propiedad de dominio `appminka.com` verificada por DNS. El sitemap ya fue enviado y estaba en cola.
- Google Analytics 4 instalado en `app/layout.tsx`.
- ID de medición GA4: `G-19BY98T7HT`.
- Eventos existentes: `generate_lead`, `file_download`, `login_click`.
- JSON-LD de `Organization` y `SoftwareApplication` en el layout.

### Reglas SEO

- Mantener el contenido natural y útil; usar expresiones como “software para urbanizaciones”, “administración de condominios”, “edificios” y “Ecuador” sin repetirlas artificialmente.
- Mantener los títulos, descripciones, canonical y Open Graph al cambiar el posicionamiento.
- No volver a añadir `/planes` al sitemap ni marcarlo indexable mientras la oferta sea personalizada.
- No prometer un ranking inmediato: la indexación y el posicionamiento dependen del rastreo y de contenido/enlaces con el tiempo.

## Formulario y Capsule CRM

El formulario visible está en `components/minka-landing.tsx` y hace `POST` a `/api/demo-request`.

`lib/capsule.ts` maneja la integración: busca un contacto (`party`) existente en
Capsule por correo (`GET /parties/search`); si existe lo actualiza, si no lo
crea (`POST /parties`, tipo `person`, con `emailAddresses`, `phoneNumbers` y un
resumen de comunidad/unidades en `about`). Después adjunta una nota
(`POST /entries`, tipo `note`) con el mensaje completo, unidades, comunidad y
la página de origen — así toda la información que dejó la persona queda
visible en la ficha del contacto, no repartida entre "forms" y "CRM" como
pasaba con HubSpot.

Si falta el secreto o Capsule responde con error, el endpoint devuelve
`ok: false` con un mensaje claro (no hay fallback silencioso a otro sistema).

Variable requerida de Cloudflare (configurarla como secreto, nunca en Git):

```text
CAPSULE_API_TOKEN=<personal access token de Capsule, generado en My Preferences > API Authentication Tokens>
```

Después de cambios a este flujo, probar primero con datos de prueba y
confirmar tanto la respuesta de `/api/demo-request` como el contacto/nota en
Capsule. No registrar ni subir tokens reales al repositorio.

Integración anterior con HubSpot (contacto + deal + pipeline + fallback a
HubSpot Forms) retirada el 18 de septiembre de 2026 por ser difícil de
encontrar los contactos y tener la mayoría de funciones bajo planes pagos.

## APK móvil

El CTA de Android apunta al asset de GitHub Releases:

`https://github.com/diegoheredia593/minka-web-new/releases/download/apk-v1/Minka.apk`

La release actual es `apk-v1`. Para actualizar el archivo a partir de Google Drive, ejecutar manualmente el workflow **Publish Android APK** con:

- `drive_file_id`: ID del archivo público de Drive;
- `release_tag`: normalmente `apk-v1`.

El enlace público original de la carpeta Drive es:

`https://drive.google.com/drive/folders/1h9oQffvJyPF_yAwgIXAA6pVpG2LETlZl?usp=sharing`

No alojar el APK dentro de los assets normales de la landing: GitHub Releases da una descarga directa y evita el visor de Drive.

## Publicación y control de cambios

Antes de editar:

```bash
git status -sb
git pull --ff-only origin main
```

Después de implementar:

```bash
npm run lint
npm run build
git diff --check
git add <archivos concretos>
git commit -m "Descripción clara del cambio"
git push origin main
```

No usar `git reset --hard`, `git checkout --`, borrados masivos o cambios de secretos. Si el árbol está sucio con cambios que no pertenecen a la solicitud actual, preservarlos y pedir dirección antes de tocar archivos que se solapen.

## Historial reciente útil

- `60f8d93` — Destino de la firma BeBrand actualizado al Worker correcto.
- `101ec2f` — Corrección del menú móvil + copy y SEO de propuesta a medida.
- `62f5d0c` — Metadatos SEO, GA4, sitemap/robots y eventos analíticos.
- `7e89210` / `ae94cff` — Enlace APK público y workflow de actualización.
- `789dc4e` — Texto animado en el footer y enlace de login.

## Pendientes probables para próximas iteraciones

- Refinar el copy comercial y la propuesta personalizada con el propietario.
- Sustituir las pantallas de demostración por capturas reales de la aplicación cuando se proporcionen.
- Medir formularios y CTA en GA4 tras tener tráfico suficiente.
- Revisar Search Console cuando el sitemap termine de procesarse y solicitar indexación de la home si es necesario.
- Validar de extremo a extremo que los leads llegan a Capsule tras cualquier modificación de Cloudflare o Capsule.

