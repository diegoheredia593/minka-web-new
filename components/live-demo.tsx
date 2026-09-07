"use client";

import { useEffect, useState } from "react";

import { SectionIntro } from "@/components/section-intro";
import { Iphone16Pro } from "@/components/ui/iphone-16-pro";
import { MacbookPro } from "@/components/ui/macbook-pro";
import { AdminMobileDemo, type AdminDemoView } from "@/components/admin-mobile-demo";

type Profile = "admin" | "residente";
type Device = "iphone" | "macbook";
type Side = "left" | "right";

type DemoLayer = {
  id: string;
  label: string;
  description: string;
  // Which side panel this feature's text belongs to. Kept independent from
  // the zone's on-screen position so a future pass can draw a callout line
  // from the zone to its side without having to rework this data.
  side: Side;
  // Real screenshot for this screen. Only set where we actually have a
  // capture (currently: admin, mobile). Everything else still falls back
  // to the placeholder rectangle rendering below.
  image?: string;
};

type Rect = { top: string; left: string; width: string; height: string };

type PageCopy = {
  left: { label: string; description: string };
  right: { label: string; description: string };
};

const adminPageCopy: Record<AdminDemoView, PageCopy> = {
  dashboard: {
    left: { label: "Resumen diario", description: "Reúne las alertas que requieren atención, la cobranza del mes y las reservas próximas en una sola vista." },
    right: { label: "Decide qué atender primero", description: "La administración identifica pendientes y entra directamente al proceso que necesita resolver." },
  },
  reservas: {
    left: { label: "Reservas", description: "Centraliza todas las solicitudes por espacio, residente, fecha y estado para evitar cruces de horarios." },
    right: { label: "Control operativo", description: "Permite revisar próximas reservas, pendientes y cancelaciones sin depender de mensajes o agendas externas." },
  },
  residentes: {
    left: { label: "Directorio de residentes", description: "Organiza las personas vinculadas a cada unidad y muestra su estado de cuenta de forma inmediata." },
    right: { label: "Información accionable", description: "Facilita buscar residentes, comprobar su unidad y detectar quién está al día o mantiene valores vencidos." },
  },
  solicitudes: {
    left: { label: "Solicitudes de acceso", description: "Concentra las peticiones de ingreso de nuevos residentes antes de habilitar su acceso a la comunidad." },
    right: { label: "Acceso bajo control", description: "La administración valida cada solicitud y evita que una cuenta entre sin estar asociada a una unidad real." },
  },
  comunidad: {
    left: { label: "Comunidad", description: "Agrupa anuncios, eventos y accesos al mapa en el canal oficial de la urbanización." },
    right: { label: "Comunicación clara", description: "La información importante queda ordenada y disponible sin perderse entre conversaciones informales." },
  },
  "eventos-anteriores": {
    left: { label: "Historial de eventos", description: "Conserva los eventos finalizados para consultarlos sin mezclarlos con la programación vigente." },
    right: { label: "Memoria organizada", description: "La administración puede revisar actividades anteriores y mantener limpia la vista principal." },
  },
  archivados: {
    left: { label: "Contenido archivado", description: "Guarda anuncios y eventos retirados de la vista de los residentes sin eliminarlos definitivamente." },
    right: { label: "Orden sin perder información", description: "El contenido antiguo permanece disponible para consulta y trazabilidad administrativa." },
  },
  "nuevo-anuncio": {
    left: { label: "Nuevo anuncio", description: "Permite redactar y publicar información oficial para todos los residentes desde un formulario sencillo." },
    right: { label: "Un solo canal", description: "Fechas, horarios y detalles quedan visibles en la comunidad sin depender de cadenas de mensajes." },
  },
  "nuevo-evento": {
    left: { label: "Nuevo evento", description: "Crea actividades comunitarias con nombre, fecha, hora, estado y una descripción para los residentes." },
    right: { label: "Participación informada", description: "Cada evento comunica lo necesario para que los residentes sepan cuándo y cómo participar." },
  },
  mapa: {
    left: { label: "Mapa de la comunidad", description: "Presenta la distribución real de manzanas, villas, áreas comunes y accesos de la urbanización." },
    right: { label: "Ubicación rápida", description: "Los controles permiten acercar, alejar y recentrar el plano para encontrar cada zona con claridad." },
  },
  cobranza: {
    left: { label: "Cobranza", description: "Resume valores esperados, recaudados y pendientes por periodo, con el estado individual de cada villa." },
    right: { label: "Seguimiento financiero", description: "Desde aquí se generan alícuotas y cargos extraordinarios, y se detectan saldos vencidos." },
  },
  configuracion: {
    left: { label: "Configuración", description: "Reúne las opciones para adaptar organización, unidades, servicios, cobranza, accesos y equipo." },
    right: { label: "Minka a tu medida", description: "Cada comunidad activa y configura únicamente los procesos que necesita para operar." },
  },
  "cuentas-bancarias": {
    left: { label: "Cuentas bancarias", description: "Administra las cuentas donde la comunidad recibe directamente las transferencias de sus residentes." },
    right: { label: "Dinero directo a la comunidad", description: "Minka muestra los datos de pago, pero los fondos permanecen siempre en las cuentas de la organización." },
  },
  "areas-servicios": {
    left: { label: "Áreas y servicios", description: "Configura los espacios que los residentes pueden consultar o reservar dentro de la comunidad." },
    right: { label: "Oferta organizada", description: "Permite activar, desactivar y ordenar servicios según la operación real de la urbanización." },
  },
  "nuevo-servicio": {
    left: { label: "Nuevo servicio", description: "Define el nombre, icono, disponibilidad y reglas básicas de una nueva área o servicio." },
    right: { label: "Configuración práctica", description: "La administración incorpora nuevos espacios sin alterar el resto de la experiencia." },
  },
};

// Residente only ever runs on mobile (there's no desktop resident portal),
// so it only needs phone-shaped positions. Admin runs on both, so its four
// features get repositioned per device via `phoneRects`/`macbookRects` below.
const residentLayers: DemoLayer[] = [
  {
    id: "inicio",
    label: "Inicio",
    description: "Todo lo importante de tu comunidad, en un vistazo — sin buscar mensajes antiguos.",
    side: "left",
  },
  {
    id: "pagos",
    label: "Pagos",
    description: "Consulta tus valores pendientes y envía tu comprobante en segundos.",
    side: "right",
  },
  {
    id: "reservas",
    label: "Reservas",
    description: "Elige espacio, fecha y horario disponible. Sin escribirle a nadie.",
    side: "left",
  },
  {
    id: "comunicados-residente",
    label: "Comunicados",
    description: "Anuncios y eventos oficiales de tu comunidad, en un solo canal.",
    side: "right",
  },
];

const adminLayers: DemoLayer[] = [
  {
    id: "resumen",
    label: "Resumen",
    description:
      "Alertas de cobranza y reservas, tu recaudación del mes y el estado de tu comunidad — todo en una sola pantalla al abrir la app.",
    side: "left",
    image: "/live-demo/admin-mobile-resumen.png",
  },
  {
    id: "cobranzas",
    label: "Cobranza",
    description:
      "Genera alícuotas, filtra por estado de pago y da seguimiento a cada villa sin salir de la pantalla.",
    side: "right",
    image: "/live-demo/admin-mobile-cobranzas.png",
  },
  {
    id: "residentes",
    label: "Residentes",
    description:
      "Directorio completo de residentes con su estado de cuenta, más las solicitudes de acceso pendientes de aprobar.",
    side: "left",
    image: "/live-demo/admin-mobile-residentes.png",
  },
  {
    id: "comunicados-admin",
    label: "Comunidad",
    description: "Publica anuncios y eventos, y consulta el mapa de tu urbanización — todo desde un mismo lugar.",
    side: "right",
    image: "/live-demo/admin-mobile-comunidad.png",
  },
];

// Slot positions (percentages within the device screen), by index — both
// profiles have exactly 4 layers, so they share the same slot shapes.
// Swap these for real screenshot crops later; the interaction wiring stays
// the same either way.
const phoneRects: Rect[] = [
  { top: "3%", left: "5%", width: "90%", height: "16%" },
  { top: "22%", left: "5%", width: "90%", height: "22%" },
  { top: "47%", left: "5%", width: "90%", height: "22%" },
  { top: "72%", left: "5%", width: "90%", height: "22%" },
];

const macbookRects: Rect[] = [
  { top: "4%", left: "4%", width: "92%", height: "20%" },
  { top: "28%", left: "4%", width: "28%", height: "64%" },
  { top: "28%", left: "36%", width: "28%", height: "64%" },
  { top: "28%", left: "68%", width: "28%", height: "64%" },
];

// Below this width there's no device toggle — mobile visitors only ever see
// the phone frame. Matches the site's existing mobile nav breakpoint.
const MOBILE_BREAKPOINT = 980;

function findFirstOfSide(layers: DemoLayer[], side: Side) {
  return layers.find((layer) => layer.side === side) ?? layers[0];
}

export function LiveDemo() {
  const [profile, setProfile] = useState<Profile>("admin");
  const [device, setDevice] = useState<Device>("iphone");
  const [adminView, setAdminView] = useState<AdminDemoView>("dashboard");
  const layers = profile === "residente" ? residentLayers : adminLayers;

  const [activeLayerId, setActiveLayerId] = useState(layers[0].id);
  const [leftLayerId, setLeftLayerId] = useState(findFirstOfSide(layers, "left").id);
  const [rightLayerId, setRightLayerId] = useState(findFirstOfSide(layers, "right").id);

  // A resident account has no desktop view, and small screens never get a
  // device choice at all — enforce the phone frame whenever either is true.
  useEffect(() => {
    const enforceMobileDevice = () => {
      if (window.innerWidth <= MOBILE_BREAKPOINT) setDevice("iphone");
    };
    window.addEventListener("resize", enforceMobileDevice);
    return () => window.removeEventListener("resize", enforceMobileDevice);
  }, []);

  const handleProfileChange = (next: Profile) => {
    if (next === profile) return;
    const nextLayers = next === "residente" ? residentLayers : adminLayers;
    setProfile(next);
    setActiveLayerId(nextLayers[0].id);
    setLeftLayerId(findFirstOfSide(nextLayers, "left").id);
    setRightLayerId(findFirstOfSide(nextLayers, "right").id);
    if (next === "residente") setDevice("iphone");
  };

  const handleZoneClick = (layer: DemoLayer) => {
    setActiveLayerId(layer.id);
    if (layer.side === "left") setLeftLayerId(layer.id);
    else setRightLayerId(layer.id);
  };

  const activeLayer = layers.find((layer) => layer.id === activeLayerId) ?? layers[0];
  const leftLayer = layers.find((layer) => layer.id === leftLayerId) ?? findFirstOfSide(layers, "left");
  const rightLayer = layers.find((layer) => layer.id === rightLayerId) ?? findFirstOfSide(layers, "right");
  // The navigable admin phone reports its current internal page so both
  // explanatory cards stay synchronized with the screen being explored.
  const showRealScreenshots = profile === "admin" && device === "iphone";
  const dynamicAdminCopy = adminPageCopy[adminView];
  const displayedLeft = showRealScreenshots ? dynamicAdminCopy.left : leftLayer;
  const displayedRight = showRealScreenshots ? dynamicAdminCopy.right : rightLayer;
  const displayedMobile = showRealScreenshots
    ? { label: dynamicAdminCopy.left.label, description: `${dynamicAdminCopy.left.description} ${dynamicAdminCopy.right.description}` }
    : activeLayer;
  const rects = device === "iphone" ? phoneRects : macbookRects;

  const controls = (
    <div className="live-demo-controls" role="group" aria-label="Configurar vista previa">
      <div className="live-demo-toggle" role="group" aria-label="Perfil">
        <button
          type="button"
          aria-pressed={profile === "residente"}
          onClick={() => handleProfileChange("residente")}
        >
          Residente
        </button>
        <button type="button" aria-pressed={profile === "admin"} onClick={() => handleProfileChange("admin")}>
          Admin
        </button>
      </div>

      <div className="live-demo-toggle live-demo-toggle--device" role="group" aria-label="Dispositivo">
        <button type="button" aria-pressed={device === "iphone"} onClick={() => setDevice("iphone")}>
          Teléfono
        </button>
        <button
          type="button"
          aria-pressed={device === "macbook"}
          disabled={profile === "residente"}
          title={profile === "residente" ? "Disponible solo con perfil Admin" : undefined}
          onClick={() => setDevice("macbook")}
        >
          Computadora
        </button>
      </div>
    </div>
  );

  return (
    <section className="live-demo-section" aria-labelledby="live-demo-title">
      <div className="section-shell live-demo-layout">
        <SectionIntro
          id="live-demo-title"
          eyebrow="Live Demo"
          title="Así se ve Minka por dentro."
          text="Cambia de perfil y toca cada zona del panel para descubrir qué hace."
        />

        <div className="live-demo-copy live-demo-copy--left" data-reveal aria-live="polite">
          <p className="live-demo-caption__eyebrow">{displayedLeft.label}</p>
          <p className="live-demo-caption__text">{displayedLeft.description}</p>
        </div>

        <div className="live-demo-center">
          <div className="live-demo-copy live-demo-copy--mobile" aria-live="polite">
            <p className="live-demo-caption__eyebrow">{displayedMobile.label}</p>
            <p className="live-demo-caption__text">{displayedMobile.description}</p>
          </div>

          {controls}

          <div className="live-demo-device" data-reveal>
            <div className={`live-demo-device__frame live-demo-device__frame--${device}`}>
              {device === "iphone" ? (
                <Iphone16Pro className="live-demo-device__svg" />
              ) : (
                <MacbookPro className="live-demo-device__svg" />
              )}
              <div className="live-demo-screen">
                {showRealScreenshots ? (
                  <AdminMobileDemo onViewChange={setAdminView} />
                ) : (
                  layers.map((layer, index) => {
                    const isActive = layer.id === activeLayerId;
                    return (
                      <button
                        key={layer.id}
                        type="button"
                        className="live-demo-zone"
                        data-active={isActive}
                        style={rects[index]}
                        aria-pressed={isActive}
                        onClick={() => handleZoneClick(layer)}
                      >
                        {layer.label}
                      </button>
                    );
                  })
                )}

                {device === "iphone" && <div className="live-demo-notch" aria-hidden="true" />}
              </div>
            </div>
          </div>
        </div>

        <div className="live-demo-copy live-demo-copy--right" data-reveal aria-live="polite">
          <p className="live-demo-caption__eyebrow">{displayedRight.label}</p>
          <p className="live-demo-caption__text">{displayedRight.description}</p>
        </div>
      </div>
    </section>
  );
}
