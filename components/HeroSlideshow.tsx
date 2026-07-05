'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { imageUrl } from '@/lib/supabase/image';
import { Magnetic } from '@/components/motion/Magnetic';
import type { HeroSlide } from '@/lib/supabase/types';

const AUTOPLAY_MS = 6500;

export function HeroSlideshow({
  slides,
  whatsappNumber,
  fallbackImageUrl,
}: {
  slides: HeroSlide[];
  whatsappNumber: string;
  fallbackImageUrl: string | null;
}) {
  const safeSlides = slides.length > 0 ? slides : [{ eyebrow: '', title: '', subtitle: '', image_path: null }];
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (safeSlides.length < 2 || reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % safeSlides.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [safeSlides.length, reduce]);

  const slide = safeSlides[index];
  const bgUrl = slide.image_path ? imageUrl(slide.image_path) : index === 0 ? fallbackImageUrl : null;

  return (
    <section className="relative">
      <div className="container-page pt-6 pb-12">
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 text-white">
          <div className="absolute inset-0 bg-warm-mesh opacity-80" aria-hidden />

          <AnimatePresence>
            {bgUrl && (
              <motion.div
                key={`${index}-${bgUrl}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <Image
                  src={bgUrl}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover opacity-55 animate-kenburns"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-r from-ink-900/70 via-ink-900/40 to-transparent" aria-hidden />

          <div className="relative px-6 py-16 md:px-14 md:py-24 lg:py-28 max-w-3xl min-h-[380px] md:min-h-[440px] lg:min-h-[480px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                  {slide.eyebrow}
                </span>
                <h1 className="mt-5 font-display text-4xl md:text-6xl lg:text-7xl font-medium leading-[0.98] tracking-tight text-balance">
                  {slide.title}
                </h1>
                <p className="mt-5 max-w-xl text-base md:text-lg text-white/80 text-pretty">
                  {slide.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap gap-3">
              <Magnetic>
                <Link href="/catalogo" className="btn bg-white text-ink-900 hover:bg-accent">
                  Ver catálogo
                  <ArrowIcon className="h-4 w-4" />
                </Link>
              </Magnetic>
              <Magnetic>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener"
                  className="btn border border-white/30 text-white hover:bg-white/10"
                >
                  <WhatsAppIcon className="h-4 w-4" /> Hablar por WhatsApp
                </a>
              </Magnetic>
            </div>

            {safeSlides.length > 1 && (
              <div className="mt-8 flex gap-2">
                {safeSlides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Ir a la diapositiva ${i + 1}`}
                    aria-current={i === index}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? 'w-8 bg-white' : 'w-3 bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.93.55 3.81 1.6 5.45L2 22l4.79-1.7a9.86 9.86 0 0 0 5.25 1.5h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.13-2.9-7C17.18 3.03 14.69 2 12.04 2Z" />
    </svg>
  );
}
