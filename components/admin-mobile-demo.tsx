"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BellRing,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Grid2X2,
  KeyRound,
  Landmark,
  LockKeyhole,
  Megaphone,
  Menu,
  Plus,
  Search,
  Settings,
  Signal,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserPlus,
  UsersRound,
  WalletCards,
  Wifi,
  BatteryFull,
  LocateFixed,
  X,
} from "lucide-react";

type MainView = "dashboard" | "reservas" | "residentes" | "comunidad" | "cobranza" | "configuracion";
type DetailView =
  | "solicitudes"
  | "eventos-anteriores"
  | "archivados"
  | "nuevo-anuncio"
  | "nuevo-evento"
  | "mapa"
  | "cuentas-bancarias"
  | "areas-servicios"
  | "nuevo-servicio";

export type AdminDemoView = MainView | DetailView;
type View = AdminDemoView;

const navItems: { id: MainView; label: string; icon: typeof Grid2X2 }[] = [
  { id: "dashboard", label: "Panel", icon: Grid2X2 },
  { id: "reservas", label: "Reservas", icon: CalendarDays },
  { id: "residentes", label: "Residentes", icon: UsersRound },
  { id: "comunidad", label: "Comunidad", icon: Megaphone },
  { id: "cobranza", label: "Cobranza", icon: WalletCards },
  { id: "configuracion", label: "Configuración", icon: Settings },
];

const mainForView: Record<View, MainView> = {
  dashboard: "dashboard",
  reservas: "reservas",
  residentes: "residentes",
  solicitudes: "residentes",
  comunidad: "comunidad",
  "eventos-anteriores": "comunidad",
  archivados: "comunidad",
  "nuevo-anuncio": "comunidad",
  "nuevo-evento": "comunidad",
  mapa: "comunidad",
  cobranza: "cobranza",
  configuracion: "configuracion",
  "cuentas-bancarias": "configuracion",
  "areas-servicios": "configuracion",
  "nuevo-servicio": "configuracion",
};

const reservationRows = [
  ["SÁBADO, 2 DE ENERO", "Salón social", "Luis Mendoza · Manzana 3, Villa 8 · 09:00–10:00", "Cancelada"],
  ["VIERNES, 1 DE ENERO", "Salón social", "María Andrade · Manzana 1, Villa 12 · 09:00–10:00", "Cancelada"],
  ["JUEVES, 31 DE DICIEMBRE", "Salón social", "Carlos Ruiz · Manzana 4, Villa 5 · 09:00–10:00", "Cancelada"],
  ["MIÉRCOLES, 30 DE DICIEMBRE", "Piscina", "Valentina Mora · Manzana 2, Villa 7 · 14:00–15:00", "Cancelada"],
  ["LUNES, 28 DE DICIEMBRE", "Salón social", "Daniel Paredes · Manzana 5, Villa 2 · 09:00–10:00", "Cancelada"],
  ["DOMINGO, 27 DE DICIEMBRE", "Cancha de tenis", "Sofía Cárdenas · Manzana 2, Villa 15 · 11:00–12:00", "Cancelada"],
  ["SÁBADO, 26 DE DICIEMBRE", "Salón social", "Javier Molina · Manzana 6, Villa 3 · 09:00–10:00", "Cancelada"],
  ["LUNES, 7 DE SEPTIEMBRE", "Cancha de fútbol", "Andrea Torres · Manzana 1, Villa 9 · 17:00–18:00", "Confirmada"],
];

const residents = [
  ["DH", "Diego Heredia", "Manzana 4 · Villa 23", "Vencido"],
  ["JP", "Juan Pérez", "Manzana 1 · Villa 1", "Vencido"],
  ["MG", "María González", "Manzana 1 · Villa 2", "Vencido"],
  ["AV", "Andrés Vera", "Manzana 1 · Villa 3", "Vencido"],
  ["LF", "Lucía Fernández", "Manzana 2 · Villa 1", "Vencido"],
  ["RS", "Roberto Salas", "Manzana 2 · Villa 2", "Vencido"],
  ["CM", "Camila Méndez", "Manzana 3 · Villa 4", "Vencido"],
  ["DR", "Daniel Romero", "Manzana 2 · Villa 6", "Vencido"],
  ["AT", "Andrea Torres", "Manzana 5 · Villa 11", "Al día"],
  ["MA", "María Alcívar", "Manzana 4 · Villa 8", "Al día"],
  ["SV", "Santiago Vera", "Manzana 6 · Villa 2", "Al día"],
  ["PG", "Paola García", "Manzana 3 · Villa 10", "Al día"],
  ["JM", "Jorge Mendoza", "Manzana 1 · Villa 14", "Al día"],
  ["AC", "Ana Cedeño", "Manzana 5 · Villa 7", "Al día"],
  ["LM", "Luis Moreira", "Manzana 2 · Villa 9", "Al día"],
];

function DemoButton({ children, onClick, tone = "clay", className = "" }: { children: ReactNode; onClick?: () => void; tone?: "clay" | "soft" | "plain"; className?: string }) {
  return <button type="button" className={`amd-button amd-button--${tone} ${className}`} onClick={onClick}>{children}</button>;
}

function StatusBar() {
  return <div className="amd-status"><span>4:05</span><span className="amd-status-icons"><Signal /><Wifi /><BatteryFull /></span></div>;
}

function PageTitle({ title, eyebrow, subtitle, back }: { title: string; eyebrow?: string; subtitle?: string; back?: () => void }) {
  return (
    <header className="amd-page-title">
      {back ? <button type="button" aria-label="Volver" onClick={back}><ArrowLeft /></button> : null}
      <div>
        {eyebrow ? <p>{eyebrow}</p> : null}
        <h3>{title}</h3>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
    </header>
  );
}

function AlertCard({ icon, children, onClick }: { icon: ReactNode; children: ReactNode; onClick?: () => void }) {
  return <button type="button" className="amd-alert-card" onClick={onClick}><span>{icon}</span><strong>{children}</strong><ChevronRight /></button>;
}

function BottomNav({ active, navigate }: { active: MainView; navigate: (view: View) => void }) {
  return (
    <nav className="amd-bottom-nav" aria-label="Navegación de la demostración">
      {navItems.map((item) => {
        const Icon = item.icon;
        const selected = item.id === active;
        return <button key={item.id} type="button" aria-label={item.label} aria-current={selected ? "page" : undefined} onClick={() => navigate(item.id)}><Icon /><span>{selected ? item.label : ""}</span></button>;
      })}
    </nav>
  );
}

function Dashboard({ navigate, fallback }: { navigate: (view: View) => void; fallback: () => void }) {
  return <div className="amd-page amd-dashboard">
    <div className="amd-greeting"><div><p>Buenas tardes</p><h3>Urbanización Los<br />Jardines</h3></div><button type="button" onClick={fallback}><Menu /></button></div>
    <h4>Requiere tu atención</h4>
    <div className="amd-stack-sm">
      <AlertCard icon={<BellRing />} onClick={() => navigate("cobranza")}>6 villas con saldo vencido</AlertCard>
      <AlertCard icon={<Clock3 />} onClick={() => navigate("reservas")}>1 reserva pendiente de aprobar</AlertCard>
    </div>
    <div className="amd-metric-grid"><article><strong>$630.00</strong><span>Pendiente de cobro</span></article><article><strong>$115.00</strong><span>Recaudado este mes</span></article></div>
    <article className="amd-progress-card"><div><strong>Termina de configurar tu comunidad</strong><button type="button" onClick={() => navigate("configuracion")}>Continuar</button></div><div className="amd-progress"><span /></div><small>4 de 5 pasos obligatorios completados</small></article>
    <div className="amd-section-row"><h4>Reservas de hoy</h4><button type="button" onClick={() => navigate("reservas")}>Ver todas</button></div>
    <article className="amd-booking"><span>◉</span><strong>Cancha de fútbol · hoy 17:00 · Andrea Torres</strong></article>
    <h4>Servicios</h4>
    <div className="amd-services"><button type="button" onClick={fallback}>⚽<strong>Cancha de fútbol</strong><small>Reservada 17:00</small></button><button type="button" onClick={fallback}>💧<strong>Piscina</strong><small>Libre hoy</small></button><button type="button" onClick={fallback}>🏢<strong>Salón social</strong><small>Libre hoy</small></button></div>
    <h4>Próximos eventos</h4><div className="amd-empty-inline">No hay eventos próximos.</div>
  </div>;
}

function Reservas({ fallback }: { fallback: () => void }) {
  return <div className="amd-page">
    <PageTitle title="Reservas" subtitle="Todas las reservas de la organización." />
    <div className="amd-search"><Search /><span>Buscar por residente o servicio...</span><button type="button" onClick={fallback}><SlidersHorizontal /></button></div>
    <div className="amd-pills"><button onClick={fallback}>Todas 27</button><button className="is-active" onClick={fallback}>Próximas 8</button><button onClick={fallback}>Pendientes 1</button><button onClick={fallback}>Canceladas 7</button></div>
    <div className="amd-reservation-list">{reservationRows.map((row, index) => <div key={`${row[0]}-${index}`}><small>{row[0]}</small><button type="button" className="amd-reservation" onClick={fallback}><Building2 /><span><strong>{row[1]}</strong><em>{row[2]}</em><em>{row[3]}</em></span><Menu /></button></div>)}</div>
  </div>;
}

function Residentes({ navigate, fallback }: { navigate: (view: View) => void; fallback: () => void }) {
  return <div className="amd-page">
    <PageTitle title="Residentes" subtitle="Administra las personas asociadas a Urbanización Los Jardines." />
    <DemoButton tone="soft" onClick={() => navigate("solicitudes")}>Solicitudes de acceso</DemoButton>
    <div className="amd-search"><Search /><span>Buscar por nombre o unidad...</span><button type="button" onClick={fallback}><SlidersHorizontal /></button></div>
    <div className="amd-resident-list">{residents.map((resident, index) => <button type="button" key={`${resident[1]}-${index}`} onClick={fallback}><span className="amd-avatar">{resident[0]}</span><span><strong>{resident[1]}</strong><em>{resident[2]}</em></span><small className={resident[3] === "Al día" ? "is-current" : "is-overdue"}>● {resident[3]}</small></button>)}</div>
  </div>;
}

function Solicitudes({ back, fallback }: { back: () => void; fallback: () => void }) {
  return <div className="amd-page"><PageTitle title="Solicitudes de acceso" back={back} /><div className="amd-pills"><button className="is-outline" onClick={fallback}>Por revisar</button><button onClick={fallback}>Todas</button></div><div className="amd-empty-state"><UserPlus /><strong>No hay solicitudes por revisar</strong><p>Las nuevas solicitudes de acceso aparecerán aquí para tu revisión.</p></div></div>;
}

function Comunidad({ navigate, fallback }: { navigate: (view: View) => void; fallback: () => void }) {
  const announcements = [["Mantenimiento de piscina", "Este domingo la piscina permanecerá cerrada de 08:00 a 14:00 por mantenimiento."], ["Corte de agua", "El jueves habrá un corte programado de agua potable entre las 09:00 y las 12:00."], ["Reunión de residentes", "Convocatoria a la reunión trimestral el próximo viernes a las 19:00 en el salón social."]];
  return <div className="amd-page"><PageTitle title="Comunidad" /><div className="amd-community-actions"><span className="amd-badge">3 activos</span><DemoButton tone="soft" onClick={() => navigate("mapa")}>Mapa 🗺</DemoButton></div>
    <div className="amd-section-row"><h4>Anuncios</h4><DemoButton tone="soft" onClick={() => navigate("nuevo-anuncio")}><Plus /> Nuevo anuncio</DemoButton></div>
    <div className="amd-stack-sm">{announcements.map(a => <article className="amd-announcement" key={a[0]}><Megaphone /><span><strong>{a[0]}</strong><small>{a[1]}</small></span><button type="button" onClick={fallback}><Menu /></button></article>)}</div>
    <div className="amd-section-row"><h4>Eventos</h4><DemoButton tone="soft" onClick={() => navigate("nuevo-evento")}><Plus /> Nuevo evento</DemoButton></div>
    <div className="amd-empty-state amd-empty-state--compact"><CalendarDays /><strong>No hay eventos vigentes</strong><p>Los eventos anteriores siguen disponibles abajo.</p></div>
    <button type="button" className="amd-text-link" onClick={() => navigate("eventos-anteriores")}>Ver 3 eventos anteriores <ChevronDown /></button>
    <button type="button" className="amd-text-link" onClick={() => navigate("archivados")}>▣ Ver archivados</button>
  </div>;
}

function EventosAnteriores({ navigate, fallback }: { navigate: (view: View) => void; fallback: () => void }) {
  return <div className="amd-page"><PageTitle title="Comunidad" /><div className="amd-section-row"><h4>Eventos</h4><DemoButton tone="soft" onClick={() => navigate("nuevo-evento")}><Plus /> Nuevo evento</DemoButton></div><div className="amd-empty-state amd-empty-state--compact"><CalendarDays /><strong>No hay eventos vigentes</strong><p>Los eventos anteriores siguen disponibles abajo.</p></div><button type="button" className="amd-text-link" onClick={() => navigate("comunidad")}>Ver 3 eventos anteriores ⌃</button>{[["Torneo de fútbol 2026", "Dom., 23 ago", "Inscripciones abiertas"], ["Feria comunitaria", "Dom., 30 ago", "Próximamente"], ["Reunión de vecinos", "Sáb, 5 sept", "Confirmado"]].map(e => <article className="amd-event" key={e[0]}><CalendarDays /><span><strong>{e[0]}</strong><small>{e[1]}</small><small>{e[2]}</small></span><button type="button" onClick={fallback}><Menu /></button></article>)}<button type="button" className="amd-text-link" onClick={() => navigate("archivados")}>▣ Ver archivados</button></div>;
}

function Archivados({ back }: { back: () => void }) { return <div className="amd-page"><PageTitle title="Archivados" subtitle="Anuncios y eventos que ya no se muestran a los residentes." back={back} /><h4>Anuncios archivados</h4><div className="amd-empty-state amd-empty-state--compact"><BellRing /><strong>No hay anuncios archivados</strong><p>Los anuncios que archives aparecerán aquí.</p></div><h4>Eventos archivados</h4><div className="amd-empty-state amd-empty-state--compact"><CalendarDays /><strong>No hay eventos archivados</strong><p>Los eventos que archives aparecerán aquí.</p></div></div>; }

function Composer({ kind, back, fallback }: { kind: "anuncio" | "evento"; back: () => void; fallback: () => void }) {
  const event = kind === "evento";
  return <div className="amd-page amd-form-page"><PageTitle title={event ? "Crear evento" : "Crear anuncio"} back={back} />
    <label>{event ? "Nombre del evento" : "Título"}<input placeholder={event ? "Ej. Torneo de fútbol" : "Ej. Corte de agua"} /></label>
    {event ? <div className="amd-form-grid"><label>Fecha (opcional)<input placeholder="AAAA-MM-DD" /></label><label>Hora (opcional)<input placeholder="Ej. 19:00" /></label></div> : null}
    {event ? <label>Estado<input placeholder="Próximamente" /></label> : null}
    <label>Descripción<textarea placeholder={event ? "Describe el evento para los residentes" : "Describe el anuncio para los residentes"} /></label>
    {!event ? <div className="amd-form-grid"><label>Fecha (opcional)<input placeholder="AAAA-MM-DD" /></label><label>Hora (opcional)<input placeholder="Ej. 08:00–14:00" /></label></div> : null}
    <DemoButton className="amd-form-submit" onClick={fallback}>{event ? "Publicar evento" : "Publicar"}</DemoButton>
  </div>;
}

function CommunityMap({ back }: { back: () => void }) {
  const [zoom, setZoom] = useState(1);
  return <div className="amd-page"><PageTitle eyebrow="Comunidad" title="Mapa" subtitle="Vista general de la organización. Urbanización Los Jardines." back={back} /><div className="amd-map"><img style={{ transform: `scale(${zoom})` }} src="/admin-mobile-reference/comunidad-mapa-detalle.png" alt="Mapa de Urbanización Los Jardines" /><div className="amd-map-controls"><button type="button" aria-label="Acercar mapa" onClick={() => setZoom(value => Math.min(1.8, value + .2))}>+</button><button type="button" aria-label="Alejar mapa" onClick={() => setZoom(value => Math.max(1, value - .2))}>−</button></div><button type="button" className="amd-map-recenter" onClick={() => setZoom(1)}><LocateFixed /> Recentrar</button></div><h4>Leyenda</h4><article className="amd-legend"><span>⚽ Cancha de fútbol</span><span>🏋️ Gimnasio</span><span>🏊 Piscina</span><span>🚪 Garita / acceso principal</span></article></div>;
}

function Cobranza({ openModal, fallback }: { openModal: (modal: "alicuota" | "extraordinaria") => void; fallback: () => void }) {
  const villas = ["Manzana 1 · Villa 1", "Manzana 1 · Villa 2", "Manzana 1 · Villa 3", "Manzana 2 · Villa 1", "Manzana 2 · Villa 2", "Manzana 4 · Villa 23", "Manzana 5 · Villa 4", "Manzana 6 · Villa 12"];
  return <div className="amd-page"><PageTitle title="Cobranza" subtitle="Alícuotas, cargos y pagos de tu organización." /><div className="amd-button-row"><DemoButton tone="soft" onClick={fallback}>Exportar CSV</DemoButton><DemoButton tone="soft" onClick={fallback}>Pagos pendientes</DemoButton></div><div className="amd-month"><button onClick={fallback}>‹</button><strong>Agosto 2026</strong><button onClick={fallback}>›</button></div><div className="amd-metric-grid"><article><strong>$510.00</strong><span>Pendiente</span><small>de $605.00 esperado</small></article><article><strong>$95.00</strong><span>Recaudado</span><small>$75.00 vía Minka · $20.00 manual</small></article></div><div className="amd-collection-meta"><span>Tasa de cobranza <strong>15.7%</strong></span><span>Reportes de pago <strong>22</strong></span></div><h4>Requiere tu atención</h4><AlertCard icon={<Clock3 />} onClick={fallback}>6 villas con saldo vencido este periodo</AlertCard><DemoButton onClick={() => openModal("alicuota")}>Generar alícuotas del mes</DemoButton><DemoButton tone="soft" onClick={() => openModal("extraordinaria")}><Plus /> Cuota extraordinaria</DemoButton><div className="amd-search"><Search /><span>Buscar villa...</span></div><div className="amd-pills"><button className="is-dark" onClick={fallback}>Todas 8</button><button onClick={fallback}>Vencidas 6</button><button onClick={fallback}>Pendientes 0</button><button onClick={fallback}>Al día 2</button></div><div className="amd-villa-list">{villas.map((v, i) => <button type="button" key={v} onClick={fallback}><span>● {v}</span><strong className={i > 5 ? "is-zero" : ""}>{i > 5 ? "$0.00" : "$190.00"}</strong><ChevronDown /></button>)}</div></div>;
}

const configItems: [typeof Settings, string, string, DetailView | null][] = [
  [Building2, "Organización", "Nombre, tipo y datos generales", null], [Sparkles, "Apariencia", "Logo, colores y portada", null], [Grid2X2, "Unidades", "Manzanas, villas, apartamentos u oficinas", null], [SlidersHorizontal, "Áreas y servicios", "Crear, editar y ordenar servicios", "areas-servicios"], [ShieldCheck, "Acceso y beneficios", "Reglas de elegibilidad para reservar", null], [CircleDollarSign, "Alícuotas", "Valor mensual predeterminado por unidad", null], [Landmark, "Cuentas bancarias", "Dónde reciben transferencias tus residentes", "cuentas-bancarias"], [KeyRound, "Acceso de residentes", "Enlace y código QR para que residentes se registren", null], [UsersRound, "Equipo", "Invitar personal con permisos limitados", null], [Check, "Onboarding", "Progreso de configuración de tu comunidad", null], [LockKeyhole, "Cambiar contraseña", "Actualiza tu contraseña de acceso", null], [BellRing, "Ayuda y soporte", "Contacto, legal y versión de la app", null],
];

function Configuracion({ navigate, fallback }: { navigate: (view: View) => void; fallback: () => void }) { return <div className="amd-page"><PageTitle title="Configuración" /><div className="amd-settings-list">{configItems.map(([Icon, title, text, route]) => <button type="button" key={title} onClick={() => route ? navigate(route) : fallback()}><Icon /><span><strong>{title}</strong><small>{text}</small></span><ChevronRight /></button>)}</div></div>; }

function BankAccounts({ back, openModal, fallback }: { back: () => void; openModal: () => void; fallback: () => void }) { return <div className="amd-page"><PageTitle title="Cuentas bancarias" subtitle="Dónde reciben transferencias tus residentes. Nunca se comparten con Minka — el dinero va directo a tu organización." back={back} /><DemoButton onClick={openModal}><Plus /> Agregar cuenta</DemoButton>{[["Banco Pichincha", "Cuenta corriente · 2201234567", "Urbanización Los Jardines"], ["Banco Guayaquil", "Cuenta de ahorros · 0918457623", "Urbanización Los Jardines"]].map(b => <article className="amd-bank" key={b[0]}><span><strong>{b[0]} <em>Activa</em></strong><small>{b[1]}</small><small>{b[2]}</small></span><span><button onClick={fallback}>Editar</button><button onClick={fallback}>Desactivar</button></span></article>)}</div>; }

const services = [["🏀", "Cancha de fútbol", true], ["🏊", "Piscina", true], ["🎾", "Cancha de tenis", false], ["🎉", "Salón social", true], ["🛝", "Parque infantil", true]] as const;
function AreasServices({ back, navigate, fallback }: { back: () => void; navigate: (v: View) => void; fallback: () => void }) { return <div className="amd-page"><PageTitle title="Áreas y servicios" subtitle="Crear, editar y ordenar servicios." back={back} /><DemoButton onClick={() => navigate("nuevo-servicio")}><Plus /> Agregar servicio</DemoButton><div className="amd-service-list">{services.map(s => <article key={s[1]}><button type="button" className="amd-service-main" onClick={fallback}><span>{s[0]}</span><span><strong>{s[1]}</strong><small><em className={s[2] ? "is-current" : "is-overdue"}>{s[2] ? "Activo" : "Inactivo"}</em> Reservable</small></span><ChevronRight /></button><div><span>Activo</span><button type="button" className={s[2] ? "amd-switch is-on" : "amd-switch"} onClick={fallback}><span /></button></div></article>)}</div></div>; }

function NewService({ back, fallback }: { back: () => void; fallback: () => void }) { return <div className="amd-page amd-form-page"><PageTitle title="Nuevo servicio" back={back} /><section className="amd-form-card"><h4>Información</h4><label>Nombre del servicio *<input placeholder="Ej. Cancha de tenis" /></label><label>Descripción<textarea placeholder="Descripción breve del servicio" /></label><label>Icono<div className="amd-icon-grid">{["⚽","🎾","🏀","🏐","🏋️","🎉","🥊","🏊","💼","🎆","💻","🎬","🎮","⭐"].map(i => <button type="button" key={i} onClick={fallback}>{i}</button>)}</div></label></section><section className="amd-form-card"><h4>Disponibilidad</h4><div className="amd-toggle-row"><span>¿Permite reservas?</span><i className="amd-switch is-on"><span /></i></div><div className="amd-toggle-row"><span>¿Está activo?</span><i className="amd-switch is-on"><span /></i></div><div className="amd-form-grid"><label>Hora de apertura<input value="08:00" readOnly /></label><label>Hora de cierre<input value="20:00" readOnly /></label></div><label>Duración máxima (minutos)<input value="60" readOnly /></label><label>Anticipación máxima (días)<input value="7" readOnly /></label><label>Reservas por usuario<input value="3" readOnly /></label></section><DemoButton className="amd-form-submit" onClick={fallback}>Crear servicio</DemoButton></div>; }

function DemoModal({ kind, close, fallback }: { kind: "alicuota" | "extraordinaria" | "cuenta"; close: () => void; fallback: () => void }) {
  return <div className="amd-modal-backdrop" role="presentation"><section className="amd-modal" role="dialog" aria-modal="true" aria-label={kind === "alicuota" ? "Generar alícuotas" : kind === "extraordinaria" ? "Cuota extraordinaria" : "Nueva cuenta bancaria"}><header><h4>{kind === "alicuota" ? "Generar alícuotas — Agosto 2026" : kind === "extraordinaria" ? "Cuota extraordinaria" : "Nueva cuenta bancaria"}</h4><button type="button" onClick={close}><X /></button></header>{kind === "alicuota" ? <div className="amd-modal-copy"><strong>Resumen</strong><b>7 unidades activas</b><b>Valor predeterminado: $85.00</b><b>Recaudación esperada (aprox.): $595.00</b><p>Las unidades con un valor personalizado usarán ese valor en lugar del predeterminado.</p></div> : <div className="amd-modal-fields">{(kind === "cuenta" ? [["Banco *", "Ej. Banco Pichincha"], ["Titular de la cuenta *", "Ej. Minka Los Jardines S.A."], ["Tipo de cuenta *", "Ej. Cuenta corriente"], ["Número de cuenta *", ""], ["RUC / Identificación (opcional)", ""]] : [["Descripción *", "Ej. Reparación piscina"], ["Monto por unidad *", "0.00"], ["Fecha de vencimiento *", "AAAA-MM-DD"]]).map(f => <label key={f[0]}>{f[0]}<input placeholder={f[1]} /></label>)}{kind === "extraordinaria" ? <div className="amd-preview"><strong>Vista previa</strong><b>7 unidades activas</b><b>Total: $0.00</b></div> : null}</div>}<footer><DemoButton tone="plain" onClick={close}>Cancelar</DemoButton><DemoButton onClick={fallback}>{kind === "cuenta" ? "Crear cuenta" : kind === "alicuota" ? "Generar" : "Confirmar"}</DemoButton></footer></section></div>;
}

export function AdminMobileDemo({ onViewChange }: { onViewChange?: (view: AdminDemoView) => void }) {
  const [view, setView] = useState<View>("dashboard");
  const [modal, setModal] = useState<"alicuota" | "extraordinaria" | "cuenta" | null>(null);
  const [toast, setToast] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const navigate = (next: View) => { setView(next); setModal(null); scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }); };
  const fallback = () => setToast(true);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(false), 2600); return () => window.clearTimeout(timer); }, [toast]);
  useEffect(() => { onViewChange?.(view); }, [onViewChange, view]);
  const backToMain = () => navigate(mainForView[view]);

  let content: ReactNode;
  switch (view) {
    case "dashboard": content = <Dashboard navigate={navigate} fallback={fallback} />; break;
    case "reservas": content = <Reservas fallback={fallback} />; break;
    case "residentes": content = <Residentes navigate={navigate} fallback={fallback} />; break;
    case "solicitudes": content = <Solicitudes back={backToMain} fallback={fallback} />; break;
    case "comunidad": content = <Comunidad navigate={navigate} fallback={fallback} />; break;
    case "eventos-anteriores": content = <EventosAnteriores navigate={navigate} fallback={fallback} />; break;
    case "archivados": content = <Archivados back={backToMain} />; break;
    case "nuevo-anuncio": content = <Composer kind="anuncio" back={backToMain} fallback={fallback} />; break;
    case "nuevo-evento": content = <Composer kind="evento" back={backToMain} fallback={fallback} />; break;
    case "mapa": content = <CommunityMap back={backToMain} />; break;
    case "cobranza": content = <Cobranza openModal={setModal} fallback={fallback} />; break;
    case "configuracion": content = <Configuracion navigate={navigate} fallback={fallback} />; break;
    case "cuentas-bancarias": content = <BankAccounts back={backToMain} openModal={() => setModal("cuenta")} fallback={fallback} />; break;
    case "areas-servicios": content = <AreasServices back={backToMain} navigate={navigate} fallback={fallback} />; break;
    case "nuevo-servicio": content = <NewService back={backToMain} fallback={fallback} />; break;
  }

  return <div className="amd-app"><StatusBar /><div ref={scrollRef} className="amd-scroll">{content}</div><BottomNav active={mainForView[view]} navigate={navigate} />{modal ? <DemoModal kind={modal} close={() => setModal(null)} fallback={fallback} /> : null}{toast ? <div className="amd-toast" role="status">Esto es una demostración. Agrega tu comunidad aquí.</div> : null}</div>;
}
