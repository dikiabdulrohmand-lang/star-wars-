import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerCharacter, StoryNode, StoryChoice, GameState, Item } from './types';
import { CLASS_DETAILS, STORY_NODES, ENEMIES_DATA } from './data/storyContent';
import { CharacterCreator } from './components/CharacterCreator';
import { CombatSystem } from './components/CombatSystem';
import { StoryManager } from './components/StoryManager';
import { PixelAvatar } from './components/PixelAvatar';
import { audio } from './utils/AudioEngine';
import {
  Compass,
  Briefcase,
  User,
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  MapPin,
  Flame,
  Shield,
  Award,
  CircleAlert,
  Menu,
  X,
  Swords,
  ChevronRight,
  Database
} from 'lucide-react';

const INITIAL_STATE: GameState = {
  player: null,
  currentStoryNodeId: 'start',
  alignment: { rebel: 0, syndicate: 0 },
  pastChoices: [],
  questLogs: ['Melarikan diri dari hanggar'],
  isInCombat: false,
  combatEnemy: null,
  postCombatNodeId: 'start',
  gameCompleted: false,
  endingId: null
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Custom interactive drawers for stats & inventory
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);

  const handleMuteToggle = () => {
    const nextMute = audio.toggleMute();
    setIsMuted(nextMute);
    audio.playClick();
  };

  const startNewGame = () => {
    audio.playClick();
    setHasStarted(true);
    setGameState(INITIAL_STATE);
  };

  const handleCharacterCreated = (char: PlayerCharacter) => {
    setGameState(prev => ({
      ...prev,
      player: char,
      currentStoryNodeId: 'start',
      alignment: { rebel: 0, syndicate: 0 },
      pastChoices: [],
      questLogs: ['Menjawab transmisi takdir kosmik']
    }));
  };

  // Process choices inside the branching story
  const handleChoiceMade = (choice: StoryChoice) => {
    if (!gameState.player) return;

    // Build copy of items and credits
    let newCredits = gameState.player.credits + (choice.creditsReward || 0);
    if (choice.requiredCredits) {
      newCredits -= choice.requiredCredits;
    }

    let nextExp = gameState.player.exp + (choice.expReward || 0);
    let currentLevel = gameState.player.level;
    let maxExp = gameState.player.maxExp;
    let nextStats = { ...gameState.player.stats };
    let nextMaxHp = gameState.player.maxHp;
    let nextMaxEnergy = gameState.player.maxEnergy;

    // Experience leveling-up mechanics
    let leveledUp = false;
    let statsAlert = '';
    while (nextExp >= maxExp) {
      currentLevel += 1;
      nextExp -= maxExp;
      maxExp = Math.floor(maxExp * 1.4);
      
      // Auto upgrade stats +1 each level up
      nextStats.strength += 1;
      nextStats.intelligence += 1;
      nextStats.vitality += 1;
      nextStats.agility += 1;

      nextMaxHp = 100 + nextStats.vitality * 12;
      nextMaxEnergy = 40 + nextStats.intelligence * 6;
      
      leveledUp = true;
      statsAlert = `Level Up! Lv. ${currentLevel}. Kekuatan & energi diperbaharui! (+1 Semua Atribut dasar).`;
    }

    if (leveledUp) {
      audio.playLevelUp();
      setLevelUpMessage(statsAlert);
      setTimeout(() => {
        setLevelUpMessage(null);
      }, 5000);
    }

    // Add inventory rewards
    const updatedInventory = [...gameState.player.inventory];
    if (choice.itemReward) {
      const existing = updatedInventory.find(i => i.id === choice.itemReward!.id);
      if (existing) {
        existing.quantity += choice.itemReward.quantity;
      } else {
        updatedInventory.push({ ...choice.itemReward });
      }
    }

    // Alignment points math
    const newRebelAlignment = gameState.alignment.rebel + (choice.alignmentImpact?.rebel || 0);
    const newSyndicateAlignment = gameState.alignment.syndicate + (choice.alignmentImpact?.syndicate || 0);

    // Save choice logging history journal
    const newPastChoices = [...gameState.pastChoices, {
      nodeId: gameState.currentStoryNodeId,
      choiceText: choice.text
    }];

    // Next direction routing
    const target = choice.leadsTo;

    // Reset indicator helper
    if (target === 'RESET') {
      audio.playLevelUp();
      setGameState(INITIAL_STATE);
      setHasStarted(false);
      return;
    }

    // Check Combat flag syntax: "COMBAT:<EnemyId>:<NextNodeId>"
    if (target.startsWith('COMBAT:')) {
      const parts = target.split(':');
      const enemyId = parts[1];
      const nextNodeId = parts[2];

      const enemyData = ENEMIES_DATA[enemyId];
      if (enemyData) {
        // Reset enemy health
        enemyData.hp = enemyData.maxHp;
        
        setGameState(prev => {
          if (!prev.player) return prev;
          return {
            ...prev,
            player: {
              ...prev.player,
              exp: nextExp,
              level: currentLevel,
              maxExp,
              stats: nextStats,
              maxHp: nextMaxHp,
              maxEnergy: nextMaxEnergy,
              hp: nextMaxHp, // heal up to full before major combat
              energy: nextMaxEnergy,
              credits: newCredits,
              inventory: updatedInventory
            },
            alignment: { rebel: newRebelAlignment, syndicate: newSyndicateAlignment },
            pastChoices: newPastChoices,
            isInCombat: true,
            combatEnemy: { ...enemyData },
            postCombatNodeId: nextNodeId
          };
        });
      }
    } else {
      // Normal node migration
      // Or ending node checks
      const isEnding = target.startsWith('ending_');

      setGameState(prev => {
        if (!prev.player) return prev;
        return {
          ...prev,
          player: {
            ...prev.player,
            exp: nextExp,
            level: currentLevel,
            maxExp,
            stats: nextStats,
            maxHp: nextMaxHp,
            maxEnergy: nextMaxEnergy,
            credits: newCredits,
            inventory: updatedInventory
          },
          alignment: { rebel: newRebelAlignment, syndicate: newSyndicateAlignment },
          pastChoices: newPastChoices,
          currentStoryNodeId: target,
          gameCompleted: isEnding,
          endingId: isEnding ? target : null
        };
      });
    }
  };

  // Combat system success callback
  const handleCombatVictory = (xpEarned: number, creditsEarned: number, itemReward?: Item) => {
    if (!gameState.player) return;

    let nextExp = gameState.player.exp + xpEarned;
    let currentLevel = gameState.player.level;
    let maxExp = gameState.player.maxExp;
    let nextStats = { ...gameState.player.stats };
    let nextMaxHp = gameState.player.maxHp;
    let nextMaxEnergy = gameState.player.maxEnergy;

    let leveledUp = false;
    let statsAlert = '';
    while (nextExp >= maxExp) {
      currentLevel += 1;
      nextExp -= maxExp;
      maxExp = Math.floor(maxExp * 1.4);
      
      nextStats.strength += 1;
      nextStats.intelligence += 1;
      nextStats.vitality += 1;
      nextStats.agility += 1;

      nextMaxHp = 100 + nextStats.vitality * 12;
      nextMaxEnergy = 40 + nextStats.intelligence * 6;
      
      leveledUp = true;
      statsAlert = `Level baru dicapai! Lv. ${currentLevel}. Status bintang meningkat (+1 Semua Parameter dasar).`;
    }

    if (leveledUp) {
      audio.playLevelUp();
      setLevelUpMessage(statsAlert);
      setTimeout(() => {
        setLevelUpMessage(null);
      }, 5000);
    }

    // Update inventory item bag
    const updatedInventory = [...gameState.player.inventory];
    if (itemReward) {
      const existing = updatedInventory.find(i => i.id === itemReward.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        updatedInventory.push({ ...itemReward });
      }
    }

    // Return safely to story manager
    setGameState(prev => {
      if (!prev.player) return prev;
      return {
        ...prev,
        player: {
          ...prev.player,
          exp: nextExp,
          level: currentLevel,
          maxExp,
          stats: nextStats,
          maxHp: nextMaxHp,
          maxEnergy: nextMaxEnergy,
          hp: prev.player.hp, // preserve state HP, or replenish to max for satisfying outcomes
          energy: prev.player.energy,
          credits: prev.player.credits + creditsEarned,
          inventory: updatedInventory
        },
        isInCombat: false,
        combatEnemy: null,
        currentStoryNodeId: prev.postCombatNodeId,
        gameCompleted: prev.postCombatNodeId.startsWith('ending_')
      };
    });
  };

  // Combat failure callback (returns safely with 25% HP penalty to before combat node to retry)
  const handleCombatDefeat = () => {
    if (!gameState.player) return;

    // Resets hp to 35% to give secondary tactical attempt rather than total wipe
    const pityHp = Math.floor(gameState.player.maxHp * 0.4);
    
    setGameState(prev => {
      if (!prev.player) return prev;
      return {
        ...prev,
        player: {
          ...prev.player,
          hp: pityHp,
          energy: prev.player.maxEnergy
        },
        isInCombat: false,
        combatEnemy: null,
        // Send player back to previous state node to purchase consumables or make alternate efforts
        currentStoryNodeId: prev.player.credits > 150 ? prev.currentStoryNodeId : 'start'
      };
    });
  };

  const handleStatsLevelUp = (newLevel: number, statPointGained: number) => {
    // handled internally inside leveling formula, but hooked up just in case
  };

  const currentNode = STORY_NODES[gameState.currentStoryNodeId] || STORY_NODES['start'];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col justify-between selection:bg-cyan-500 selection:text-white font-sans" id="main-application">
      
      {/* Dynamic Header Navbar Bar */}
      <header className="h-16 border-b border-[#27272a] bg-[#121216] sticky top-0 z-30 px-8 flex justify-between items-center shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              audio.playClick();
              setGameState(INITIAL_STATE);
              setHasStarted(false);
            }}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-sm bg-cyan-500 flex items-center justify-center font-black text-[#0c0c0e] shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:bg-cyan-400 transition-all">
              ★
            </div>
            <div>
              <span className="text-sm font-bold tracking-widest text-[#fafafa] group-hover:text-cyan-400 transition-colors uppercase">STAR SAVIOR CHRONICLES</span>
              <p className="text-[10px] text-zinc-500 font-mono">Turn-Based Space RPG</p>
            </div>
          </button>
        </div>

        {/* Action controllers buttons */}
        <div className="flex items-center gap-2">
          {gameState.player && (
            <div className="flex items-center gap-6 mr-4">
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-zinc-500 uppercase tracking-tighter">Stellar Credits</span>
                <span className="font-mono text-xs text-cyan-200">{gameState.player.credits.toFixed(2)}</span>
              </div>
              <button
                onClick={() => {
                  audio.playClick();
                  setIsSidebarOpen(!isSidebarOpen);
                }}
                className="px-3 py-1.5 rounded-sm bg-zinc-900 border border-zinc-700 hover:border-cyan-500/50 hover:bg-zinc-800/80 text-xs text-cyan-400 flex items-center gap-1.5 cursor-pointer font-sans transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Inventori & Atribut</span>
              </button>
            </div>
          )}

          <button
            onClick={handleMuteToggle}
            className="p-2 rounded-sm bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer"
            title={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {hasStarted && (
            <button
              onClick={() => {
                if (window.confirm('Batalkan petualangan saat ini dan kembali ke menu utama?')) {
                  audio.playClick();
                  setGameState(INITIAL_STATE);
                  setHasStarted(false);
                }
              }}
              className="p-2 rounded-sm bg-zinc-900/60 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-900/50 text-zinc-500 hover:text-rose-400 transition-all cursor-pointer"
              title="Reset Petualangan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Level Up Banner Alert */}
      <AnimatePresence>
        {levelUpMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 border-2 border-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-white text-sm font-sans"
          >
            <Award className="w-6 h-6 text-yellow-300 animate-bounce shrink-0" />
            <div>
              <strong className="block text-yellow-300 font-extrabold uppercase tracking-wide">LEVEL UP BINTANG!</strong>
              <span>{levelUpMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container viewport */}
      <main className="flex-grow flex items-center justify-center relative py-6">
        
        {/* Soft starry overlay visuals beneath */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-30" />

        <div className="w-full relative z-10">
          <AnimatePresence mode="wait">
            {/* 1. START HOME PAGE LANDING */}
            {!hasStarted && (
              <motion.div
                key="landing-hero"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-4xl mx-auto px-4 text-center space-y-8"
              >
                {/* Immersive Pixel Logo Box overlay */}
                <div className="relative inline-block p-6 rounded-sm bg-[#0c0c0e] border border-[#27272a] max-w-[420px] mx-auto overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.15)] glow-cyan">
                  <div className="relative py-4">
                    <div className="flex justify-center mb-4">
                      <PixelAvatar
                        sprite={{
                          hairStyle: 'helmet',
                          hairColor: '#06b6d4',
                          skinColor: '#fed7aa',
                          suitColor: '#18181b',
                          accentColor: '#22d3ee',
                          weaponStyle: 'saber'
                        }}
                        size={110}
                        animation="victory"
                      />
                    </div>
                    <h2 className="text-3xl font-bold text-cyan-400 tracking-widest uppercase font-sans">
                      AETHERIA
                    </h2>
                    <span className="text-xs font-mono text-zinc-500 tracking-[0.3em] font-bold uppercase block mt-1.5">
                      STAR SAVIOR
                    </span>
                  </div>
                </div>

                {/* Blurb block */}
                <div className="space-y-3 max-w-lg mx-auto">
                  <p className="text-zinc-300 text-sm leading-relaxed font-sans">
                    Galaksi berada dalam cengkeraman Syndicate raksasa yang menyedot inti matahari sistem Bintang Omega. Bergabunglah dengan Aliansi Pemberontak Ceres, ambil keuntungan sebagai tentara bayaran independen, atau selidiki kuil mistis void kuno.
                  </p>
                  <p className="text-zinc-500 text-xs italic font-mono">
                    Keputusan Anda menentukan takdir, membuka jalur rekrutmen, dan menuntun pada 6 Ending bercabang yang epik.
                  </p>
                </div>

                {/* Big Action launch button */}
                <div className="flex justify-center">
                  <button
                    onClick={startNewGame}
                    className="px-10 py-4 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold tracking-wider shadow-lg shadow-cyan-950 transition-all cursor-pointer font-sans uppercase duration-300"
                  >
                    INITIATE DEPLOYMENT
                  </button>
                </div>

                {/* Sub Features grid layout */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4 text-left">
                  <div className="p-4 rounded-sm bg-[#0c0c0e]/80 border border-[#27272a] space-y-1">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">⚔ SISTEM TURN-BASED</span>
                    <p className="text-[11px] text-zinc-400">Pertempuran taktis menggunakan Energi SP, amunisi taktis, cooldown aktif, dan item medpack.</p>
                  </div>
                  <div className="p-4 rounded-sm bg-[#0c0c0e]/80 border border-[#27272a] space-y-1">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">🎨 PIXEL ART KUSTOM</span>
                    <p className="text-[11px] text-zinc-400">Penyuntingan kosmetik rona baju zirah, gaya rambut, panel energi, senjata langsung terpakai di pertarungan.</p>
                  </div>
                  <div className="p-4 rounded-sm bg-[#0c0c0e]/80 border border-[#27272a] space-y-1">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">🌿 ALIRAN BERCABANG</span>
                    <p className="text-[11px] text-zinc-400">Pilihan faksi memengaruhi kemakmuran, membuka opsi khusus ras kelas, dan mengunci bos pertarungan berbeda.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. CHARACTER BUILDER SCREEN */}
            {hasStarted && !gameState.player && (
              <motion.div
                key="char-creator-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <CharacterCreator onCharacterCreated={handleCharacterCreated} />
              </motion.div>
            )}

            {/* 3. CORE STORY MODE SCREEN */}
            {hasStarted && gameState.player && !gameState.isInCombat && !gameState.gameCompleted && (
              <motion.div
                key="story-gameplay-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <StoryManager
                  player={gameState.player}
                  currentNode={currentNode}
                  alignment={gameState.alignment}
                  onChoiceMade={handleChoiceMade}
                  onLevelUp={handleStatsLevelUp}
                />
              </motion.div>
            )}

            {/* 4. TURN BASED COMBAT INTERACTIVE ARENA SCREEN */}
            {hasStarted && gameState.player && gameState.isInCombat && gameState.combatEnemy && (
              <motion.div
                key="combat-battle-view"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <CombatSystem
                  player={gameState.player}
                  enemy={gameState.combatEnemy}
                  onVictory={handleCombatVictory}
                  onDefeat={handleCombatDefeat}
                />
              </motion.div>
            )}

            {/* 5. ENDING CHRONICLES FRAME */}
            {hasStarted && gameState.player && gameState.gameCompleted && (
              <motion.div
                key="ending-credits-view"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="w-full max-w-2xl mx-auto px-4 space-y-8"
              >
                <div className="bg-[#0c0c0e] border border-[#27272a] rounded-sm p-6 sm:p-10 shadow-[0_0_20px_rgba(6,182,212,0.1)] space-y-6 text-center">
                  <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase bg-[#121216] border border-[#27272a] px-4 py-1.5 rounded-sm inline-block">
                    KRONIK AKHIR TERCATAT
                  </span>

                  <h1 className="text-2xl sm:text-3xl font-bold text-[#fafafa]">
                    {currentNode.title}
                  </h1>

                  <div className="p-4 sm:p-6 bg-[#09090b] rounded-sm border border-[#27272a] text-left space-y-4">
                    {currentNode.text.split('\n\n').map((p, idx) => (
                      <p key={idx} className="text-zinc-300 text-sm leading-relaxed font-sans">
                        {p}
                      </p>
                    ))}
                  </div>

                  <div className="bg-[#09090b] p-4 border border-[#27272a] rounded-sm space-y-2 text-xs font-mono text-left">
                    <h3 className="font-bold text-cyan-400 uppercase flex items-center gap-1">
                      <Database className="w-4 h-4" /> Ringkasan Perjalanan Anda:
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-zinc-300">
                      <div>Karakter: <strong className="text-[#fafafa]">{gameState.player.name}</strong></div>
                      <div>Kelas: <strong className="text-[#fafafa]">{gameState.player.classType}</strong></div>
                      <div>Level Akhir: <strong className="text-[#fafafa] font-bold">{gameState.player.level}</strong></div>
                      <div>Kredit Sisa: <strong className="text-cyan-200">{gameState.player.credits.toFixed(2)} Credits</strong></div>
                      <div>Jalur Rebel: <strong className="text-rose-400">{gameState.alignment.rebel} Poin</strong></div>
                      <div>Jalur Syndicate: <strong className="text-emerald-400">{gameState.alignment.syndicate} Poin</strong></div>
                    </div>
                  </div>

                  {/* Reset back to zero */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleChoiceMade({ text: 'Reset', leadsTo: 'RESET' })}
                      className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 border border-zinc-700 text-white font-bold rounded-sm transition-transform active:scale-95 shadow-md shadow-cyan-950 flex items-center justify-center gap-2 mx-auto cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" /> RESET & MULTIPLASI PENJELAJAHAN
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Persistent Character Inventory Drawer Sheet Overlay */}
      <AnimatePresence>
        {isSidebarOpen && gameState.player && (
          <div className="fixed inset-0 z-50 flex justify-end" id="inventory-drawer">
            {/* Backdrop lock */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            {/* Content drawer card */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="relative w-full max-w-md bg-[#0c0c0e] border-l border-[#27272a] h-full shadow-2xl flex flex-col justify-between rounded-none"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#27272a] flex justify-between items-center bg-[#121216]">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Briefcase className="w-5 h-5 animate-pulse" />
                  <span>KONSOL INTEGRAL & ATRIBUT PAHLAWAN</span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 px-2.5 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-pointer text-xs font-bold"
                >
                  Tutup [X]
                </button>
              </div>

              {/* Central Drawer Details */}
              <div className="flex-grow overflow-y-auto p-5 space-y-6 scrollbar-thin text-xs">
                {/* Visual Avatar Render */}
                <div className="bg-[#09090b]/80 rounded-sm p-4 flex items-center gap-4 border border-[#27272a]">
                  <div className="bg-[#121216] p-2.5 rounded-sm border border-[#27272a] flex items-center justify-center">
                    <PixelAvatar sprite={gameState.player.sprite} size={64} animation="idle" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-[#fafafa] text-sm">{gameState.player.name}</h3>
                    <div className="font-mono text-cyan-400 uppercase text-[10px] bg-cyan-950/40 px-2 py-0.5 rounded-sm border border-cyan-800/50 inline-block">
                      {gameState.player.classType}
                    </div>
                    <div className="text-zinc-500 text-[10px]">Level {gameState.player.level} | {gameState.player.credits.toFixed(2)} Credits</div>
                  </div>
                </div>

                {/* Base attributes values */}
                <div className="space-y-2">
                  <h4 className="font-bold text-cyan-400 uppercase font-mono tracking-wider flex items-center gap-1">
                    📊 ATRIBUT DASAR MOLEKULAR
                  </h4>
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div className="bg-[#09090b] p-2.5 rounded-sm border border-[#27272a]">
                      <span className="text-zinc-500 block text-[10px]">Strength (Fisik)</span>
                      <strong className="text-[#fafafa] text-sm">{gameState.player.stats.strength}</strong>
                    </div>
                    <div className="bg-[#09090b] p-2.5 rounded-sm border border-[#27272a]">
                      <span className="text-zinc-500 block text-[10px]">Intelligence (Spells)</span>
                      <strong className="text-[#fafafa] text-sm">{gameState.player.stats.intelligence}</strong>
                    </div>
                    <div className="bg-[#09090b] p-2.5 rounded-sm border border-[#27272a]">
                      <span className="text-zinc-500 block text-[10px]">Vitality (Armor)</span>
                      <strong className="text-[#fafafa] text-sm">{gameState.player.stats.vitality}</strong>
                    </div>
                    <div className="bg-[#09090b] p-2.5 rounded-sm border border-[#27272a]">
                      <span className="text-zinc-500 block text-[10px]">Agility (Saraf/Turn)</span>
                      <strong className="text-[#fafafa] text-sm">{gameState.player.stats.agility}</strong>
                    </div>
                  </div>
                </div>

                {/* Current Active Items inventory stack list */}
                <div className="space-y-2">
                  <h4 className="font-bold text-cyan-400 uppercase font-mono tracking-wider flex items-center gap-1">
                    🎒 KANTUNG SUPLAY AKTIF
                  </h4>
                  <div className="space-y-2">
                    {gameState.player.inventory.map((item, id) => (
                      <div
                        key={id}
                        className="bg-[#09090b] p-3 rounded-sm border border-[#27272a] flex items-center justify-between text-zinc-300"
                      >
                        <div>
                          <span className="font-bold text-[#fafafa] block">{item.name}</span>
                          <span className="text-[10px] text-zinc-500 leading-normal">{item.description}</span>
                        </div>
                        <span className="px-2.5 py-1 bg-[#121216] text-[#fafafa] text-xs font-mono rounded-sm border border-[#27272a]">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                    {gameState.player.inventory.length === 0 && (
                      <div className="text-zinc-600 italic text-center text-xs py-4">Kantung kosong. Selesaikan misi untuk merampas logistik!</div>
                    )}
                  </div>
                </div>

                {/* alignment points monitoring */}
                <div className="space-y-2 bg-[#09090b] p-4 border border-[#27272a] rounded-sm">
                  <h4 className="font-bold text-cyan-400 uppercase font-mono tracking-wider text-[10px] mb-1.5 flex items-center gap-1">
                    ⚖ REPUTASI HUBUNGAN FAKSI
                  </h4>
                  <div className="space-y-1.5 text-xs text-zinc-300">
                    <div className="flex justify-between">
                      <span>Pemberontak Ceres (Rebels):</span>
                      <strong className="text-cyan-400">{gameState.alignment.rebel} Poin</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Corporate Syndicate:</span>
                      <strong className="text-cyan-400">{gameState.alignment.syndicate} Poin</strong>
                    </div>
                  </div>
                </div>

                {/* History tracker journal */}
                <div className="space-y-2">
                  <h4 className="font-bold text-cyan-400 uppercase font-mono tracking-wider flex items-center gap-1">
                    📜 LOG JURNAL PETUALANGAN
                  </h4>
                  <div className="bg-[#09090b] p-3 rounded-sm border border-[#27272a] space-y-2 max-h-[150px] overflow-y-auto pr-1 text-[11px] scrollbar-thin font-mono text-zinc-400">
                    {gameState.pastChoices.length === 0 ? (
                      <div className="text-zinc-600 italic">Belum ada keputusan tercatat. Mulai cerita!</div>
                    ) : (
                      gameState.pastChoices.map((choice, i) => (
                        <div key={i} className="flex gap-1.5 leading-relaxed text-xs">
                          <span className="text-cyan-400 shrink-0">➔</span>
                          <span>{choice.choiceText}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* CTA bottom close button */}
              <div className="p-4 bg-[#121216] border-t border-[#27272a]">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-sm transition-all font-sans cursor-pointer text-center uppercase tracking-wider shadow-md shadow-cyan-950/45 duration-300"
                >
                  Return to Main Console
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern Sci-fi Footer Credit */}
      <footer className="bg-[#121216] border-t border-[#27272a] py-4 text-center text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
        <span>© 2026 STAR SAVIOR PROJECT • DESIGNED WITH ELEGANT DARK THEME</span>
      </footer>
    </div>
  );
}
