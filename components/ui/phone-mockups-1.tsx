import {
  type ImageItem,
  PhoneCarousel,
} from "@/components/ui/phone-mockups-1-utils/phone-carousel";

const exampleImages: ImageItem[] = [
  {
    src: "/hero-mobile/hero-dashboard.png",
    alt: "Panel principal de administración en Minka",
    eyebrow: "Vista principal",
    title: "Todo lo importante, en un solo lugar.",
    description:
      "Alertas de cobranza y reservas, tu recaudación del mes y el estado de tu comunidad — todo en una sola pantalla al abrir la app.",
  },
  {
    src: "/hero-mobile/hero-cobranza.png",
    alt: "Pantalla de cobranza en Minka",
    eyebrow: "Cobranza",
    title: "Decisiones claras para cada día.",
    description: "Genera alícuotas, filtra por estado de pago y da seguimiento a cada villa sin salir de la pantalla.",
  },
  {
    src: "/hero-mobile/hero-residentes.png",
    alt: "Directorio de residentes en Minka",
    eyebrow: "Residentes",
    title: "Una experiencia simple para tu comunidad.",
    description:
      "Directorio completo de residentes con su estado de cuenta, más las solicitudes de acceso pendientes de aprobar.",
  },
  {
    src: "/hero-mobile/hero-comunidad.png",
    alt: "Anuncios y eventos de la comunidad en Minka",
    eyebrow: "Comunidad",
    title: "Menos seguimiento manual.",
    description: "Publica anuncios y eventos, y consulta el mapa de tu urbanización — todo desde un mismo lugar.",
  },
];

export default function PhoneMockupBasic() {
  return <PhoneCarousel images={exampleImages} />;
}
