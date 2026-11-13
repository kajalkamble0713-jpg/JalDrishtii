import React, { useState, useEffect, useRef } from 'react';
import { Satellite, Sparkles, Shield, Rocket, Activity, Globe, ArrowRight, Volume2, VolumeX, Radio, Cpu, Orbit, Zap, Compass, RefreshCw } from 'lucide-react';

interface AstroSplashIntroProps {
  onGetStarted: () => void;
}

export const AstroSplashIntro: React.FC<AstroSplashIntroProps> = ({ onGetStarted }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [telemetryCount, setTelemetryCount] = useState(786.2);
  const [activeNode, setActiveNode] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Parallax tilt tracking
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Sound synthesis utility for cinematic sci-fi audio effects
  const playSciFiSound = (type: 'hover' | 'launch' | 'ambient') => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (type === 'hover') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'launch') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      }
    } catch (e) {
      console.warn('Audio synthesis disabled', e);
    }
  };

  // Live telemetry ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryCount((prev) => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(1));
      setActiveNode((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // HTML5 Canvas 3D Orbital Globe & Starfield Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Star particle array
    const numStars = 220;
    const stars = Array.from({ length: numStars }).map(() => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * width,
      size: Math.random() * 1.8 + 0.5,
      color: Math.random() > 0.4 ? '#06b6d4' : Math.random() > 0.5 ? '#10b981' : '#f8fafc',
    }));

    // Orbital globe 3D points
    const numGlobePoints = 260;
    const globeRadius = Math.min(width, height) * 0.28;
    const globePoints = Array.from({ length: numGlobePoints }).map(() => {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      return {
        x: globeRadius * Math.sin(phi) * Math.cos(theta),
        y: globeRadius * Math.sin(phi) * Math.sin(theta),
        z: globeRadius * Math.cos(phi),
        baseX: 0,
        baseY: 0,
        baseZ: 0,
      };
    });

    let angleY = 0;
    let angleX = 0.2;
    let radarSweepAngle = 0;

    const render = () => {
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 30;

      // Render Starfield with Hyperspace Warp Speed condition
      stars.forEach((star) => {
        if (isWarping) {
          star.z -= 45; // Warp speed boost
        } else {
          star.z -= 0.8;
        }

        if (star.z <= 0) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }

        const k = 400 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = Math.max(0.1, (1 - star.z / width) * star.size * (isWarping ? 3.5 : 1));
          ctx.beginPath();
          if (isWarping) {
            // Radial warp streak lines
            const prevK = 400 / (star.z + 50);
            const ppx = star.x * prevK + cx;
            const ppy = star.y * prevK + cy;
            ctx.strokeStyle = star.color;
            ctx.lineWidth = size * 1.8;
            ctx.moveTo(px, py);
            ctx.lineTo(ppx, ppy);
            ctx.stroke();
          } else {
            ctx.fillStyle = star.color;
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Render 3D Wireframe Globe Sphere & HUD Radar Rings
      if (!isWarping) {
        angleY += 0.006;
        radarSweepAngle += 0.02;
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);

        // Orbital Scope HUD Rings
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, globeRadius * 1.45, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.beginPath();
        ctx.arc(cx, cy, globeRadius * 1.75, 0, Math.PI * 2);
        ctx.stroke();

        // Rotating HUD Radar Sweep Beam
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(radarSweepAngle);
        const sweepGrad = ctx.createConicGradient(0, 0, 0);
        sweepGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
        sweepGrad.addColorStop(0.15, 'rgba(16, 185, 129, 0.05)');
        sweepGrad.addColorStop(1, 'rgba(3, 7, 18, 0)');
        ctx.fillStyle = sweepGrad;
        ctx.beginPath();
        ctx.arc(0, 0, globeRadius * 1.75, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const projectedGlobePoints: { x: number; y: number; z: number }[] = [];

        globePoints.forEach((p) => {
          // Rotate around Y and X
          const x1 = p.x * cosY - p.z * sinY;
          const z1 = p.z * cosY + p.x * sinY;

          const y2 = p.y * cosX - z1 * sinX;
          const z2 = z1 * cosX + p.y * sinX;

          const scale = 500 / (500 + z2);
          const px = x1 * scale + cx;
          const py = y2 * scale + cy;

          projectedGlobePoints.push({ x: px, y: py, z: z2 });

          if (z2 < 100) {
            const alpha = Math.max(0.08, (100 - z2) / 300);
            ctx.fillStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.beginPath();
            ctx.arc(px, py, 2.2 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Draw connecting constellation radar mesh lines
        for (let i = 0; i < projectedGlobePoints.length; i += 4) {
          const p1 = projectedGlobePoints[i];
          if (p1.z > 0) continue;
          for (let j = i + 1; j < Math.min(i + 5, projectedGlobePoints.length); j++) {
            const p2 = projectedGlobePoints[j];
            if (p2.z > 0) continue;
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < 80) {
              ctx.strokeStyle = `rgba(16, 185, 129, ${0.18 * (1 - dist / 80)})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }

        // Atmosphere Outer Edge Halo Glow Ring
        const haloGrad = ctx.createRadialGradient(cx, cy, globeRadius * 0.9, cx, cy, globeRadius * 1.5);
        haloGrad.addColorStop(0, 'rgba(6, 182, 212, 0.3)');
        haloGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.15)');
        haloGrad.addColorStop(1, 'rgba(3, 7, 18, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, globeRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isWarping]);

  // Handle launch with warp sound + hyperspace transition
  const handleLaunch = () => {
    playSciFiSound('launch');
    setIsWarping(true);
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onGetStarted();
      }, 500);
    }, 400);
  };

  // Mouse move parallax 3D effect
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 20;
    const y = (clientY / window.innerHeight - 0.5) * 20;
    setTilt({ x, y });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-[9999] bg-[#02040c] text-slate-100 flex flex-col justify-between p-4 sm:p-8 select-none overflow-hidden transition-all duration-700 ${
        isExiting ? 'scale-150 opacity-0 blur-2xl pointer-events-none' : 'scale-100 opacity-100'
      }`}
    >
      {/* 3D WebGL Canvas Engine in background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Cybernetic HUD Scanlines & Flare Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Horizontal Lens Flare Line */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent blur-[1px] animate-pulse" />

        {/* Laser Scanning Line */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-32 w-full pointer-events-none animate-[scanline_6s_linear_infinite]" />

        {/* Ambient Corner Radial Glows */}
        <div className="absolute top-0 left-0 w-[30rem] h-[30rem] bg-cyan-500/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-emerald-500/15 rounded-full blur-[160px]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.35)] backdrop-blur-md flex items-center justify-center">
            <Orbit className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black tracking-widest text-cyan-400 uppercase">
                JalDrishti Space Observatory
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                v5.0 PRO
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Alva's Institute of Engineering & Technology • CSE Major Project 2026
            </div>
          </div>
        </div>

        {/* Top Right Live Telemetry Ticker & Audio Control */}
        <div className="flex items-center gap-3">
          {/* Live Orbit Status Ticker */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 text-xs font-mono text-slate-300 backdrop-blur-md shadow-xl">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>ALT: <strong className="text-cyan-400">{telemetryCount} KM</strong></span>
            <span className="text-slate-600">|</span>
            <span>BAND: <strong className="text-emerald-400">SENTINEL-2 L2A</strong></span>
          </div>

          {/* Audio Synthesizer Sound Effects Toggle */}
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (isMuted) playSciFiSound('hover');
            }}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition shadow-lg"
            title={isMuted ? 'Enable Sci-Fi Audio Synthesizer' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />}
          </button>

          {/* Quick Skip Intro */}
          <button
            onClick={handleLaunch}
            onMouseEnter={() => playSciFiSound('hover')}
            className="text-xs font-mono text-slate-300 hover:text-white transition px-4 py-2 rounded-xl border border-cyan-500/30 hover:border-cyan-400 bg-slate-900/80 hover:bg-cyan-950/60 backdrop-blur-md shadow-lg"
          >
            Skip Intro →
          </button>
        </div>
      </header>

      {/* Main Center Cinematic Title Card with 3D Parallax Tilt */}
      <main
        style={{
          transform: `perspective(1000px) rotateX(${-tilt.y}deg) rotateY(${tilt.x}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
        className="relative z-10 max-w-4xl mx-auto text-center space-y-7 my-auto py-6 px-4"
      >
        {/* Category Badge with Glowing Halo */}
        <div className="inline-flex items-center gap-2.5 px-4.5 py-1.5 rounded-full bg-slate-950/90 border border-cyan-400/50 text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_35px_rgba(6,182,212,0.3)] backdrop-blur-xl animate-float-slow">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>SPACEBORNE WATERBORNE DISEASE EARLY WARNING SYSTEM</span>
        </div>

        {/* Cinematic Title "JALDRISHTI" with Glitch & Light Sweep Effect */}
        <div className="relative group py-2">
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-emerald-300 drop-shadow-[0_15px_45px_rgba(6,182,212,0.6)] font-sans animate-shimmer-text">
            JALDRISHTI
          </h1>
          {/* Chromatic Neon Aura behind Title */}
          <div className="absolute inset-0 text-6xl sm:text-8xl lg:text-9xl font-black tracking-tight text-cyan-400/25 blur-2xl pointer-events-none select-none">
            JALDRISHTI
          </div>
        </div>

        {/* Subtitle Description */}
        <p className="text-base sm:text-xl font-medium text-slate-200 max-w-2xl mx-auto leading-relaxed drop-shadow">
          Predicting Acute Diarrheal Disease, Cholera, and Typhoid outbreaks across 225+ Indian districts{' '}
          <span className="text-cyan-300 font-bold underline decoration-emerald-400/80 underline-offset-4">
            2–4 weeks in advance
          </span>{' '}
          using multi-spectral satellite telemetry and XGBoost ML.
        </p>

        {/* 4 Interactive Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2 text-xs font-mono">
          <div
            onMouseEnter={() => playSciFiSound('hover')}
            className={`p-3.5 rounded-2xl bg-slate-950/90 border transition-all duration-300 text-left backdrop-blur-xl ${
              activeNode === 0
                ? 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] bg-cyan-950/40 scale-105'
                : 'border-slate-800/80 hover:border-cyan-500/40'
            }`}
          >
            <div className="text-cyan-400 font-bold mb-1 flex items-center gap-1.5">
              <Satellite className="w-4 h-4 text-cyan-400" /> Sentinel-2 L2A
            </div>
            <div className="text-[11px] text-slate-400 leading-tight">Turbidity, NDCI, CDOM & NDWI</div>
          </div>

          <div
            onMouseEnter={() => playSciFiSound('hover')}
            className={`p-3.5 rounded-2xl bg-slate-950/90 border transition-all duration-300 text-left backdrop-blur-xl ${
              activeNode === 1
                ? 'border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.4)] bg-amber-950/40 scale-105'
                : 'border-slate-800/80 hover:border-amber-500/40'
            }`}
          >
            <div className="text-amber-400 font-bold mb-1 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-amber-400" /> MODIS LST
            </div>
            <div className="text-[11px] text-slate-400 leading-tight">Surface Temp (&gt;25°C threshold)</div>
          </div>

          <div
            onMouseEnter={() => playSciFiSound('hover')}
            className={`p-3.5 rounded-2xl bg-slate-950/90 border transition-all duration-300 text-left backdrop-blur-xl ${
              activeNode === 2
                ? 'border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)] bg-emerald-950/40 scale-105'
                : 'border-slate-800/80 hover:border-emerald-500/40'
            }`}
          >
            <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" /> XGBoost ML
            </div>
            <div className="text-[11px] text-slate-400 leading-tight">SMOTE + SHAP Feature Explainability</div>
          </div>

          <div
            onMouseEnter={() => playSciFiSound('hover')}
            className={`p-3.5 rounded-2xl bg-slate-950/90 border transition-all duration-300 text-left backdrop-blur-xl ${
              activeNode === 3
                ? 'border-teal-400 shadow-[0_0_25px_rgba(20,184,166,0.4)] bg-teal-950/40 scale-105'
                : 'border-slate-800/80 hover:border-teal-500/40'
            }`}
          >
            <div className="text-teal-400 font-bold mb-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-teal-400" /> NFHS-5 SVI
            </div>
            <div className="text-[11px] text-slate-400 leading-tight">Social Vulnerability Index (PCA)</div>
          </div>
        </div>

        {/* Main "LAUNCH OBSERVATORY" Action Button with Pulse Rings */}
        <div className="pt-4">
          <button
            onClick={handleLaunch}
            onMouseEnter={() => playSciFiSound('hover')}
            className="group relative inline-flex items-center gap-3.5 px-10 py-5 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 text-white font-black text-base sm:text-lg shadow-[0_0_70px_rgba(6,182,212,0.7)] hover:shadow-[0_0_100px_rgba(16,185,129,0.9)] border border-cyan-200/60 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden animate-pulse-border"
          >
            {/* Shimmer Light Reflection Sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />

            <Rocket className="w-5 h-5 text-cyan-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            <span className="tracking-wider">LAUNCH OBSERVATORY</span>
            <ArrowRight className="w-5 h-5 text-cyan-100 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </main>

      {/* Bottom Footer Telemetry & Author Credits */}
      <footer className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400 border-t border-white/10 pt-4 font-mono">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-sky-400" />
          <span>
            Guided by: <strong className="text-slate-200">Dr. Chandra Naik</strong> (Associate Professor)
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          <span>Josna Fernandes</span> • <span>Kajal Kamble</span> • <span>Hemalatha K B</span> • <span>Arpita Gavi</span>
        </div>

        <div className="flex items-center gap-2 text-sky-400 font-bold text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>₹0 Data License • 100% Public Satellite</span>
        </div>
      </footer>
    </div>
  );
};
