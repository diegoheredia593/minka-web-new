"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Home,
  ShieldCheck,
  TriangleAlert,
  UserPlus,
  UserRound,
  UsersRound,
  Wallet,
  Zap,
} from "lucide-react";

const EMERGENCY_TAPS_REQUIRED = 5;

const quickActions = [
  { label: "Reservar", icon: CalendarDays },
  { label: "Mi estado", icon: Wallet },
  { label: "Comunidad", icon: UsersRound },
  { label: "Visitas", icon: UserPlus },
] as const;

const reservations = [
  { name: "Salón social", when: "jueves, 31 de diciembre · 09:00 — 10:00", status: "Cancelada" },
  { name: "Salón social", when: "sábado, 26 de diciembre · 09:00 — 10:00", status: "Cancelada" },
];

const benefits = [
  { icon: "⚽", name: "Cancha de fútbol", status: "Disponible" },
  { icon: "🏊", name: "Piscina", status: "Disponible" },
];

const navItems = [
  { id: "inicio", label: "Inicio", icon: Zap },
  { id: "reservas", label: "Reservas", icon: CalendarDays },
  { id: "comunidad", label: "Comunidad", icon: UsersRound },
  { id: "perfil", label: "Perfil", icon: UserRound },
] as const;

/**
 * Navigable resident-side mobile demo. Only the "Inicio" screen exists today
 * (it mirrors the supplied capture 1:1). Every other tap — bottom nav items,
 * quick actions, cards — surfaces the same "this is a demo" toast used by
 * the admin mobile demo instead of inventing a screen that wasn't provided.
 */
export function ResidentMobileDemo({ pulse }: { pulse?: number }) {
  const [emergencyTaps, setEmergencyTaps] = useState(0);
  const [toast, setToast] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });
  const scrollRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef(pulse);

  const fallback = () => setToast(true);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(false), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (pulse === undefined || pulse === pulseRef.current) return;
    pulseRef.current = pulse;
    fallback();
  }, [pulse]);

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

  return (
    <div
      className="rmd-app"
      onPointerMove={moveCursor}
      onPointerLeave={() => setCursor((value) => ({ ...value, visible: false }))}
    >
      <div ref={scrollRef} className="rmd-scroll">
        <div className="rmd-page">
          <div className="rmd-greeting">
            <div className="rmd-greeting__avatar">RT</div>
            <div className="rmd-greeting__text">
              <h3>Buenos días, Resident</h3>
              <span className="rmd-greeting__unit">
                <Home aria-hidden="true" /> Manzana Test · Villa RESIDENT-TEST
              </span>
            </div>
            <button type="button" className="rmd-bell" aria-label="Notificaciones" onClick={fallback}>
              <Bell aria-hidden="true" />
              <span className="rmd-bell__badge">9+</span>
            </button>
          </div>

          <button
            type="button"
            className="rmd-emergency"
            onClick={tapEmergency}
            aria-label="Emergencia, toca 5 veces para activar"
          >
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
            <button type="button" className="rmd-account__cta" onClick={fallback}>
              Ver mi estado <ChevronRight aria-hidden="true" />
            </button>
          </article>

          <div className="rmd-quick-grid">
            {quickActions.map(({ label, icon: Icon }) => (
              <button type="button" className="rmd-quick" key={label} onClick={fallback}>
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
            <button type="button" onClick={fallback}>
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
      </div>

      <nav className="rmd-bottom-nav" aria-label="Navegación de la demostración">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.id === "inicio";
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={active ? undefined : fallback}
            >
              <Icon aria-hidden="true" />
              <span>{active ? item.label : ""}</span>
            </button>
          );
        })}
      </nav>

      {toast ? (
        <div className="rmd-toast" role="status">
          Esto es una demostración. Agrega tu comunidad aquí.
        </div>
      ) : null}
      <span className="rmd-cursor" data-visible={cursor.visible} style={{ left: cursor.x, top: cursor.y }} aria-hidden="true" />
    </div>
  );
}
