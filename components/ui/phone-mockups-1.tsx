import {
  type ImageItem,
  PhoneCarousel,
} from "@/components/ui/phone-mockups-1-utils/phone-carousel";

const exampleImages: ImageItem[] = [
  {
    src: "https://res.cloudinary.com/harshitproject/image/upload/v1746774805/Behance-screen.png",
    alt: "Vista temporal uno de la aplicación",
    eyebrow: "Vista principal",
    title: "Todo lo importante, en un solo lugar.",
    description:
      "Texto provisional para explicar esta pantalla y el valor que aporta dentro de la experiencia Minka.",
  },
  {
    src: "https://res.cloudinary.com/harshitproject/image/upload/v1746774805/Notion-screen.png",
    alt: "Vista temporal dos de la aplicación",
    eyebrow: "Administración",
    title: "Decisiones claras para cada día.",
    description:
      "Este contenido cambiará junto con la captura activa. Más adelante definiremos el copy definitivo.",
  },
  {
    src: "https://res.cloudinary.com/harshitproject/image/upload/v1746774806/One-screen.png",
    alt: "Vista temporal tres de la aplicación",
    eyebrow: "Comunidad",
    title: "Una experiencia simple para residentes.",
    description:
      "Aquí podremos describir una función concreta de la aplicación usando las capturas reales de Minka.",
  },
  {
    src: "https://res.cloudinary.com/harshitproject/image/upload/v1746774807/Reddit-nj7hwh.png",
    alt: "Vista temporal cuatro de la aplicación",
    eyebrow: "Operación",
    title: "Menos seguimiento manual.",
    description:
      "Texto temporal para la cuarta pantalla. El carrusel admite más vistas sin cambiar su funcionamiento.",
  },
];

export default function PhoneMockupBasic() {
  return <PhoneCarousel images={exampleImages} />;
}
