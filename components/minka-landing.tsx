"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  FileSpreadsheet,
  Inbox,
  KeyRound,
  MapPinned,
  MessageCircle,
  ReceiptText,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  UsersRound,
} from "lucide-react";

import { FlowButton } from "@/components/ui/flow-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LiveDemo } from "@/components/live-demo";
import { SectionIntro } from "@/components/section-intro";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Textarea } from "@/components/ui/textarea";

const problemItems = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    text: "Avisos, reclamos y comprobantes mezclados en conversaciones.",
  },
  {
    icon: FileSpreadsheet,
    title: "Excel",
    text: "Listas de residentes, saldos y unidades que se actualizan a mano.",
  },
  {
    icon: ReceiptText,
    title: "Comprobantes",
    text: "Pagos que llegan por chat y cuesta reconciliar con cada villa.",
  },
  {
    icon: CalendarClock,
    title: "Reservas",
    text: "Horarios administrados entre llamadas, mensajes y confirmaciones.",
  },
  {
    icon: Inbox,
    title: "Solicitudes",
    text: "Accesos y pendientes repartidos entre personas del equipo.",
  },
];

const definitionItems = [
  {
    icon: Building2,
    title: "Producto para administraciones",
    text: "La comunidad o administración contrata Minka para ordenar su operación diaria.",
  },
  {
    icon: Smartphone,
    title: "Admin y residente conectados",
    text: "El equipo gestiona procesos y los residentes consultan, pagan, reservan y se informan.",
  },
  {
    icon: MapPinned,
    title: "Diseñada para Ecuador",
    text: "Pensada para urbanizaciones, condominios y edificios que necesitan control claro.",
  },
];

const controlItems = [
  {
    icon: KeyRound,
    title: "Acceso verificado",
    text: "Crear una cuenta no significa entrar automáticamente a una comunidad.",
  },
  {
    icon: UsersRound,
    title: "Residentes por unidad",
    text: "Una unidad puede incluir propietarios, arrendatarios y familiares.",
  },
  {
    icon: SlidersHorizontal,
    title: "Funciones configurables",
    text: "Activa lo que la comunidad necesita y evita módulos innecesarios.",
  },
  {
    icon: ShieldCheck,
    title: "Permisos por equipo",
    text: "Delega tareas sin entregar acceso total a toda la operación.",
  },
];

const onboardingSteps = [
  {
    title: "Configurar comunidad",
    detail: "Nombre, torres o manzanas y datos base, listos en minutos.",
  },
  {
    title: "Importar unidades",
    detail: "Sube tu Excel de propietarios y residentes; nosotros migramos la información.",
  },
  {
    title: "Personalizar",
    detail: "Logo, colores y comunicados con la identidad de tu comunidad.",
  },
  {
    title: "Invitar residentes",
    detail: "Cada residente recibe su acceso por correo o WhatsApp.",
  },
  {
    title: "Lanzar",
    detail: "Tu comunidad opera en Minka, con acompañamiento durante las primeras semanas.",
  },
];

export function MinkaLanding() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [formStatus, setFormStatus] = useState<
    "idle" | "submitting" | "success" | "partial" | "error"
  >("idle");

  const submitDemoRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    // Honeypot: bots tend to fill hidden fields, people never see this one.
    if (formData.get("website")) {
      setFormStatus("success");
      form.reset();
      return;
    }

    setFormStatus("submitting");

    const values = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      units: String(formData.get("units") ?? ""),
      community: String(formData.get("community") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    try {
      const response = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          pageName: document.title,
          pageUri: window.location.href,
        }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        mode?: "crm" | "forms" | "partial" | "ignored";
      };

      if (!response.ok || !result.ok) {
        throw new Error("HubSpot rejected the submission");
      }

      form.reset();
      setFormStatus(result.mode === "partial" ? "partial" : "success");
    } catch {
      setFormStatus("error");
    }
  };

  useEffect(() => {
    let cleanup = () => {};

    async function animatePage() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (!rootRef.current) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
          gsap.from(element, {
            y: 34,
            opacity: 0,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 82%",
              once: true,
            },
          });
        });
      }, rootRef);

      cleanup = () => ctx.revert();
    }

    void animatePage();

    return () => cleanup();
  }, []);

  return (
    <div ref={rootRef} className="minka-site">
      <SiteHeader />

      <main>
        <div id="inicio">
          <LiveDemo />
        </div>

        <section className="problem-section" aria-labelledby="problema-title">
          <div className="section-shell problem-layout">
            <div className="problem-copy" data-reveal>
              <p className="eyebrow">El problema</p>
              <h2 id="problema-title">
                La operación se fragmenta cuando cada tarea vive en una herramienta distinta.
              </h2>
              <p>
                Mensajes, pagos, reservas y solicitudes avanzan por canales separados. La
                administración termina persiguiendo información en vez de tomar decisiones.
              </p>
            </div>

            <div className="operations-map" data-reveal>
              <div className="operations-map__header">
                <span>Hoy</span>
                <small>Procesos separados</small>
              </div>
              <div className="operations-map__grid">
                {problemItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title}>
                      <Icon aria-hidden="true" />
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.text}</small>
                      </span>
                    </article>
                  );
                })}
              </div>
              <div className="operations-map__bridge" aria-hidden="true">
                <span />
                <ArrowRight />
                <span />
              </div>
              <article className="operations-map__minka">
                <div>
                  <Building2 aria-hidden="true" />
                  <strong>Minka</strong>
                </div>
                <p>
                  Un solo espacio para residentes, pagos, reservas, solicitudes y comunicación.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="definition-section" aria-labelledby="minka-title">
          <div className="section-shell definition-grid">
            <div className="definition-copy" data-reveal>
              <p className="eyebrow">Qué es</p>
              <h2 id="minka-title">El sistema operativo de tu comunidad.</h2>
              <p>
                Minka conecta lo que hace la administración con lo que necesitan los residentes:
                pagos, reservas, comunicados, accesos, unidades, personal y más.
              </p>
              <div className="definition-signal" aria-label="Minka conecta administración, residentes y comunidad">
                <span>Admin</span>
                <span>Residentes</span>
                <span>Comunidad</span>
              </div>
            </div>
            <div className="definition-points">
              {definitionItems.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} data-reveal>
                    <span className="definition-point__icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="control-section" aria-labelledby="control-title">
          <div className="section-shell">
            <SectionIntro
              id="control-title"
              eyebrow="Acceso y control"
              title="Tu comunidad decide quién entra y quién puede hacer qué."
              text="Minka separa cuenta, acceso a comunidad y relación con una unidad para que la administración conserve el control."
            />
            <div className="control-grid">
              {controlItems.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} data-reveal>
                    <Icon aria-hidden="true" />
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="piloto" className="onboarding-section">
          <div className="section-shell onboarding-layout">
            <div className="onboarding-intro">
              <SectionIntro
                eyebrow="Onboarding"
                title="Nosotros te ayudamos a empezar."
                text="No tienes que reconstruir tu comunidad desde cero. Minka puede ayudarte a organizar la información existente y poner la operación en marcha."
              />
              <span className="onboarding-note" data-reveal>
                Implementación guiada · sin instalaciones
              </span>
              <div className="onboarding-motion" data-reveal aria-hidden="true">
                <video autoPlay muted loop playsInline preload="metadata">
                  <source src="/brand/minka-login-bg-720p.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
            <div className="onboarding-steps">
              {onboardingSteps.map((step, index) => (
                <div key={step.title} data-reveal>
                  <span>{index + 1}</span>
                  <div>
                    <p>{step.title}</p>
                    <small>{step.detail}</small>
                  </div>
                </div>
              ))}
            </div>
            <FlowButton href="#demo" text="Agenda tu onboarding" className="onboarding-cta" />
          </div>
        </section>

        <section id="demo" className="demo-section">
          <div className="section-shell demo-layout">
            <div data-reveal>
              <p className="eyebrow">Primeras comunidades piloto</p>
              <h2>Descubre cómo se vería Minka en tu comunidad.</h2>
              <p>
                Estamos abriendo los primeros pilotos con comunidades en Guayaquil y Ecuador. Si
                administras una urbanización, condominio o edificio, queremos conversar contigo.
              </p>
              <div className="demo-proof">
                <Building2 aria-hidden="true" />
                <span>Cupos limitados para pilotos y demos iniciales.</span>
              </div>
            </div>

            <form
              className="demo-form"
              data-reveal
              onSubmit={submitDemoRequest}
            >
              <div className="form-honeypot" aria-hidden="true">
                <Label htmlFor="website">Sitio web</Label>
                <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <div className="field-row">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" name="name" placeholder="Tu nombre" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
                </div>
              </div>
              <div className="field-row">
                <div>
                  <Label htmlFor="phone">WhatsApp</Label>
                  <Input id="phone" name="phone" placeholder="+593" />
                </div>
                <div>
                  <Label htmlFor="units">Unidades</Label>
                  <Input id="units" name="units" placeholder="Ej. 120" />
                </div>
              </div>
              <div>
                <Label htmlFor="community">Comunidad</Label>
                <Input
                  id="community"
                  name="community"
                  placeholder="Urbanización, condominio o edificio"
                />
              </div>
              <div>
                <Label htmlFor="message">Qué te gustaría ordenar primero</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Reservas, pagos, comunicación, residentes..."
                />
              </div>
              <FlowButton
                tone="light"
                type="submit"
                disabled={formStatus === "submitting"}
                text={formStatus === "submitting" ? "Enviando..." : "Solicitar una demostración"}
                className="w-full justify-center"
              />
              <div className="form-status" role="status" aria-live="polite">
                {formStatus === "success" ? (
                  <p>Recibimos tu solicitud. Te contactaremos muy pronto.</p>
                ) : null}
                {formStatus === "partial" ? (
                  <p>
                    Recibimos tus datos de contacto. Te contactaremos para completar la información.
                  </p>
                ) : null}
                {formStatus === "error" ? (
                  <p className="form-status--error">
                    No pudimos enviar la solicitud. Revisa los datos e inténtalo nuevamente.
                  </p>
                ) : null}
              </div>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
