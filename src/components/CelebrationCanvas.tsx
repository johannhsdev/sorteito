import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  colorIndex: number;
}

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}

const PARTICLE_COLORS = [
  "149,134,210",
  "101,85,166",
  "188,178,224",
];

const CONFETTI_COLORS = [
  "#9586d2",
  "#bcb2e0",
  "#7968be",
  "#f4f3fa",
  "#a898d6",
  "#ffffff",
  "#d3ccec",
  "#e7c55a",
  "#f0d060",
];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export default function CelebrationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    // Initialize particles
    const particles: Particle[] = Array.from({ length: 80 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = randomBetween(8, 20);
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: randomBetween(2, 4),
        colorIndex: Math.floor(Math.random() * PARTICLE_COLORS.length),
      };
    });

    // Initialize confetti
    const confetti: ConfettiPiece[] = Array.from({ length: 150 }, () => ({
      x: Math.random() * window.innerWidth,
      y: randomBetween(-200, -20),
      vx: randomBetween(-2, 2),
      vy: randomBetween(3, 7),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: randomBetween(-5, 5) * (Math.PI / 180),
      width: randomBetween(6, 12),
      height: randomBetween(10, 18),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      opacity: 1,
    }));

    function draw() {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- Draw particles ---
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const lineAlpha = (1 - dist / 120) * 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(149,134,210,${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const p of particles) {
        const color = PARTICLE_COLORS[p.colorIndex];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},1)`;
        ctx.fill();
      }

      // --- Draw confetti (loop infinito: recicla al salir por abajo) ---
      for (const piece of confetti) {
        piece.vy += 0.15;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rotation += piece.rotationSpeed;

        // Reciclar cuando sale por debajo de la pantalla
        if (piece.y > canvas.height + 20) {
          piece.x = Math.random() * canvas.width;
          piece.y = randomBetween(-200, -20);
          piece.vy = randomBetween(3, 7);
          piece.vx = randomBetween(-2, 2);
        }

        ctx.save();
        ctx.globalAlpha = piece.opacity;
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rotation);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 50,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
