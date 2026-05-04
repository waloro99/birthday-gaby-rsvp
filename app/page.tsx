"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import Confetti from "react-confetti";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Expand,
  Loader2,
  MapPin,
  Sparkles,
  X,
} from "lucide-react";

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type ButterflyPalette = {
  start: string;
  middle: string;
  end: string;
  body: string;
};

type BackgroundButterfly = {
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
  paletteIndex: number;
};

type BurstButterfly = {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  rotate: number;
  duration: number;
  paletteIndex: number;
};

const BUTTERFLY_PALETTES: ButterflyPalette[] = [
  {
    start: "#F5D0FE",
    middle: "#D8B4FE",
    end: "#C084FC",
    body: "#F3E8FF",
  },
  {
    start: "#FBCFE8",
    middle: "#F9A8D4",
    end: "#EC4899",
    body: "#FCE7F3",
  },
  {
    start: "#E9D5FF",
    middle: "#C084FC",
    end: "#A855F7",
    body: "#F5F3FF",
  },
  {
    start: "#FCE7F3",
    middle: "#F9A8D4",
    end: "#D946EF",
    body: "#FFF1F2",
  },
  {
    start: "#F3E8FF",
    middle: "#E879F9",
    end: "#C084FC",
    body: "#FAE8FF",
  },
];

function getTimeLeft(targetDate: string): Countdown {
  const total = new Date(targetDate).getTime() - new Date().getTime();

  if (total <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

function ButterflySVG({
  size = 42,
  gradientId,
  palette,
}: {
  size?: number;
  gradientId: string;
  palette: ButterflyPalette;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className="drop-shadow-[0_0_14px_rgba(236,72,153,0.18)]"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.start} />
          <stop offset="45%" stopColor={palette.middle} />
          <stop offset="100%" stopColor={palette.end} />
        </linearGradient>
      </defs>

      <ellipse
        cx="19"
        cy="20"
        rx="12"
        ry="10"
        fill={`url(#${gradientId})`}
        opacity="0.96"
      />
      <ellipse
        cx="45"
        cy="20"
        rx="12"
        ry="10"
        fill={`url(#${gradientId})`}
        opacity="0.96"
      />
      <ellipse
        cx="21"
        cy="41"
        rx="10"
        ry="8"
        fill={`url(#${gradientId})`}
        opacity="0.84"
      />
      <ellipse
        cx="43"
        cy="41"
        rx="10"
        ry="8"
        fill={`url(#${gradientId})`}
        opacity="0.84"
      />

      <rect x="30" y="16" width="4" height="30" rx="2" fill={palette.body} />
      <path
        d="M31 16 C27 10, 24 8, 21 6"
        stroke={palette.body}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M33 16 C37 10, 40 8, 43 6"
        stroke={palette.body}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FloatingButterfly({
  left,
  top,
  size,
  delay,
  duration,
  rotate,
  paletteIndex,
  mouseX,
  mouseY,
  index,
}: BackgroundButterfly & {
  mouseX: number;
  mouseY: number;
  index: number;
}) {
  const palette = BUTTERFLY_PALETTES[paletteIndex % BUTTERFLY_PALETTES.length];

  return (
    <motion.div
      className="pointer-events-none absolute z-[1]"
      style={{ left, top }}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: [0.16, 0.78, 0.25],
        y: [0, -18, 0],
        x: [0, 10, -8, 0],
        rotate: [rotate, rotate + 8, rotate - 6, rotate],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <motion.div
        animate={{
          x: mouseX * 0.22,
          y: mouseY * 0.22,
        }}
        transition={{ type: "spring", stiffness: 18, damping: 18 }}
      >
        <ButterflySVG
          size={size}
          gradientId={`bg-wing-${index}`}
          palette={palette}
        />
      </motion.div>
    </motion.div>
  );
}

function BurstButterflyLayer({ items }: { items: BurstButterfly[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <AnimatePresence>
        {items.map((item) => {
          const palette =
            BUTTERFLY_PALETTES[item.paletteIndex % BUTTERFLY_PALETTES.length];

          return (
            <motion.div
              key={item.id}
              initial={{
                opacity: 0,
                x: item.x,
                y: item.y,
                scale: 0.7,
                rotate: item.rotate,
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                x: item.x + item.dx,
                y: item.y + item.dy,
                scale: [0.7, 1, 0.9, 0.6],
                rotate: item.rotate + 24,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: item.duration,
                ease: "easeOut",
              }}
              className="absolute"
            >
              <ButterflySVG
                size={item.size}
                gradientId={`burst-wing-${item.id}`}
                palette={palette}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const eventDate = "2026-05-16T19:00:00";

  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    asistencia: "Sí asistiré",
    personas: "1",
    telefono: "",
    mensaje: "",
  });

  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState("");
  const [error, setError] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showQuickPopup, setShowQuickPopup] = useState(false);

  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0,
  });

  const [mouse, setMouse] = useState({
    x: 0,
    y: 0,
  });

  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [burstButterflies, setBurstButterflies] = useState<BurstButterfly[]>(
    []
  );

  const burstIdRef = useRef(0);

  useEffect(() => {
    setMounted(true);

    const updateScreen = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateScreen();
    window.addEventListener("resize", updateScreen);

    return () => {
      window.removeEventListener("resize", updateScreen);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    setCountdown(getTimeLeft(eventDate));

    const interval = window.setInterval(() => {
      setCountdown(getTimeLeft(eventDate));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [mounted, eventDate]);

  useEffect(() => {
    if (!mounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 18;
      const y = (e.clientY / window.innerHeight - 0.5) * 18;
      setMouse({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mounted]);

  const butterflies: BackgroundButterfly[] = useMemo(
    () => [
      {
        left: "4%",
        top: "10%",
        size: 42,
        delay: 0,
        duration: 9,
        rotate: -6,
        paletteIndex: 0,
      },
      {
        left: "14%",
        top: "72%",
        size: 34,
        delay: 1.4,
        duration: 10,
        rotate: 5,
        paletteIndex: 1,
      },
      {
        left: "38%",
        top: "18%",
        size: 26,
        delay: 0.6,
        duration: 8,
        rotate: -10,
        paletteIndex: 2,
      },
      {
        left: "52%",
        top: "82%",
        size: 28,
        delay: 1.8,
        duration: 9,
        rotate: 7,
        paletteIndex: 3,
      },
      {
        left: "74%",
        top: "12%",
        size: 38,
        delay: 0.3,
        duration: 11,
        rotate: -4,
        paletteIndex: 4,
      },
      {
        left: "92%",
        top: "30%",
        size: 30,
        delay: 1.5,
        duration: 9,
        rotate: 8,
        paletteIndex: 1,
      },
      {
        left: "86%",
        top: "72%",
        size: 32,
        delay: 0.9,
        duration: 10,
        rotate: -7,
        paletteIndex: 0,
      },
    ],
    []
  );

  const spawnButterflies = (x: number, y: number, count = 8) => {
    if (!mounted) return;

    const created: BurstButterfly[] = Array.from({ length: count }).map(() => {
      burstIdRef.current += 1;

      const angle = Math.random() * Math.PI * 2;
      const distance = 70 + Math.random() * 160;

      return {
        id: burstIdRef.current,
        x,
        y,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance - (20 + Math.random() * 40),
        size: 20 + Math.floor(Math.random() * 18),
        rotate: -20 + Math.random() * 40,
        duration: 1.8 + Math.random() * 1.2,
        paletteIndex: Math.floor(Math.random() * BUTTERFLY_PALETTES.length),
      };
    });

    setBurstButterflies((prev) => [...prev, ...created]);

    window.setTimeout(() => {
      setBurstButterflies((prev) =>
        prev.filter((item) => !created.some((c) => c.id === item.id))
      );
    }, 3200);
  };

  const spawnFromElementCenter = (
    e:
      | ReactMouseEvent<HTMLElement>
      | ReactPointerEvent<HTMLElement>
      | KeyboardEvent<HTMLElement>,
    count = 10
  ) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    spawnButterflies(x, y, count);
  };

  const handleImageMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (Math.random() > 0.88) {
      spawnButterflies(e.clientX, e.clientY, 2);
    }
  };

  const handleGabyHover = (e: ReactMouseEvent<HTMLSpanElement>) => {
    if (Math.random() > 0.65) {
      spawnFromElementCenter(e, 4);
    }
  };

  const handleGabyClick = (e: ReactMouseEvent<HTMLSpanElement>) => {
    spawnFromElementCenter(e, 14);
  };

  const handleChange = (
    e:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const downloadInvitation = () => {
    const link = document.createElement("a");
    link.href = "/invitacion.jpeg";
    link.download = "Invitacion-Gaby.jpeg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setRespuesta("");
    setError("");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al enviar");
      }

      setRespuesta(
        "Tu confirmación fue registrada correctamente. ¡Gracias por acompañar a Gaby!"
      );

      setShowCelebration(true);
      setShowQuickPopup(true);

      spawnButterflies(window.innerWidth * 0.72, window.innerHeight * 0.62, 22);

      setForm({
        nombre: "",
        asistencia: "Sí asistiré",
        personas: "1",
        telefono: "",
        mensaje: "",
      });

      downloadInvitation();

      window.setTimeout(() => {
        setShowCelebration(false);
      }, 4200);

      window.setTimeout(() => {
        setShowQuickPopup(false);
      }, 5200);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo registrar la confirmación.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {showCelebration && mounted && screenSize.width > 0 && (
        <Confetti
          width={screenSize.width}
          height={screenSize.height}
          recycle={false}
          numberOfPieces={260}
          gravity={0.24}
        />
      )}

      <BurstButterflyLayer items={burstButterflies} />

      <AnimatePresence>
        {showQuickPopup && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.94 }}
            className="pointer-events-none fixed left-1/2 top-6 z-[70] -translate-x-1/2"
          >
            <div className="rounded-2xl border border-[#d7b46a]/35 bg-[#140d0b]/90 px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d7b46a]/15">
                  <Sparkles className="h-5 w-5 text-[#d7b46a]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#f7ead1]">
                    ¡Te esperamos!
                  </p>
                  <p className="text-xs text-[#d8c8bd]">
                    Tu confirmación fue recibida con éxito.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#4c1d95_0%,#1b0f0d_28%,#090606_62%,#000000_100%)]" />

      <motion.div
        className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-fuchsia-700/20 blur-3xl"
        animate={{ x: mouse.x * 0.6, y: mouse.y * 0.6 }}
        transition={{ type: "spring", stiffness: 25, damping: 20 }}
      />

      <motion.div
        className="absolute right-0 top-0 h-[26rem] w-[26rem] rounded-full bg-amber-500/10 blur-3xl"
        animate={{ x: -mouse.x * 0.6, y: -mouse.y * 0.6 }}
        transition={{ type: "spring", stiffness: 25, damping: 20 }}
      />

      <motion.div
        className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl"
        animate={{ x: mouse.x * 0.35, y: -mouse.y * 0.35 }}
        transition={{ type: "spring", stiffness: 25, damping: 20 }}
      />

      {butterflies.map((b, i) => (
        <FloatingButterfly
          key={i}
          {...b}
          mouseX={mouse.x}
          mouseY={mouse.y}
          index={i}
        />
      ))}

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] items-center px-4 py-4 lg:h-screen lg:overflow-hidden lg:px-8 lg:py-5">
        <div className="grid w-full grid-cols-1 gap-6 lg:h-full lg:grid-cols-[1.06fr_0.94fr] lg:gap-8">
          <div className="flex items-center justify-center lg:h-full">
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex h-full w-full items-center justify-center"
              style={{
                transform: `translate(${mouse.x * 0.14}px, ${
                  mouse.y * 0.14
                }px)`,
              }}
            >
              <div
                className="group relative flex h-full max-h-[88vh] w-full max-w-[760px] items-center justify-center overflow-hidden rounded-[2.2rem] border border-[#d7b46a]/25 bg-white/5 p-4 shadow-[0_0_50px_rgba(0,0,0,0.35)] backdrop-blur-md"
                onMouseMove={handleImageMove}
                onClick={(e) => {
                  spawnButterflies(e.clientX, e.clientY, 8);
                  setShowModal(true);
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-purple-400/10 opacity-70" />

                <motion.img
                  src="/invitacion.jpeg"
                  alt="Invitación Gaby"
                  className="relative z-10 max-h-[80vh] w-full rounded-[1.6rem] object-contain shadow-2xl"
                  whileHover={{ scale: 1.012 }}
                  transition={{ duration: 0.25 }}
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    spawnButterflies(
                      window.innerWidth * 0.3,
                      window.innerHeight * 0.82,
                      6
                    );
                    setShowModal(true);
                  }}
                  className="absolute bottom-5 right-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-4 py-2 text-sm text-white backdrop-blur transition hover:bg-black/80"
                >
                  <Expand className="h-4 w-4" />
                  Ver invitación
                </button>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center justify-center lg:h-full">
            <motion.div
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="w-full max-w-[620px]"
              style={{
                transform: `translate(${mouse.x * -0.12}px, ${
                  mouse.y * -0.12
                }px)`,
              }}
            >
              <div className="rounded-[2rem] border border-[#d7b46a]/25 bg-[#100b0a]/85 p-4 shadow-[0_0_60px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-5 xl:p-6">
                <div className="mb-3">
                  <p className="mb-1.5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-[#d7b46a]">
                    <Sparkles className="h-3.5 w-3.5" />
                    RSVP
                  </p>

                  <h1 className="text-3xl font-semibold leading-tight text-[#f7ead1] md:text-4xl xl:text-[2.65rem]">
                    Celebremos a{" "}
                    <span
                      role="button"
                      tabIndex={0}
                      onMouseEnter={handleGabyHover}
                      onMouseMove={handleGabyHover}
                      onClick={handleGabyClick}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          spawnFromElementCenter(e, 14);
                        }
                      }}
                      className="cursor-pointer text-[#d8b16c] transition hover:text-[#f0c97c]"
                    >
                      GABY
                    </span>
                  </h1>

                  <p className="mt-2 text-sm leading-relaxed text-[#d8c8bd] md:text-[14px]">
                    Una noche especial, elegante y llena de magia. Confirma tu
                    asistencia para acompañarnos en esta celebración.
                  </p>
                </div>

                <div className="mb-3 grid grid-cols-4 gap-2.5">
                  {[
                    { label: "Días", value: countdown.days },
                    { label: "Horas", value: countdown.hours },
                    { label: "Min", value: countdown.minutes },
                    { label: "Seg", value: countdown.seconds },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-white/5 px-2 py-2.5 text-center backdrop-blur"
                    >
                      <div className="text-lg font-semibold text-[#f7ead1] md:text-2xl">
                        {mounted ? String(item.value).padStart(2, "0") : "--"}
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-[#d7b46a] md:text-[11px]">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-3">
                  <div className="flex flex-wrap gap-2 text-xs md:flex-nowrap">
                    <motion.div
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[#e8ddd5]"
                    >
                      <CalendarDays className="h-4 w-4 text-[#d7b46a]" />
                      16 de mayo
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[#e8ddd5]"
                    >
                      <Clock3 className="h-4 w-4 text-[#d7b46a]" />
                      7:00 P.M.
                    </motion.div>

                    <motion.a
                      href="https://maps.app.goo.gl/LP9aQ8g2WinGoSnP6"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        borderColor: [
                          "rgba(215,180,106,0.20)",
                          "rgba(215,180,106,0.55)",
                          "rgba(215,180,106,0.20)",
                        ],
                        boxShadow: [
                          "0 0 0 rgba(215,180,106,0)",
                          "0 0 14px rgba(215,180,106,0.18)",
                          "0 0 0 rgba(215,180,106,0)",
                        ],
                      }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      onClick={(e) => spawnFromElementCenter(e, 7)}
                      className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border bg-white/5 px-3 py-1.5 text-[#f2e7d7] transition hover:border-[#d7b46a]/40 hover:bg-white/8"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.12, 1] }}
                        transition={{
                          duration: 1.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="flex"
                      >
                        <MapPin className="h-4 w-4 text-[#d7b46a]" />
                      </motion.span>
                      Indigo
                    </motion.a>

                    <motion.div
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[#e8ddd5] md:w-auto md:shrink-0 md:whitespace-nowrap"
                    >
                      <Sparkles className="h-4 w-4 shrink-0 text-[#d7b46a]" />
                      <span className="truncate md:whitespace-nowrap">
                        Dress code: Jeans con tu toque chic
                      </span>
                    </motion.div>
                  </div>
                </div>

                <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
                  <p className="text-sm leading-relaxed text-[#d8c8bd]">
                    Será un gusto contar contigo en el cumpleaños de{" "}
                    <span className="font-semibold text-[#d7b46a]">Gaby</span>.
                    Completa el formulario para reservar tu lugar.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label
                      htmlFor="nombre"
                      className="mb-1 block text-sm font-medium text-[#f7ead1]"
                    >
                      Nombre completo
                    </label>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-[#7c5b3c] bg-[#0b0706] px-4 py-2.5 text-[#f7ead1] outline-none transition placeholder:text-[#8f7d73] focus:border-[#d7b46a] focus:ring-2 focus:ring-[#d7b46a]/20"
                      placeholder="Escribe tu nombre"
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="asistencia"
                        className="mb-1 block text-sm font-medium text-[#f7ead1]"
                      >
                        ¿Asistirás?
                      </label>
                      <select
                        id="asistencia"
                        name="asistencia"
                        value={form.asistencia}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-[#7c5b3c] bg-[#0b0706] px-4 py-2.5 text-[#f7ead1] outline-none transition focus:border-[#d7b46a] focus:ring-2 focus:ring-[#d7b46a]/20"
                      >
                        <option>Sí asistiré</option>
                        <option>No podré asistir</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="personas"
                        className="mb-1 block text-sm font-medium text-[#f7ead1]"
                      >
                        Número de personas
                      </label>
                      <input
                        id="personas"
                        name="personas"
                        type="number"
                        min="1"
                        value={form.personas}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-[#7c5b3c] bg-[#0b0706] px-4 py-2.5 text-[#f7ead1] outline-none transition focus:border-[#d7b46a] focus:ring-2 focus:ring-[#d7b46a]/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="telefono"
                      className="mb-1 block text-sm font-medium text-[#f7ead1]"
                    >
                      Teléfono opcional
                    </label>
                    <input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={form.telefono}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-[#7c5b3c] bg-[#0b0706] px-4 py-2.5 text-[#f7ead1] outline-none transition placeholder:text-[#8f7d73] focus:border-[#d7b46a] focus:ring-2 focus:ring-[#d7b46a]/20"
                      placeholder="Ej. 5555-5555"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="mensaje"
                      className="mb-1 block text-sm font-medium text-[#f7ead1]"
                    >
                      Mensaje opcional
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      value={form.mensaje}
                      onChange={handleChange}
                      rows={2}
                      className="w-full resize-none rounded-2xl border border-[#7c5b3c] bg-[#0b0706] px-4 py-2.5 text-[#f7ead1] outline-none transition placeholder:text-[#8f7d73] focus:border-[#d7b46a] focus:ring-2 focus:ring-[#d7b46a]/20"
                      placeholder="Puedes dejar un mensaje especial para Gaby"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.985 }}
                    type="submit"
                    disabled={loading}
                    onMouseEnter={(e) => spawnFromElementCenter(e, 5)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#9b6b2f] via-[#d7b46a] to-[#9b6b2f] px-5 py-3 font-semibold text-[#17100f] shadow-[0_10px_30px_rgba(215,180,106,0.18)] transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Confirmar asistencia
                      </>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {respuesta && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 rounded-2xl border border-green-500/25 bg-green-500/10 px-4 py-2.5 text-sm text-green-200"
                      >
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        {respuesta}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm text-red-200"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 px-4 py-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="relative max-h-[95vh] w-full max-w-5xl"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#100b0a] p-3 shadow-2xl">
                <img
                  src="/invitacion.jpeg"
                  alt="Invitación ampliada"
                  className="max-h-[88vh] w-full rounded-[1.5rem] object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}