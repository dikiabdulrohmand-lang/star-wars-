import React from 'react';
import { PixelSpriteData } from '../types';

interface PixelAvatarProps {
  sprite?: PixelSpriteData;
  enemyType?: string; // If rendering enemy: 'behemoth' | 'android' | 'phantom' | 'kraken' | 'siren'
  animation?: 'idle' | 'attack' | 'hurt' | 'victory';
  size?: number;
  className?: string;
  isEnemy?: boolean;
  colorTheme?: string; // Enemy color theme
}

// Helper to darken/lighten hex colors for pristine shading
function shadeColor(color: string, percent: number): string {
  // If not hex, return color
  if (!color.startsWith('#')) return color;
  let num = parseInt(color.replace("#",""), 16),
  amt = Math.round(2.55 * percent),
  R = (num >> 16) + amt,
  G = (num >> 8 & 0x00FF) + amt,
  B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R<255?R<0?0:R:255)*0x10000 + (G<255?G<0?0:G:255)*0x100 + (B<255?B<0?0:B:255)).toString(16).slice(1);
}

export const PixelAvatar: React.FC<PixelAvatarProps> = ({
  sprite,
  enemyType,
  animation = 'idle',
  size = 120,
  className = '',
  isEnemy = false,
  colorTheme = '#f43f5e'
}) => {
  // Pixel grid is 14x14
  const gridW = 14;
  const gridH = 14;

  const defaultSprite: PixelSpriteData = {
    hairStyle: 'spiky',
    hairColor: '#eab308', // Gold
    skinColor: '#fbcfe8', // Pale Peach
    suitColor: '#2563eb', // Sci-Fi Blue
    accentColor: '#10b981', // Emerald tech lines
    weaponStyle: 'saber'
  };

  const s = sprite || defaultSprite;

  // Let's programmatically define pixels to light up.
  // We represent them as { x, y, color } arrays.
  const pixels: { x: number; y: number; color: string }[] = [];

  // Animation offsets
  let bobY = 0;
  let thrustX = 0;
  let tilt = 0;
  let shakeX = 0;

  if (animation === 'idle') {
    // Idle slow breath bob
    const t = Date.now() / 330;
    bobY = Math.sin(t) > 0 ? 0.3 : 0;
  } else if (animation === 'attack') {
    thrustX = isEnemy ? -1.5 : 1.5;
    bobY = -0.5;
  } else if (animation === 'hurt') {
    shakeX = Math.sin(Date.now() / 40) * 1.2;
    tilt = (Math.sin(Date.now() / 50) * 8);
  } else if (animation === 'victory') {
    bobY = -1.2;
    const t = Date.now() / 150;
    shakeX = Math.cos(t) * 0.4;
  }

  // Draw procedural alien enemy
  const drawEnemy = (type: string) => {
    const theme = colorTheme;
    const darkTheme = shadeColor(theme, -30);
    const brightTheme = shadeColor(theme, 30);

    if (type === 'behemoth') {
      // Large cosmic rock behemoth (huge armored golem with center glowing power block)
      // Body
      for (let x = 3; x <= 10; x++) {
        for (let y = 3; y <= 11; y++) {
          const isCore = (x === 6 || x === 7) && (y === 6 || y === 7);
          const isAccent = (x === 4 || x === 9) && (y === 4 || y === 8);
          if (isCore) {
            pixels.push({ x, y, color: '#6ee7b7' }); // Glowing crystal heart
          } else if (isAccent) {
            pixels.push({ x, y, color: brightTheme });
          } else {
            // Shaded rock pattern
            const shaded = (x + y) % 2 === 0 ? theme : darkTheme;
            pixels.push({ x, y, color: shaded });
          }
        }
      }
      // Shoulders & Horns
      pixels.push({ x: 2, y: 3, color: darkTheme });
      pixels.push({ x: 11, y: 3, color: darkTheme });
      pixels.push({ x: 3, y: 1, color: brightTheme });
      pixels.push({ x: 10, y: 1, color: brightTheme });
      pixels.push({ x: 3, y: 2, color: theme });
      pixels.push({ x: 10, y: 2, color: theme });
      // Glowing visor/eyes
      pixels.push({ x: 5, y: 4, color: '#ef4444' });
      pixels.push({ x: 8, y: 4, color: '#ef4444' });

    } else if (type === 'android') {
      // Rogue Cyber-Nexus Android (sleek metallic dome, twin red monocular eye)
      // Head
      for (let x = 4; x <= 9; x++) {
        for (let y = 2; y <= 5; y++) {
          const isEye = y === 4 && (x === 6 || x === 7);
          if (isEye) {
            pixels.push({ x, y, color: '#ef4444' }); // Red laser optic
          } else {
            pixels.push({ x, y, color: (x + y) % 3 === 0 ? '#cbd5e1' : '#94a3b8' });
          }
        }
      }
      // Tech shoulders
      for (let x = 2; x <= 11; x++) {
        pixels.push({ x, y: 6, color: '#64748b' });
      }
      // Torso
      for (let x = 3; x <= 10; x++) {
        for (let y = 7; y <= 11; y++) {
          const isStripe = x === 6 || x === 7;
          pixels.push({ x, y, color: isStripe ? theme : '#475569' });
        }
      }
      // Jet propulsion booster beneath
      pixels.push({ x: 5, y: 12, color: '#f97316' });
      pixels.push({ x: 6, y: 12, color: '#facc15' });
      pixels.push({ x: 7, y: 12, color: '#facc15' });
      pixels.push({ x: 8, y: 12, color: '#f97316' });

    } else if (type === 'phantom') {
      // Cosmic Void Phantom (ghostly floats, purple trails, glowing mask)
      // Floating shroud
      for (let y = 2; y <= 11; y++) {
        const spread = Math.floor(y / 2) + 1;
        const left = 7 - spread;
        const right = 7 + spread;
        for (let x = left; x <= right; x++) {
          // Floating pattern with empty voids
          if ((x + y + Math.floor(Date.now() / 400)) % 4 !== 0) {
            const isMask = y >= 4 && y <= 6 && x >= 5 && x <= 8;
            if (isMask) {
              pixels.push({ x, y, color: '#1e1b4b' }); // Deep black mask hole
            } else {
              pixels.push({ x, y, color: y > 7 ? darkTheme : theme });
            }
          }
        }
      }
      // Eerie glowing pupils
      pixels.push({ x: 6, y: 5, color: '#a855f7' });
      pixels.push({ x: 7, y: 5, color: '#c084fc' });
      // Floating fire-wisps around it
      const firePhase = Math.floor(Date.now() / 150) % 4;
      pixels.push({ x: 1 + firePhase % 2, y: 4, color: brightTheme });
      pixels.push({ x: 12 - firePhase % 2, y: 5, color: brightTheme });

    } else if (type === 'siren') {
      // Nebula Siren (magnetic cloud, sleek construct with wings)
      // Wings
      for (let x = 1; x <= 12; x++) {
        if (x === 1 || x === 2 || x === 11 || x === 12) {
          pixels.push({ x, y: 4, color: darkTheme });
          pixels.push({ x, y: 5, color: theme });
          pixels.push({ x, y: 6, color: brightTheme });
        }
      }
      // Core Body
      for (let y = 2; y <= 11; y++) {
        for (let x = 5; x <= 8; x++) {
          const isFace = y === 3 || y === 4;
          if (isFace) {
            pixels.push({ x, y, color: '#f8fafc' }); // Elegant porcelain artificial head
          } else {
            pixels.push({ x, y, color: y % 2 === 0 ? theme : darkTheme });
          }
        }
      }
      // Golden Crown halo
      pixels.push({ x: 5, y: 1, color: '#fbbf24' });
      pixels.push({ x: 6, y: 0, color: '#fbbf24' });
      pixels.push({ x: 7, y: 0, color: '#fbbf24' });
      pixels.push({ x: 8, y: 1, color: '#fbbf24' });
      // Glowing green tech eyes
      pixels.push({ x: 6, y: 4, color: '#10b981' });
      pixels.push({ x: 7, y: 4, color: '#10b981' });

    } else {
      // Default: Asteroid Marauder
      for (let x = 4; x <= 9; x++) {
        for (let y = 3; y <= 10; y++) {
          pixels.push({ x, y, color: theme });
        }
      }
      // glowing visor
      pixels.push({ x: 5, y: 5, color: '#fb7185' });
      pixels.push({ x: 8, y: 5, color: '#fb7185' });
    }
  };

  // Draw customized player character
  const drawPlayer = () => {
    // 1. Skin / Head
    const skinColor = s.skinColor;
    const shadedSkin = shadeColor(skinColor, -15);
    for (let x = 5; x <= 8; x++) {
      for (let y = 3; y <= 5; y++) {
        pixels.push({ x, y, color: skinColor });
      }
    }
    // Head shadow base
    pixels.push({ x: 5, y: 5, color: shadedSkin });
    pixels.push({ x: 8, y: 5, color: shadedSkin });

    // Eyes
    pixels.push({ x: 5, y: 4, color: '#000000' });
    pixels.push({ x: 7, y: 4, color: '#000000' });

    // 2. Hair styles
    const hair = s.hairColor;
    const darkHair = shadeColor(hair, -25);
    if (s.hairStyle === 'spiky') {
      pixels.push({ x: 4, y: 2, color: hair });
      pixels.push({ x: 5, y: 1, color: hair });
      pixels.push({ x: 6, y: 2, color: darkHair });
      pixels.push({ x: 7, y: 1, color: hair });
      pixels.push({ x: 8, y: 2, color: hair });
      pixels.push({ x: 9, y: 3, color: darkHair });
      // hairline base
      for (let col = 4; col <= 9; col++) {
        pixels.push({ x: col, y: 2, color: hair });
      }
    } else if (s.hairStyle === 'long') {
      // Long hair flowing down sides
      for (let col = 4; col <= 9; col++) {
        pixels.push({ x: col, y: 2, color: hair });
      }
      for (let y_hair = 3; y_hair <= 6; y_hair++) {
        pixels.push({ x: 4, y: y_hair, color: hair });
        pixels.push({ x: 9, y: y_hair, color: darkHair });
      }
    } else if (s.hairStyle === 'helmet') {
      // Sleek retro sci-fi space helmet with visor
      for (let col = 4; col <= 9; col++) {
        for (let row = 1; row <= 5; row++) {
          const isVisor = row === 3 || row === 4;
          const isVisorCol = col >= 5 && col <= 8;
          if (isVisor && isVisorCol) {
            pixels.push({ x: col, y: row, color: '#38bdf8' }); // Glowing cyan visor
          } else {
            pixels.push({ x: col, y: row, color: s.accentColor }); // Suit accent color helmet
          }
        }
      }
    } else {
      // 'short' classic trim
      for (let col = 5; col <= 8; col++) {
        pixels.push({ x: col, y: 2, color: hair });
      }
      pixels.push({ x: 4, y: 3, color: hair });
      pixels.push({ x: 9, y: 3, color: darkHair });
    }

    // 3. Torso / Suit (Rows 6 - 9)
    const suit = s.suitColor;
    const darkSuit = shadeColor(suit, -30);
    const accent = s.accentColor;

    for (let x = 4; x <= 9; x++) {
      for (let y = 6; y <= 9; y++) {
        // Tech armor details: draw accent stripes on central chassis
        const isAccent = (x === 6 || x === 7) && (y === 7 || y === 8);
        const color = isAccent ? accent : (x % 2 === 0 ? suit : darkSuit);
        pixels.push({ x, y, color });
      }
    }

    // Arms
    // Left arm / Shield
    pixels.push({ x: 3, y: 6, color: suit });
    pixels.push({ x: 3, y: 7, color: accent });
    pixels.push({ x: 2, y: 7, color: s.weaponStyle === 'pulse' ? '#10b981' : suit }); // Shield node

    // Right arm / weapon mount
    pixels.push({ x: 10, y: 6, color: suit });
    pixels.push({ x: 10, y: 7, color: accent });

    // 4. Legs
    for (let x = 4; x <= 9; x++) {
      if (x === 4 || x === 5 || x === 8 || x === 9) {
        pixels.push({ x, y: 10, color: darkSuit });
        pixels.push({ x, y: 11, color: '#1e293b' }); // black boots
      }
    }

    // 5. Weapon styles
    // Placed in the character's right hand (around column 11-13, rows 2-8)
    const renderWeapon = () => {
      const w = s.weaponStyle;
      if (w === 'saber') {
        const glow = '#ef4444'; // Glowing energy blade
        const hilt = '#94a3b8';
        // Hilt
        pixels.push({ x: 11, y: 7, color: hilt });
        pixels.push({ x: 12, y: 7, color: hilt });
        // Laser Core extending up
        pixels.push({ x: 11, y: 6, color: glow });
        pixels.push({ x: 12, y: 5, color: '#fecdd3' }); // tip glow
        pixels.push({ x: 12, y: 4, color: glow });
        pixels.push({ x: 13, y: 3, color: glow });
        pixels.push({ x: 13, y: 2, color: '#ffffff' }); // white hot core
      } else if (w === 'blaster') {
        // Sci-fi heavy sidearm
        const body = '#64748b';
        const blast = '#fb923c';
        pixels.push({ x: 11, y: 7, color: body });
        pixels.push({ x: 12, y: 7, color: body });
        pixels.push({ x: 12, y: 6, color: body });
        pixels.push({ x: 13, y: 6, color: blast }); // barrel flash
      } else if (w === 'pulse') {
        // High tech electronic ring gauntlets
        pixels.push({ x: 11, y: 7, color: '#a855f7' });
        pixels.push({ x: 12, y: 8, color: '#ec4899' });
        pixels.push({ x: 12, y: 6, color: '#3b82f6' });
        pixels.push({ x: 13, y: 7, color: '#10b981' });
      } else if (w === 'staff') {
        // Void Scepter
        const staffColor = '#78350f'; // mahogany wood or tech staff
        const gem = '#a855f7'; // mystical purple crystalline node
        pixels.push({ x: 11, y: 9, color: staffColor });
        pixels.push({ x: 11, y: 8, color: staffColor });
        pixels.push({ x: 11, y: 7, color: staffColor });
        pixels.push({ x: 12, y: 6, color: staffColor });
        pixels.push({ x: 12, y: 5, color: staffColor });
        pixels.push({ x: 13, y: 4, color: gem });
        pixels.push({ x: 13, y: 3, color: '#f3e8ff' }); // shine
        pixels.push({ x: 14, y: 4, color: gem });
      }
    };

    renderWeapon();
  };

  // Run builders
  if (isEnemy && enemyType) {
    drawEnemy(enemyType);
  } else {
    drawPlayer();
  }

  return (
    <div
      className={`relative inline-block ${className}`}
      id={isEnemy ? `enemy-avatar-${enemyType}` : 'player-avatar'}
      style={{
        width: size,
        height: size,
        transform: `translate(${shakeX}px, ${bobY * 8}px) rotate(${tilt}deg)`,
        transition: animation === 'hurt' ? 'none' : 'transform 0.1s ease-out'
      }}
    >
      <svg
        viewBox="0 0 15 15"
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Shadow Drop */}
        <ellipse
          cx="7.5"
          cy="13.2"
          rx="3.5"
          ry="0.8"
          fill="rgba(0,0,0,0.4)"
        />

        {/* Dynamic visual aura during attack or level up */}
        {animation === 'victory' && (
          <circle
            cx="7.5"
            cy="7.5"
            r="6"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="0.5"
            strokeDasharray="2 1"
            className="animate-spin"
            style={{ transformOrigin: 'center', animationDuration: '6s' }}
          />
        )}

        {/* Compile individual pixels into SVG rectangles */}
        {pixels.map((pix, idx) => {
          // Attacking translations for weapon/arm on player
          let finalX = pix.x;
          let finalY = pix.y;
          
          if (animation === 'attack' && !isEnemy) {
            // Weapon parts thrust further forward
            if (pix.x >= 10) {
              finalX += 0.8;
              finalY -= 0.4;
            }
          }

          return (
            <rect
              key={idx}
              x={finalX}
              y={finalY}
              width="1"
              height="1"
              fill={pix.color}
              stroke={pix.color}
              strokeWidth="0.05" // Overlap slightly to eliminate white gaps
            />
          );
        })}
      </svg>
    </div>
  );
};
