"use client";

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type FlowButtonTone = "dark" | "light";

const toneStyles: Record<
  FlowButtonTone,
  { border: string; text: string; hoverText: string; circle: string; arrow: string; hoverArrow: string }
> = {
  // For use on the site's cream/paper backgrounds.
  dark: {
    border: "border-[#17231f]/35",
    text: "text-[#17231f]",
    hoverText: "hover:text-[#fffaf2]",
    circle: "bg-[#245b4f]",
    arrow: "stroke-[#17231f]",
    hoverArrow: "group-hover:stroke-[#fffaf2]",
  },
  // For use on the site's dark sections (Cobranzas, demo/CTA).
  light: {
    border: "border-[#fffaf2]/35",
    text: "text-[#fffaf2]",
    hoverText: "hover:text-[#17231f]",
    circle: "bg-[#fffaf2]",
    arrow: "stroke-[#fffaf2]",
    hoverArrow: "group-hover:stroke-[#17231f]",
  },
};

function flowButtonClasses(tone: FlowButtonTone) {
  const styles = toneStyles[tone];
  return cn(
    "group relative inline-flex items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] bg-transparent px-8 py-3 text-sm font-semibold no-underline cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:rounded-xl active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50",
    styles.border,
    styles.text,
    styles.hoverText,
  );
}

function FlowButtonInner({ text, tone }: { text: ReactNode; tone: FlowButtonTone }) {
  const styles = toneStyles[tone];
  return (
    <>
      <ArrowRight
        aria-hidden="true"
        className={cn(
          "absolute left-[-25%] z-[9] h-4 w-4 transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:left-4",
          styles.arrow,
          styles.hoverArrow,
        )}
      />
      <span className="relative z-[1] -translate-x-3 transition-all duration-[800ms] ease-out group-hover:translate-x-3">
        {text}
      </span>
      <span
        className={cn(
          "absolute top-1/2 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:h-[220px] group-hover:w-[220px] group-hover:opacity-100",
          styles.circle,
        )}
      />
      <ArrowRight
        aria-hidden="true"
        className={cn(
          "absolute right-4 z-[9] h-4 w-4 transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:right-[-25%]",
          styles.arrow,
          styles.hoverArrow,
        )}
      />
    </>
  );
}

type FlowButtonLinkProps = {
  text?: string;
  tone?: FlowButtonTone;
  href: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children">;

type FlowButtonButtonProps = {
  text?: string;
  tone?: FlowButtonTone;
  href?: undefined;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export type FlowButtonProps = FlowButtonLinkProps | FlowButtonButtonProps;

/**
 * Animated pill button: on hover the border disappears, a filled circle
 * expands from the center, and the arrow slides across. Renders an <a>
 * when `href` is passed, otherwise a <button>. Use `tone="light"` on the
 * site's dark sections (Cobranzas, the closing CTA) for correct contrast.
 */
export function FlowButton({
  text = "Modern Button",
  tone = "dark",
  className,
  ...props
}: FlowButtonProps) {
  if (props.href) {
    const { href, ...anchorProps } = props as FlowButtonLinkProps;
    return (
      <a href={href} className={cn(flowButtonClasses(tone), className)} {...anchorProps}>
        <FlowButtonInner text={text} tone={tone} />
      </a>
    );
  }

  const { type = "button", ...buttonProps } = props as FlowButtonButtonProps;
  return (
    <button type={type} className={cn(flowButtonClasses(tone), className)} {...buttonProps}>
      <FlowButtonInner text={text} tone={tone} />
    </button>
  );
}
