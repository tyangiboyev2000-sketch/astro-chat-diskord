import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  r: number;
  base: number;
  speed: number;
  phase: number;
  hue: number;
};

type Shooter = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  len: number;
};

export function SpaceBackground() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    const shooters: Shooter[] = [];
    let raf = 0;
    let nextShooter = 1200;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(650, Math.floor((w * h) / 2000));
      stars = Array.from({ length: count }, () => {
        const big = Math.random() > 0.93;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: big ? 1.4 + Math.random() * 1.6 : 0.3 + Math.random() * 0.9,
          base: 0.5 + Math.random() * 0.5,
          speed: 0.0006 + Math.random() * 0.0022,
          phase: Math.random() * Math.PI * 2,
          hue: Math.random() > 0.7 ? (Math.random() > 0.5 ? 275 : 195) : 220,
        };
      });
    };

    const drawNebula = (t: number) => {
      const clouds = [
        { x: 0.2 + Math.sin(t / 24000) * 0.05, y: 0.18, c: "168,85,247", r: 0.55 },
        { x: 0.8, y: 0.72 + Math.cos(t / 31000) * 0.05, c: "56,189,248", r: 0.5 },
        { x: 0.55 + Math.cos(t / 27000) * 0.07, y: 0.45, c: "99,102,241", r: 0.42 },
      ];
      for (const cl of clouds) {
        const cx = cl.x * w;
        const cy = cl.y * h;
        const rad = cl.r * Math.max(w, h) * 0.6;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, `rgba(${cl.c},0.26)`);
        g.addColorStop(0.5, `rgba(${cl.c},0.1)`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    };

    const spawnShooter = () => {
      const fromTop = Math.random() > 0.4;
      const speed = 6 + Math.random() * 5;
      const angle = (Math.PI / 180) * (18 + Math.random() * 14);
      shooters.push({
        x: fromTop ? -80 : Math.random() * w * 0.5,
        y: fromTop ? Math.random() * h * 0.5 : -60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        len: 120 + Math.random() * 160,
      });
    };

    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(now - last, 48);
      last = now;

      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#0a0f22");
      bg.addColorStop(0.55, "#0b1026");
      bg.addColorStop(1, "#07091a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      drawNebula(now);

      for (const s of stars) {
        const tw = 0.55 + 0.45 * Math.sin(now * s.speed + s.phase);
        const a = Math.min(1, s.base * tw);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 90%, ${s.hue === 220 ? 92 : 80}%, ${a})`;
        ctx.shadowBlur = s.r * 6;
        ctx.shadowColor = `hsla(${s.hue}, 95%, 75%, ${a * 0.9})`;
        ctx.fill();
        ctx.shadowBlur = 0;
        if (!reduced) {
          s.y -= 0.012 * dt * (s.r * 0.4);
          if (s.y < -4) {
            s.y = h + 4;
            s.x = Math.random() * w;
          }
        }
      }

      if (!reduced) {
        nextShooter -= dt;
        if (nextShooter <= 0) {
          spawnShooter();
          nextShooter = 3500 + Math.random() * 6000;
        }
        for (let i = shooters.length - 1; i >= 0; i--) {
          const sh = shooters[i]!;
          sh.x += sh.vx * (dt / 16);
          sh.y += sh.vy * (dt / 16);
          sh.life -= dt / 2600;
          const tailX = sh.x - (sh.vx / Math.hypot(sh.vx, sh.vy)) * sh.len;
          const tailY = sh.y - (sh.vy / Math.hypot(sh.vx, sh.vy)) * sh.len;
          const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
          const alpha = Math.max(0, Math.min(1, sh.life));
          grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
          grad.addColorStop(0.4, `rgba(147,197,253,${alpha * 0.5})`);
          grad.addColorStop(1, "rgba(147,197,253,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.shadowBlur = 14;
          ctx.shadowColor = `rgba(186,230,253,${alpha * 0.8})`;
          ctx.beginPath();
          ctx.moveTo(sh.x, sh.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
          ctx.shadowBlur = 0;
          if (sh.life <= 0 || sh.x > w + 200 || sh.y > h + 200) shooters.splice(i, 1);
        }
      }

      raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    />
  );
}
