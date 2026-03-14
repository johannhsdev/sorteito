import { useEffect, useRef } from 'react';

interface NeuralBackgroundProps {
  isDark: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const PARTICLE_COUNT = 60;
const CONNECTION_DISTANCE = 150;

function createParticles(width: number, height: number): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.random() - 0.5,
    vy: Math.random() - 0.5,
    radius: 2 + Math.random() * 2,
  }));
}

export default function NeuralBackground({ isDark }: NeuralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number>(0);
  const isDarkRef = useRef<boolean>(isDark);

  // Keep isDarkRef in sync without reinitializing particles
  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleResize = () => {
      const prevWidth = canvas.width;
      const prevHeight = canvas.height;
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      for (const p of particlesRef.current) {
        p.x = (p.x / prevWidth) * newWidth;
        p.y = (p.y / prevHeight) * newHeight;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;
    };

    initCanvas();
    particlesRef.current = createParticles(canvas.width, canvas.height);

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      const dark = isDarkRef.current;

      const nodeColor = dark
        ? 'rgba(149, 134, 210, 0.7)'
        : 'rgba(101, 85, 166, 0.5)';
      const maxLineOpacity = dark ? 0.3 : 0.2;
      const lineBaseRGB = dark ? '101, 85, 166' : '149, 134, 210';

      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;

      // Update positions and draw nodes
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x - p.radius < 0) {
          p.x = p.radius;
          p.vx = Math.abs(p.vx);
        } else if (p.x + p.radius > w) {
          p.x = w - p.radius;
          p.vx = -Math.abs(p.vx);
        }

        if (p.y - p.radius < 0) {
          p.y = p.radius;
          p.vy = Math.abs(p.vy);
        } else if (p.y + p.radius > h) {
          p.y = h - p.radius;
          p.vy = -Math.abs(p.vy);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
      }

      // Draw connections between nearby nodes
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECTION_DISTANCE) {
            const opacity = (1 - distance / CONNECTION_DISTANCE) * maxLineOpacity;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${lineBaseRGB}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
