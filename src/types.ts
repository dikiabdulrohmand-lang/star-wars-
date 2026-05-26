export type GameClass = 'Star Knight' | 'Void Mage' | 'Aegis Sentinel' | 'Chrono Scout';

export interface AttributeStats {
  strength: number;    // Physical damage, critical multiplier
  intelligence: number;// Tech/Void magic power, max energy
  vitality: number;    // Max HP, armor rating
  agility: number;     // Speed (turn order), dodge chance
}

export interface PixelSpriteData {
  hairStyle: string;   // 'short' | 'spiky' | 'long' | 'helmet'
  hairColor: string;   // Hex color
  skinColor: string;   // Hex color
  suitColor: string;   // Hex color
  accentColor: string; // Hex color
  weaponStyle: string; // 'saber' | 'blaster' | 'pulse' | 'staff'
}

export interface PlayerCharacter {
  name: string;
  classType: GameClass;
  level: number;
  exp: number;
  maxExp: number;
  stats: AttributeStats;
  sprite: PixelSpriteData;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  credits: number;
  inventory: Item[];
  activeSkills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  cooldown: number;
  currentCooldown: number;
  type: 'damage' | 'heal' | 'buff' | 'debuff';
  element: 'laser' | 'void' | 'kinetic' | 'shield';
  power: number; // multiplier or base scaling
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'heal_hp' | 'heal_energy' | 'grenade' | 'buff_stats';
  value: number;
  quantity: number;
  icon: string;
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  maxHp: number;
  hp: number;
  attack: number;
  speed: number;
  spriteSeed: string; // Used to seed procedural enemy pixel art
  colorTheme: string; // Main color
  skills: { name: string; damage: number; frequency: number }[];
  description: string;
}

export interface StoryNode {
  id: string;
  title: string;
  location: string;
  text: string;
  backgroundType: 'space_bridge' | 'star_station' | 'ancient_temple' | 'void_rift' | 'nebula_deck';
  choices: StoryChoice[];
}

export interface StoryChoice {
  text: string;
  leadsTo: string; // Next StoryNode id or 'COMBAT:<EnemyId>:<NextNodeId>' or 'ENDING:<EndingId>'
  alignmentImpact?: { rebel: number; syndicate: number }; // Alignment checks
  expReward?: number;
  creditsReward?: number;
  itemReward?: Item;
  requiredClass?: GameClass;
  requiredCredits?: number;
  alignmentRequirement?: { faction: 'rebel' | 'syndicate'; value: number };
}

export interface CombatLog {
  id: string;
  text: string;
  type: 'info' | 'player_hit' | 'player_skill' | 'enemy_hit' | 'heal' | 'defeat' | 'victory';
}

export interface GameState {
  player: PlayerCharacter | null;
  currentStoryNodeId: string;
  alignment: { rebel: number; syndicate: number };
  pastChoices: { nodeId: string; choiceText: string }[];
  questLogs: string[];
  isInCombat: boolean;
  combatEnemy: Enemy | null;
  postCombatNodeId: string; // story node to return to after combat
  gameCompleted: boolean;
  endingId: string | null;
}
