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
      className="relative mx-auto grid w-full max-w-[1180px] items-center gap-y-7 xl:grid-cols-[minmax(230px,0.8fr)_minmax(470px,560px)_minmax(230px,0.8fr)] xl:gap-x-8 2xl:grid-cols-[minmax(285px,0.85fr)_minmax(560px,640px)_minmax(285px,0.85fr)] 2xl:gap-x-10"
      aria-roledescription="carrusel"
      aria-label="Vistas de la aplicación Minka"
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
    >
      <div className="order-1 mx-auto max-w-[30rem] px-2 text-center xl:order-none xl:max-w-[17rem] xl:pr-0 xl:text-left 2xl:max-w-[20rem]">
        <div
          key={`title-${activeIndex}`}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#c66f4a]">
            {activeItem.eyebrow}
          </p>
          <h3 className="text-3xl font-bold leading-[1.06] text-[#17231f] xl:text-[clamp(2rem,2.25vw,2.8rem)] 2xl:text-[clamp(2.35rem,2.7vw,3.5rem)]">
            {activeItem.title}
          </h3>
        </div>
      </div>

      <div className="order-2 flex flex-col items-center">
        <div className="relative flex min-h-[470px] w-full max-w-[560px] items-center justify-center sm:min-h-[560px] xl:min-h-[545px] 2xl:min-h-[610px]">
          {visiblePhones.map(({ item, offset }) => {
            const isActive = offset === 0;
            return (
              <button
                key={item.src}
                type="button"
                className={cn(
                  "phone-carousel-device absolute h-[410px] w-[201px] origin-bottom cursor-pointer rounded-[2.45rem] border-[7px] border-[#17231f] bg-[#17231f] p-0 shadow-[0_30px_70px_rgba(23,35,31,0.22)] transition-all duration-700 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c66f4a]/60 sm:h-[500px] sm:w-[245px] xl:h-[492px] xl:w-[240px] 2xl:h-[540px] 2xl:w-[264px]",
                  offset === -1 &&
                    "-translate-x-[42%] -rotate-[7deg] scale-[0.78] opacity-75 sm:-translate-x-[52%] xl:-translate-x-[46%] 2xl:-translate-x-[62%]",
                  offset === 1 &&
                    "translate-x-[42%] rotate-[7deg] scale-[0.78] opacity-75 sm:translate-x-[52%] xl:translate-x-[46%] 2xl:translate-x-[62%]",
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
                    className="h-full w-full rounded-[1.9rem] bg-[#faf7f1] object-cover object-top"
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

      <div className="order-3 mx-auto max-w-[31rem] px-2 text-center xl:max-w-[17rem] xl:pl-0 xl:text-left 2xl:max-w-[20rem]">
        <div
          key={`description-${activeIndex}`}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
          <p className="text-base leading-7 text-[#17231f]/70 xl:text-[1.03rem] xl:leading-8 2xl:text-lg">
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
