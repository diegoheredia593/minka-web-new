"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import {
  AlertCircle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cloud,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  GitBranch,
  Heart,
  Home,
  BarChart3,
  ClipboardList,
  Info,
  Lock,
  LocateFixed,
  Map,
  Mail,
  Paperclip,
  Phone,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  CircleDollarSign,
  Sun,
  TriangleAlert,
  UserPlus,
  UserRound,
  UsersRound,
  Wallet,
  Zap,
} from "lucide-react";

type MainView = "inicio" | "reservas" | "comunidad" | "perfil";
type DetailView =
  | "reserva-cancha"
  | "comunidad-map"
  | "comunidad-vecinos"
  | "perfil-reservas"
  | "perfil-estado"
  | "perfil-transferencia"
  | "perfil-cuentas"
  | "perfil-visitas"
  | "perfil-incidencias"
  | "perfil-documentos"
  | "perfil-notificaciones"
  | "perfil-preferencias"
  | "perfil-password"
  | "perfil-ayuda";

export type ResidentDemoView = MainView | DetailView;
type View = ResidentDemoView;
export type ResidentCommand = "reservar" | "estado" | "comunidad" | "visitas";

const EMERGENCY_TAPS_REQUIRED = 5;

const navItems: { id: MainView; label: string; icon: typeof Zap }[] = [
  { id: "inicio", label: "Inicio", icon: Zap },
  { id: "reservas", label: "Reservas", icon: CalendarDays },
  { id: "comunidad", label: "Comunidad", icon: UsersRound },
  { id: "perfil", label: "Perfil", icon: UserRound },
];

const mainForView: Record<View, MainView> = {
  inicio: "inicio",
  reservas: "reservas",
  "reserva-cancha": "reservas",
  comunidad: "comunidad",
  "comunidad-map": "comunidad",
  "comunidad-vecinos": "comunidad",
  perfil: "perfil",
  "perfil-reservas": "perfil",
  "perfil-estado": "perfil",
  "perfil-transferencia": "perfil",
  "perfil-cuentas": "perfil",
  "perfil-visitas": "perfil",
  "perfil-incidencias": "perfil",
  "perfil-documentos": "perfil",
  "perfil-notificaciones": "perfil",
  "perfil-preferencias": "perfil",
  "perfil-password": "perfil",
  "perfil-ayuda": "perfil",
};

// Where "volver" lands. Most details sit one level under a tab root, but a
// couple (transferencia/cuentas) are nested inside "Mi estado" itself.
const backTargetFor: Partial<Record<DetailView, View>> = {
  "reserva-cancha": "reservas",
  "comunidad-map": "comunidad",
  "comunidad-vecinos": "comunidad",
  "perfil-reservas": "perfil",
  "perfil-estado": "perfil",
  "perfil-transferencia": "perfil-estado",
  "perfil-cuentas": "perfil-estado",
  "perfil-visitas": "perfil",
  "perfil-incidencias": "perfil",
  "perfil-documentos": "perfil",
  "perfil-notificaciones": "perfil",
  "perfil-preferencias": "perfil",
  "perfil-password": "perfil",
  "perfil-ayuda": "perfil",
};

const quickActions = [
  { label: "Reservar", icon: CalendarDays, view: "reservas" as View },
  { label: "Mi estado", icon: Wallet, view: "perfil-estado" as View },
  { label: "Comunidad", icon: UsersRound, view: "comunidad" as View },
  { label: "Visitas", icon: UserPlus, view: "perfil-visitas" as View },
] as const;

const reservations = [
  { name: "Salón social", when: "jueves, 31 de diciembre · 09:00 — 10:00", status: "Cancelada" },
  { name: "Salón social", when: "sábado, 26 de diciembre · 09:00 — 10:00", status: "Cancelada" },
];

const myReservations = [
  { name: "Salón social", when: "jueves, 31 de diciembre · 09:00 — 10:00", status: "Cancelada" },
  { name: "Salón social", when: "sábado, 26 de diciembre · 09:00 — 10:00", status: "Cancelada" },
  { name: "Cancha de fútbol", when: "lunes, 7 de septiembre · 17:00 — 18:00", status: "Confirmada" },
  { name: "Cancha de fútbol", when: "domingo, 6 de septiembre · 18:00 — 19:00", status: "Confirmada" },
];

const benefits = [
  { icon: "⚽", name: "Cancha de fútbol", status: "Disponible" },
  { icon: "🏊", name: "Piscina", status: "Disponible" },
];

const days = [
  { label: "Hoy", num: "16" },
  { label: "Jue", num: "17" },
  { label: "Vie", num: "18" },
  { label: "Sáb", num: "19" },
  { label: "Dom", num: "20" },
  { label: "Lun", num: "21" },
];

const settingsRows: { icon: typeof CalendarDays; label: string; view: View | null }[] = [
  { icon: CalendarDays, label: "Mis reservas", view: "perfil-reservas" },
  { icon: Wallet, label: "Mi estado", view: "perfil-estado" },
  { icon: UsersRound, label: "Mis visitas", view: "perfil-visitas" },
  { icon: AlertCircle, label: "Mis incidencias", view: "perfil-incidencias" },
  { icon: CreditCard, label: "Mis pagos", view: null },
  { icon: FileText, label: "Documentos", view: "perfil-documentos" },
  { icon: Bell, label: "Notificaciones", view: "perfil-notificaciones" },
  { icon: SlidersHorizontal, label: "Preferencias de notificaciones", view: "perfil-preferencias" },
  { icon: Lock, label: "Cambiar contraseña", view: "perfil-password" },
  { icon: CircleDollarSign, label: "Ayuda y soporte", view: "perfil-ayuda" },
];

const unpaidPayments = [
  { amount: "$1.00", reason: "Motivo: Unreadable receipt — re-test" },
  { amount: "$12.00", reason: "Motivo: incorrect_amount — sql test" },
  { amount: "$1.00", reason: "Motivo: Unreadable receipt — re-test" },
];

const notificationGroups = [
  {
    date: "10 DE SEPTIEMBRE",
    items: [
      { tone: "success" as const, icon: CheckCircle2, title: "Pago aprobado", body: "Tu pago de $1.00 fue aprobado por la administración.", time: "2:18 p. m." },
      { tone: "announce" as const, icon: null, emoji: "📣", title: "Nuevo anuncio", body: "Golden Path anuncio 1789067922514", time: "2:18 p. m." },
    ],
  },
  {
    date: "7 DE SEPTIEMBRE",
    items: [
      { tone: "info" as const, icon: Info, title: "Emergencia resuelta", body: "La situación de emergencia fue resuelta.", time: "11:28 p. m." },
      { tone: "info" as const, icon: Info, title: "Alerta de emergencia — detalle", body: "Otro — prueba del sistema", time: "11:28 p. m." },
      { tone: "alert" as const, icon: null, emoji: "🚨", title: "Alerta de la administración", body: "Se activó una alerta de emergencia en tu comunidad.", time: "11:28 p. m." },
    ],
  },
  {
    date: "4 DE SEPTIEMBRE",
    items: [
      { tone: "success" as const, icon: CheckCircle2, title: "Reserva confirmada", body: "Tu reserva fue confirmada.", time: "1:18 p. m." },
      { tone: "success" as const, icon: CheckCircle2, title: "Reserva confirmada", body: "Tu reserva fue confirmada.", time: "11:47 a. m." },
    ],
  },
];

const helpTopics: { icon: typeof CircleDollarSign; label: string }[] = [
  { icon: CircleDollarSign, label: "Cómo reportar un pago" },
  { icon: CalendarDays, label: "Cómo hacer una reserva" },
  { icon: UserPlus, label: "Cómo registrar una visita" },
  { icon: TriangleAlert, label: "Cómo usar el botón de emergencia" },
  { icon: Sparkles, label: "Volver a ver el recorrido inicial" },
];

function Heading({ title, subtitle, back, eyebrow }: { title: string; subtitle?: string; back?: () => void; eyebrow?: string }) {
  return (
    <header className="rmd-page-title">
      {back ? (
        <button type="button" aria-label="Volver" onClick={back}>
          <ChevronLeft aria-hidden="true" />
        </button>
      ) : null}
      <div>
        {eyebrow ? <p>{eyebrow}</p> : null}
        <h3>{title}</h3>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
    </header>
  );
}

function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="rmd-back-link" onClick={onClick}>
      <ChevronLeft aria-hidden="true" /> {label}
    </button>
  );
}

function BottomNav({ active, navigate }: { active: MainView; navigate: (view: View) => void }) {
  return (
    <nav className="rmd-bottom-nav" aria-label="Navegación de la demostración">
      {navItems.map((item) => {
        const Icon = item.icon;
        const selected = item.id === active;
        return (
          <button key={item.id} type="button" aria-label={item.label} aria-current={selected ? "page" : undefined} onClick={() => navigate(item.id)}>
            <Icon aria-hidden="true" />
            <span>{selected ? item.label : ""}</span>
          </button>
        );
      })}
    </nav>
  );
}

function Inicio({ navigate, fallback, tapEmergency, emergencyTaps }: { navigate: (view: View) => void; fallback: () => void; tapEmergency: () => void; emergencyTaps: number }) {
  return (
    <div className="rmd-page">
      <div className="rmd-greeting">
        <div className="rmd-greeting__avatar">RT</div>
        <div className="rmd-greeting__text">
          <h3>Buenos días, Resident</h3>
          <span className="rmd-greeting__unit">
            <Home aria-hidden="true" /> Manzana Test · Villa RESIDENT-TEST
          </span>
        </div>
        <button type="button" className="rmd-bell" aria-label="Notificaciones" onClick={() => navigate("perfil-notificaciones")}>
          <Bell aria-hidden="true" />
          <span className="rmd-bell__badge">9+</span>
        </button>
      </div>

      <button type="button" className="rmd-emergency" onClick={tapEmergency} aria-label="Emergencia, toca 5 veces para activar">
        <span className="rmd-emergency__icon">
          <TriangleAlert aria-hidden="true" />
        </span>
        <span className="rmd-emergency__copy">
          <strong>Emergencia</strong>
          <em>Toca 5 veces para activar</em>
        </span>
        <span className="rmd-emergency__dots" aria-hidden="true">
          {Array.from({ length: EMERGENCY_TAPS_REQUIRED }).map((_, index) => (
            <i key={index} data-filled={index < emergencyTaps} />
          ))}
        </span>
      </button>
      <p className="rmd-emergency__hint">Se enviará una alerta al personal de seguridad</p>

      <article className="rmd-account">
        <div className="rmd-account__top">
          <span className="rmd-account__label">
            <Wallet aria-hidden="true" /> ESTADO DE CUENTA
          </span>
          <span className="rmd-pill rmd-pill--green">● Al día</span>
        </div>
        <h2 className="rmd-account__headline">Estás al día</h2>
        <button type="button" className="rmd-account__cta" onClick={() => navigate("perfil-estado")}>
          Ver mi estado <ChevronRight aria-hidden="true" />
        </button>
      </article>

      <div className="rmd-quick-grid">
        {quickActions.map(({ label, icon: Icon, view }) => (
          <button type="button" className="rmd-quick" key={label} onClick={() => navigate(view)}>
            <span className="rmd-quick__icon">
              <Icon aria-hidden="true" />
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="rmd-section-row">
        <h4>
          <CalendarDays aria-hidden="true" /> Próximas reservas
        </h4>
        <button type="button" onClick={() => navigate("perfil-reservas")}>
          Ver todas
        </button>
      </div>
      <div className="rmd-stack">
        {reservations.map((reservation, index) => (
          <button type="button" className="rmd-card" key={`${reservation.name}-${index}`} onClick={fallback}>
            <span className="rmd-card__icon">🎉</span>
            <span className="rmd-card__body">
              <strong>{reservation.name}</strong>
              <em>{reservation.when}</em>
            </span>
            <span className="rmd-pill rmd-pill--muted">{reservation.status}</span>
          </button>
        ))}
      </div>

      <div className="rmd-section-row">
        <h4>
          <ShieldCheck aria-hidden="true" /> Tus beneficios
        </h4>
        <button type="button" onClick={fallback}>
          1 beneficio restringido
        </button>
      </div>
      <div className="rmd-stack">
        {benefits.map((benefit) => (
          <button type="button" className="rmd-card" key={benefit.name} onClick={fallback}>
            <span className="rmd-card__icon">{benefit.icon}</span>
            <span className="rmd-card__body">
              <strong>{benefit.name}</strong>
            </span>
            <span className="rmd-pill rmd-pill--green">{benefit.status}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ReservasList({ navigate, fallback }: { navigate: (view: View) => void; fallback: () => void }) {
  return (
    <div className="rmd-page">
      <Heading title="Reservas" subtitle="Elige un área común para ver horarios disponibles." />
      <div className="rmd-service-list">
        <button type="button" className="rmd-service-card" onClick={() => navigate("reserva-cancha")}>
          <span className="rmd-service-card__icon">⚽</span>
          <span className="rmd-service-card__body">
            <strong>Cancha de fútbol</strong>
            <em>Cancha sintética techada, ideal para partidos de hasta 10 jugadores.</em>
          </span>
          <ChevronRight aria-hidden="true" />
        </button>
        <button type="button" className="rmd-service-card" onClick={fallback}>
          <span className="rmd-service-card__icon">🏊</span>
          <span className="rmd-service-card__body">
            <strong>Piscina</strong>
            <em>Piscina climatizada con área de descanso y duchas.</em>
          </span>
          <ChevronRight aria-hidden="true" />
        </button>
        <button type="button" className="rmd-service-card" onClick={fallback}>
          <span className="rmd-service-card__icon">🎉</span>
          <span className="rmd-service-card__body">
            <strong>Salón social</strong>
            <em>Salón para eventos con capacidad para 60 personas.</em>
            <span className="rmd-pill rmd-pill--muted">
              <Lock aria-hidden="true" /> Restringido
            </span>
          </span>
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function ReservaCancha({ back, fallback }: { back: () => void; fallback: () => void }) {
  return (
    <div className="rmd-page">
      <BackLink label="Reservas" onClick={back} />
      <div className="rmd-detail-heading">
        <span className="rmd-detail-heading__icon">⚽</span>
        <h3>Cancha de fútbol</h3>
      </div>
      <p className="rmd-detail-desc">Cancha sintética techada, ideal para partidos de hasta 10 jugadores.</p>
      <div className="rmd-info-row">
        <Clock aria-hidden="true" />
        <strong>17:00 – 21:00</strong> · máx. 3 reserva(s) por residente
      </div>
      <div className="rmd-day-pills">
        {days.map((day) => (
          <button type="button" key={day.num} className={day.label === "Hoy" ? "is-active" : ""} onClick={day.label === "Hoy" ? undefined : fallback}>
            <span>{day.label}</span>
            <strong>{day.num}</strong>
          </button>
        ))}
      </div>
      <h4 style={{ margin: "6px 0 -4px" }}>Horarios disponibles</h4>
      <div className="rmd-legend-row">
        <span>
          <i /> Disponible
        </span>
        <span>
          <i className="dot--green" /> Tu reserva
        </span>
        <span>
          <i className="dot--muted" /> Reservado
        </span>
      </div>
      <p className="rmd-eyebrow">TARDE</p>
      <button type="button" className="rmd-slot" onClick={fallback}>
        17:00-18:00
      </button>
      <p className="rmd-eyebrow">NOCHE</p>
      <div className="rmd-slot-grid">
        <button type="button" className="rmd-slot" onClick={fallback}>
          18:00-19:00
        </button>
        <button type="button" className="rmd-slot" onClick={fallback}>
          19:00-20:00
        </button>
      </div>
      <button type="button" className="rmd-slot" onClick={fallback}>
        20:00-21:00
      </button>
    </div>
  );
}

function Comunidad({ navigate, fallback }: { navigate: (view: View) => void; fallback: () => void }) {
  const announcements = [
    ["Golden Path anuncio 1789067922514", "Publicado por el Golden Path E2E."],
    ["Mantenimiento de piscina", "Este domingo la piscina permanecerá cerrada de 08:00 a 14:00 por mantenimiento."],
    ["Corte de agua", "El jueves habrá corte programado de agua potable de 09:00 a 12:00."],
    ["Reunión de residentes", "Convocatoria a la reunión trimestral el próximo viernes a las 19:00 en el salón social."],
  ];
  return (
    <div className="rmd-page">
      <Heading title="Comunidad" />
      <span className="rmd-badge">4 activos</span>
      <div className="rmd-service-list">
        <button type="button" className="rmd-service-card" onClick={() => navigate("comunidad-map")}>
          <span className="rmd-service-card__icon">
            <Map aria-hidden="true" />
          </span>
          <span className="rmd-service-card__body">
            <strong>Mi comunidad</strong>
            <em>Ver el mapa y tu propiedad</em>
          </span>
          <ChevronRight aria-hidden="true" />
        </button>
        <button type="button" className="rmd-service-card" onClick={() => navigate("comunidad-vecinos")}>
          <span className="rmd-service-card__icon">
            <UsersRound aria-hidden="true" />
          </span>
          <span className="rmd-service-card__body">
            <strong>Entre Vecinos</strong>
            <em>Propón actividades y participa</em>
          </span>
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
      <h4 style={{ margin: "4px 0 -6px" }}>Anuncios</h4>
      <div className="rmd-stack">
        {announcements.map(([title, body]) => (
          <button type="button" className="rmd-card" key={title} onClick={fallback}>
            <span className="rmd-card__icon">📣</span>
            <span className="rmd-card__body">
              <strong>{title}</strong>
              <em>{body}</em>
            </span>
          </button>
        ))}
      </div>
      <div className="rmd-section-row" style={{ marginTop: 4 }}>
        <h4 style={{ margin: 0 }}>Eventos</h4>
      </div>
      <button type="button" className="rmd-text-link" onClick={fallback}>
        Ver 3 eventos anteriores <ChevronDown aria-hidden="true" />
      </button>
      <h4 style={{ margin: "4px 0 -6px" }}>Encuestas</h4>
      <div className="rmd-empty-state rmd-empty-state--compact">
        <BarChart3 aria-hidden="true" />
        <strong>Sin encuestas por ahora</strong>
      </div>
    </div>
  );
}

function ComunidadMap({ back }: { back: () => void }) {
  return (
    <div className="rmd-page">
      <BackLink label="Comunidad" onClick={back} />
      <h3 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 21, fontWeight: 700 }}>Mi comunidad</h3>
      <p className="rmd-detail-desc" style={{ margin: "-4px 0 0" }}>
        Urbanización Los Jardines
      </p>
      <div className="rmd-map-card">
        <div className="rmd-map-grid">
          {["MZ 3", "MZ 4", "MZ 6", "MZ 7"].map((label) => (
            <div className="rmd-map-block" key={label}>
              {label}
            </div>
          ))}
          <div className="rmd-map-block rmd-map-block--amenity">Cancha · Gimnasio · Piscina</div>
          {["MZ 8", "MZ 10", "MZ 11", "MZ 1"].map((label) => (
            <div className="rmd-map-block" key={label}>
              {label}
            </div>
          ))}
          <div className="rmd-map-block rmd-map-block--garita">🚪 Garita</div>
        </div>
        <div className="rmd-map-controls">
          <button type="button" aria-label="Acercar mapa">
            +
          </button>
          <button type="button" aria-label="Alejar mapa">
            −
          </button>
        </div>
        <button type="button" className="rmd-map-recenter">
          <LocateFixed aria-hidden="true" /> Recentrar
        </button>
      </div>
      <h4 style={{ margin: "4px 0 -6px" }}>Leyenda</h4>
      <div className="rmd-legend-card">
        <span>
          <i className="dot-green" /> Tu propiedad
        </span>
        <span>⚽ Cancha de fútbol</span>
        <span>🏋️ Gimnasio</span>
        <span>🏊 Piscina</span>
        <span>🚪 Garita / acceso principal</span>
      </div>
    </div>
  );
}

function ComunidadVecinos({ back, fallback }: { back: () => void; fallback: () => void }) {
  const [tab, setTab] = useState<"publicaciones" | "mias">("publicaciones");
  return (
    <div className="rmd-page">
      <BackLink label="Comunidad" onClick={back} />
      <h3 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 21, fontWeight: 700 }}>Entre Vecinos</h3>
      <p className="rmd-detail-desc" style={{ margin: "-4px 0 0" }}>
        Propón actividades, comparte avisos útiles y participa. La administración revisa cada publicación antes de publicarla.
      </p>
      <div className="rmd-tabbar">
        <button type="button" className={tab === "publicaciones" ? "is-active" : ""} onClick={() => setTab("publicaciones")}>
          Publicaciones
        </button>
        <button type="button" className={tab === "mias" ? "is-active" : ""} onClick={() => setTab("mias")}>
          Mis publicaciones
        </button>
      </div>
      <article className="rmd-note-card">
        <span className="rmd-note-card__title">
          <Heart aria-hidden="true" /> Antes de publicar
        </span>
        <p>Este espacio es para conectar y colaborar entre vecinos. Revisa las reglas de tu comunidad antes de publicar.</p>
        <button type="button" className="rmd-link" onClick={fallback}>
          Ver reglas
        </button>
      </article>
      <button type="button" className="rmd-cta" onClick={fallback}>
        Crear publicación <Plus aria-hidden="true" />
      </button>
      <div className="rmd-empty-state">
        <UsersRound aria-hidden="true" />
        <strong>Todavía no hay publicaciones</strong>
        <p>Cuando un vecino publique algo y la administración lo apruebe, aparecerá aquí.</p>
      </div>
    </div>
  );
}

function Perfil({ navigate, fallback }: { navigate: (view: View) => void; fallback: () => void }) {
  const [nightMode, setNightMode] = useState(false);
  return (
    <div className="rmd-page">
      <Heading title="Perfil" />
      <div className="rmd-profile-head">
        <span className="rmd-profile-head__avatar">RT</span>
        <h3>Resident (Test)</h3>
        <span>Manzana Test · Villa RESIDENT-TEST</span>
        <span>Urbanización Los Jardines</span>
      </div>
      <div className="rmd-contact-card">
        <div>
          <Phone aria-hidden="true" />
        </div>
        <div>
          <Mail aria-hidden="true" /> resident.test@community.dev
        </div>
      </div>
      <div className="rmd-toggle-card">
        <div className="rmd-toggle-row">
          <div>
            <strong>
              <Sun aria-hidden="true" /> Modo noche
            </strong>
            <p>{nightMode ? "Activado" : "Desactivado"}</p>
          </div>
          <button type="button" className={nightMode ? "rmd-switch is-on" : "rmd-switch"} aria-pressed={nightMode} onClick={() => setNightMode((value) => !value)}>
            <span />
          </button>
        </div>
      </div>
      <div className="rmd-settings-list">
        {settingsRows.map(({ icon: Icon, label, view }) => (
          <button type="button" key={label} onClick={() => (view ? navigate(view) : fallback())}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
            <ChevronRight aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

function PerfilReservas({ back, fallback }: { back: () => void; fallback: () => void }) {
  return (
    <div className="rmd-page">
      <Heading title="Mis reservas" back={back} />
      <p className="rmd-eyebrow">PRÓXIMAS</p>
      <p className="rmd-detail-desc" style={{ margin: 0 }}>
        No tienes reservas próximas.
      </p>
      <p className="rmd-eyebrow">ANTERIORES</p>
      <div className="rmd-stack">
        {myReservations.map((reservation, index) => (
          <button type="button" className="rmd-card" key={`${reservation.name}-${index}`} onClick={fallback}>
            <span className="rmd-card__icon">{reservation.name === "Cancha de fútbol" ? "⚽" : "🎉"}</span>
            <span className="rmd-card__body">
              <strong>{reservation.name}</strong>
              <em>{reservation.when}</em>
            </span>
            <span className={reservation.status === "Confirmada" ? "rmd-pill rmd-pill--green" : "rmd-pill rmd-pill--muted"}>{reservation.status}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PerfilEstado({ back, navigate, fallback }: { back: () => void; navigate: (view: View) => void; fallback: () => void }) {
  return (
    <div className="rmd-page">
      <Heading title="Mi estado" back={back} />
      <div className="rmd-status-block">
        <span className="rmd-pill rmd-pill--green">● Al día</span>
        <p className="rmd-status-block__amount">$0.00</p>
        <p className="rmd-status-block__label">Saldo pendiente</p>
        <p className="rmd-status-block__hint">Estás al día con tus alícuotas. Disfruta de todos tus beneficios.</p>
        <button type="button" className="rmd-cta" onClick={() => navigate("perfil-transferencia")}>
          Pagar por transferencia
        </button>
        <button type="button" className="rmd-cta rmd-cta--soft" onClick={() => navigate("perfil-cuentas")}>
          Ver cuentas bancarias
        </button>
      </div>
      <div className="rmd-quota-card">
        <span>Alícuota mensual</span>
        <strong>$95.00</strong>
        <span>Valor personalizado para tu unidad.</span>
      </div>
      <h4 style={{ margin: "4px 0 -6px" }}>Pagos no aprobados</h4>
      <div className="rmd-stack">
        {unpaidPayments.map((payment, index) => (
          <article className="rmd-unpaid-card" key={index}>
            <strong>{payment.amount}</strong>
            <em>No se aprobó este pago</em>
            <small>{payment.reason}</small>
            <button type="button" onClick={fallback}>
              Enviar de nuevo
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

function PerfilTransferencia({ back, fallback }: { back: () => void; fallback: () => void }) {
  const [showAttach, setShowAttach] = useState(false);
  return (
    <div className="rmd-page">
      <Heading title="Reportar transferencia" back={back} />
      <div className="rmd-quota-card">
        <span>Saldo actual</span>
        <strong>$0.00</strong>
      </div>
      <div className="rmd-form">
        <label>
          Monto <em>*</em>
          <input placeholder="0.00" onFocus={fallback} readOnly />
        </label>
        <label>
          Fecha de transferencia <em>*</em>
          <input defaultValue="2026-09-16" onFocus={fallback} readOnly />
        </label>
        <label>
          Comprobante <em>*</em>
          <button
            type="button"
            className="rmd-form-attach"
            onClick={() => {
              setShowAttach(true);
              fallback();
            }}
          >
            <Paperclip aria-hidden="true" /> {showAttach ? "Comprobante adjuntado" : "Adjuntar comprobante"}
          </button>
        </label>
        <label>
          Banco desde el que pagó (opcional)
          <input placeholder="Ej. Pichincha" onFocus={fallback} readOnly />
        </label>
        <label>
          Número/referencia (opcional)
          <input onFocus={fallback} readOnly />
        </label>
        <label>
          Notas (opcional)
          <textarea onFocus={fallback} readOnly />
        </label>
        <button type="button" className="rmd-cta rmd-cta--muted" onClick={fallback}>
          Enviar para revisión
        </button>
      </div>
    </div>
  );
}

function PerfilCuentas({ back }: { back: () => void }) {
  const accounts = [
    { bank: "Banco Pichincha", number: "2201234567", owner: "Minka Los Jardines S.A." },
    { bank: "Banco Pichincha (re-test)", number: "2201234567", owner: "Minka Los Jardines S.A." },
  ];
  return (
    <div className="rmd-page">
      <Heading title="Cuentas bancarias" back={back} />
      <div className="rmd-stack">
        {accounts.map((account, index) => (
          <article className="rmd-bank-card" key={index}>
            <strong>{account.bank}</strong>
            <span>Cuenta corriente</span>
            <div className="rmd-bank-card__number">
              {account.number}
              <button type="button" aria-label="Copiar número de cuenta">
                <Copy aria-hidden="true" />
              </button>
            </div>
            <span>{account.owner}</span>
            <small>Toca el número para copiarlo.</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function PerfilVisitas({ back, fallback }: { back: () => void; fallback: () => void }) {
  return (
    <div className="rmd-page">
      <Heading title="Mis visitas" back={back} />
      <p className="rmd-detail-desc" style={{ margin: 0 }}>
        Genera un acceso para tu visita y compártelo por WhatsApp. En garita solo dice su nombre y el código.
      </p>
      <button type="button" className="rmd-cta" onClick={fallback}>
        Nueva visita <Plus aria-hidden="true" />
      </button>
      <article className="rmd-visit-card">
        <div>
          <strong>Diego Heredia</strong>
          <small>Código de acceso</small>
        </div>
        <div className="rmd-visit-card__actions">
          <span className="rmd-pill rmd-pill--muted">Esperando en garita</span>
          <button type="button" onClick={fallback}>
            Ver acceso
          </button>
          <button type="button" className="is-danger" onClick={fallback}>
            Cancelar
          </button>
        </div>
      </article>
    </div>
  );
}

function PerfilIncidencias({ back, fallback }: { back: () => void; fallback: () => void }) {
  return (
    <div className="rmd-page">
      <Heading title="Mis incidencias" back={back} />
      <p className="rmd-detail-desc" style={{ margin: 0 }}>
        Reporta una situación de tu comunidad (mantenimiento, áreas comunes, ruido, iluminación…) y sigue su estado. Para una emergencia usa el botón de emergencia en tu inicio.
      </p>
      <button type="button" className="rmd-cta" onClick={fallback}>
        Reportar incidencia <Plus aria-hidden="true" />
      </button>
      <div className="rmd-empty-state">
        <ClipboardList aria-hidden="true" />
        <strong>Sin incidencias</strong>
        <p>Cuando reportes algo, aparecerá aquí con su estado.</p>
      </div>
    </div>
  );
}

function PerfilDocumentos({ back }: { back: () => void }) {
  return (
    <div className="rmd-page">
      <Heading title="Documentos" back={back} subtitle="Reglamentos, actas y otra documentación de tu comunidad." />
      <div className="rmd-empty-state">
        <FileText aria-hidden="true" />
        <strong>No hay documentos publicados todavía</strong>
      </div>
    </div>
  );
}

function PerfilNotificaciones({ back, fallback }: { back: () => void; fallback: () => void }) {
  return (
    <div className="rmd-page">
      <Heading title="Notificaciones" back={back} />
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" className="rmd-cta rmd-cta--soft" style={{ width: "auto", padding: "9px 14px" }} onClick={fallback}>
          Marcar todo como leído
        </button>
        <button
          type="button"
          aria-label="Filtrar"
          onClick={fallback}
          style={{ display: "grid", placeItems: "center", width: 34, border: "1px solid var(--rmd-line)", borderRadius: 10, background: "var(--rmd-card)" }}
        >
          <SlidersHorizontal aria-hidden="true" style={{ width: 14, height: 14 }} />
        </button>
      </div>
      {notificationGroups.map((group) => (
        <div className="rmd-notif-group" key={group.date}>
          <p>{group.date}</p>
          {group.items.map((item, index) => {
            const Icon = item.icon;
            return (
              <button type="button" className="rmd-notif" data-tone={item.tone} key={index} onClick={fallback}>
                <span className="rmd-notif__icon">{Icon ? <Icon aria-hidden="true" /> : item.emoji}</span>
                <span className="rmd-notif__body">
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                  <time>{item.time}</time>
                </span>
                <span className="rmd-notif__dot" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function PerfilPreferencias({ back, fallback }: { back: () => void; fallback: () => void }) {
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  return (
    <div className="rmd-page">
      <Heading title="Preferencias de notificaciones" back={back} subtitle="Elige cómo quieres enterarte de novedades." />
      <div className="rmd-toggle-card">
        <div className="rmd-toggle-row">
          <div>
            <strong>Notificaciones push</strong>
            <p>Pagos, reservas y anuncios directamente en tu dispositivo.</p>
          </div>
          <button type="button" className={push ? "rmd-switch is-on" : "rmd-switch"} aria-pressed={push} onClick={() => setPush((value) => !value)}>
            <span />
          </button>
        </div>
        <div className="rmd-toggle-row">
          <div>
            <strong>Notificaciones por correo</strong>
            <p>Todavía no enviamos correos — guardamos tu preferencia para activarlo apenas esté disponible.</p>
          </div>
          <button type="button" className={email ? "rmd-switch is-on" : "rmd-switch"} aria-pressed={email} onClick={() => setEmail((value) => !value)}>
            <span />
          </button>
        </div>
      </div>
      <article className="rmd-note-card">
        <span className="rmd-note-card__title">Este dispositivo</span>
        <p>Activa notificaciones push en este dispositivo.</p>
        <button type="button" className="rmd-link" onClick={fallback}>
          Activar notificaciones push
        </button>
      </article>
    </div>
  );
}

function PerfilPassword({ back, fallback }: { back: () => void; fallback: () => void }) {
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const toggle = (key: keyof typeof show) => setShow((value) => ({ ...value, [key]: !value[key] }));
  const fields: { key: keyof typeof show; label: string; placeholder: string }[] = [
    { key: "current", label: "Contraseña actual", placeholder: "Tu contraseña actual" },
    { key: "next", label: "Nueva contraseña", placeholder: "Mínimo 6 caracteres" },
    { key: "confirm", label: "Confirmar nueva contraseña", placeholder: "Repite la nueva contraseña" },
  ];
  return (
    <div className="rmd-page">
      <Heading title="Cambiar contraseña" back={back} />
      <div className="rmd-form">
        {fields.map((field) => (
          <label key={field.key}>
            {field.label}
            <div className="rmd-form-password">
              <input type={show[field.key] ? "text" : "password"} placeholder={field.placeholder} onFocus={fallback} readOnly />
              <button type="button" aria-label="Mostrar contraseña" onClick={() => toggle(field.key)}>
                {show[field.key] ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </button>
            </div>
          </label>
        ))}
        <button type="button" className="rmd-cta rmd-cta--muted" onClick={fallback}>
          Guardar nueva contraseña
        </button>
      </div>
    </div>
  );
}

function PerfilAyuda({ back, fallback }: { back: () => void; fallback: () => void }) {
  return (
    <div className="rmd-page">
      <Heading title="Ayuda y soporte" back={back} />
      <article className="rmd-help-card">
        <h4>¿Cómo podemos ayudarte?</h4>
        <p>Elige un tema y Minka te muestra, paso a paso, dónde tocar.</p>
        {helpTopics.map(({ icon: Icon, label }) => (
          <button type="button" className="rmd-help-row" key={label} onClick={fallback}>
            <span className="rmd-help-row__icon">
              <Icon aria-hidden="true" />
            </span>
            <strong>{label}</strong>
            <em>
              Ver recorrido <ChevronRight aria-hidden="true" />
            </em>
          </button>
        ))}
      </article>
      <article className="rmd-about-card">
        <p>CONTACTO</p>
        <span style={{ color: "var(--rmd-muted)", fontSize: 10.5 }}>Todavía no hay un canal de soporte configurado para Minka.</span>
      </article>
      <article className="rmd-about-card">
        <p>ACERCA DE</p>
        <div className="rmd-about-row">
          <Info aria-hidden="true" />
          <div>
            <small>Versión</small>
            <strong>1.0.0</strong>
          </div>
        </div>
        <div className="rmd-about-row">
          <Smartphone aria-hidden="true" />
          <div>
            <small>Plataforma</small>
            <strong>web 0.0.0</strong>
          </div>
        </div>
        <div className="rmd-about-row">
          <GitBranch aria-hidden="true" />
          <div>
            <small>Runtime</small>
            <strong>—</strong>
          </div>
        </div>
        <div className="rmd-about-row">
          <Cloud aria-hidden="true" />
          <div>
            <small>Canal de actualización</small>
            <strong>—</strong>
          </div>
        </div>
      </article>
    </div>
  );
}

/**
 * Navigable resident-side mobile demo. Every screen here mirrors a supplied
 * capture 1:1 (Inicio, Reservas, Comunidad, Perfil and their sub-screens).
 * Anything without a capture — individual cards, secondary buttons — surfaces
 * the same "this is a demo" toast used by the admin mobile demo instead of
 * inventing a screen that wasn't provided.
 */
export function ResidentMobileDemo({ commandType, commandToken }: { commandType?: ResidentCommand; commandToken?: number }) {
  const [view, setView] = useState<View>("inicio");
  const [emergencyTaps, setEmergencyTaps] = useState(0);
  const [toast, setToast] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });
  const scrollRef = useRef<HTMLDivElement>(null);
  const commandRef = useRef(commandToken);

  const navigate = (next: View) => {
    setView(next);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const fallback = () => setToast(true);
  const back = () => navigate(backTargetFor[view as DetailView] ?? "inicio");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(false), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (commandToken === undefined || commandToken === commandRef.current) return;
    commandRef.current = commandToken;
    if (commandType === "reservar") navigate("reservas");
    else if (commandType === "estado") navigate("perfil-estado");
    else if (commandType === "comunidad") navigate("comunidad");
    else if (commandType === "visitas") navigate("perfil-visitas");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commandToken, commandType]);

  const tapEmergency = () => {
    setEmergencyTaps((current) => {
      const next = current + 1;
      if (next >= EMERGENCY_TAPS_REQUIRED) {
        window.setTimeout(fallback, 120);
        return 0;
      }
      return next;
    });
  };

  const moveCursor = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setCursor({ x: event.clientX - bounds.left, y: event.clientY - bounds.top, visible: true });
  };

  let content: ReactNode;
  switch (view) {
    case "inicio":
      content = <Inicio navigate={navigate} fallback={fallback} tapEmergency={tapEmergency} emergencyTaps={emergencyTaps} />;
      break;
    case "reservas":
      content = <ReservasList navigate={navigate} fallback={fallback} />;
      break;
    case "reserva-cancha":
      content = <ReservaCancha back={back} fallback={fallback} />;
      break;
    case "comunidad":
      content = <Comunidad navigate={navigate} fallback={fallback} />;
      break;
    case "comunidad-map":
      content = <ComunidadMap back={back} />;
      break;
    case "comunidad-vecinos":
      content = <ComunidadVecinos back={back} fallback={fallback} />;
      break;
    case "perfil":
      content = <Perfil navigate={navigate} fallback={fallback} />;
      break;
    case "perfil-reservas":
      content = <PerfilReservas back={back} fallback={fallback} />;
      break;
    case "perfil-estado":
      content = <PerfilEstado back={back} navigate={navigate} fallback={fallback} />;
      break;
    case "perfil-transferencia":
      content = <PerfilTransferencia back={back} fallback={fallback} />;
      break;
    case "perfil-cuentas":
      content = <PerfilCuentas back={back} />;
      break;
    case "perfil-visitas":
      content = <PerfilVisitas back={back} fallback={fallback} />;
      break;
    case "perfil-incidencias":
      content = <PerfilIncidencias back={back} fallback={fallback} />;
      break;
    case "perfil-documentos":
      content = <PerfilDocumentos back={back} />;
      break;
    case "perfil-notificaciones":
      content = <PerfilNotificaciones back={back} fallback={fallback} />;
      break;
    case "perfil-preferencias":
      content = <PerfilPreferencias back={back} fallback={fallback} />;
      break;
    case "perfil-password":
      content = <PerfilPassword back={back} fallback={fallback} />;
      break;
    case "perfil-ayuda":
      content = <PerfilAyuda back={back} fallback={fallback} />;
      break;
  }

  return (
    <div className="rmd-app" onPointerMove={moveCursor} onPointerLeave={() => setCursor((value) => ({ ...value, visible: false }))}>
      <div ref={scrollRef} className="rmd-scroll">
        {content}
      </div>
      <BottomNav active={mainForView[view]} navigate={navigate} />
      {toast ? (
        <div className="rmd-toast" role="status">
          Esto es una demostración. Agrega tu comunidad aquí.
        </div>
      ) : null}
      <span className="rmd-cursor" data-visible={cursor.visible} style={{ left: cursor.x, top: cursor.y }} aria-hidden="true" />
    </div>
  );
}
