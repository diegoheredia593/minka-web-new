import { ScaleLetterText } from "@/components/ui/text-animation";

const legalLinks = [
  { label: "Términos y Condiciones", href: "/legal/terminos" },
  { label: "Política de Privacidad", href: "/legal/privacidad" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="section-shell site-footer__inner">
        <div className="site-footer__brand">
          <ScaleLetterText text="Minka" className="site-footer__animated-word" />
          <small>Comunidades mejor organizadas.</small>
        </div>
        <nav aria-label="Páginas legales">
          {legalLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <a className="site-footer__credit" href="https://bebrand.dev" target="_blank" rel="noreferrer">
          Desarrollado por <strong>bebrand.dev</strong>
        </a>
      </div>
    </footer>
  );
}
