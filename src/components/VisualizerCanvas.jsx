import React, { useEffect, useRef } from 'react';

export default function VisualizerCanvas({ analyserNode, isPlaying, accentColor = '#8b5cf6' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 64;
    const dataArray = analyserNode ? new Uint8Array(bufferLength) : new Uint8Array(64);

    let idleAngle = 0;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      // Match canvas resolution to element display size
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (isPlaying && analyserNode) {
        analyserNode.getByteFrequencyData(dataArray);

        const barCount = 48;
        const barWidth = (width / barCount) * 0.7;
        let x = 0;

        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * (bufferLength / 2));
          const value = dataArray[dataIndex] || 0;
          const percent = value / 255;
          const barHeight = Math.max(4, percent * height * 0.85);

          // Neon gradient from accent color to pink/cyan
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, `${accentColor}33`);
          gradient.addColorStop(0.5, accentColor);
          gradient.addColorStop(1, '#ec4899');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          // Cap highlight on top of bar
          if (percent > 0.4) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, height - barHeight - 2, barWidth, 2);
          }

          x += width / barCount;
        }
      } else {
        // Idle ambient gentle wave
        idleAngle += 0.04;
        const barCount = 48;
        const barWidth = (width / barCount) * 0.7;
        let x = 0;

        for (let i = 0; i < barCount; i++) {
          const wave = Math.sin(idleAngle + (i * 0.2)) * 0.5 + 0.5;
          const barHeight = Math.max(3, wave * (height * 0.25));

          ctx.fillStyle = `${accentColor}44`;
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, barWidth, barHeight, [3, 3, 0, 0]);
          ctx.fill();

          x += width / barCount;
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyserNode, isPlaying, accentColor]);

  return (
    <div className="w-full h-16 md:h-20 flex items-center justify-center overflow-hidden rounded-xl bg-black/20 border border-white/5 backdrop-blur-md px-3">
      <canvas
        ref={canvasRef}
        width={480}
        height={80}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
