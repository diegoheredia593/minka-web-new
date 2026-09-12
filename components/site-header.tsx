"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { FlowButton } from "@/components/ui/flow-button";

type NavItem = {
  label: string;
  href: string;
  archived?: boolean;
};

const navItems: NavItem[] = [
  { label: "El problema", href: "/#problema-title" },
  { label: "Cómo funciona", href: "/#minka-title" },
  { label: "Live demo", href: "/#live-demo" },
  { label: "Onboarding", href: "/#piloto" },
  { label: "Planes", href: "/planes", archived: true },
];

const visibleNavItems = navItems.filter((item) => !item.archived);

/**
 * Shared site header/nav, used on the landing page and on standalone
 * routes (e.g. /planes). Every link is an absolute path so it resolves
 * correctly no matter which page it's rendered on: "/#anchor" jumps to
 * a landing-page section (navigating home first if needed), "/planes"
 * goes to the dedicated plans page.
 */
export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    const closeOnDesktopResize = () => {
      if (window.innerWidth > 980) setIsMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnDesktopResize);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnDesktopResize);
    };
  }, [isMenuOpen]);

  return (
    <header className="site-header">
      <a className="brand" href="/#inicio" aria-label="Ir al inicio de Minka">
        <img className="brand-logo" src="/brand/minka-lockup.svg" alt="Minka" />
      </a>

      <nav aria-label="Secciones de Minka">
        {visibleNavItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <FlowButton
          href="/#demo"
          text="Agenda una demo"
          className="header-flow-cta px-6 py-2.5 text-[0.9rem]"
        />
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {isMenuOpen ? (
        <nav
          id="mobile-nav"
          className="mobile-nav animate-in fade-in slide-in-from-top-2 duration-200"
          aria-label="Secciones de Minka (móvil)"
        >
          {visibleNavItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          <FlowButton
            href="/#demo"
            text="Agenda una demo"
            className="mt-2 w-full justify-center"
            onClick={() => setIsMenuOpen(false)}
          />
        </nav>
      ) : null}
    </header>
  );
}
