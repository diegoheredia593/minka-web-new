"use client";

import NumberFlow from "@number-flow/react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { useRef, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export interface PricingPlan {
  name: string;
  price: number;
  yearlyPrice: number;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular?: boolean;
}

export function Pricing({
  plans,
  title = "Planes pensados para cada comunidad.",
  description = "Valores y condiciones provisionales. Los ajustaremos en una siguiente iteración.",
}: {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}) {
  const [isAnnual, setIsAnnual] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsAnnual(checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      confetti({
        particleCount: 42,
        spread: 55,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ["#245b4f", "#c66f4a", "#4b8194", "#fffaf2"],
        ticks: 160,
        gravity: 1.15,
        startVelocity: 26,
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1120px] px-6 py-24">
      <div className="mx-auto mb-10 max-w-3xl space-y-4 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#c66f4a]">Planes</p>
        <h2 className="text-4xl font-bold tracking-tight text-[#17231f] sm:text-6xl">{title}</h2>
        <p className="text-lg leading-8 text-[#17231f]/65">{description}</p>
      </div>

      <div className="mb-12 flex items-center justify-center gap-3">
        <span className={cn("font-semibold", !isAnnual ? "text-[#17231f]" : "text-[#17231f]/45")}>
          Mensual
        </span>
        <Switch
          ref={switchRef}
          checked={isAnnual}
          onCheckedChange={handleToggle}
          aria-label="Cambiar entre facturación mensual y anual"
        />
        <span className={cn("font-semibold", isAnnual ? "text-[#17231f]" : "text-[#17231f]/45")}>
          Anual <span className="text-[#245b4f]">-20%</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch">
        {plans.map((plan, index) => (
          <motion.article
            key={plan.name}
            initial={{ y: 42, opacity: 0, scale: 0.92 }}
            whileInView={{
              y: isDesktop && plan.isPopular ? -18 : 0,
              opacity: 1,
              x: isDesktop ? (index === 0 ? 18 : index === 2 ? -18 : 0) : 0,
              scale: isDesktop && !plan.isPopular ? 0.96 : 1,
            }}
            whileHover={{
              y: isDesktop && plan.isPopular ? -28 : -10,
              scale: 1.02,
              transition: { duration: 0.22, type: "spring", stiffness: 260, damping: 20 },
            }}
            viewport={{ once: false, amount: 0.18 }}
            transition={{
              delay: index * 0.09,
              duration: 0.75,
              type: "spring",
              stiffness: 90,
              damping: 22,
            }}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-[#fffaf2] p-7 text-center shadow-[0_24px_60px_rgba(23,35,31,0.08)]",
              plan.isPopular ? "z-10 border-2 border-[#245b4f]" : "border-[#245b4f]/15",
            )}
          >
            {plan.isPopular ? (
              <div className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-xl rounded-tr-xl bg-[#245b4f] px-3 py-1 text-sm font-semibold text-[#fffaf2]">
                <Star className="size-4 fill-current" aria-hidden="true" /> Popular
              </div>
            ) : null}
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#245b4f]">
              {plan.name}
            </p>
            <div className="mt-6 flex items-end justify-center gap-2">
              <span className="text-5xl font-bold tracking-tight text-[#17231f]">
                <NumberFlow
                  value={isAnnual ? plan.yearlyPrice : plan.price}
                  format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
                />
              </span>
              <span className="pb-1 text-sm font-semibold text-[#17231f]/55">/ {plan.period}</span>
            </div>
            <p className="mt-2 text-xs text-[#17231f]/50">
              {isAnnual ? "facturado anualmente" : "facturado mensualmente"}
            </p>
            <ul className="my-7 flex flex-1 flex-col gap-3">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-left text-sm text-[#17231f]/75"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-[#245b4f]" aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <a
              href={plan.href}
              className={cn(
                buttonVariants({ variant: plan.isPopular ? "default" : "outline", size: "lg" }),
                "min-h-11 w-full text-base",
                plan.isPopular && "bg-[#245b4f] text-[#fffaf2] hover:bg-[#183a32]",
              )}
            >
              {plan.buttonText}
            </a>
            <p className="mt-5 text-xs leading-5 text-[#17231f]/50">{plan.description}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
