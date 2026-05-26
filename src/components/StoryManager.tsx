import React from 'react';
import { PlayerCharacter, StoryNode, StoryChoice, GameState, Item } from '../types';
import { STORY_NODES } from '../data/storyContent';
import { audio } from '../utils/AudioEngine';
import { Compass, Sparkles, AlertTriangle, Shield, Eye, Flame, Award, Heart, ShieldQuestion, BrainCircuit } from 'lucide-react';

interface StoryManagerProps {
  player: PlayerCharacter;
  currentNode: StoryNode;
  alignment: { rebel: number; syndicate: number };
  onChoiceMade: (choice: StoryChoice) => void;
  onLevelUp: (newLevel: number, statPointGained: number) => void;
}

export const StoryManager: React.FC<StoryManagerProps> = ({
  player,
  currentNode,
  alignment,
  onChoiceMade,
  onLevelUp
}) => {
  
  // Decide background theme stylized according to cosmic location
  const getBackgroundStyles = () => {
    switch (currentNode.backgroundType) {
      case 'space_bridge':
        return {
          bgClass: 'from-[#0c0c0e] via-[#09090b] to-[#121216]',
          decor: 'bg-radial-gradient from-cyan-500/5 to-transparent'
        };
      case 'star_station':
        return {
          bgClass: 'from-[#0c0c0e] via-[#09090b] to-[#121216]',
          decor: 'bg-radial-gradient from-cyan-500/5 to-transparent'
        };
      case 'nebula_deck':
        return {
          bgClass: 'from-[#0c0c0e] via-[#09090b] to-[#121216]',
          decor: 'bg-radial-gradient from-cyan-500/5 to-transparent'
        };
      case 'void_rift':
        return {
          bgClass: 'from-[#0c0c0e] via-[#09090b] to-[#121216]',
          decor: 'bg-radial-gradient from-cyan-500/10 to-transparent'
        };
      case 'ancient_temple':
        return {
          bgClass: 'from-[#0c0c0e] via-[#09090b] to-[#121216]',
          decor: 'bg-radial-gradient from-cyan-500/5 to-transparent'
        };
      default:
        return {
          bgClass: 'from-[#0c0c0e] via-[#121216] to-[#09090b]',
          decor: ''
        };
    }
  };

  const { bgClass, decor } = getBackgroundStyles();

  // Helper to safely parse newlines and build paragraph elements
  const formatStoryText = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => (
      <p key={index} className="leading-relaxed text-sm text-zinc-300 antialiased font-sans">
        {paragraph}
      </p>
    ));
  };

  const checkChoiceRequirements = (choice: StoryChoice): { allowed: boolean; reason?: string } => {
    // 1. Class limitation
    if (choice.requiredClass) {
      if (player.classType !== choice.requiredClass) {
        return { allowed: false, reason: `Butuh kelas spesifik: ${choice.requiredClass}` };
      }
    }
    // 2. Credits limitation
    if (choice.requiredCredits) {
      if (player.credits < choice.requiredCredits) {
        return { allowed: false, reason: `Butuh dana: ${choice.requiredCredits} Credits (Anda hanya punya: ${player.credits})` };
      }
    }
    // 3. Alignment requirements
    if (choice.alignmentRequirement) {
      const { faction, value } = choice.alignmentRequirement;
      const factionVal = faction === 'rebel' ? alignment.rebel : alignment.syndicate;
      if (factionVal < value) {
        const factionName = faction === 'rebel' ? 'Reputasi Pemberontak' : 'Reputasi Syndicate';
        return { allowed: false, reason: `Butuh ${factionName} minimal ${value} (Reputasi Anda: ${factionVal})` };
      }
    }

    return { allowed: true };
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-2 px-4 space-y-6" id="story-manager-screen">
      
      {/* HUD status strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#0c0c0e] border border-[#27272a] rounded-sm p-4">
        <div className="space-y-1">
          <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> EXP PENERBANG
          </div>
          <div className="text-sm font-bold text-white font-mono">
            {player.exp} / {player.maxExp} <span className="text-[10px] font-normal text-zinc-500">(Lv. {player.level})</span>
          </div>
          <div className="h-1.5 w-full bg-[#09090b] rounded-none overflow-hidden border border-[#27272a]">
            <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${(player.exp / player.maxExp) * 100}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-cyan-400" /> DOMPET KREDIT
          </div>
          <div className="text-sm font-bold text-cyan-200 font-mono">
            {player.credits.toFixed(2)} Credits
          </div>
          <div className="text-[9px] text-zinc-500 font-sans truncate">Sisa modal transaksi armada.</div>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-cyan-400" /> REBEL ALIGNMENT
          </div>
          <div className="text-sm font-bold text-cyan-400 font-mono">
            {alignment.rebel} Poin
          </div>
          <div className="h-1.5 w-full bg-[#09090b] rounded-none overflow-hidden border border-[#27272a]">
            <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${Math.min(100, (alignment.rebel / 100) * 100)}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-cyan-400" /> SYNDICATE ALIGNMENT
          </div>
          <div className="text-sm font-bold text-cyan-400 font-mono">
            {alignment.syndicate} Poin
          </div>
          <div className="h-1.5 w-full bg-[#09090b] rounded-none overflow-hidden border border-[#27272a]">
            <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${Math.min(100, (alignment.syndicate / 100) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Narrative Board with reactive backgrounds */}
      <div className={`relative bg-gradient-to-b ${bgClass} rounded-sm p-6 sm:p-8 border border-[#27272a] min-h-[300px] flex flex-col justify-between shadow-2xl overflow-hidden`}>
        {/* Soft atmospheric backlight halo */}
        <div className={`absolute inset-0 ${decor} pointer-events-none transition-all duration-500`} />
        
        {/* Animated matrix of retro pixel stars in the background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(270deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-30" />

        <div className="relative space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272a] pb-3">
            <div>
              <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-widest bg-zinc-950 px-2.5 py-1 rounded-sm border border-[#27272a]">
                LOKASI: {currentNode.location}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight uppercase font-sans">
              {currentNode.title}
            </h2>
          </div>

          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin">
            {formatStoryText(currentNode.text)}
          </div>
        </div>

        {/* Action Choice Terminal Header */}
        <div className="relative mt-8 pt-4 border-t border-[#27272a] flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <span className="flex items-center gap-1">
            <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" /> JALUR NALURI PILIHAN
          </span>
          <span>SILAKAN KUNCI TINDAKAN ANDA</span>
        </div>
      </div>

      {/* Choices Interactive Terminal Block */}
      <div className="space-y-3 font-sans">
        {currentNode.choices.map((choice, idx) => {
          const { allowed, reason } = checkChoiceRequirements(choice);

          return (
            <button
              key={idx}
              disabled={!allowed}
              onClick={() => {
                audio.playClick();
                onChoiceMade(choice);
              }}
              style={{ contentVisibility: 'auto' }}
              className={`w-full group text-left p-4 rounded-sm border transition-all duration-350 block relative text-sm ${
                allowed
                  ? 'border-[#27272a] hover:border-cyan-500 bg-[#0c0c0e] hover:bg-[#121216] text-zinc-200 cursor-pointer shadow-md'
                  : 'border-zinc-950 bg-zinc-950/40 text-zinc-600 cursor-not-allowed border-dashed'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className={`w-6 h-6 rounded-sm font-mono text-xs font-bold flex items-center justify-center border shrink-0 transition-all ${
                  allowed 
                    ? 'bg-zinc-950 border-[#27272a] text-zinc-500 group-hover:bg-cyan-950/40 group-hover:border-cyan-500 group-hover:text-cyan-300'
                    : 'bg-zinc-950 border-zinc-950 text-zinc-700'
                }`}>
                  {idx + 1}
                </span>

                <div className="space-y-2 flex-1">
                  <span className={`${allowed ? 'text-[#fafafa]' : 'text-zinc-600'} font-bold`}>
                    {choice.text}
                  </span>

                  {/* Rewards preview tooltip helper beneath */}
                  {allowed && (choice.expReward || choice.creditsReward || choice.itemReward || choice.alignmentImpact) && (
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono pt-1">
                      {choice.expReward && (
                        <span className="text-cyan-400 bg-cyan-950/20 border border-cyan-800/40 px-1.5 py-0.5 rounded-sm">
                          +{choice.expReward} EXP
                        </span>
                      )}
                      {choice.creditsReward && (
                        <span className="text-cyan-400 bg-cyan-950/20 border border-cyan-800/40 px-1.5 py-0.5 rounded-sm">
                          +{choice.creditsReward.toFixed(2)} Credits
                        </span>
                      )}
                      {choice.itemReward && (
                        <span className="text-cyan-400 bg-cyan-950/20 border border-cyan-800/40 px-1.5 py-0.5 rounded-sm">
                          Dapatkan: {choice.itemReward.name}
                        </span>
                      )}
                      {choice.alignmentImpact && (
                        <>
                          {choice.alignmentImpact.rebel > 0 && (
                            <span className="text-cyan-400 bg-cyan-950/20 border border-cyan-800/40 px-1.5 py-0.5 rounded-sm">
                              + Rebel Alignment
                            </span>
                          )}
                          {choice.alignmentImpact.syndicate > 0 && (
                            <span className="text-cyan-400 bg-cyan-950/20 border border-cyan-800/40 px-1.5 py-0.5 rounded-sm">
                              + Syndicate Alignment
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Disabled lock warnings */}
                  {!allowed && reason && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-400/80 font-mono font-medium pt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      {reason}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
