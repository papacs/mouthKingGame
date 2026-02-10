import { SFX, SFX_GROUPS, type SfxEntry, type SfxKey } from '../config/soundConfig';

interface AudioPoolEntry {
  elements: HTMLAudioElement[];
  nextIndex: number;
}

export interface AudioSystem {
  unlock: () => void;
  play: (key: SfxKey, options?: { volume?: number; rate?: number }) => void;
}

export function createAudioSystem(): AudioSystem {
  let ctx: AudioContext | null = null;
  const pools = new Map<SfxKey, AudioPoolEntry>();
  const lastPlayed = new Map<SfxKey, number>();
  const lastGroupPlayed = new Map<string, number>();

  const getContext = (): AudioContext => {
    if (!ctx) ctx = new AudioContext();
    return ctx;
  };

  const ensureUnlocked = (): void => {
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }
  };

  const buildPool = (key: SfxKey, entry: SfxEntry): AudioPoolEntry => {
    const elements: HTMLAudioElement[] = [];
    if (entry.src) {
      const src = `${import.meta.env.BASE_URL}${entry.src}`;
      for (let i = 0; i < entry.maxPolyphony; i += 1) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        elements.push(audio);
      }
    }
    return { elements, nextIndex: 0 };
  };

  const canPlay = (key: SfxKey, entry: SfxEntry, now: number): boolean => {
    const lastKey = lastPlayed.get(key) ?? 0;
    if (now - lastKey < entry.cooldownMs) return false;
    if (entry.group) {
      const groupCooldown = SFX_GROUPS[entry.group]?.cooldownMs ?? 0;
      const lastGroup = lastGroupPlayed.get(entry.group) ?? 0;
      if (now - lastGroup < groupCooldown) return false;
    }
    return true;
  };

  const playTone = (entry: SfxEntry): void => {
    if (!entry.tone) return;
    const context = getContext();
    ensureUnlocked();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = entry.tone.type ?? 'sine';
    oscillator.frequency.value = entry.tone.frequency;
    gain.gain.value = entry.volume;
    gain.gain.setValueAtTime(entry.volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + entry.tone.durationMs / 1000);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + entry.tone.durationMs / 1000);
  };

  const playFromPool = (key: SfxKey, entry: SfxEntry, volume?: number, rate?: number): void => {
    const pool = pools.get(key) ?? buildPool(key, entry);
    pools.set(key, pool);
    const elements = pool.elements;
    if (elements.length === 0) {
      playTone(entry);
      return;
    }
    const audio = elements[pool.nextIndex];
    pool.nextIndex = (pool.nextIndex + 1) % elements.length;
    const [minRate, maxRate] = entry.rateRange ?? [1, 1];
    const playbackRate = rate ?? (minRate === maxRate ? minRate : minRate + Math.random() * (maxRate - minRate));
    audio.pause();
    audio.currentTime = 0;
    audio.volume = Math.min(1, Math.max(0, entry.volume * (volume ?? 1)));
    audio.playbackRate = playbackRate;
    void audio.play();
  };

  return {
    unlock: () => {
      const context = getContext();
      if (context.state === 'suspended') {
        void context.resume();
      }
    },
    play: (key, options) => {
      const entry = SFX[key];
      if (!entry) return;
      const now = performance.now();
      if (!canPlay(key, entry, now)) return;
      lastPlayed.set(key, now);
      if (entry.group) lastGroupPlayed.set(entry.group, now);
      playFromPool(key, entry, options?.volume, options?.rate);
    }
  };
}

export function drainSfxQueue(system: AudioSystem, queue: { key: SfxKey; volume?: number; rate?: number }[]): void {
  if (queue.length === 0) return;
  const pending = queue.splice(0, queue.length);
  for (const item of pending) {
    system.play(item.key, { volume: item.volume, rate: item.rate });
  }
}
