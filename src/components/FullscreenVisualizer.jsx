import React, { useEffect, useRef } from 'react';

export default function FullscreenVisualizer({
  analyserNode,
  isPlaying,
  accentColor = '#8b5cf6',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize canvas to match display size
    const handleResize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 64;
    const dataArray = analyserNode ? new Uint8Array(bufferLength) : new Uint8Array(64);

    // Starfield Particle generator
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 0.5,
      speedY: Math.random() * 0.4 + 0.1,
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.6 + 0.2,
    }));

    let idleAngle = 0;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Render floating background star dust
      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      if (isPlaying && analyserNode) {
        analyserNode.getByteFrequencyData(dataArray);

        const barCount = 72;
        const barWidth = (width / barCount) * 0.65;
        const centerY = height * 0.65;
        let x = 0;

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * (bufferLength / 2));
          const value = dataArray[dataIndex] || 0;
          const percent = value / 255;
          const barHeight = Math.max(6, percent * (height * 0.45));

          // Neon gradient from accent color to pink & cyan
          const gradient = ctx.createLinearGradient(0, centerY, 0, centerY - barHeight);
          gradient.addColorStop(0, `${accentColor}22`);
          gradient.addColorStop(0.4, accentColor);
          gradient.addColorStop(1, '#ec4899');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, centerY - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          // Mirror reflection below
          const mirrorGradient = ctx.createLinearGradient(0, centerY, 0, centerY + barHeight * 0.35);
          mirrorGradient.addColorStop(0, `${accentColor}33`);
          mirrorGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = mirrorGradient;
          ctx.beginPath();
          ctx.roundRect(x, centerY, barWidth, barHeight * 0.35, [0, 0, 4, 4]);
          ctx.fill();

          // Cap light on peak
          if (percent > 0.35) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, centerY - barHeight - 2, barWidth, 2);
          }

          x += width / barCount;
        }
      } else {
        // Idle ambient gentle ocean wave
        idleAngle += 0.025;
        const barCount = 72;
        const barWidth = (width / barCount) * 0.65;
        const centerY = height * 0.65;
        let x = 0;

        for (let i = 0; i < barCount; i++) {
          const wave = Math.sin(idleAngle + (i * 0.15)) * 0.5 + 0.5;
          const barHeight = Math.max(4, wave * (height * 0.15));

          ctx.fillStyle = `${accentColor}33`;
          ctx.beginPath();
          ctx.roundRect(x, centerY - barHeight, barWidth, barHeight, [3, 3, 0, 0]);
          ctx.fill();

          x += width / barCount;
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [analyserNode, isPlaying, accentColor]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
