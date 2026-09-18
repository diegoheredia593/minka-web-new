"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, Building2, CalendarDays, CircleDollarSign, LayoutDashboard, Settings, UserPlus, UsersRound, Wallet } from "lucide-react";

import { Iphone16Pro } from "@/components/ui/iphone-16-pro";
import { MacbookPro } from "@/components/ui/macbook-pro";
import { SamsungS25Ultra } from "@/components/ui/samsung-s25-ultra";
import { AdminMobileDemo, type AdminDemoView } from "@/components/admin-mobile-demo";
import { ResidentMobileDemo, type ResidentCommand, type ResidentDemoView } from "@/components/resident-mobile-demo";

type Device = "iphone" | "macbook";
type Role = "admin" | "resident";

type PageCopy = {
  left: { label: string; description: string };
  right: { label: string; description: string };
};

// Drop the navigable desktop admin HTML in /public/live-demo/admin-desktop.html.
const ADMIN_DESKTOP_DEMO_SRC = "/live-demo/admin-desktop.html";
const MOBILE_BREAKPOINT = 980;

type DemoShortcutView = "dashboard" | "reservas" | "residentes" | "comunidad" | "cobranza" | "configuracion";

const heroShortcuts: Array<{
  label: string;
  view: DemoShortcutView;
  icon: typeof CircleDollarSign;
}> = [
  { label: "Panel", view: "dashboard", icon: LayoutDashboard },
  { label: "Reservas", view: "reservas", icon: CalendarDays },
  { label: "Residentes", view: "residentes", icon: UsersRound },
  { label: "Comunidad", view: "comunidad", icon: Building2 },
  { label: "Cobranza", view: "cobranza", icon: CircleDollarSign },
  { label: "Configuración", view: "configuracion", icon: Settings },
];

// Outer rail shown when the demo is switched to the resident profile. Each
// button drives the phone straight to the matching screen inside
// ResidentMobileDemo, mirroring the quick actions on the resident's own
// Inicio screen.
const residentShortcuts: Array<{
  label: string;
  icon: typeof CircleDollarSign;
  command: ResidentCommand;
}> = [
  { label: "Reservar", icon: CalendarDays, command: "reservar" },
  { label: "Mi estado", icon: Wallet, command: "estado" },
  { label: "Comunidad", icon: UsersRound, command: "comunidad" },
  { label: "Visitas", icon: UserPlus, command: "visitas" },
];

const desktopShortcutViews: Record<DemoShortcutView, DesktopDemoView> = {
  dashboard: "dashboard-a",
  reservas: "reservas-a",
  residentes: "residentes-a",
  comunidad: "comunidad-a",
  cobranza: "cobranza-a",
  configuracion: "configuracion-a",
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

// Mirrors adminPageCopy: one pair of captions per resident screen, so the
// explanatory text beside the phone changes with each screen the resident
// navigates to, instead of staying fixed on the Inicio copy.
const residentPageCopy: Record<ResidentDemoView, PageCopy> = {
  inicio: {
    left: {
      label: "Inicio del residente",
      description:
        "El residente ve su estado de cuenta, accesos rápidos, próximas reservas y beneficios apenas abre la app.",
    },
    right: {
      label: "Solo lo esencial",
      description:
        "Sin menús de administración: el residente navega su propia información desde el teléfono, nada más.",
    },
  },
  reservas: {
    left: {
      label: "Mis reservas",
      description:
        "El residente revisa sus reservas activas y el historial de espacios comunes sin llamar a la administración.",
    },
    right: {
      label: "Reservar en segundos",
      description:
        "Desde aquí puede iniciar una nueva reserva para cancha, salón u otro espacio disponible.",
    },
  },
  "reserva-cancha": {
    left: {
      label: "Reservar cancha",
      description:
        "Elige el día y el horario disponible para la cancha de fútbol en pocos toques.",
    },
    right: {
      label: "Sin choques de horario",
      description:
        "Los espacios ya ocupados no aparecen disponibles, evitando reservas dobles.",
    },
  },
  comunidad: {
    left: {
      label: "Comunidad",
      description:
        "El residente ve anuncios, eventos y encuestas oficiales de su urbanización en un solo lugar.",
    },
    right: {
      label: "Vecinos conectados",
      description:
        "También puede leer publicaciones de otros residentes y acceder al mapa de la comunidad.",
    },
  },
  "comunidad-map": {
    left: {
      label: "Mapa de la comunidad",
      description:
        "Muestra la distribución de manzanas, áreas comunes y accesos para ubicarse dentro de la urbanización.",
    },
    right: {
      label: "Referencia rápida",
      description:
        "Los controles de zoom ayudan a identificar canchas, piscina y la garita principal.",
    },
  },
  "comunidad-vecinos": {
    left: {
      label: "Entre vecinos",
      description:
        "Un espacio para que los residentes publiquen avisos o pedidos directamente a la comunidad.",
    },
    right: {
      label: "Moderado por la administración",
      description:
        "El residente puede ver todas las publicaciones o filtrar únicamente las suyas.",
    },
  },
  perfil: {
    left: {
      label: "Perfil del residente",
      description:
        "Reúne datos de contacto, estado de cuenta y accesos a cada función disponible para el residente.",
    },
    right: {
      label: "Todo en un solo lugar",
      description:
        "Desde aquí se llega a pagos, visitas, notificaciones, documentos y ajustes de la cuenta.",
    },
  },
  "perfil-reservas": {
    left: {
      label: "Historial de reservas",
      description:
        "El residente revisa sus reservas pasadas y su estado, confirmadas o canceladas.",
    },
    right: {
      label: "Trazabilidad completa",
      description:
        "Permite confirmar qué espacios ha usado sin depender de mensajes o comprobantes sueltos.",
    },
  },
  "perfil-estado": {
    left: {
      label: "Estado de cuenta",
      description:
        "Muestra el saldo pendiente, la cuota vigente y los pagos que todavía no se han realizado.",
    },
    right: {
      label: "Pagar sin fricción",
      description:
        "Desde aquí el residente puede iniciar una transferencia o revisar las cuentas de la comunidad.",
    },
  },
  "perfil-transferencia": {
    left: {
      label: "Registrar transferencia",
      description:
        "El residente reporta un pago realizado adjuntando el comprobante correspondiente.",
    },
    right: {
      label: "Confirmación más rápida",
      description:
        "La administración recibe el aviso y concilia el pago sin esperar a que alguien lo escriba por chat.",
    },
  },
  "perfil-cuentas": {
    left: {
      label: "Cuentas para pagar",
      description:
        "Lista las cuentas bancarias oficiales de la comunidad donde el residente puede transferir.",
    },
    right: {
      label: "Fondos directos",
      description:
        "El dinero llega directamente a la cuenta de la comunidad, nunca a Minka.",
    },
  },
  "perfil-visitas": {
    left: {
      label: "Visitas",
      description:
        "El residente autoriza el ingreso de invitados y consulta las visitas programadas.",
    },
    right: {
      label: "Control en la garita",
      description:
        "La información queda disponible para que la garita valide el acceso sin llamadas previas.",
    },
  },
  "perfil-incidencias": {
    left: {
      label: "Incidencias",
      description:
        "Permite reportar un problema o daño en una unidad o área común directamente desde la app.",
    },
    right: {
      label: "Seguimiento claro",
      description:
        "El residente puede ver el estado de cada reporte enviado a la administración.",
    },
  },
  "perfil-documentos": {
    left: {
      label: "Documentos",
      description:
        "Reúne reglamentos, comunicados y archivos oficiales que la administración comparte con los residentes.",
    },
    right: {
      label: "Todo a la mano",
      description:
        "El residente evita pedir documentos por chat o correo cada vez que los necesita.",
    },
  },
  "perfil-notificaciones": {
    left: {
      label: "Notificaciones",
      description:
        "Agrupa avisos de pagos, reservas y comunicados importantes ordenados por fecha.",
    },
    right: {
      label: "Nada se pierde",
      description:
        "Cada notificación indica su tipo para que el residente priorice lo urgente.",
    },
  },
  "perfil-preferencias": {
    left: {
      label: "Preferencias de notificación",
      description:
        "El residente decide qué avisos recibir por push o por correo electrónico.",
    },
    right: {
      label: "Menos ruido",
      description:
        "Permite ajustar la comunicación a lo que realmente le interesa a cada residente.",
    },
  },
  "perfil-password": {
    left: {
      label: "Cambiar contraseña",
      description:
        "El residente actualiza su contraseña de acceso de forma segura desde su propio perfil.",
    },
    right: {
      label: "Cuenta protegida",
      description:
        "No depende de la administración para gestionar sus propias credenciales.",
    },
  },
  "perfil-ayuda": {
    left: {
      label: "Ayuda y soporte",
      description:
        "Reúne temas frecuentes y canales de contacto para resolver dudas sobre la app.",
    },
    right: {
      label: "Soporte a un toque",
      description:
        "El residente encuentra respuesta sin salir de Minka ni buscar el contacto de la administración.",
    },
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

function shortcutForDesktopView(view: DesktopDemoView): DemoShortcutView {
  if (view.startsWith("reservas")) return "reservas";
  if (view.startsWith("residentes")) return "residentes";
  if (view.startsWith("comunidad")) return "comunidad";
  if (view.startsWith("cobranza")) return "cobranza";
  if (view.startsWith("configuracion")) return "configuracion";
  return "dashboard";
}

function shortcutForMobileView(view: AdminDemoView): DemoShortcutView {
  if (view === "reservas") return "reservas";
  if (view === "residentes" || view === "solicitudes") return "residentes";
  if (["comunidad", "eventos-anteriores", "archivados", "nuevo-anuncio", "nuevo-evento", "mapa"].includes(view)) return "comunidad";
  if (view === "cobranza") return "cobranza";
  if (["configuracion", "cuentas-bancarias", "areas-servicios", "nuevo-servicio"].includes(view)) return "configuracion";
  return "dashboard";
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

function AdminDesktopDemoFrame({ requestedView }: { requestedView: DesktopDemoView }) {
  const [isDesktopDemoReady, setIsDesktopDemoReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigateDesktopDemo = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "minka-desktop-demo:navigate", view: requestedView },
      window.location.origin,
    );
  }, [requestedView]);

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

  useEffect(() => {
    if (isDesktopDemoReady) navigateDesktopDemo();
  }, [isDesktopDemoReady, navigateDesktopDemo]);

  if (isDesktopDemoReady) {
    return (
      <iframe
        ref={iframeRef}
        className="live-demo-desktop-iframe"
        src={`${ADMIN_DESKTOP_DEMO_SRC}#${requestedView}`}
        title="Demo de administración de Minka en computadora"
        loading="lazy"
        sandbox="allow-forms allow-same-origin allow-scripts"
        onLoad={navigateDesktopDemo}
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
  const [role, setRole] = useState<Role>("admin");
  const [device, setDevice] = useState<Device>("iphone");
  const [adminView, setAdminView] = useState<AdminDemoView>("dashboard");
  const [requestedAdminView, setRequestedAdminView] = useState<AdminDemoView>();
  const [desktopView, setDesktopView] = useState<DesktopDemoView>(DEFAULT_DESKTOP_VIEW);
  const [desktopCopy, setDesktopCopy] = useState<PageCopy>(
    desktopPageCopy[DEFAULT_DESKTOP_VIEW],
  );
  const [residentCommand, setResidentCommand] = useState<{ type: ResidentCommand; token: number } | null>(null);
  const residentCommandCounter = useRef(0);
  const [residentView, setResidentView] = useState<ResidentDemoView>("inicio");
  const dynamicAdminCopy =
    role === "resident"
      ? residentPageCopy[residentView]
      : device === "iphone"
        ? adminPageCopy[adminView]
        : desktopCopy;

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
          setDesktopView(event.data.view);
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

  const openDemoView = (view: DemoShortcutView) => {
    if (device === "iphone") {
      setAdminView(view);
      setRequestedAdminView(view);
      return;
    }

    const nextDesktopView = desktopShortcutViews[view];
    setDesktopView(nextDesktopView);
    setDesktopCopy(desktopPageCopy[nextDesktopView]);
  };

  const showPhone = () => {
    const nextMobileView = shortcutForDesktopView(desktopView);
    setAdminView(nextMobileView);
    setRequestedAdminView(nextMobileView);
    setDevice("iphone");
  };

  const showDesktop = () => {
    const nextDesktopView = desktopShortcutViews[shortcutForMobileView(adminView)];
    setDesktopView(nextDesktopView);
    setDesktopCopy(desktopPageCopy[nextDesktopView]);
    setDevice("macbook");
  };

  const handleMobileViewChange = useCallback((view: AdminDemoView) => {
    setAdminView(view);
    setRequestedAdminView(undefined);
  }, []);

  const handleResidentViewChange = useCallback((view: ResidentDemoView) => {
    setResidentView(view);
  }, []);

  const runResidentCommand = (type: ResidentCommand) => {
    residentCommandCounter.current += 1;
    setResidentCommand({ type, token: residentCommandCounter.current });
  };

  const renderShortcuts = (items: typeof heroShortcuts) =>
    items.map(({ label, view, icon: Icon }) => (
      <button
        className="live-demo-shortcut"
        type="button"
        key={view}
        aria-pressed={(device === "iphone" ? shortcutForMobileView(adminView) : shortcutForDesktopView(desktopView)) === view}
        onClick={() => openDemoView(view)}
      >
        <span className="live-demo-shortcut__icon"><Icon aria-hidden="true" /></span>
        <span>{label}</span>
      </button>
    ));

  const renderResidentShortcuts = (items: typeof residentShortcuts) =>
    items.map(({ label, icon: Icon, command }) => (
      <button className="live-demo-shortcut" type="button" key={label} onClick={() => runResidentCommand(command)}>
        <span className="live-demo-shortcut__icon"><Icon aria-hidden="true" /></span>
        <span>{label}</span>
      </button>
    ));

  return (
    <section id="live-demo" className="live-demo-section" aria-labelledby="live-demo-title">
      <div className="live-demo-landscape" aria-hidden="true">
        <img src="/images/minka-community-landscape.png" alt="" />
      </div>

      <div className="section-shell live-demo-layout" data-device={device} data-role={role}>
        <header className="live-demo-intro">
          <p className="live-demo-intro__eyebrow">Minka en acción</p>
          <h1 id="live-demo-title">Administra tu urbanización sin caos</h1>
          <p className="live-demo-intro__text">
            El software para urbanizaciones, condominios y edificios que centraliza pagos, residentes,
            solicitudes y comunicación. Explora el demo y descubre cómo funciona Minka en tu comunidad.
          </p>
          <button className="live-demo-see-how" type="button" onClick={() => document.querySelector(".live-demo-device")?.scrollIntoView({ behavior: "smooth", block: "center" })}>
            Mira cómo
            <ArrowDown aria-hidden="true" />
          </button>
        </header>

        <div className="live-demo-shortcuts live-demo-shortcuts--rail" aria-label="Explorar funciones del demo">
          {role === "resident" ? (
            <>
              {renderResidentShortcuts(residentShortcuts.slice(0, 2))}
              <span className="live-demo-shortcuts__phone-space" aria-hidden="true" />
              {renderResidentShortcuts(residentShortcuts.slice(2))}
            </>
          ) : (
            <>
              {renderShortcuts(heroShortcuts.slice(0, 3))}
              <span className="live-demo-shortcuts__phone-space" aria-hidden="true" />
              {renderShortcuts(heroShortcuts.slice(3))}
            </>
          )}
        </div>

        <div className="live-demo-copy live-demo-copy--left" aria-live="polite">
          <p className="live-demo-caption__eyebrow">{dynamicAdminCopy.left.label}</p>
          <p className="live-demo-caption__text">{dynamicAdminCopy.left.description}</p>
        </div>

        <div className="live-demo-center">
          <div className="live-demo-controls" role="group" aria-label="Cambiar perfil y dispositivo del demo">
            <div className="live-demo-toggle live-demo-toggle--role" role="group" aria-label="Perfil">
              <button type="button" aria-pressed={role === "resident"} onClick={() => setRole("resident")}>
                Residente
              </button>
              <button type="button" aria-pressed={role === "admin"} onClick={() => setRole("admin")}>
                Administrador
              </button>
            </div>
            {role === "admin" ? (
              <div className="live-demo-toggle live-demo-toggle--device" role="group" aria-label="Dispositivo">
                <button type="button" aria-pressed={device === "iphone"} onClick={showPhone}>
                  Teléfono
                </button>
                <button type="button" aria-pressed={device === "macbook"} onClick={showDesktop}>
                  Computadora
                </button>
              </div>
            ) : null}
          </div>

          <div className="live-demo-device" data-reveal>
            <div className={`live-demo-device__frame live-demo-device__frame--${role === "resident" ? "samsung" : device}`}>
              {role === "resident" ? (
                <SamsungS25Ultra className="live-demo-device__svg" />
              ) : device === "iphone" ? (
                <Iphone16Pro className="live-demo-device__svg" />
              ) : (
                <MacbookPro className="live-demo-device__svg" />
              )}
              <div className="live-demo-screen">
                {role === "resident" ? (
                  <>
                    <ResidentMobileDemo
                      commandType={residentCommand?.type}
                      commandToken={residentCommand?.token}
                      onViewChange={handleResidentViewChange}
                    />
                    <div className="live-demo-punch-hole" aria-hidden="true" />
                  </>
                ) : device === "iphone" ? (
                  <>
                    <AdminMobileDemo requestedView={requestedAdminView} onViewChange={handleMobileViewChange} />
                    <div className="live-demo-notch" aria-hidden="true" />
                  </>
                ) : (
                  <AdminDesktopDemoFrame requestedView={desktopView} />
                )}
              </div>
              {role === "resident" || device === "iphone" ? <div className="live-demo-glare" aria-hidden="true" /> : null}
            </div>
          </div>
        </div>

        <div className="live-demo-copy live-demo-copy--right" aria-live="polite">
          <p className="live-demo-caption__eyebrow">{dynamicAdminCopy.right.label}</p>
          <p className="live-demo-caption__text">{dynamicAdminCopy.right.description}</p>
        </div>
      </div>
    </section>
  );
}
