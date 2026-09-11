import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";
import logo from "../../assets/logo.png";
import logoBlueprint from "../../assets/logo-blueprint.png";
import wordmark from "../../assets/wordmark.png";

gsap.registerPlugin(ScrollTrigger);

export function IntroAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const normalLogoRef = useRef<HTMLImageElement>(null);
  const blueprintLogoRef = useRef<HTMLImageElement>(null);
  const blueprintBgRef = useRef<HTMLDivElement>(null);
  const gridLinesRef = useRef<HTMLDivElement>(null);
  const techSpecsRef = useRef<HTMLDivElement>(null);
  const animationSectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: animationSectionRef.current,
            start: "top top",
            end: "+=400%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        })
        .to(logoWrapperRef.current, { rotation: 360, duration: 3, ease: "none" })
        .to(blueprintBgRef.current, { opacity: 1, duration: 1.5 }, "-=2")
        .to(gridLinesRef.current, { opacity: 1, duration: 1.5 }, "-=2")
        .to(normalLogoRef.current, { opacity: 0, scale: 0.5, duration: 1.5 }, "-=1")
        .to(blueprintLogoRef.current, { opacity: 1, duration: 1.5 }, "-=1")
        .to(blueprintLogoRef.current, { scale: 1.1, duration: 2 })
        .to(techSpecsRef.current, { opacity: 1, y: 0, duration: 1.5 }, "-=1.5");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}>
      <section className="flex h-screen flex-col items-center justify-center bg-[#f8fafc] px-4 dark:bg-gray-950">
        <img src={logo} alt="" className="mb-4 h-20 w-20 rounded-2xl shadow-lg" />
        <img src={wordmark} alt="Wer Macht" className="mb-10 h-16 w-auto" />
        <h1 className="max-w-xl text-center text-4xl font-semibold text-slate-800 md:text-5xl dark:text-slate-100">
          Bald verfügbar in Deutschland
        </h1>
        <div className="mt-12 rounded-full bg-white p-4 text-slate-400 shadow-lg dark:bg-gray-800 dark:text-slate-500">
          <svg className="h-6 w-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Fixed brand-blueprint transition: colors are intentionally hardcoded (not theme-aware) — the scene scripts a light-to-blueprint-blue reveal regardless of app theme. */}
      <div ref={animationSectionRef} className="relative flex h-screen w-full items-center justify-center overflow-hidden">
        <div ref={blueprintBgRef} className="absolute inset-0 bg-[#1a4da0] opacity-0" />
        <div
          ref={gridLinesRef}
          className="absolute inset-0 opacity-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div ref={logoWrapperRef} className="relative flex h-[300px] w-[300px] items-center justify-center md:h-[400px] md:w-[400px]">
          <img
            ref={normalLogoRef}
            src={logo}
            alt="Normal Logo"
            className="absolute z-20 h-[80%] w-[80%] rounded-[40px] bg-white object-contain shadow-2xl"
          />
          <img
            ref={blueprintLogoRef}
            src={logoBlueprint}
            alt="Blueprint Logo"
            className="absolute z-10 w-[120%] max-w-none object-contain opacity-0 md:w-[150%]"
          />
        </div>

        <div
          ref={techSpecsRef}
          className="absolute right-4 bottom-8 z-30 translate-y-10 rounded-xl border border-white/20 bg-white/10 p-6 text-white opacity-0 shadow-2xl backdrop-blur-md md:right-12 md:bottom-12"
        >
          <h3 className="mb-4 border-b border-white/30 pb-2 text-sm font-bold tracking-widest md:text-base">
            PROJE DETAYLARI
          </h3>
          <div className="space-y-2 font-mono text-sm md:text-base">
            <p className="flex justify-between gap-8">
              <span>ÖLÇEK:</span> <span>1:1</span>
            </p>
            <p className="flex justify-between gap-8">
              <span>BİRİM:</span> <span>mm</span>
            </p>
            <p className="flex justify-between gap-8">
              <span>TOLERANS:</span> <span>±0.5</span>
            </p>
            <p className="flex justify-between gap-8">
              <span>TARİH:</span> <span>25.05.2024</span>
            </p>
          </div>
          <div className="mt-6 flex justify-center border-t border-white/30 pt-4">
            <img src={wordmark} alt="Wer Macht" className="h-8 brightness-0 invert" />
          </div>
        </div>
      </div>

      <section className="flex h-screen flex-col items-center justify-center bg-slate-900 px-4 text-center text-white">
        <h2 className="mb-4 text-3xl font-bold md:text-4xl">Finde, wer's macht.</h2>
        <p className="max-w-md text-slate-400">
          Vertrauenswürdige Handwerker und Dienstleister – jetzt in deiner Nähe entdecken.
        </p>
      </section>
    </div>
  );
}
