import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { GameScene } from './GameScene';
import { gameStore, GameStateData } from './GameState';
import { Crosshair, Shield, Heart, Navigation, Maximize2, Minimize2, X, RefreshCcw, RotateCcw, Sliders } from 'lucide-react';
import { motion } from 'motion/react';
import { useGameFullscreen } from '../../../../hooks/useGameFullscreen';
import { GameCustomizationModal } from '../shared/GameCustomizationModal';
import { hasAdminSession } from '../../../../lib/adminAuth';

interface BattleRoyaleProps {
  onBack: () => void;
}

export const BattleRoyale3D: React.FC<BattleRoyaleProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<GameStateData>({
    phase: 'menu',
    score: 0,
    timeAlive: 0,
    eliminations: 0,
    placement: 1,
    health: 100,
    armor: 0,
    ammo: 30,
    maxAmmo: 30,
    botsRemaining: 19,
    safeZoneRadius: 200,
    safeZoneCenter: [0, 0],
    nearLoot: null,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen, viewportSize } = useGameFullscreen(containerRef);
  const [gameScale, setGameScale] = useState(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isAuth] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      if (hasAdminSession()) return true;
      const profileRaw = localStorage.getItem('bharatjugaad_user_profile_v1');
      if (profileRaw) {
        const p = JSON.parse(profileRaw);
        if (p.isLoggedIn || p.email || p.mobile) return true;
      }
    } catch {}
    return false;
  });

  // Mobile detection
  const isMobile = window.innerWidth <= 768;

  // Mobile Controls Ref
  const actionControls = useRef({
    joystick: { x: 0, y: 0 },
    jump: false,
    fire: false,
    sprint: false,
    aim: false,
    crouch: false,
  });

  useEffect(() => {
    const handleStateUpdate = (partial: Partial<GameStateData>) => {
      setGameState(prev => ({ ...prev, ...partial }));
    };
    gameStore.listeners.add(handleStateUpdate);
    // Init state
    handleStateUpdate({ phase: gameStore.phase });
    
    return () => {
      gameStore.listeners.delete(handleStateUpdate);
      // Cleanup pointers
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    };
  }, []);

  const startGame = () => {
    gameStore.reset();
  };

  const reload = () => {
    if (gameStore.phase === 'playing') {
      gameStore.ammo = gameStore.maxAmmo;
      gameStore.notify();
    }
  };

  const interact = () => {
    if (gameStore.phase === 'playing' && gameStore.nearLoot) {
      const lootItem = gameStore.loot.find(l => l.id === gameStore.nearLoot && l.active);
      if (lootItem) {
        lootItem.active = false;
        if (lootItem.type === 'health') {
          gameStore.health = Math.min(100, gameStore.health + 50);
        } else {
          gameStore.ammo += 30;
          gameStore.maxAmmo += 30;
        }
        gameStore.nearLoot = null;
        gameStore.notify();
      }
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyR') reload();
      if (e.code === 'KeyE') interact();
    };
    
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let dx = (touch.clientX - centerX) / (rect.width / 2);
    let dy = (touch.clientY - centerY) / (rect.height / 2);
    
    // Clamp to circle
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 1) {
      dx /= dist;
      dy /= dist;
    }
    
    actionControls.current.joystick = { x: dx, y: -dy }; // -dy because y is inverted
  };

  const handleTouchEnd = () => {
    actionControls.current.joystick = { x: 0, y: 0 };
  };

  const battleRoyaleContent = (
    <motion.div 
      layout={!isFullscreen}
      transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
      ref={containerRef}
      className={`game-container relative w-full mx-auto bg-slate-900 overflow-hidden shadow-2xl ${isFullscreen ? 'z-[99999] fixed inset-0 w-screen h-screen m-0 rounded-none' : 'h-[60vh] sm:h-[70vh] rounded-2xl'}`}
      style={{ 
        height: isFullscreen ? `${viewportSize.height}px` : undefined,
        transformOrigin: 'top center', 
        transform: isFullscreen ? 'none' : `scale(${gameScale})`, 
        marginBottom: isFullscreen ? 0 : `${(gameScale - 1) * 70}vh` 
      }}
    >
      {/* 3D Canvas */}
      {(gameState.phase === 'playing' || gameState.phase === 'dropping' || gameState.phase === 'gameover') && (
        <div className="absolute inset-0 cursor-crosshair">
          <GameScene isMobile={isMobile} actionControls={actionControls.current} />
        </div>
      )}

      {/* Main Menu Overlay */}
      {gameState.phase === 'menu' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm z-50">
          <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-rose-600 mb-2">
            BATTLE ROYALE 3D
          </h1>
          <p className="text-slate-300 mb-8 font-semibold">Land • Loot • Survive • Win</p>
          
          <button 
            onClick={startGame}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white rounded-xl font-black text-xl shadow-lg transition-transform hover:scale-105 active:scale-95 mb-6"
          >
            PLAY NOW
          </button>
          
          {!isMobile && (
            <div className="text-slate-400 text-sm flex gap-6 mt-4">
              <span className="flex items-center gap-1"><b>WASD</b> Move</span>
              <span className="flex items-center gap-1"><b>Mouse</b> Look</span>
              <span className="flex items-center gap-1"><b>L-Click</b> Fire</span>
              <span className="flex items-center gap-1"><b>Space</b> Jump</span>
            </div>
          )}
        </div>
      )}

      {/* Dropping Overlay */}
      {gameState.phase === 'dropping' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <h2 className="text-3xl font-black text-white drop-shadow-lg animate-pulse">DEPLOYING...</h2>
        </div>
      )}

      {/* Game HUD */}
      {gameState.phase === 'playing' && (
        <div className="battle-ground-root absolute inset-0 pointer-events-none z-10 select-none">
          <div className="hud hud-top-left pointer-events-auto">
            <div className="player-status">
              <div className="player-name">PLAYER</div>
              <div className="status-bar">
                <span className="status-label text-white text-[10px]">HP</span>
                <div className="bar">
                  <span style={{ width: `${gameState.health}%`, backgroundColor: '#ef4444' }}></span>
                </div>
                <span className="text-white ml-1 text-[10px]">{Math.floor(gameState.health)}</span>
              </div>
              <div className="status-bar">
                <span className="status-label text-white text-[10px]">ARM</span>
                <div className="bar armor">
                  <span style={{ width: `${gameState.armor}%`, backgroundColor: '#3b82f6' }}></span>
                </div>
                <span className="text-white ml-1 text-[10px]">{Math.floor(gameState.armor)}</span>
              </div>
            </div>
          </div>

          <div className="hud hud-compass pointer-events-auto text-white">
            <span>W</span><span>NW</span><strong>N</strong><span>NE</span><span>E</span>
          </div>

          <div className="hud hud-top-right pointer-events-auto">
            <div className="match-info text-white">
              <span>ALIVE <b>{gameState.botsRemaining + 1}</b></span>
              <span>ELIMS <b>{gameState.eliminations}</b></span>
            </div>
            <button className="hud-map-button">
              <div id="miniMap">
                <div className="zone" style={{ transform: `translate(-50%, -50%) scale(${gameState.safeZoneRadius / 200})`, left: '50%', top: '50%' }}></div>
                <div className="player-marker"></div>
              </div>
              <span id="zoneTimer">{(45 - (gameState.timeAlive % 45)).toFixed(0)}s</span>
            </button>
          </div>

          {gameState.nearLoot && (
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-white/20 pointer-events-auto z-[99]">
              <span className="text-white font-bold flex items-center gap-2">
                {!isMobile && <span className="bg-white text-slate-900 px-2 py-0.5 rounded text-xs">E</span>}
                PICK UP
              </span>
              {isMobile && (
                <button 
                  onClick={interact}
                  className="mt-2 w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-1 rounded text-sm"
                >
                  TAP TO LOOT
                </button>
              )}
            </div>
          )}

          {isMobile && (
            <div className="mobile-controls left-controls pointer-events-none">
              <div 
                className="virtual-joystick pointer-events-auto"
                onTouchStart={handleTouchMove}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="joystick-base">
                  <div className="joystick-thumb" style={{ transform: `translate3d(${actionControls.current.joystick.x * 25}px, ${-actionControls.current.joystick.y * 25}px, 0)` }}></div>
                </div>
              </div>
              <button 
                className="hud-action small pointer-events-auto"
                onTouchStart={() => actionControls.current.sprint = !actionControls.current.sprint}
              >
                🏃<span className="text-[8px] mt-0.5">SPRINT</span>
              </button>
            </div>
          )}

          {isMobile && (
            <div className="mobile-controls right-controls pointer-events-none">
              <button className="hud-action medium pointer-events-auto" id="aimButton" onTouchStart={() => actionControls.current.aim = !actionControls.current.aim}>🎯</button>
              <button className="hud-action fire pointer-events-auto" onTouchStart={() => {
                actionControls.current.fire = true;
                if (document.pointerLockElement) document.exitPointerLock();
              }}>🔥</button>
              <div className="secondary-actions pointer-events-auto">
                <button className="hud-action" onTouchStart={() => actionControls.current.jump = true}>⬆</button>
                <button className="hud-action" onTouchStart={() => actionControls.current.crouch = !actionControls.current.crouch}>🧎</button>
                <button className="hud-action" onTouchStart={reload}>🔄</button>
                <button className={`hud-action ${gameState.nearLoot ? '' : 'hidden'}`} onTouchStart={interact}>✋</button>
              </div>
            </div>
          )}

          <div className="hud bottom-hud pointer-events-auto text-white">
            <div className="health-summary flex flex-col gap-1">
              <div>❤️ <span>{Math.floor(gameState.health)}</span></div>
              <div>🛡️ <span>{Math.floor(gameState.armor)}</span></div>
            </div>
            <div className="weapon-info px-4">
              <div className="weapon-name">ASSAULT RIFLE</div>
              <div className="ammo mt-1"><strong>{gameState.ammo}</strong> / <span>{gameState.maxAmmo}</span></div>
            </div>
            <div className="weapon-slots hidden sm:flex">
              <button className="weapon-slot active">1</button>
              <button className="weapon-slot">2</button>
              <button className="weapon-slot">3</button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState.phase === 'gameover' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md z-50">
          <h2 className={`text-4xl sm:text-6xl font-black mb-2 ${gameState.placement === 1 ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'text-rose-500'}`}>
            {gameState.placement === 1 ? '🏆 VICTORY!' : 'MATCH ENDED'}
          </h2>
          
          <div className="bg-slate-800 rounded-2xl p-6 min-w-[300px] border border-white/10 shadow-2xl mb-8 mt-4">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Placement</span>
              <span className="text-white font-bold">#{gameState.placement}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Eliminations</span>
              <span className="text-white font-bold">{gameState.eliminations}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Survival Time</span>
              <span className="text-white font-bold">{Math.floor(gameState.timeAlive / 60)}:{Math.floor(gameState.timeAlive % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="flex justify-between py-2 pt-4">
              <span className="text-amber-400 font-bold">Final Score</span>
              <span className="text-amber-400 font-black text-xl">{gameState.score}</span>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={startGame}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> TRY AGAIN
            </button>
            <button 
              onClick={() => {
                setGameState(prev => ({ ...prev, phase: 'menu' }));
              }}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold"
            >
              MAIN MENU
            </button>
          </div>
        </div>
      )}

      {/* Top Toolbar (Exit, Resize, Fullscreen) */}
      <div className="game-toolbar absolute top-4 right-4 flex items-center gap-2 z-[100] pointer-events-auto">
        {!isFullscreen && (
          <div className="bg-slate-900/80 backdrop-blur border border-white/10 rounded-full px-3 py-1 flex items-center gap-2 mr-2 min-h-[44px]">
            <span className="text-xs text-slate-400 font-bold">SIZE:</span>
            <button onClick={() => setGameScale(0.75)} className={`text-xs font-bold px-2 py-1 min-h-[36px] min-w-[36px] flex items-center justify-center rounded ${gameScale === 0.75 ? 'bg-amber-500 text-slate-900' : 'text-slate-300'}`}>S</button>
            <button onClick={() => setGameScale(1)} className={`text-xs font-bold px-2 py-1 min-h-[36px] min-w-[36px] flex items-center justify-center rounded ${gameScale === 1 ? 'bg-amber-500 text-slate-900' : 'text-slate-300'}`}>M</button>
            <button onClick={() => setGameScale(1.15)} className={`text-xs font-bold px-2 py-1 min-h-[36px] min-w-[36px] flex items-center justify-center rounded ${gameScale === 1.15 ? 'bg-amber-500 text-slate-900' : 'text-slate-300'}`}>L</button>
          </div>
        )}
        
        {isAuth && (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 min-w-[44px] min-h-[44px] bg-amber-500/80 hover:bg-amber-500 backdrop-blur border border-amber-400/50 rounded-full text-slate-900 transition-colors flex items-center justify-center shadow-sm active:scale-95"
            title="Battle Royale Settings"
            aria-label="Game Settings"
          >
            <Sliders className="w-5 h-5" />
          </button>
        )}
        
        <button 
          onClick={toggleFullscreen}
          className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 min-w-[44px] min-h-[44px] bg-slate-900/80 backdrop-blur border border-white/10 rounded-full text-white hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 font-bold shadow-sm active:scale-95 text-xs"
          title={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
          aria-label={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Exit Full Screen</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Full Screen</span>
            </>
          )}
        </button>
        <button 
          onClick={() => {
            if (document.fullscreenElement) document.exitFullscreen();
            onBack();
          }}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-rose-500/80 backdrop-blur border border-rose-500/50 rounded-full text-white hover:bg-rose-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Game Customization Modal */}
      {isAuth && (
        <GameCustomizationModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          gameId="battleroyale"
          gameTitle="Battle Royale 3D"
        />
      )}
    </motion.div>
  );

  if (isFullscreen && typeof document !== 'undefined') {
    return createPortal(battleRoyaleContent, document.body);
  }

  return battleRoyaleContent;
};
