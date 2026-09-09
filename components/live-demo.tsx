"use client";

import { useEffect, useState } from "react";

import { SectionIntro } from "@/components/section-intro";
import { Iphone16Pro } from "@/components/ui/iphone-16-pro";
import { MacbookPro } from "@/components/ui/macbook-pro";
import { AdminMobileDemo, type AdminDemoView } from "@/components/admin-mobile-demo";

type Device = "iphone" | "macbook";

type PageCopy = {
  left: { label: string; description: string };
  right: { label: string; description: string };
};

// Drop the navigable desktop admin HTML in /public/live-demo/admin-desktop.html.
const ADMIN_DESKTOP_DEMO_SRC = "/live-demo/admin-desktop.html";
const MOBILE_BREAKPOINT = 980;

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

const desktopPageCopy: PageCopy = {
  left: {
    label: "Panel de administración",
    description:
      "El MacBook queda preparado para mostrar el demo navegable de escritorio en pantalla grande.",
  },
  right: {
    label: "Sin pantallas ficticias",
    description:
      "Hasta que el archivo real esté conectado, la landing no muestra vistas de administración inventadas.",
  },
};

function AdminDesktopDemoFrame() {
  const [isDesktopDemoReady, setIsDesktopDemoReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetch(ADMIN_DESKTOP_DEMO_SRC, { method: "HEAD", cache: "no-store" })
      .then((response) => {
        if (isMounted) setIsDesktopDemoReady(response.ok);
      })
      .catch(() => {
        if (isMounted) setIsDesktopDemoReady(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isDesktopDemoReady) {
    return (
      <iframe
        className="live-demo-desktop-iframe"
        src={ADMIN_DESKTOP_DEMO_SRC}
        title="Demo de administración de Minka en computadora"
        loading="lazy"
        sandbox="allow-forms allow-same-origin allow-scripts"
      />
    );
  }

  return (
    <div className="live-demo-desktop-empty">
      <span>Vista de computadora</span>
      <strong>Demo web en preparación</strong>
      <p>Aquí aparecerá el demo navegable de escritorio.</p>
    </div>
  );
}

export function LiveDemo() {
  const [device, setDevice] = useState<Device>("iphone");
  const [adminView, setAdminView] = useState<AdminDemoView>("dashboard");
  const dynamicAdminCopy = device === "iphone" ? adminPageCopy[adminView] : desktopPageCopy;
  const displayedMobile = {
    label: dynamicAdminCopy.left.label,
    description: `${dynamicAdminCopy.left.description} ${dynamicAdminCopy.right.description}`,
  };

  useEffect(() => {
    const enforcePhoneOnSmallScreens = () => {
      if (window.innerWidth <= MOBILE_BREAKPOINT) setDevice("iphone");
    };

    enforcePhoneOnSmallScreens();
    window.addEventListener("resize", enforcePhoneOnSmallScreens);

    return () => {
      window.removeEventListener("resize", enforcePhoneOnSmallScreens);
    };
  }, []);

  return (
    <section id="live-demo" className="live-demo-section" aria-labelledby="live-demo-title">
      <div className="section-shell live-demo-layout">
        <SectionIntro
          id="live-demo-title"
          eyebrow="Live Demo"
          title="Así se ve Minka por dentro."
          text="Explora la versión móvil de administrador y cambia a computadora para revisar la vista de escritorio."
        />

        <div className="live-demo-copy live-demo-copy--left" data-reveal aria-live="polite">
          <p className="live-demo-caption__eyebrow">{dynamicAdminCopy.left.label}</p>
          <p className="live-demo-caption__text">{dynamicAdminCopy.left.description}</p>
        </div>

        <div className="live-demo-center">
          <div className="live-demo-copy live-demo-copy--mobile" aria-live="polite">
            <p className="live-demo-caption__eyebrow">{displayedMobile.label}</p>
            <p className="live-demo-caption__text">{displayedMobile.description}</p>
          </div>

          <div className="live-demo-controls" role="group" aria-label="Cambiar dispositivo del demo">
            <div className="live-demo-toggle live-demo-toggle--device" role="group" aria-label="Dispositivo">
              <button type="button" aria-pressed={device === "iphone"} onClick={() => setDevice("iphone")}>
                Teléfono
              </button>
              <button type="button" aria-pressed={device === "macbook"} onClick={() => setDevice("macbook")}>
                Computadora
              </button>
            </div>
          </div>

          <div className="live-demo-device" data-reveal>
            <div className={`live-demo-device__frame live-demo-device__frame--${device}`}>
              {device === "iphone" ? (
                <Iphone16Pro className="live-demo-device__svg" />
              ) : (
                <MacbookPro className="live-demo-device__svg" />
              )}
              <div className="live-demo-screen">
                {device === "iphone" ? (
                  <>
                    <AdminMobileDemo onViewChange={setAdminView} />
                    <div className="live-demo-notch" aria-hidden="true" />
                  </>
                ) : (
                  <AdminDesktopDemoFrame />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="live-demo-copy live-demo-copy--right" data-reveal aria-live="polite">
          <p className="live-demo-caption__eyebrow">{dynamicAdminCopy.right.label}</p>
          <p className="live-demo-caption__text">{dynamicAdminCopy.right.description}</p>
        </div>
      </div>
    </section>
  );
}
