"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Building2,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  KeyRound,
  Megaphone,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";

import { FlowButton } from "@/components/ui/flow-button";
import { Input } from "@/components/ui/input";
import { Iphone16Pro } from "@/components/ui/iphone-16-pro";
import { Label } from "@/components/ui/label";
import { LiveDemo } from "@/components/live-demo";
import { MacbookPro } from "@/components/ui/macbook-pro";
import { SectionIntro } from "@/components/section-intro";
import { SiteHeader } from "@/components/site-header";
import { Textarea } from "@/components/ui/textarea";
import PhoneMockupBasic from "@/components/ui/phone-mockups-1";

const problemItems = [
  "Grupos de WhatsApp",
  "Hojas de Excel",
  "Comprobantes por chat",
  "Reservas manuales",
  "Solicitudes dispersas",
];

const adminFocus = [
  { icon: CheckCircle2, label: "Pagos por revisar" },
  { icon: KeyRound, label: "Solicitudes de acceso" },
  { icon: CalendarCheck2, label: "Reservas próximas" },
  { icon: CircleDollarSign, label: "Unidades con valores pendientes" },
  { icon: Megaphone, label: "Comunicados y eventos" },
];

const residentActions = [
  "Consultar valores pendientes",
  "Enviar comprobantes",
  "Reservar espacios",
  "Ver anuncios y eventos",
  "Recibir notificaciones relevantes",
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

const communityVariants = [
  {
    name: "Bosques del Sol",
    initials: "BS",
    color: "#245b4f",
    detail: "Logo y colores propios en cada aviso, recibo y pantalla de acceso.",
  },
  {
    name: "Vista Río",
    initials: "VR",
    color: "#4b8194",
    detail: "Misma app, misma velocidad — solo cambia la identidad visual.",
  },
  {
    name: "Los Ceibos Park",
    initials: "LC",
    color: "#c66f4a",
    detail: "Nombre, marca y comunicados adaptados sin perder funcionalidad.",
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

function VisualPlaceholder({
  label,
  title,
  detail,
  format,
  shape = "desktop",
}: {
  label: string;
  title: string;
  detail: string;
  format: string;
  shape?: "desktop" | "mobile" | "wide";
}) {
  // Desktop captures are framed in a MacBook until real screenshots land;
  // no fabricated app content goes inside, just the copy that was already there.
  if (shape === "desktop") {
    return (
      <div className="visual-placeholder visual-placeholder--desktop" data-reveal>
        <div className="visual-placeholder__meta">{label}</div>
        <div className="visual-placeholder__device">
          <MacbookPro className="visual-placeholder__device-frame" />
          <div className="visual-placeholder__device-screen">
            <p>{title}</p>
            <span>{detail}</span>
          </div>
        </div>
        <div className="visual-placeholder__format">{format}</div>
      </div>
    );
  }

  // Mobile captures are framed in an iPhone until real screenshots land;
  // same rule as desktop, no fabricated app content inside.
  if (shape === "mobile") {
    return (
      <div className="visual-placeholder visual-placeholder--mobile" data-reveal>
        <div className="visual-placeholder__meta">{label}</div>
        <div className="visual-placeholder__device visual-placeholder__device--phone">
          <Iphone16Pro className="visual-placeholder__device-frame" />
          <div className="visual-placeholder__device-screen">
            <p>{title}</p>
            <span>{detail}</span>
          </div>
        </div>
        <div className="visual-placeholder__format">{format}</div>
      </div>
    );
  }

  return (
    <div className={`visual-placeholder visual-placeholder--${shape}`} data-reveal>
      <div className="visual-placeholder__meta">{label}</div>
      <div className="visual-placeholder__frame">
        <div>
          <p>{title}</p>
          <span>{detail}</span>
        </div>
      </div>
      <div className="visual-placeholder__format">{format}</div>
    </div>
  );
}

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

    const compact = (fields: { name: string; value: string }[]) =>
      fields.filter((field) => field.value.trim().length > 0);

    const fieldSets = [
      compact([
        { name: "firstname", value: values.name },
        { name: "email", value: values.email },
        { name: "phone", value: values.phone },
        { name: "numero_de_unidades", value: values.units },
        { name: "nombre_de_la_comunidad", value: values.community },
        { name: "necesidad_principal", value: values.message },
      ]),
      compact([
        { name: "firstname", value: values.name },
        { name: "email", value: values.email },
        { name: "whatsapp", value: values.phone },
        { name: "unidades", value: values.units },
        { name: "comunidad", value: values.community },
        { name: "que_te_gustaria_ordenar_primero", value: values.message },
      ]),
      compact([
        { name: "firstname", value: values.name },
        { name: "email", value: values.email },
        { name: "phone", value: values.phone },
        { name: "units", value: values.units },
        { name: "community", value: values.community },
        { name: "message", value: values.message },
      ]),
      compact([
        { name: "firstname", value: values.name },
        { name: "email", value: values.email },
        { name: "phone", value: values.phone },
      ]),
    ];

    try {
      let acceptedFieldSet = -1;

      for (let index = 0; index < fieldSets.length; index += 1) {
        const response = await fetch(
          "https://api.hsforms.com/submissions/v3/integration/submit/51970751/d2cac2e3-232c-47f8-9f21-3856a09a2dfd",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              submittedAt: String(Date.now()),
              fields: fieldSets[index],
              context: {
                pageName: document.title,
                pageUri: window.location.href,
              },
            }),
          },
        );

        if (response.ok) {
          acceptedFieldSet = index;
          break;
        }

        if (response.status !== 400) throw new Error("HubSpot rejected the submission");
      }

      if (acceptedFieldSet === -1) throw new Error("HubSpot rejected every field mapping");

      form.reset();
      setFormStatus(acceptedFieldSet === fieldSets.length - 1 ? "partial" : "success");
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
        gsap.from("[data-hero]", {
          y: 26,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1,
        });

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
        <section id="inicio" className="hero-section">
          <div className="hero-content">
            <p data-hero className="eyebrow">
              Plataforma para comunidades residenciales
            </p>
            <h1 data-hero>Tu comunidad, mejor organizada.</h1>
            <p data-hero className="hero-copy">
              Administra residentes, reservas, cobranzas y comunicación desde un solo lugar, con una
              experiencia simple para la administración y para quienes viven en la comunidad.
            </p>
            <div data-hero className="hero-actions">
              <FlowButton href="#demo" text="Agenda una demostración" className="px-7 py-3.5" />
              <a className="secondary-link" href="#piloto">
                Postular mi comunidad al piloto
              </a>
            </div>
          </div>

          <div className="hero-phone-showcase" data-hero>
            <p>Explora la experiencia de Minka</p>
            <PhoneMockupBasic />
          </div>
        </section>

        <section className="problem-section" aria-labelledby="problema-title">
          <div className="section-shell problem-layout">
            <div data-reveal>
              <p className="eyebrow">El problema</p>
              <h2 id="problema-title">
                Administrar una comunidad no debería significar administrar diez herramientas.
              </h2>
              <p>
                Hoy muchas comunidades operan entre mensajes, hojas de cálculo, transferencias,
                comprobantes enviados por chat, llamadas y anuncios que se pierden.
              </p>
            </div>

            <div className="convergence-map" data-reveal>
              {problemItems.map((item) => (
                <span key={item}>{item}</span>
              ))}
              <strong>Minka</strong>
            </div>
          </div>
        </section>

        <section className="definition-section" aria-labelledby="minka-title">
          <div className="section-shell definition-grid">
            <SectionIntro
              id="minka-title"
              eyebrow="Qué es"
              title="La interfaz digital de tu comunidad."
              text="Minka conecta la operación diaria de la administración con la experiencia cotidiana de los residentes: pagos, reservas, comunicados, solicitudes de acceso, unidades, personal y más."
            />
            <div className="definition-points">
              {[
                ["B2B SaaS", "La comunidad o administración es el comprador."],
                ["Admin + residente", "Ambos lados viven dentro de una misma experiencia."],
                [
                  "Guayaquil primero",
                  "Pensada para urbanizaciones, condominios y edificios en Ecuador.",
                ],
              ].map(([title, text]) => (
                <article key={title} data-reveal>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="administracion" className="admin-section" aria-labelledby="admin-title">
          <div className="section-shell two-column">
            <div>
              <SectionIntro
                id="admin-title"
                eyebrow="Para administradores"
                title="Menos seguimiento manual. Más claridad sobre lo que requiere atención."
                text="El dashboard de Minka debe sentirse como un centro de atención y acción, no como una colección de estadísticas decorativas."
              />
              <div className="attention-list" data-reveal>
                {adminFocus.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label}>
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <VisualPlaceholder
              label="Visual principal de administración"
              title="Espacio para captura o motion del dashboard Admin"
              detail="Debe mostrar una sección prominente: Requiere tu atención."
              format="Desktop 16:10"
            />
          </div>
        </section>

        <section id="residentes" className="resident-section" aria-labelledby="residentes-title">
          <div className="section-shell resident-layout">
            <VisualPlaceholder
              label="Visual de residente"
              title="Espacio para home móvil del residente"
              detail="Aquí irán capturas de estado financiero, reservas y comunidad."
              format="Mobile 9:19"
              shape="mobile"
            />
            <div>
              <SectionIntro
                id="residentes-title"
                eyebrow="Para residentes"
                title="Una aplicación que tus residentes sí entienden."
                text="Los residentes pueden encontrar lo importante sin buscar mensajes antiguos ni preguntar por cada proceso."
              />
              <ul className="resident-actions" data-reveal>
                {residentActions.map((action) => (
                  <li key={action}>
                    <CheckCircle2 aria-hidden="true" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="reservation-section" aria-labelledby="reservas-title">
          <div className="section-shell section-stack">
            <SectionIntro
              id="reservas-title"
              eyebrow="Reservas"
              title="Reservar un espacio debería tomar segundos, no mensajes."
              text="El residente elige espacio, fecha y horario disponible. La administración mantiene visibilidad sobre lo que está reservado."
            />
            <div className="feature-visual-row">
              <VisualPlaceholder
                label="Flujo de reserva"
                title="Espacio para video corto de reserva"
                detail="Secuencia sugerida: espacio, fecha, horario, confirmación."
                format="Mobile motion 9:19"
                shape="mobile"
              />
              <div className="flow-copy" data-reveal>
                {["Espacio", "Fecha", "Horario disponible", "Confirmación"].map((item, index) => (
                  <div key={item}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="cobranzas" className="collections-section" aria-labelledby="cobranzas-title">
          <div className="section-shell section-stack">
            <SectionIntro
              id="cobranzas-title"
              eyebrow="Cobranzas"
              title="Más claridad para cobrar. Más claridad para pagar."
              text="La comunidad conserva su cuenta bancaria. El residente paga como siempre, envía su comprobante desde Minka y la administración lo aprueba o rechaza desde un solo lugar."
            />
            <div className="paired-placeholders">
              <VisualPlaceholder
                label="Admin"
                title="Espacio para captura de comprobantes por revisar"
                detail="Vista sugerida: pendiente, recaudado, tasa de cobranza y pagos por revisar."
                format="Desktop 16:10"
              />
              <VisualPlaceholder
                label="Residente"
                title="Espacio para captura de pago aprobado"
                detail="Vista sugerida: valores pendientes, cómo pagar y comprobantes enviados."
                format="Mobile 9:19"
                shape="mobile"
              />
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

        <section className="communication-section" aria-labelledby="com-title">
          <div className="section-shell two-column">
            <div>
              <SectionIntro
                id="com-title"
                eyebrow="Comunicación"
                title="La información importante deja de perderse."
                text="Anuncios, eventos y notificaciones viven en un canal oficial, claro y útil. Sin convertir la comunidad en una red social."
              />
              <div className="quote-strip" data-reveal>
                Notificar cuando importa. No notificar por notificar.
              </div>
            </div>
            <VisualPlaceholder
              label="Comunidad"
              title="Espacio para captura de anuncios y notificaciones"
              detail="Puede ser una captura fija o una microanimación de publicación oficial."
              format="Mobile + desktop"
            />
          </div>
        </section>

        <section className="custom-section" aria-labelledby="custom-title">
          <div className="section-shell section-stack">
            <SectionIntro
              id="custom-title"
              eyebrow="Personalización"
              title="Minka se adapta a tu comunidad sin perder simplicidad."
              text="Cada comunidad puede incorporar su nombre, logo, colores e información propia, manteniendo una experiencia consistente y fácil de usar."
            />
            <div className="community-variants">
              {communityVariants.map((variant) => (
                <div
                  key={variant.name}
                  data-reveal
                  style={{ "--variant-color": variant.color } as CSSProperties}
                >
                  <span className="community-variants__mark">{variant.initials}</span>
                  <strong>{variant.name}</strong>
                  <p>{variant.detail}</p>
                </div>
              ))}
              <div className="community-variants__ghost" data-reveal>
                <span>+</span>
                <strong>Tu comunidad aquí</strong>
                <p>Se configura en minutos durante el onboarding.</p>
              </div>
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

        <LiveDemo />

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
    </div>
  );
}
