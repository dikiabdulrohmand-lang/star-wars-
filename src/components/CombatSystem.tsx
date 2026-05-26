import React, { useState, useEffect } from 'react';
import { PlayerCharacter, Enemy, CombatLog, Skill, Item } from '../types';
import { PixelAvatar } from './PixelAvatar';
import { audio } from '../utils/AudioEngine';
import { Swords, ShieldAlert, Heart, Zap, Sparkles, Wand2, Shield, Flame, Terminal, Play, CircleAlert } from 'lucide-react';

interface CombatSystemProps {
  player: PlayerCharacter;
  enemy: Enemy;
  onVictory: (xpEarned: number, creditsEarned: number, itemReward?: Item) => void;
  onDefeat: () => void;
}

interface FloatingPopup {
  id: string;
  text: string;
  type: 'damage' | 'heal' | 'energy' | 'shield';
  x: number; // percentage or offset
}

export const CombatSystem: React.FC<CombatSystemProps> = ({
  player,
  enemy,
  onVictory,
  onDefeat
}) => {
  // Fight States
  const [playerHp, setPlayerHp] = useState(player.hp);
  const [playerEnergy, setPlayerEnergy] = useState(player.energy);
  const [playerShield, setPlayerShield] = useState(0);
  const [enemyHp, setEnemyHp] = useState(enemy.hp);
  
  // Skill cooldown trackers
  const [skills, setSkills] = useState<Skill[]>(() => 
    player.activeSkills.map(sk => ({ ...sk, currentCooldown: 0 }))
  );

  // Turn tracking: 'player_turn' | 'enemy_turn' | 'resolution'
  const [turn, setTurn] = useState<'player' | 'enemy' | 'resolving'>('player');
  const [logs, setLogs] = useState<CombatLog[]>([]);
  const [popups, setPopups] = useState<FloatingPopup[]>([]);
  
  // Animation states
  const [playerAnim, setPlayerAnim] = useState<'idle' | 'attack' | 'hurt' | 'victory'>('idle');
  const [enemyAnim, setEnemyAnim] = useState<'idle' | 'attack' | 'hurt' | 'victory'>('idle');

  // Load initial log entry
  useEffect(() => {
    addLog(`Pertarungan dimulai! Menghadapi ${enemy.name} (Lv. ${enemy.level})`, 'info');
    addLog(`Kecepatan Anda: ${player.stats.agility} | Kecepatan Musuh: ${enemy.speed}`, 'info');
    
    // speed check for first turn
    if (enemy.speed > player.stats.agility) {
      setTurn('enemy');
      setTimeout(() => {
        executeEnemyTurn();
      }, 1200);
    }
  }, []);

  const addLog = (text: string, type: CombatLog['type']) => {
    const newLog: CombatLog = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      type
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const addPopup = (text: string, type: FloatingPopup['type'], isEnemySprite: boolean) => {
    const newPopup: FloatingPopup = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      type,
      x: isEnemySprite ? 65 + Math.random() * 10 : 20 + Math.random() * 10
    };
    setPopups(prev => [...prev, newPopup]);
    // Auto remove popup
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== newPopup.id));
    }, 1500);
  };

  // Turn check cooldown reducer
  const tickCooldowns = () => {
    setSkills(prev => prev.map(s => {
      if (s.currentCooldown > 0) {
        return { ...s, currentCooldown: s.currentCooldown - 1 };
      }
      return s;
    }));
  };

  // 1. STRIKE ATK
  const handleStrike = () => {
    if (turn !== 'player' || playerHp <= 0 || enemyHp <= 0) return;
    setTurn('resolving');
    setPlayerAnim('attack');
    audio.playLaser();

    // Damage formula: 5 + strength * 1.5 + random variance
    const variance = Math.floor(Math.random() * 4) - 2;
    const baseDamage = Math.max(5, Math.floor(5 + player.stats.strength * 1.5 + variance));
    
    setTimeout(() => {
      setEnemyHp(prev => {
        const next = Math.max(0, prev - baseDamage);
        setEnemyAnim('hurt');
        audio.playHit();
        addPopup(`-${baseDamage}`, 'damage', true);
        addLog(`Anda menyerang ${enemy.name} dengan Senjata Utama Anda sebesar ${baseDamage} damage!`, 'player_hit');
        
        if (next <= 0) {
          // Win sequence
          handleVictory();
        } else {
          // Normal turnaround
          setTimeout(() => {
            setEnemyAnim('idle');
            setPlayerAnim('idle');
            setTurn('enemy');
            setTimeout(() => {
              executeEnemyTurn();
            }, 1000);
          }, 800);
        }
        return next;
      });
    }, 400);
  };

  // 2. CAST SKILL
  const handleCastSkill = (skill: Skill) => {
    if (turn !== 'player' || playerHp <= 0 || enemyHp <= 0) return;
    if (playerEnergy < skill.energyCost) {
      audio.playClick();
      return;
    }
    if (skill.currentCooldown > 0) {
      audio.playClick();
      return;
    }

    setTurn('resolving');
    setPlayerAnim('attack');
    setPlayerEnergy(prev => Math.max(0, prev - skill.energyCost));
    audio.playSpell();

    // Reduce cooldown triggers and apply CD to casted skill
    setSkills(prev => prev.map(s => {
      if (s.id === skill.id) {
        return { ...s, currentCooldown: s.cooldown };
      }
      return s;
    }));

    // power scales on Strength or Intelligence depending on element
    let powerMultiplier = skill.power;
    const isVoidOrLaser = skill.element === 'void' || skill.element === 'laser';
    const attributeValue = isVoidOrLaser ? player.stats.intelligence : player.stats.strength;
    
    setTimeout(() => {
      // 1. DAMAGE TYPE
      if (skill.type === 'damage') {
        const damage = Math.floor((10 + attributeValue * 1.8) * powerMultiplier);
        setEnemyHp(prev => {
          const next = Math.max(0, prev - damage);
          setEnemyAnim('hurt');
          audio.playHit();
          addPopup(`-${damage}`, 'damage', true);
          addLog(`Anda merapal [${skill.name}] ke ${enemy.name}, memberikan ${damage} damage!`, 'player_skill');
          
          if (next <= 0) {
            handleVictory();
          } else {
            transitionToEnemyTurn();
          }
          return next;
        });
      }
      // 2. HEAL TYPE 
      else if (skill.type === 'heal') {
        const healAmt = Math.floor((15 + attributeValue * 2.5) * powerMultiplier);
        setPlayerHp(prev => {
          const next = Math.min(player.maxHp, prev + healAmt);
          audio.playHeal();
          addPopup(`+${healAmt}`, 'heal', false);
          addLog(`Anda menggunakan [${skill.name}] memulihkan kesehatan sebesar ${healAmt} HP!`, 'heal');
          transitionToEnemyTurn();
          return next;
        });
      }
      // 3. BUFF TYPE (Shield absorption build)
      else if (skill.type === 'buff') {
        const shieldAmt = Math.floor((18 + attributeValue * 1.5) * powerMultiplier);
        setPlayerShield(prev => prev + shieldAmt);
        audio.playHeal();
        addPopup(`+${shieldAmt} Guard`, 'shield', false);
        addLog(`Anda mengaktifkan [${skill.name}], meningkatkan baris pertahanan tameng sebesar +${shieldAmt} Poin!`, 'heal');
        transitionToEnemyTurn();
      }
    }, 450);
  };

  // 3. CONSUME ITEM
  const [inventory, setInventory] = useState<Item[]>(() => JSON.parse(JSON.stringify(player.inventory)));

  const handleUseItem = (item: Item) => {
    if (turn !== 'player' || playerHp <= 0 || item.quantity <= 0) return;
    
    setTurn('resolving');

    // Consume stock
    setInventory(prev => prev.map(inv => {
      if (inv.id === item.id) {
        return { ...inv, quantity: inv.quantity - 1 };
      }
      return inv;
    }));

    // Update real player character instance inventory references
    player.inventory = player.inventory.map(inv => {
      if (inv.id === item.id) {
        inv.quantity -= 1;
      }
      return inv;
    });

    if (item.type === 'heal_hp') {
      audio.playHeal();
      setPlayerHp(prev => {
        const next = Math.min(player.maxHp, prev + item.value);
        addPopup(`+${item.value} HP`, 'heal', false);
        addLog(`Anda mendistribusikan [${item.name}] meningkatkan kesehatan sebesar +${item.value} HP!`, 'heal');
        return next;
      });
      setTimeout(() => {
        transitionToEnemyTurn();
      }, 700);
    } else if (item.type === 'heal_energy') {
      audio.playHeal();
      setPlayerEnergy(prev => {
        const next = Math.min(player.maxEnergy, prev + item.value);
        addPopup(`+${item.value} SP`, 'energy', false);
        addLog(`Anda memasang [${item.name}] memulihkan energi setinggi +${item.value} SP!`, 'heal');
        return next;
      });
      setTimeout(() => {
        transitionToEnemyTurn();
      }, 700);
    } else if (item.type === 'grenade') {
      audio.playHit();
      setEnemyAnim('hurt');
      setEnemyHp(prev => {
        const next = Math.max(0, prev - item.value);
        addPopup(`-${item.value}`, 'damage', true);
        addLog(`Anda meluncurkan [${item.name}] meledakkan sirkuit ${enemy.name} senilai ${item.value} damage!`, 'player_hit');
        
        if (next <= 0) {
          handleVictory();
        } else {
          setTimeout(() => {
            setEnemyAnim('idle');
            transitionToEnemyTurn();
          }, 800);
        }
        return next;
      });
    }
  };

  // Transitions helper
  const transitionToEnemyTurn = () => {
    setTimeout(() => {
      setPlayerAnim('idle');
      setEnemyAnim('idle');
      setTurn('enemy');
      setTimeout(() => {
        executeEnemyTurn();
      }, 1000);
    }, 800);
  };

  // 4. DEFEND / GUARD
  const handleDefend = () => {
    if (turn !== 'player' || playerHp <= 0 || enemyHp <= 0) return;
    setTurn('resolving');
    audio.playHeal();
    
    // Add temporary 25 guard shield points
    const extraGuard = 15 + player.stats.vitality * 1;
    setPlayerShield(prev => prev + extraGuard);
    addPopup(`+${extraGuard} Guard`, 'shield', false);
    addLog(`Anda mengambil posisi siaga bertahan! Tameng meningkat +${extraGuard} Poin.`, 'info');

    setTimeout(() => {
      transitionToEnemyTurn();
    }, 600);
  };

  // ENEMY AI ACTION TURN
  const executeEnemyTurn = () => {
    if (enemyHp <= 0 || playerHp <= 0) return;

    setEnemyAnim('attack');
    audio.playLaser();

    // Decide weapon/skill attack
    // Let's grab skills
    const randomSkill = enemy.skills[Math.floor(Math.random() * enemy.skills.length)];
    
    // Damage variance
    const variance = Math.floor(Math.random() * 4) - 2;
    const rawDamage = Math.max(3, randomSkill.damage + variance);

    // Apply shield deduction first
    setTimeout(() => {
      setPlayerHp(prevHp => {
        let finalDmg = rawDamage;
        
        setPlayerShield(prevShield => {
          if (prevShield > 0) {
            if (prevShield >= finalDmg) {
              const nextShield = prevShield - finalDmg;
              addPopup(`-${finalDmg} Shield`, 'shield', false);
              addLog(`${enemy.name} melepaskan ilmu [${randomSkill.name}]. Tameng perisai Anda meredam seluruh luka (${finalDmg} damage)!`, 'enemy_hit');
              finalDmg = 0;
              return nextShield;
            } else {
              const absorbed = prevShield;
              finalDmg -= absorbed;
              addPopup(`-${absorbed} Shield`, 'shield', false);
              return 0;
            }
          }
          return 0;
        });

        // Remaining damage deduction
        const netHp = Math.max(0, prevHp - finalDmg);
        setPlayerAnim('hurt');
        audio.playHit();
        
        if (finalDmg > 0) {
          addPopup(`-${finalDmg}`, 'damage', false);
          addLog(`${enemy.name} meluncurkan [${randomSkill.name}], merobek pertahanan Anda sebesar ${finalDmg} damage!`, 'enemy_hit');
        }

        if (netHp <= 0) {
          // Defeat sequence
          handleDefeat();
        } else {
          // Return turn
          setTimeout(() => {
            setPlayerAnim('idle');
            setEnemyAnim('idle');
            tickCooldowns();
            setTurn('player');
          }, 800);
        }

        return netHp;
      });
    }, 500);
  };

  // WIN / DEFEAT REDIRECTS
  const handleVictory = () => {
    setEnemyAnim('hurt');
    setPlayerAnim('victory');
    audio.playLevelUp();
    addLog(`Selamat! Anda berhasil menghancurkan ${enemy.name}!`, 'victory');

    // Experience calculation
    const xpReward = enemy.level * 35;
    const creditsReward = enemy.level * 80;

    // Optional dynamic drop
    let loot: Item | undefined;
    if (Math.random() > 0.4) {
      loot = {
        id: Math.random().toString(36).substring(2, 9),
        name: 'Sel Amunisi Kejut',
        description: 'Bahan peledak kosmik berfrekuensi tinggi.',
        type: 'grenade',
        value: 50,
        quantity: 1,
        icon: 'Bomb'
      };
    }

    setTimeout(() => {
      onVictory(xpReward, creditsReward, loot);
    }, 2800);
  };

  const handleDefeat = () => {
    setPlayerAnim('hurt');
    audio.playDefeat();
    addLog(`Baju zirah Anda hancur! Anda runtuh dalam kehampaan...`, 'defeat');
    setTimeout(() => {
      onDefeat();
    }, 2800);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-2 px-4 space-y-6" id="combat-screen">
      {/* Turn indicator banner */}
      <div className="flex justify-between items-center bg-[#0c0c0e] border border-[#27272a] rounded-sm px-4 py-2.5 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>STATUS ARENA:</span>
          {turn === 'player' ? (
            <span className="text-cyan-400 font-bold animate-pulse uppercase">GILIRAN ANDA (SIAGA)</span>
          ) : turn === 'enemy' ? (
            <span className="text-cyan-400 font-bold animate-pulse uppercase">GILIRAN LAWAN (ANCAMAN)</span>
          ) : (
            <span className="text-zinc-500 font-bold uppercase">PEMROSESAN AKSI...</span>
          )}
        </div>
        <div className="text-zinc-500">
          Misi: <strong className="text-zinc-300">{enemy.name} Delta Sector</strong>
        </div>
      </div>

      {/* Battle Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#0c0c0e] p-4 sm:p-6 rounded-sm border border-[#27272a] relative overflow-hidden min-h-[290px]">
        {/* Floating popups overlay container */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {popups.map(p => (
            <span
              key={p.id}
              className={`absolute top-1/3 text-2xl font-extrabold font-mono transition-all animate-bounce drop-shadow-[0_4px_12px_rgba(0,0,0,1)] ${
                p.type === 'damage' ? 'text-cyan-400' : p.type === 'heal' ? 'text-cyan-300' : p.type === 'energy' ? 'text-cyan-400' : 'text-cyan-300'
              }`}
              style={{ left: `${p.x}%` }}
            >
              {p.text}
            </span>
          ))}
        </div>

        {/* Player Sprite Cell */}
        <div className="md:col-span-5 flex flex-col items-center justify-between space-y-4">
          <div className="text-center w-full">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/20 px-2.5 py-1 rounded-sm border border-cyan-800/40">
              {player.name} (Lv. {player.level})
            </span>
          </div>

          <div className="min-h-[130px] flex items-center justify-center p-2 rounded-sm bg-[#09090b]/40 w-full border border-dashed border-[#27272a]">
            <PixelAvatar sprite={player.sprite} size={135} animation={playerAnim} />
          </div>

          {/* Player stats gauges */}
          <div className="w-full space-y-2 max-w-[200px] sm:max-w-[240px]">
            {/* HP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" /> Kesehatan:
                </span>
                <span className="text-white font-bold">{playerHp}/{player.maxHp} HP</span>
              </div>
              <div className="h-2.5 w-full bg-[#09090b] rounded-none overflow-hidden border border-[#27272a]">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300 relative"
                  style={{ width: `${(playerHp / player.maxHp) * 100}%` }}
                >
                  {playerShield > 0 && (
                    <div
                      className="absolute right-0 top-0 h-full bg-[#121216] opacity-90"
                      style={{ width: `${Math.min(100, (playerShield / player.maxHp) * 100)}%` }}
                    />
                  )}
                </div>
              </div>
              {playerShield > 0 && (
                <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Pelindung Nyala: +{playerShield} Guard Point
                </div>
              )}
            </div>

            {/* Energy SP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" /> Energi SP:
                </span>
                <span className="text-white font-bold">{playerEnergy}/{player.maxEnergy} SP</span>
              </div>
              <div className="h-2.5 w-full bg-[#09090b] rounded-none overflow-hidden border border-[#27272a]">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${(playerEnergy / player.maxEnergy) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Versus Indicator */}
        <div className="md:col-span-2 flex items-center justify-center font-mono text-zinc-700 font-normal text-lg py-4 md:py-0">
          <div className="text-center">
            <div className="text-xl text-cyan-400 font-bold tracking-widest">VS</div>
            <div className="text-[10px] text-zinc-500 mt-1 uppercase font-semibold">RONDE {Math.max(1, logs.length + 1)}</div>
          </div>
        </div>

        {/* Enemy Sprite Cell */}
        <div className="md:col-span-5 flex flex-col items-center justify-between space-y-4">
          <div className="text-center w-full">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/20 px-2.5 py-1 rounded-sm border border-cyan-800/40">
              {enemy.name} (Lv. {enemy.level})
            </span>
          </div>

          <div className="min-h-[130px] flex items-center justify-center p-2 rounded-sm bg-[#09090b]/40 w-full border border-dashed border-[#27272a]">
            <PixelAvatar isEnemy enemyType={enemy.spriteSeed} colorTheme={enemy.colorTheme} size={135} animation={enemyAnim} />
          </div>

          {/* Enemy Hp Gauge */}
          <div className="w-full space-y-2 max-w-[200px] sm:max-w-[240px]">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-cyan-400" /> Boss HP:
                </span>
                <span className="text-white font-bold">{enemyHp}/{enemy.maxHp} HP</span>
              </div>
              <div className="h-2.5 w-full bg-[#09090b] rounded-none overflow-hidden border border-[#27272a]">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${(enemyHp / enemy.maxHp) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-[#121216] p-2 rounded-sm text-[10px] text-zinc-400 font-sans border border-[#27272a]">
              {enemy.description}
            </div>
          </div>
        </div>
      </div>

      {/* Action Dashboard Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start font-sans">
        {/* Left Interactive Console (6 columns) */}
        <div className="lg:col-span-8 bg-[#0c0c0e] border border-[#27272a] rounded-sm p-5 shadow-2xl space-y-4">
          <div className="text-xs font-bold text-cyan-400 flex items-center gap-2 border-b border-[#27272a] pb-2 uppercase tracking-wider font-mono">
            <Swords className="w-4 h-4 text-cyan-400" />
            Panel Komando Saraf Petarung
          </div>

          {/* Attack / Defend Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleStrike}
              disabled={turn !== 'player' || playerHp <= 0 || enemyHp <= 0}
              className="px-4 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-900 disabled:text-zinc-600 border border-transparent disabled:border-[#27272a] text-white rounded-sm text-[11px] uppercase tracking-wider font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <Swords className="w-4 h-4" />
              Saber / Blaster [Atk Utama]
            </button>

            <button
              onClick={handleDefend}
              disabled={turn !== 'player' || playerHp <= 0 || enemyHp <= 0}
              className="px-4 py-3 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-900 disabled:text-zinc-600 border border-[#27272a] text-zinc-300 rounded-sm text-[11px] uppercase tracking-wider font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <Shield className="w-4 h-4" />
              Taktik Bertahan [+Guard]
            </button>
          </div>

          {/* Active Skills Block */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Gunakan Ilmu Energi Kelas ({player.classType})</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skills.map((skill) => {
                const energyDeficient = playerEnergy < skill.energyCost;
                const cooldownActive = skill.currentCooldown > 0;
                const isLocked = turn !== 'player' || energyDeficient || cooldownActive || playerHp <= 0;

                return (
                  <button
                    key={skill.id}
                    onClick={() => handleCastSkill(skill)}
                    disabled={isLocked}
                    className={`p-3 rounded-sm border text-left transition-all text-xs relative ${
                      isLocked
                        ? 'bg-zinc-950 border-zinc-900/40 text-zinc-600 cursor-not-allowed'
                        : 'bg-[#09090b] hover:bg-[#121216] border-[#27272a] hover:border-cyan-500 text-zinc-200 cursor-pointer active:scale-95'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[#fafafa] flex items-center gap-1">
                        <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                        {skill.name}
                      </span>
                      <span className="font-mono text-[9px] text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded-sm border border-cyan-800/20">
                        {skill.energyCost} SP
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mb-1.5">{skill.description}</p>
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-cyan-500 uppercase font-semibold">Tipe: {skill.type} ({skill.element})</span>
                      {cooldownActive ? (
                        <span className="text-rose-400 font-bold">CD: {skill.currentCooldown} Turn</span>
                      ) : (
                        <span className="text-cyan-400 font-bold">SIAP</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items Drawer */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Gunakan Suplay Kimia Medis ({inventory.reduce((sum, i) => sum + i.quantity, 0)} Tersedia)</div>
            <div className="grid grid-cols-3 gap-2">
              {inventory.map((item) => {
                const outOfStock = item.quantity <= 0;
                const isLocked = turn !== 'player' || outOfStock || playerHp <= 0;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleUseItem(item)}
                    disabled={isLocked}
                    className={`p-2 rounded-sm border text-center transition-all text-xs ${
                      isLocked
                        ? 'bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed'
                        : 'bg-[#09090b] hover:bg-[#121216] border-[#27272a] hover:border-cyan-500 text-zinc-300 cursor-pointer active:scale-95'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-[#fafafa] truncate">{item.name}</div>
                    <div className="text-[9px] text-zinc-400 mb-1">
                      {item.type === 'heal_hp' ? `+${item.value} HP` : item.type === 'heal_energy' ? `+${item.value} Energy` : `Atk: ${item.value} Dmg`}
                    </div>
                    <span className={`px-2 py-0.5 rounded-sm text-[9px] font-mono leading-none ${
                      outOfStock ? 'bg-zinc-950 text-zinc-600 border border-zinc-900' : 'bg-zinc-950 text-cyan-400 font-bold'
                    }`}>
                      Stok: {item.quantity}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Battle Logs Console (4 columns) */}
        <div className="lg:col-span-4 bg-[#0c0c0e] border border-[#27272a] rounded-sm p-4 shadow-2xl h-[340px] flex flex-col justify-between">
          <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-[#27272a] pb-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            Saluran Transmisi Komando
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 text-xs font-mono scrollbar-thin">
            {logs.length === 0 ? (
              <div className="text-zinc-600 italic text-center pt-8">Bersiap menghadapi serangan...</div>
            ) : (
              logs.map((log) => {
                let textClass = 'text-zinc-300';
                if (log.type === 'info') textClass = 'text-cyan-400';
                if (log.type === 'player_hit') textClass = 'text-cyan-100';
                if (log.type === 'player_skill') textClass = 'text-cyan-300 font-bold';
                if (log.type === 'enemy_hit') textClass = 'text-zinc-400';
                if (log.type === 'heal') textClass = 'text-cyan-400 font-bold';
                if (log.type === 'victory') textClass = 'text-cyan-400 font-bold text-sm bg-cyan-950/20 p-2 rounded-sm border border-cyan-800/40';
                if (log.type === 'defeat') textClass = 'text-rose-500 font-bold bg-rose-950/30 p-2 rounded-sm border border-rose-900/30';

                return (
                  <div key={log.id} style={{ contentVisibility: 'auto' }} className={`leading-relaxed border-l-2 pl-2 border-[#27272a] ${textClass}`}>
                    {log.text}
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-2 text-[10px] text-zinc-500 uppercase italic text-center bg-[#09090b] py-1.5 rounded-sm border border-[#27272a]">
            Sistem Saraf Tersinkronisasi AI Studio
          </div>
        </div>
      </div>
    </div>
  );
};
