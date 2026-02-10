import type { GameState } from '../core/types';

const PLAYER_COLORS = ['#2ecc71', '#3498db', '#f39c12', '#e74c3c'];

export function renderGame(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, state: GameState): void {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);

  if (video.readyState >= 2) {
    ctx.drawImage(video, 0, 0, width, height);
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

    ctx.beginPath();
    ctx.arc(-x, y, 50, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = PLAYER_COLORS[p.id] ?? '#ffffff';
    ctx.stroke();

    ctx.font = '58px Arial';
    ctx.fillText(p.mouthOpen ? '😮' : '😐', -x, y);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`P${p.id + 1}`, -x, y - 70);
  }

  ctx.restore();

  for (const ft of state.floatTexts) {
    ctx.globalAlpha = Math.max(0, ft.life / 35);
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.globalAlpha = 1;
}
