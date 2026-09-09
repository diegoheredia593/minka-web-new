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
    left: { label: "Cobranza", description: "Resume valores esperados, recaudados y pendientes por período, con el estado individual de cada villa." },
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

const desktopCopyDashboard: PageCopy = {
  left: {
    label: "Panel",
    description:
      "El administrador abre el día con alertas, cobranza, reservas y servicios reunidos en una sola pantalla.",
  },
  right: {
    label: "Prioridad inmediata",
    description:
      "Cada bloque lleva al flujo correspondiente para resolver saldos vencidos, revisar reservas o comunicar novedades.",
  },
};

const desktopCopyReservas: PageCopy = {
  left: {
    label: "Reservas",
    description:
      "La vista organiza cada reserva por fecha, residente, servicio y estado para que la operación no dependa de chats dispersos.",
  },
  right: {
    label: "Filtros claros",
    description:
      "Los tabs y selectores separan reservas proximas, canceladas o pendientes sin perder el historial completo.",
  },
};

const desktopCopyResidentes: PageCopy = {
  left: {
    label: "Residentes",
    description:
      "El directorio permite revisar rápidamente quién pertenece a cada unidad y en qué estado financiero se encuentra.",
  },
  right: {
    label: "Cuenta completa",
    description:
      "Al entrar a un residente se ven datos de contacto, estado financiero y beneficios disponibles en la comunidad.",
  },
};

const desktopCopyComunidad: PageCopy = {
  left: {
    label: "Comunidad",
    description:
      "Anuncios, eventos y encuestas viven en un canal oficial para que la administración comunique sin perder trazabilidad.",
  },
  right: {
    label: "Participación ordenada",
    description:
      "Cada publicación puede mantenerse vigente, archivarse o abrir formularios específicos para crear nuevo contenido.",
  },
};

const desktopCopyCobranza: PageCopy = {
  left: {
    label: "Cobranza",
    description:
      "La administración ve cuánto se cargó, cuánto se pagó y qué unidades siguen pendientes durante el período.",
  },
  right: {
    label: "Cargos controlados",
    description:
      "Desde esta sección se generan alícuotas mensuales, cuotas extraordinarias y reportes sin duplicar registros.",
  },
};

const desktopCopyAccess: PageCopy = {
  left: {
    label: "Garita",
    description:
      "La garita valida visitas con código, placa o frase y mantiene visible quién está adentro en ese momento.",
  },
  right: {
    label: "Bitácora trazable",
    description:
      "Cada ingreso y salida queda registrado con unidad, estado, hora y documento para consultar movimientos recientes.",
  },
};

const desktopCopySettings: PageCopy = {
  left: {
    label: "Configuración",
    description:
      "Aquí se ajusta la estructura de la comunidad, las reglas de acceso, los valores mensuales, las cuentas y el equipo.",
  },
  right: {
    label: "Operacion adaptable",
    description:
      "Cada urbanización, condominio o edificio puede activar solo las reglas que necesita para su forma de administrarse.",
  },
};

const desktopPageCopy = {
  "dashboard-a": desktopCopyDashboard,
  "dashboard-b": desktopCopyDashboard,
  "reservas-a": desktopCopyReservas,
  "reservas-b": desktopCopyReservas,
  "reservas-c": desktopCopyReservas,
  "reservas-d": desktopCopyReservas,
  "residentes-a": desktopCopyResidentes,
  "residentes-b": desktopCopyResidentes,
  "residentes-c": desktopCopyResidentes,
  "residentes-solicitud-acceso": {
    left: {
      label: "Solicitudes de acceso",
      description:
        "Las nuevas cuentas entran primero a revisión para confirmar que realmente pertenecen a una unidad.",
    },
    right: {
      label: "Ingreso seguro",
      description:
        "La administración filtra solicitudes por estado antes de habilitar el acceso a la comunidad.",
    },
  },
  "residentes-detalle": {
    left: {
      label: "Detalle de residente",
      description:
        "Cada perfil concentra datos de contacto, unidad asociada y situación financiera de la persona.",
    },
    right: {
      label: "Beneficios visibles",
      description:
        "Los servicios disponibles se muestran junto al estado de cuenta para saber que puede reservar el residente.",
    },
  },
  "comunidad-a": desktopCopyComunidad,
  "comunidad-b": desktopCopyComunidad,
  "comunidad-nuevo-anuncio": {
    left: {
      label: "Nuevo anuncio",
      description:
        "El formulario convierte un aviso operativo en una publicación clara para todos los residentes.",
    },
    right: {
      label: "Comunicación oficial",
      description:
        "Título, detalle, fecha y hora ayudan a que cada anuncio llegue con contexto suficiente.",
    },
  },
  "comunidad-nuevo-evento": {
    left: {
      label: "Nuevo evento",
      description:
        "La administración puede publicar actividades con fecha, hora, estado y descripción en un mismo flujo.",
    },
    right: {
      label: "Agenda comunitaria",
      description:
        "Los residentes ven eventos vigentes y anteriores sin mezclar conversaciones ni hojas externas.",
    },
  },
  "comunidad-nueva-encuesta": {
    left: {
      label: "Nueva encuesta",
      description:
        "Las preguntas se crean con opciones, fecha de cierre y modo anónimo cuando la comunidad lo necesita.",
    },
    right: {
      label: "Decisiones con datos",
      description:
        "La administración recoge respuestas ordenadas sin exponer información innecesaria de los residentes.",
    },
  },
  "cobranza-a": desktopCopyCobranza,
  "cobranza-b": desktopCopyCobranza,
  "cobranza-c": desktopCopyCobranza,
  "cobranza-generar-alicuotas": {
    left: {
      label: "Generar alícuotas",
      description:
        "Antes de crear cargos, Minka resume unidades activas, valor predeterminado y recaudación estimada.",
    },
    right: {
      label: "Sin duplicados",
      description:
        "Si el período ya tiene cargos generados, el flujo evita crear registros repetidos.",
    },
  },
  "cobranza-cuota-extraordinaria": {
    left: {
      label: "Cuota extraordinaria",
      description:
        "Los cargos especiales se preparan con descripción, monto por unidad y fecha de vencimiento.",
    },
    right: {
      label: "Vista previa",
      description:
        "La administración revisa cuántas unidades reciben el cargo y el total antes de confirmar.",
    },
  },
  "control-accesos": desktopCopyAccess,
  "control-accesos-bitacora": desktopCopyAccess,
  "configuracion-a": desktopCopySettings,
  "configuracion-b": desktopCopySettings,
  "configuracion-organizacion": {
    left: {
      label: "Organización",
      description:
        "Define el nombre, tipo y datos base que cambian la terminología usada en toda la app.",
    },
    right: {
      label: "Identidad operativa",
      description:
        "La configuración distingue urbanizaciones, condominios, edificios o complejos sin rehacer el producto.",
    },
  },
  "configuracion-unidades-a": {
    left: {
      label: "Unidades",
      description:
        "Minka estructura manzanas, villas, departamentos u oficinas y muestra el estado de cada unidad.",
    },
    right: {
      label: "Base administrativa",
      description:
        "Las unidades conectan residentes, alícuotas, beneficios y estado financiero en el resto del sistema.",
    },
  },
  "configuracion-unidades-b": {
    left: {
      label: "Unidades",
      description:
        "El desplazamiento conserva la estructura completa para revisar grupos grandes sin perder consistencia visual.",
    },
    right: {
      label: "Estado por unidad",
      description:
        "Las etiquetas permiten detectar rápidamente qué villas están al día y cuáles requieren atención.",
    },
  },
  "configuracion-acceso-beneficios": {
    left: {
      label: "Acceso y beneficios",
      description:
        "Cada servicio puede exigir que el residente esté al día antes de permitir una reserva.",
    },
    right: {
      label: "Reglas flexibles",
      description:
        "La administración decide si la restricción aplica a toda la comunidad o solo a servicios específicos.",
    },
  },
  "configuracion-alicuotas": {
    left: {
      label: "Alicuotas",
      description:
        "El valor mensual predeterminado sirve para todas las unidades que no tienen una tarifa personalizada.",
    },
    right: {
      label: "Excepciones claras",
      description:
        "Las unidades con valor propio quedan identificadas para que la cobranza use el monto correcto.",
    },
  },
  "configuracion-cuentas-bancarias": {
    left: {
      label: "Cuentas bancarias",
      description:
        "La comunidad registra donde recibe transferencias y mantiene visible que cuenta esta activa.",
    },
    right: {
      label: "Fondos directos",
      description:
        "Minka facilita la informacion de pago, pero el dinero va a la organizacion, no a Minka.",
    },
  },
  "configuracion-agregar-cuentas": {
    left: {
      label: "Agregar cuenta",
      description:
        "El modal pide banco, titular, tipo, número de cuenta e identificación antes de crear el registro.",
    },
    right: {
      label: "Datos completos",
      description:
        "La cuenta queda lista para mostrarse a residentes cuando reporten o preparen sus pagos.",
    },
  },
  "configuracion-equipo": {
    left: {
      label: "Equipo",
      description:
        "La administración invita personal con permisos limitados para repartir tareas sin entregar control total.",
    },
    right: {
      label: "Roles cuidados",
      description:
        "Editar o suspender accesos ayuda a mantener el equipo operativo actualizado.",
    },
  },
  "configuracion-equipo-invitar-personal": {
    left: {
      label: "Invitar personal",
      description:
        "El modal recoge datos de contacto y permisos para incorporar a alguien al panel administrativo.",
    },
    right: {
      label: "Permisos limitados",
      description:
        "Cada invitación puede acotar lo que la persona verá y gestionará dentro de Minka.",
    },
  },
} satisfies Record<string, PageCopy>;

type DesktopDemoView = keyof typeof desktopPageCopy;
const DEFAULT_DESKTOP_VIEW: DesktopDemoView = "dashboard-a";

type DesktopDemoMessage =
  | { type: "minka-desktop-demo:view"; view: string }
  | { type: "minka-desktop-demo:action"; label: string };

function isDesktopDemoView(view: string): view is DesktopDemoView {
  return view in desktopPageCopy;
}

function isDesktopDemoMessage(data: unknown): data is DesktopDemoMessage {
  if (typeof data !== "object" || data === null || !("type" in data)) {
    return false;
  }

  if (data.type === "minka-desktop-demo:view") {
    return "view" in data && typeof data.view === "string";
  }

  if (data.type === "minka-desktop-demo:action") {
    return "label" in data && typeof data.label === "string";
  }

  return false;
}

function createDesktopActionCopy(label: string): PageCopy {
  return {
    left: {
      label,
      description:
        "Esta zona también es interactiva dentro del demo y muestra la acción que existe en la pantalla activa.",
    },
    right: {
      label: "Acción de demo",
      description:
        "Cuando no hay una captura adicional para ese paso, Minka conserva la pantalla y muestra un aviso sin inventar flujo.",
    },
  };
}

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
  const [desktopCopy, setDesktopCopy] = useState<PageCopy>(
    desktopPageCopy[DEFAULT_DESKTOP_VIEW],
  );
  const dynamicAdminCopy = device === "iphone" ? adminPageCopy[adminView] : desktopCopy;
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

  useEffect(() => {
    const handleDesktopDemoMessage = (event: MessageEvent<unknown>) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (!isDesktopDemoMessage(event.data)) {
        return;
      }

      if (event.data.type === "minka-desktop-demo:view") {
        if (isDesktopDemoView(event.data.view)) {
          setDesktopCopy(desktopPageCopy[event.data.view]);
        }
        return;
      }

      setDesktopCopy(createDesktopActionCopy(event.data.label));
    };

    window.addEventListener("message", handleDesktopDemoMessage);

    return () => {
      window.removeEventListener("message", handleDesktopDemoMessage);
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
