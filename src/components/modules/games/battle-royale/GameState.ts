export type GamePhase = 'menu' | 'dropping' | 'playing' | 'gameover';

export interface BotData {
  id: string;
  position: [number, number, number];
  health: number;
  active: boolean;
}

export interface LootData {
  id: string;
  type: 'ammo' | 'health';
  position: [number, number, number];
  active: boolean;
}

export interface GameStateData {
  phase: GamePhase;
  score: number;
  timeAlive: number;
  eliminations: number;
  placement: number;
  health: number;
  armor: number;
  ammo: number;
  maxAmmo: number;
  botsRemaining: number;
  safeZoneRadius: number;
  safeZoneCenter: [number, number];
  nearLoot: string | null;
}

// A simple mutable store for 3D performance
export const gameStore = {
  playerPos: [0, 50, 0] as [number, number, number],
  playerVelocity: [0, 0, 0] as [number, number, number],
  isGrounded: false,
  health: 100,
  armor: 100,
  ammo: 30,
  maxAmmo: 30,
  phase: 'menu' as GamePhase,
  bots: [] as BotData[],
  loot: [] as LootData[],
  nearLoot: null as string | null,
  safeZoneRadius: 200,
  safeZoneCenter: [0, 0] as [number, number],
  timeAlive: 0,
  eliminations: 0,
  placement: 1,
  
  // Callbacks to update React UI
  listeners: new Set<(state: Partial<GameStateData>) => void>(),
  
  notify() {
    const data: GameStateData = {
      phase: this.phase,
      score: this.eliminations * 100 + Math.floor(this.timeAlive),
      timeAlive: this.timeAlive,
      eliminations: this.eliminations,
      placement: this.placement,
      health: this.health,
      armor: this.armor,
      ammo: this.ammo,
      maxAmmo: this.maxAmmo,
      botsRemaining: this.bots.filter(b => b.active).length,
      safeZoneRadius: this.safeZoneRadius,
      safeZoneCenter: this.safeZoneCenter,
      nearLoot: this.nearLoot,
    };
    this.listeners.forEach(l => l(data));
  },
  
  reset() {
    this.playerPos = [0, 50, 0];
    this.playerVelocity = [0, 0, 0];
    this.health = 100;
    this.armor = 100;
    this.ammo = 30;
    this.maxAmmo = 30;
    this.phase = 'dropping';
    this.safeZoneRadius = 200;
    this.safeZoneCenter = [0, 0];
    this.timeAlive = 0;
    this.eliminations = 0;
    this.nearLoot = null;
    
    // Spawn 19 bots + 1 player = 20 total
    this.bots = Array.from({ length: 19 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 180;
      return {
        id: `bot_${i}`,
        position: [Math.cos(angle) * radius, 1, Math.sin(angle) * radius],
        health: 100,
        active: true
      };
    });

    // Spawn 30 loots
    this.loot = Array.from({ length: 30 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 190;
      return {
        id: `loot_${i}`,
        type: Math.random() > 0.5 ? 'ammo' : 'health',
        position: [Math.cos(angle) * radius, 1, Math.sin(angle) * radius],
        active: true
      };
    });

    this.placement = 20;
    this.notify();
  }
};
