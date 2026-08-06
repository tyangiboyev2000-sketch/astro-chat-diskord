import { useMemo } from "react";

type Star = { x: number; y: number; size: number; delay: number; dur: number };

function makeStars(count: number, seedOffset: number, maxSize: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const s = Math.sin((i + seedOffset) * 12.9898) * 43758.5453;
    const r1 = s - Math.floor(s);
    const s2 = Math.sin((i + seedOffset) * 78.233) * 12345.6789;
    const r2 = s2 - Math.floor(s2);
    const s3 = Math.sin((i + seedOffset) * 39.425) * 9876.54321;
    const r3 = s3 - Math.floor(s3);
    stars.push({
      x: r1 * 100,
      y: r2 * 100,
      size: 0.6 + r3 * maxSize,
      delay: r3 * 6,
      dur: 3 + r1 * 5,
    });
  }
  return stars;
}

function StarLayer({
  count,
  seed,
  maxSize,
  duration,
  opacity,
}: {
  count: number;
  seed: number;
  maxSize: number;
  duration: number;
  opacity: number;
}) {
  const stars = useMemo(() => makeStars(count, seed, maxSize), [count, seed, maxSize]);
  return (
    <div
      className="space-layer absolute inset-[-30%]"
      style={{ animation: `star-drift ${duration}s linear infinite`, opacity }}
    >
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-foreground"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            boxShadow: `0 0 ${s.size * 4}px oklch(0.95 0.03 240 / 0.9)`,
            animation: `star-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

const shooters = [
  { top: "8%", left: "-12%", delay: 2, dur: 11 },
  { top: "32%", left: "-20%", delay: 14, dur: 14 },
  { top: "58%", left: "-8%", delay: 26, dur: 12 },
];

export function SpaceBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 20% 10%, oklch(0.28 0.07 285) 0%, oklch(0.18 0.04 275) 45%, oklch(0.13 0.03 270) 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-45"
        style={{
          background:
            "radial-gradient(45% 35% at 78% 72%, oklch(0.55 0.15 190 / 0.35), transparent 70%), radial-gradient(40% 30% at 15% 85%, oklch(0.5 0.16 300 / 0.3), transparent 70%)",
        }}
      />
      <StarLayer count={90} seed={1} maxSize={1.4} duration={200} opacity={0.8} />
      <StarLayer count={55} seed={40} maxSize={2.2} duration={130} opacity={0.8} />
      <StarLayer count={25} seed={90} maxSize={3} duration={90} opacity={1} />
      {shooters.map((s, i) => (
        <span
          key={i}
          className="shooting-star absolute h-px w-40 rounded-full"
          style={{
            top: s.top,
            left: s.left,
            background:
              "linear-gradient(90deg, transparent, oklch(0.98 0.01 250 / 0.9), transparent)",
            filter: "drop-shadow(0 0 6px oklch(0.9 0.05 220 / 0.8))",
            animation: `shooting-star ${s.dur}s ease-in ${s.delay}s infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
