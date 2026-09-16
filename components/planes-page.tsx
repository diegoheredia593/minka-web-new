"use client";

import { FlowButton } from "@/components/ui/flow-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function PlanesPage() {
  return (
    <div className="minka-site">
      <SiteHeader />

      <main>
        <section className="planes-demo-cta">
          <div className="section-shell planes-demo-cta__inner">
            <p className="eyebrow">Minka para tu comunidad</p>
            <h2>Una propuesta que se adapta a tu operación.</h2>
            <p>
              Cada urbanización, condominio y edificio tiene una capacidad, procesos y prioridades
              distintos. Conversemos para entender tu comunidad y preparar una propuesta a medida.
            </p>
            <FlowButton href="/#demo" tone="light" text="Conoce Minka para tu comunidad" />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
