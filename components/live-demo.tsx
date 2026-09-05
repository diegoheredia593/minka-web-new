"use client";

import { useEffect, useState } from "react";

import { SectionIntro } from "@/components/section-intro";
import { Iphone16Pro } from "@/components/ui/iphone-16-pro";
import { MacbookPro } from "@/components/ui/macbook-pro";

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

// Hit targets for the real admin/mobile screenshots, positioned over the
// app's own bottom nav icons (Panel, Reservas, Residentes, Comunidad,
// Cobranza, Configuración — 6 evenly spaced icons; we only wire the 4 we
// have layers/captures for). Indices line up with `adminLayers` above.
const adminMobileNavRects: Rect[] = [
  { top: "91%", left: "3%", width: "15%", height: "8%" }, // resumen -> Panel
  { top: "91%", left: "72%", width: "16%", height: "8%" }, // cobranzas -> Cobranza
  { top: "91%", left: "38%", width: "15%", height: "8%" }, // residentes -> Residentes
  { top: "91%", left: "55%", width: "15%", height: "8%" }, // comunicados-admin -> Comunidad
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
  const rects = device === "iphone" ? phoneRects : macbookRects;

  // Real captures only exist for admin on mobile so far. Everywhere else
  // (residente, or admin on the MacBook frame) still uses the placeholder
  // rectangles until those screenshots exist.
  const showRealScreenshots = profile === "admin" && device === "iphone";

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
          <p className="live-demo-caption__eyebrow">{leftLayer.label}</p>
          <p className="live-demo-caption__text">{leftLayer.description}</p>
        </div>

        <div className="live-demo-center">
          <div className="live-demo-copy live-demo-copy--mobile" aria-live="polite">
            <p className="live-demo-caption__eyebrow">{activeLayer.label}</p>
            <p className="live-demo-caption__text">{activeLayer.description}</p>
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
                  <>
                    <img
                      src={activeLayer.image}
                      alt={activeLayer.label}
                      className="live-demo-screen-image"
                    />
                    {layers.map((layer, index) => {
                      const isActive = layer.id === activeLayerId;
                      return (
                        <button
                          key={layer.id}
                          type="button"
                          className="live-demo-zone live-demo-zone--nav"
                          data-active={isActive}
                          style={adminMobileNavRects[index]}
                          aria-label={layer.label}
                          aria-pressed={isActive}
                          onClick={() => handleZoneClick(layer)}
                        />
                      );
                    })}
                  </>
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
          <p className="live-demo-caption__eyebrow">{rightLayer.label}</p>
          <p className="live-demo-caption__text">{rightLayer.description}</p>
        </div>
      </div>
    </section>
  );
}
