"use client";

import { FlowButton } from "@/components/ui/flow-button";
import { Pricing, type PricingPlan } from "@/components/ui/pricing";
import { SiteHeader } from "@/components/site-header";

// Every plan CTA points back to the demo form on the landing page,
// since that's the only place a request is actually captured today.
const pricingPlans: PricingPlan[] = [
  {
    name: "Esencial",
    price: 49,
    yearlyPrice: 39,
    period: "mes",
    features: ["Gestión de residentes", "Comunicados", "Reservas básicas", "Soporte estándar"],
    description: "Una base simple para comenzar a organizar la comunidad.",
    buttonText: "Solicitar información",
    href: "/#demo",
  },
  {
    name: "Comunidad",
    price: 99,
    yearlyPrice: 79,
    period: "mes",
    features: [
      "Todo en Esencial",
      "Cobranzas",
      "Control de accesos",
      "Reportes",
      "Soporte prioritario",
    ],
    description: "La experiencia completa para administraciones en crecimiento.",
    buttonText: "Agendar una demo",
    href: "/#demo",
    isPopular: true,
  },
  {
    name: "A medida",
    price: 199,
    yearlyPrice: 159,
    period: "mes",
    features: [
      "Todo en Comunidad",
      "Configuración avanzada",
      "Acompañamiento",
      "Integraciones",
      "Condiciones personalizadas",
    ],
    description: "Para comunidades con procesos y necesidades particulares.",
    buttonText: "Conversemos",
    href: "/#demo",
  },
];

export function PlanesPage() {
  return (
    <div className="minka-site">
      <SiteHeader />

      <main>
        <section className="pricing-section" aria-label="Planes de Minka">
          <Pricing plans={pricingPlans} />
        </section>

        <section className="planes-demo-cta">
          <div className="section-shell planes-demo-cta__inner">
            <h2>¿Quieres saber cómo funciona?</h2>
            <p>Mira este demo en vivo.</p>
            {/* Not wired up yet — will open the live demo once it's ready. */}
            <FlowButton tone="light" text="Ver demo en vivo" />
          </div>
        </section>
      </main>
    </div>
  );
}
