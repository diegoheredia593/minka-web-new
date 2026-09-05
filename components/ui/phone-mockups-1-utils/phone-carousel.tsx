"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type ImageItem = {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  description: string;
};

export function PhoneCarousel({ images }: { images: ImageItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReduceMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (images.length < 2 || isPaused || reduceMotion) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 4200);

    return () => window.clearTimeout(timer);
  }, [activeIndex, images.length, isPaused, reduceMotion]);

  if (images.length === 0) return null;

  const move = (direction: number) => {
    setActiveIndex((current) => (current + direction + images.length) % images.length);
  };

  const visiblePhones = [-1, 0, 1].map((offset) => ({
    item: images[(activeIndex + offset + images.length) % images.length],
    offset,
  }));
  const activeItem = images[activeIndex];

  return (
    <div
      className="relative mx-auto grid w-full max-w-[1440px] items-center gap-4 lg:grid-cols-[minmax(180px,1fr)_minmax(580px,760px)_minmax(180px,1fr)] lg:gap-2"
      aria-roledescription="carrusel"
      aria-label="Vistas de la aplicación Minka"
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
    >
      <div className="order-1 px-2 text-center lg:order-none lg:pr-6 lg:text-left">
        <div
          key={`title-${activeIndex}`}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#c66f4a]">
            {activeItem.eyebrow}
          </p>
          <h3 className="text-3xl font-bold leading-[1.05] text-[#17231f] lg:text-[clamp(2rem,3vw,3.5rem)]">
            {activeItem.title}
          </h3>
        </div>
      </div>

      <div className="order-2 flex flex-col items-center">
        <div className="relative flex min-h-[490px] w-full items-center justify-center sm:min-h-[610px]">
          {visiblePhones.map(({ item, offset }) => {
            const isActive = offset === 0;
            return (
              <button
                key={item.src}
                type="button"
                className={cn(
                  "phone-carousel-device absolute h-[420px] w-[205px] origin-bottom cursor-pointer rounded-[2.6rem] border-[7px] border-[#17231f] bg-[#17231f] p-0 shadow-[0_35px_80px_rgba(23,35,31,0.24)] transition-all duration-700 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c66f4a]/60 sm:h-[540px] sm:w-[264px]",
                  offset === -1 &&
                    "-translate-x-[46%] -rotate-[8deg] scale-[0.82] opacity-80 sm:-translate-x-[72%]",
                  offset === 1 &&
                    "translate-x-[46%] rotate-[8deg] scale-[0.82] opacity-80 sm:translate-x-[72%]",
                  isActive && "phone-carousel-device--active z-10 scale-100 opacity-100",
                )}
                onClick={() => offset !== 0 && move(offset)}
                aria-label={isActive ? `${item.alt}, vista actual` : `Mostrar ${item.alt}`}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="phone-carousel-float block h-full w-full rounded-[2.15rem] p-1">
                  <span className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-[#17231f] sm:h-6 sm:w-24" />
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="h-full w-full rounded-[1.9rem] object-cover object-top"
                    draggable={false}
                  />
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-1 flex items-center gap-4 sm:mt-3">
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-[#245b4f]/25 bg-[#fffaf2] text-[#245b4f] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c66f4a]/40"
            onClick={() => move(-1)}
            aria-label="Ver captura anterior"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <div className="flex gap-2" aria-hidden="true">
            {images.map((image, index) => (
              <span
                key={image.src}
                className={cn(
                  "h-2 rounded-full bg-[#245b4f]/25 transition-all",
                  index === activeIndex ? "w-8 bg-[#245b4f]" : "w-2",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-[#245b4f]/25 bg-[#fffaf2] text-[#245b4f] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c66f4a]/40"
            onClick={() => move(1)}
            aria-label="Ver captura siguiente"
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>

      <div className="order-3 px-2 text-center lg:pl-6 lg:text-left">
        <div
          key={`description-${activeIndex}`}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          <p className="text-base leading-7 text-[#17231f]/70 lg:text-lg lg:leading-8">
            {activeItem.description}
          </p>
          <p className="mt-5 text-sm font-semibold tabular-nums text-[#245b4f]">
            {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </div>
  );
}
