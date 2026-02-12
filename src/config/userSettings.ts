export type SpawnRateId = 'low' | 'normal' | 'high' | 'extreme';
export type FallSpeedId = 'slow' | 'normal' | 'fast' | 'extreme';

export type UserSettings = {
  spawnRate: SpawnRateId;
  fallSpeed: FallSpeedId;
};

export type SpawnRateOption = {
  id: SpawnRateId;
  label: string;
  intervalScale: number;
};

export type FallSpeedOption = {
  id: FallSpeedId;
  label: string;
  speedScale: number;
};

const STORAGE_KEY = 'mouth-king-game:settings';

const SPAWN_RATE_OPTIONS: SpawnRateOption[] = [
  { id: 'low', label: '稀疏', intervalScale: 1.25 },
  { id: 'normal', label: '标准', intervalScale: 1.0 },
  { id: 'high', label: '密集', intervalScale: 0.7 },
  { id: 'extreme', label: '疯狂', intervalScale: 0.5 }
];

const FALL_SPEED_OPTIONS: FallSpeedOption[] = [
  { id: 'slow', label: '慢', speedScale: 0.85 },
  { id: 'normal', label: '标准', speedScale: 1.0 },
  { id: 'fast', label: '快', speedScale: 1.2 },
  { id: 'extreme', label: '超快', speedScale: 1.4 }
];

const DEFAULT_SETTINGS: UserSettings = {
  spawnRate: 'extreme',
  fallSpeed: 'extreme'
};

let cachedSettings: UserSettings = loadSettings();

function isSpawnRateId(value: string): value is SpawnRateId {
  return SPAWN_RATE_OPTIONS.some((option) => option.id === value);
}

function isFallSpeedId(value: string): value is FallSpeedId {
  return FALL_SPEED_OPTIONS.some((option) => option.id === value);
}

function loadSettings(): UserSettings {
  if (typeof window === 'undefined' || !window.localStorage) return { ...DEFAULT_SETTINGS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    const spawnRate = parsed.spawnRate && isSpawnRateId(parsed.spawnRate) ? parsed.spawnRate : DEFAULT_SETTINGS.spawnRate;
    const fallSpeed = parsed.fallSpeed && isFallSpeedId(parsed.fallSpeed) ? parsed.fallSpeed : DEFAULT_SETTINGS.fallSpeed;
    return { spawnRate, fallSpeed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function persistSettings(settings: UserSettings): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function getSpawnRateOptions(): SpawnRateOption[] {
  return SPAWN_RATE_OPTIONS;
}

export function getFallSpeedOptions(): FallSpeedOption[] {
  return FALL_SPEED_OPTIONS;
}

export function getUserSettings(): UserSettings {
  return { ...cachedSettings };
}

export function setUserSettings(next: Partial<UserSettings>): UserSettings {
  const spawnRate = next.spawnRate && isSpawnRateId(next.spawnRate) ? next.spawnRate : cachedSettings.spawnRate;
  const fallSpeed = next.fallSpeed && isFallSpeedId(next.fallSpeed) ? next.fallSpeed : cachedSettings.fallSpeed;
  cachedSettings = { spawnRate, fallSpeed };
  persistSettings(cachedSettings);
  return getUserSettings();
}

export function getGameplayModifiers(): { spawnIntervalScale: number; fallSpeedScale: number } {
  const spawnRate = SPAWN_RATE_OPTIONS.find((option) => option.id === cachedSettings.spawnRate) ?? SPAWN_RATE_OPTIONS[1];
  const fallSpeed = FALL_SPEED_OPTIONS.find((option) => option.id === cachedSettings.fallSpeed) ?? FALL_SPEED_OPTIONS[1];
  return {
    spawnIntervalScale: spawnRate.intervalScale,
    fallSpeedScale: fallSpeed.speedScale
  };
}
