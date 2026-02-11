import { TUNING, getActiveTheme } from '../config/gameConfig';
import type { GameState } from '../core/types';

const PLAYER_COLORS = ['#2ecc71', '#3498db', '#f39c12', '#e74c3c'];

export function renderGame(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, state: GameState): void {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);

  const shake =
    state.shakeFrames > 0
      ? (state.shakeFrames % 2 === 0 ? 1 : -1) * Math.min(3, 1 + state.shakeFrames * 0.2)
      : 0;
  if (shake !== 0) {
    ctx.save();
    ctx.translate(shake, -shake);
  }

  if (video.readyState >= 2) {
    ctx.drawImage(video, 0, 0, width, height);
  }

  if (getActiveTheme().id === 'spring_festival_horse') {
    ctx.save();
    ctx.globalAlpha = 0.18;
    const pulse = 0.85 + 0.15 * Math.sin(state.frame * 0.04);
    const lanterns = 5;
    for (let i = 0; i < lanterns; i += 1) {
      const x = ((i + 1) * width) / (lanterns + 1);
      const y = 54 + (i % 2) * 16;
      ctx.fillStyle = `rgba(230, 56, 70, ${0.6 * pulse})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 18, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 215, 102, 0.9)';
      ctx.fillRect(x - 2, y + 24, 4, 14);
    }
    ctx.restore();
  }

  ctx.save();
  ctx.scale(-1, 1);

  for (const item of state.items) {
    ctx.font = '38px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.emoji, -item.x, item.y);
  }

  for (const p of state.players) {
    if (!p.active) continue;
    const x = p.x * width;
    const y = p.y * height;

    const eliminated = p.eliminated || p.hp <= 0;
    ctx.beginPath();
    ctx.arc(-x, y, TUNING.mouthRadius, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = eliminated ? '#888888' : (PLAYER_COLORS[p.id] ?? '#ffffff');
    ctx.stroke();

    if (!eliminated) {
      const pulse = (frames: number): number => 0.2 + 0.3 * (0.5 + 0.5 * Math.sin((frames % 18) * 0.35));
      if (p.maskFrames > 0) {
        ctx.strokeStyle = 'rgba(194, 240, 255, 0.8)';
        ctx.lineWidth = 6;
        ctx.globalAlpha = pulse(p.maskFrames);
        ctx.beginPath();
        ctx.arc(-x, y, TUNING.mouthRadius + 6, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (p.sunglassesFrames > 0) {
        ctx.strokeStyle = 'rgba(245, 197, 66, 0.9)';
        ctx.lineWidth = 6;
        ctx.globalAlpha = pulse(p.sunglassesFrames);
        ctx.beginPath();
        ctx.arc(-x, y, TUNING.mouthRadius + 10, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (p.feverFrames > 0) {
        ctx.strokeStyle = 'rgba(255, 140, 66, 0.9)';
        ctx.lineWidth = 4;
        ctx.globalAlpha = pulse(p.feverFrames);
        ctx.beginPath();
        ctx.arc(-x, y, TUNING.mouthRadius + 14, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (p.shieldFrames > 0) {
        ctx.strokeStyle = 'rgba(109, 213, 255, 0.9)';
        ctx.lineWidth = 4;
        ctx.globalAlpha = pulse(p.shieldFrames);
        ctx.beginPath();
        ctx.arc(-x, y, TUNING.mouthRadius + 18, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    ctx.font = '58px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = eliminated ? 0.85 : 1;
    let faceIcon = p.mouthOpen ? '😮' : '😐';
    if (p.sunglassesFrames > 0) faceIcon = '😎';
    if (p.maskFrames > 0) faceIcon = '😷';
    if (eliminated) faceIcon = p.loserMark ?? '😷';
    ctx.fillText(faceIcon, -x, y);
    ctx.globalAlpha = 1;

    ctx.font = '18px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`P${p.id + 1}`, -x, y - TUNING.mouthRadius - 20);
  }

  ctx.restore();

  if (state.poopStormFrames > 0) {
    ctx.save();
    ctx.scale(-1, 1);
    const count = 42;
    for (let i = 0; i < count; i += 1) {
      const seed = (state.frame * 31 + i * 97) % 997;
      const rx = (seed * 37) % width;
      const ry = ((seed * 53 + state.frame * 9) % height);
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.75;
      ctx.fillText('💩', -rx, ry);
    }

    for (const splat of state.poopSplats) {
      const x = splat.x * width;
      const y = splat.y * height;
      ctx.globalAlpha = splat.alpha;
      ctx.fillStyle = '#6b4a1b';
      ctx.beginPath();
      ctx.ellipse(-x, y, splat.r, splat.r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = splat.alpha * 0.6;
      ctx.fillRect(-x - splat.r * 0.15, y, splat.r * 0.3, splat.r * 1.2);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  if (state.trapFlashFrames > 0) {
    ctx.save();
    const alpha = Math.min(0.35, state.trapFlashFrames / 30);
    ctx.fillStyle = `rgba(255, 80, 80, ${alpha})`;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  ctx.save();
  ctx.scale(-1, 1);
  for (const ft of state.floatTexts) {
    ctx.globalAlpha = Math.min(1, Math.max(0, ft.life / 35));
    const size = ft.size ?? 20;
    ctx.font = `bold ${size}px Arial`;
    ctx.fillStyle = ft.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ft.text, -ft.x, ft.y);
  }
  ctx.restore();
  ctx.globalAlpha = 1;

  if (shake !== 0) {
    ctx.restore();
  }
}
