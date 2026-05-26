import React, { useState } from 'react';
import { PlayerCharacter, GameClass, AttributeStats, PixelSpriteData } from '../types';
import { CLASS_DETAILS, DEFAULT_ITEMS } from '../data/storyContent';
import { PixelAvatar } from './PixelAvatar';
import { audio } from '../utils/AudioEngine';
import { Sparkles, Swords, Brain, Shield, Zap, CircleAlert, Check, HelpCircle } from 'lucide-react';

interface CharacterCreatorProps {
  onCharacterCreated: (character: PlayerCharacter) => void;
}

const PRESET_COLORS = {
  hair: ['#fbbf24', '#f87171', '#60a5fa', '#34d399', '#c084fc', '#cbd5e1', '#1e293b'],
  skin: ['#fbcfe8', '#fed7aa', '#fde047', '#cbd5e1', '#fcd34d', '#7c2d12', '#451a03'],
  suit: ['#1d4ed8', '#10b981', '#3b82f6', '#dc2626', '#16a34a', '#4f46e5', '#475569'],
  accent: ['#6ee7b7', '#ec4899', '#facc15', '#60a5fa', '#c084fc', '#10b981', '#ffffff']
};

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({ onCharacterCreated }) => {
  const [name, setName] = useState('Vanguard S7');
  const [selectedClass, setSelectedClass] = useState<GameClass>('Star Knight');
  
  // Custom points allocation
  const [bonusPoints, setBonusPoints] = useState(10);
  const [allocatedStats, setAllocatedStats] = useState<AttributeStats>({
    strength: 0,
    intelligence: 0,
    vitality: 0,
    agility: 0
  });

  // Cosmetic options state
  const [sprite, setSprite] = useState<PixelSpriteData>({
    hairStyle: 'spiky',
    hairColor: '#fbbf24',
    skinColor: '#fbcfe8',
    suitColor: '#1d4ed8',
    accentColor: '#6ee7b7',
    weaponStyle: 'saber'
  });

  const classInfo = CLASS_DETAILS[selectedClass];

  const handleStatChange = (stat: keyof AttributeStats, increment: boolean) => {
    audio.playClick();
    if (increment && bonusPoints > 0) {
      setAllocatedStats(prev => ({ ...prev, [stat]: prev[stat] + 1 }));
      setBonusPoints(prev => prev - 1);
    } else if (!increment && allocatedStats[stat] > 0) {
      setAllocatedStats(prev => ({ ...prev, [stat]: prev[stat] - 1 }));
      setBonusPoints(prev => prev + 1);
    }
  };

  const handleCosmeticChange = (key: keyof PixelSpriteData, value: string) => {
    audio.playClick();
    setSprite(prev => ({ ...prev, [key]: value }));
  };

  const calculateTotalStats = (): AttributeStats => {
    const base = classInfo.baseStats;
    return {
      strength: base.strength + allocatedStats.strength,
      intelligence: base.intelligence + allocatedStats.intelligence,
      vitality: base.vitality + allocatedStats.vitality,
      agility: base.agility + allocatedStats.agility,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    audio.playLevelUp();

    const finalStats = calculateTotalStats();
    // Base HP derived from Vitality: 100 + Vitality * 12
    const maxHp = 100 + finalStats.vitality * 12;
    // Base Energy derived from Intelligence: 40 + Intelligence * 6
    const maxEnergy = 40 + finalStats.intelligence * 6;

    const newChar: PlayerCharacter = {
      name: name,
      classType: selectedClass,
      level: 1,
      exp: 0,
      maxExp: 100,
      stats: finalStats,
      sprite: sprite,
      hp: maxHp,
      maxHp: maxHp,
      energy: maxEnergy,
      maxEnergy: maxEnergy,
      credits: 300, // starting funds
      inventory: JSON.parse(JSON.stringify(DEFAULT_ITEMS)),
      activeSkills: classInfo.skills
    };

    onCharacterCreated(newChar);
  };

  const totalStats = calculateTotalStats();

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-4 sm:px-6 lg:px-8" id="character-creator-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-widest text-cyan-400 mb-2 font-sans uppercase">
          KUSTOMISASI KARAKTER
        </h1>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">
          Ciptakan pahlawan kosmik Anda! Sesuaikan penampilan piksel, alokasikan poin atribut taktis, dan pilih takdir kelas Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Sprite Preview Card */}
        <div className="lg:col-span-4 bg-[#0c0c0e] border border-[#27272a] rounded-sm p-6 flex flex-col items-center justify-between shadow-2xl space-y-6">
          <div className="w-full text-center">
            <span className="text-[10px] font-mono text-cyan-400 tracking-wider font-semibold uppercase bg-cyan-950/30 px-3 py-1 rounded-sm border border-cyan-900/50">
              Uji Coba Sistem Holosurga
            </span>
          </div>

          <div className="relative p-6 bg-[#09090b] rounded-sm border border-[#27272a] w-full flex items-center justify-center min-h-[180px] overflow-hidden group">
            <div className="absolute inset-0 bg-radial-gradient from-cyan-900/10 to-transparent pointer-events-none" />
            <PixelAvatar sprite={sprite} size={150} animation="victory" />
          </div>

          <div className="w-full space-y-4">
            <div>
              <label htmlFor="char-name" className="block text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-widest mb-1.5">
                Nama Penerbang Bintang
              </label>
              <input
                id="char-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value.slice(0, 18));
                }}
                className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] focus:border-cyan-500 rounded-sm text-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                maxLength={18}
                required
              />
            </div>

            <div className="bg-[#121216]/50 p-3 rounded-sm border border-[#27272a] space-y-2">
              <div className="flex justify-between text-xs text-zinc-400 font-mono">
                <span>Daya Tahan Hidup (HP):</span>
                <span className="text-cyan-400 font-bold">{100 + totalStats.vitality * 12} HP</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-400 font-mono">
                <span>Konverter Energi (EN):</span>
                <span className="text-cyan-400 font-bold">{40 + totalStats.intelligence * 6} SP</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-400 font-mono">
                <span>Kredit Awal:</span>
                <span className="text-cyan-200 font-bold">300.00 Credits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle/Right Columns: Options, Stats, Classes */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Class Chooser */}
          <div className="bg-[#0c0c0e] rounded-sm p-6 border border-[#27272a]">
            <h2 className="text-sm font-bold text-cyan-400 tracking-wider uppercase mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              1. Pilihlah Arketipe Kelas Anda
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.keys(CLASS_DETAILS) as GameClass[]).map((cls) => {
                const isSelected = selectedClass === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => {
                      audio.playClick();
                      setSelectedClass(cls);
                    }}
                    className={`p-3 rounded-sm border text-left transition-all relative overflow-hidden ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                        : 'border-[#27272a] hover:border-zinc-700 bg-[#09090b]/40 text-zinc-300'
                    }`}
                  >
                    <div className="font-bold text-sm text-white mb-1">{cls}</div>
                    <div className="text-[10px] text-zinc-400 line-clamp-2">
                      {CLASS_DETAILS[cls].description}
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-cyan-500 rounded-full p-0.5">
                        <Check className="w-3 h-3 text-black font-extrabold" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-[#121216] border border-[#27272a] rounded-sm text-xs text-zinc-300 flex gap-2">
              <CircleAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Spesialisasi Kelas: </span>
                {classInfo.description}
              </div>
            </div>
          </div>

          {/* Section 2: Attributes Allocation */}
          <div className="bg-[#0c0c0e] rounded-sm p-6 border border-[#27272a]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-2">
                <Brain className="w-5 h-5" />
                2. Alokasikan Poin Atribut
              </h2>
              <span className="text-[10px] font-mono font-bold text-zinc-300 bg-zinc-900 px-3 py-1 rounded-sm border border-[#27272a] mt-2 sm:mt-0 uppercase">
                Poin Tersedia: <strong className="text-cyan-400 text-xs font-bold">{bonusPoints}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strength */}
              <div className="bg-[#09090b] p-4 rounded-sm border border-[#27272a] flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#fafafa] flex items-center gap-1.5 uppercase font-mono">
                    <Swords className="w-4 h-4 text-cyan-400" />
                    Strength (Kekuatan)
                  </div>
                  <div className="text-[11px] text-zinc-500 max-w-[200px]">
                    Meningkatkan damage fisik senjata, sabetan, dan hantaman.
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleStatChange('strength', false)}
                    className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-700 hover:bg-[#121216] text-[#fafafa] font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
                    disabled={allocatedStats.strength === 0}
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-[#fafafa] font-mono">
                    {totalStats.strength}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStatChange('strength', true)}
                    className="w-8 h-8 rounded-sm bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
                    disabled={bonusPoints === 0}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Intelligence */}
              <div className="bg-[#09090b] p-4 rounded-sm border border-[#27272a] flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#fafafa] flex items-center gap-1.5 uppercase font-mono">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Intelligence (Akurasi/Void)
                  </div>
                  <div className="text-[11px] text-zinc-500 max-w-[200px]">
                    Meningkatkan daya pikat energi, spell mistis, dan batas SP.
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleStatChange('intelligence', false)}
                    className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-700 hover:bg-[#121216] text-[#fafafa] font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
                    disabled={allocatedStats.intelligence === 0}
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-[#fafafa] font-mono">
                    {totalStats.intelligence}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStatChange('intelligence', true)}
                    className="w-8 h-8 rounded-sm bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
                    disabled={bonusPoints === 0}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Vitality */}
              <div className="bg-[#09090b] p-4 rounded-sm border border-[#27272a] flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#fafafa] flex items-center gap-1.5 uppercase font-mono">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    Vitality (Daya Tahan)
                  </div>
                  <div className="text-[11px] text-zinc-500 max-w-[200px]">
                    Memberikan HP maksimum yang tinggi dan kekebalan dari armor.
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleStatChange('vitality', false)}
                    className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-700 hover:bg-[#121216] text-[#fafafa] font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
                    disabled={allocatedStats.vitality === 0}
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-[#fafafa] font-mono">
                    {totalStats.vitality}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStatChange('vitality', true)}
                    className="w-8 h-8 rounded-sm bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
                    disabled={bonusPoints === 0}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Agility */}
              <div className="bg-[#09090b] p-4 rounded-sm border border-[#27272a] flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#fafafa] flex items-center gap-1.5 uppercase font-mono">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Agility (Kelincahan)
                  </div>
                  <div className="text-[11px] text-zinc-500 max-w-[200px]">
                    Meningkatkan kepemimpinan giliran tercepat dan hindaran taktis.
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleStatChange('agility', false)}
                    className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-700 hover:bg-[#121216] text-[#fafafa] font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
                    disabled={allocatedStats.agility === 0}
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-[#fafafa] font-mono">
                    {totalStats.agility}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStatChange('agility', true)}
                    className="w-8 h-8 rounded-sm bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center disabled:opacity-30 cursor-pointer"
                    disabled={bonusPoints === 0}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Visual Style Selection */}
          <div className="bg-[#0c0c0e] rounded-sm p-6 border border-[#27272a] space-y-5">
            <h2 className="text-sm font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-2">
              <Swords className="w-5 h-5 text-cyan-400" />
              3. Visualisasi Kosmetik & Senjata Piksel
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hair Style */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Model Rambut / Helm
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { style: 'spiky', label: 'Spiky' },
                    { style: 'short', label: 'Short' },
                    { style: 'long', label: 'Long' },
                    { style: 'helmet', label: 'Helmet' }
                  ].map((hOpt) => (
                    <button
                      key={hOpt.style}
                      type="button"
                      onClick={() => handleCosmeticChange('hairStyle', hOpt.style)}
                      className={`py-2 px-1 text-xs text-center font-bold rounded-sm border transition-colors cursor-pointer ${
                        sprite.hairStyle === hOpt.style
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                          : 'bg-[#09090b] border-[#27272a] hover:bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      {hOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weapon Selection */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Model Senjata Utama
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { style: 'saber', label: 'Saber' },
                    { style: 'blaster', label: 'Blaster' },
                    { style: 'pulse', label: 'Gaunt' },
                    { style: 'staff', label: 'Staff' }
                  ].map((wOpt) => (
                    <button
                      key={wOpt.style}
                      type="button"
                      onClick={() => handleCosmeticChange('weaponStyle', wOpt.style)}
                      className={`py-2 px-1 text-xs text-center font-bold rounded-sm border transition-colors cursor-pointer ${
                        sprite.weaponStyle === wOpt.style
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                          : 'bg-[#09090b] border-[#27272a] hover:bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      {wOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color selectors */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Warna Rambut
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.hair.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => handleCosmeticChange('hairColor', hex)}
                      className={`w-6 h-6 rounded-sm border text-center relative cursor-pointer ${
                        sprite.hairColor === hex ? 'border-white scale-110' : 'border-[#27272a]'
                      }`}
                      style={{ backgroundColor: hex }}
                      title={hex}
                    >
                      {sprite.hairColor === hex && <Check className="w-3.5 h-3.5 mx-auto text-black font-extrabold shadow" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suit Color */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Warna Baju Zirah
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.suit.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => handleCosmeticChange('suitColor', hex)}
                      className={`w-6 h-6 rounded-sm border relative cursor-pointer ${
                        sprite.suitColor === hex ? 'border-white scale-110' : 'border-[#27272a]'
                      }`}
                      style={{ backgroundColor: hex }}
                      title={hex}
                    >
                      {sprite.suitColor === hex && <Check className="w-3.5 h-3.5 mx-auto text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tech Line Color */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Panel Energi / Garis Senjata
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.accent.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => handleCosmeticChange('accentColor', hex)}
                      className={`w-6 h-6 rounded-sm border relative cursor-pointer ${
                        sprite.accentColor === hex ? 'border-white scale-110' : 'border-[#27272a]'
                      }`}
                      style={{ backgroundColor: hex }}
                      title={hex}
                    >
                      {sprite.accentColor === hex && <Check className="w-3.5 h-3.5 mx-auto text-black font-bold" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Tone */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Rona Kulit
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.skin.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => handleCosmeticChange('skinColor', hex)}
                      className={`w-6 h-6 rounded-sm border relative cursor-pointer ${
                        sprite.skinColor === hex ? 'border-white scale-110' : 'border-[#27272a]'
                      }`}
                      style={{ backgroundColor: hex }}
                      title={hex}
                    >
                      {sprite.skinColor === hex && <Check className="w-3.5 h-3.5 mx-auto text-black font-bold" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action Block */}
          <div className="flex justify-between items-center bg-[#0c0c0e]/80 p-4 rounded-sm border border-[#27272a]">
            <span className="text-xs text-zinc-400 font-mono">
              {bonusPoints > 0 ? (
                <span className="text-cyan-400 animate-pulse flex items-center gap-1">
                  💡 Selesaikan alokasi sisa {bonusPoints} poin stat untuk optimalisasi pahlawan.
                </span>
              ) : (
                <span className="text-cyan-400 font-semibold flex items-center gap-1">
                  ✓ Penyetelan sistem pahlawan selesai sempurna.
                </span>
              )}
            </span>

            <button
              type="submit"
              disabled={bonusPoints > 0 || !name.trim()}
              className="px-6 py-3 rounded-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-900 disabled:text-zinc-600 shadow-lg shadow-cyan-950/60 border border-transparent disabled:border-zinc-800 transition-all font-sans cursor-pointer disabled:cursor-not-allowed uppercase text-xs tracking-wider duration-300"
            >
              Luncurkan Karakter!
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
