import { useEffect, useRef } from "react";

interface DarkVeilProps {
  hueShift?: number;
  speed?: number;
  warpAmount?: number;
  noiseIntensity?: number;
  scanlineIntensity?: number;
  scanlineFrequency?: number;
}

export default function DarkVeil({
  hueShift = 180,
  speed = 0.3,
  warpAmount = 0.1,
  noiseIntensity = 0.02,
}: DarkVeilProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.offsetWidth;
      h = parent.offsetHeight;
      canvas.width = Math.floor(w / 4);
      canvas.height = Math.floor(h / 4);
    };
    resize();
    window.addEventListener("resize", resize);

    let time = 0;
    const draw = () => {
      time += speed * 0.01;
      const cw = canvas.width;
      const ch = canvas.height;
      const imageData = ctx.createImageData(cw, ch);
      const data = imageData.data;

      for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
          const nx = x / cw;
          const ny = y / ch;

          // Warp coordinates
          const wx = nx + Math.sin(ny * 3.0 + time) * warpAmount;
          const wy = ny + Math.cos(nx * 3.0 + time * 0.7) * warpAmount;

          // Gradient base with hue shift
          const hue = (hueShift + wx * 60 + wy * 40 + Math.sin(time * 0.5) * 20) % 360;
          const sat = 0.4 + Math.sin(wx * 2 + time) * 0.1;
          const lightness = 0.08 + Math.sin(wy * 2.5 + time * 0.8) * 0.03;

          // HSL to RGB
          const c = (1 - Math.abs(2 * lightness - 1)) * sat;
          const hh = hue / 60;
          const xx = c * (1 - Math.abs((hh % 2) - 1));
          const m = lightness - c / 2;
          let r = 0, g = 0, b = 0;
          if (hh < 1) { r = c; g = xx; }
          else if (hh < 2) { r = xx; g = c; }
          else if (hh < 3) { g = c; b = xx; }
          else if (hh < 4) { g = xx; b = c; }
          else if (hh < 5) { r = xx; b = c; }
          else { r = c; b = xx; }

          // Add noise
          const noise = (Math.random() - 0.5) * noiseIntensity;

          const idx = (y * cw + x) * 4;
          data[idx] = Math.max(0, Math.min(255, (r + m + noise) * 255));
          data[idx + 1] = Math.max(0, Math.min(255, (g + m + noise) * 255));
          data[idx + 2] = Math.max(0, Math.min(255, (b + m + noise) * 255));
          data[idx + 3] = 180; // semi-transparent
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [hueShift, speed, warpAmount, noiseIntensity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
