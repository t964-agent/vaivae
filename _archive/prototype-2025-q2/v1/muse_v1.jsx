// Muse silhouette — SVG figure that scales/turns and changes outfit color/shape per scroll progress.
// Receives `progress` (0..1) and `outfitState` (one of: 'forming', 'brown','blue','salmon','beige', 'final').

const Muse = ({ progress, outfitState, idleBreathe }) => {
  // Scale: tiny silhouette during opening, grows to full body by mid scroll
  // progress 0..0.18: still emerging
  // 0.18..0.45: zoomed waist-up
  // 0.45..0.85: full body, turning + outfit changes
  // 0.85..1: full body in studio
  const scale = React.useMemo(() => {
    if (progress < 0.18) return 0.55 + progress * 1.4;          // 0.55 → 0.80
    if (progress < 0.45) return 0.80 + (progress - 0.18) * 1.3; // 0.80 → 1.15
    if (progress < 0.85) return 1.15 - (progress - 0.45) * 0.6; // 1.15 → 0.91
    return 0.91 - (progress - 0.85) * 0.4;                       // 0.91 → 0.85
  }, [progress]);

  // Vertical position: slightly lifts/drops to suggest zoom
  const yShift = React.useMemo(() => {
    if (progress < 0.18) return 40;
    if (progress < 0.45) return 60 - (progress - 0.18) * 200; // 60 → 6
    return -10 + (progress - 0.45) * 30;                       // -10 → ~6
  }, [progress]);

  // Rotation: during runway phase the muse turns (suggesting the in-place transformation)
  const rotation = React.useMemo(() => {
    if (progress < 0.45) return 0;
    if (progress > 0.82) return 0;
    // 0.45..0.82 → sweep -18 → +18 across multiple turns
    const phase = (progress - 0.45) / 0.37; // 0..1
    return Math.sin(phase * Math.PI * 3) * 14;
  }, [progress]);

  // Blur on opening: heavy blur, resolves at ~0.12
  const blur = progress < 0.12 ? (0.12 - progress) * 60 : 0;

  // Opacity grow-in
  const opacity = Math.min(1, progress * 8);

  // Outfit colors
  const palette = {
    forming: { dress: '#3a1a10', accent: '#7a2a14', hair: '#1a0a06' },
    brown:   { dress: '#6b4326', accent: '#3d2614', hair: '#2a1a10' },
    blue:    { dress: '#6a8aa8', accent: '#3a5a78', hair: '#1a1820' },
    salmon:  { dress: '#e9a594', accent: '#c47e6f', hair: '#2a1a16' },
    beige:   { dress: '#d8c7af', accent: '#a89070', hair: '#3a2a20' },
    final:   { dress: '#e8d9c0', accent: '#b8a080', hair: '#2a1a14' },
  };
  const colors = palette[outfitState] || palette.forming;

  // Skin tone: subtle variation by visit (set once)
  const skin = React.useMemo(() => {
    const tones = ['#c89a7a', '#a87858', '#d4a888', '#8a5a40', '#b88a68'];
    return tones[Math.floor(Math.random() * tones.length)];
  }, []);

  // Idle breathing
  const breath = idleBreathe ? Math.sin(Date.now() / 1400) * 0.008 : 0;

  return (
    <div
      className="muse-stage"
      style={{
        transform: `translateY(${yShift}px)`,
        transition: 'transform 0.4s ease',
      }}
    >
      <svg
        viewBox="0 0 400 700"
        width="38vw"
        style={{
          maxWidth: 600,
          minWidth: 280,
          height: 'auto',
          opacity,
          filter: `blur(${blur}px) drop-shadow(0 30px 60px rgba(0,0,0,0.4))`,
          transform: `scale(${scale + breath}) rotateY(${rotation}deg)`,
          transformOrigin: 'center 60%',
          transition: 'filter 0.6s ease',
        }}
      >
        <defs>
          {/* Soft gradient for outfit body */}
          <linearGradient id="dress-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.accent} />
            <stop offset="55%" stopColor={colors.dress} />
            <stop offset="100%" stopColor={colors.accent} stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="skin-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skin} />
            <stop offset="100%" stopColor={skin} stopOpacity="0.9" />
          </linearGradient>
          {/* Soft fabric ripple filter */}
          <filter id="ripple" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="3">
              <animate
                attributeName="baseFrequency"
                values="0.012;0.018;0.012"
                dur="8s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="6" />
          </filter>
          <radialGradient id="halo" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(255,220,180,0.5)" />
            <stop offset="100%" stopColor="rgba(255,220,180,0)" />
          </radialGradient>
        </defs>

        {/* Halo behind */}
        <ellipse cx="200" cy="280" rx="180" ry="240" fill="url(#halo)" />

        {/* Hair (back) */}
        <path
          d="M 158 95 Q 130 130 132 195 Q 138 240 158 250 L 242 250 Q 262 240 268 195 Q 270 130 242 95 Q 200 70 158 95 Z"
          fill={colors.hair}
          opacity="0.85"
        />

        {/* Neck */}
        <path d="M 188 175 L 188 210 Q 200 216 212 210 L 212 175 Z" fill="url(#skin-grad)" />

        {/* Head */}
        <ellipse cx="200" cy="140" rx="42" ry="52" fill="url(#skin-grad)" />

        {/* Face suggestion (very subtle) */}
        <ellipse cx="186" cy="146" rx="2" ry="3" fill="rgba(0,0,0,0.3)" />
        <ellipse cx="214" cy="146" rx="2" ry="3" fill="rgba(0,0,0,0.3)" />
        <path d="M 196 162 Q 200 165 204 162" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        {/* Hair (front strands) */}
        <path
          d="M 158 95 Q 165 105 175 110 Q 185 100 200 102 Q 215 100 225 110 Q 235 105 242 95 Q 200 65 158 95 Z"
          fill={colors.hair}
        />

        {/* Shoulders + dress (with ripple filter for fabric movement) */}
        <g filter={progress > 0.18 ? 'url(#ripple)' : undefined}>
          {/* Dress / outfit body */}
          <path
            d="
              M 150 215
              Q 135 235 132 270
              L 128 360
              Q 130 420 138 480
              Q 146 540 158 600
              L 242 600
              Q 254 540 262 480
              Q 270 420 272 360
              L 268 270
              Q 265 235 250 215
              Q 225 230 200 230
              Q 175 230 150 215
              Z
            "
            fill="url(#dress-grad)"
          />

          {/* Subtle fabric fold lines */}
          <path
            d="M 170 260 Q 175 380 168 580"
            stroke={colors.accent}
            strokeWidth="1.2"
            fill="none"
            opacity="0.4"
          />
          <path
            d="M 230 260 Q 225 380 232 580"
            stroke={colors.accent}
            strokeWidth="1.2"
            fill="none"
            opacity="0.4"
          />
          <path
            d="M 200 240 L 200 600"
            stroke={colors.accent}
            strokeWidth="0.8"
            fill="none"
            opacity="0.3"
          />
        </g>

        {/* Arms (visible when full body) */}
        {progress > 0.35 && (
          <>
            <path
              d="M 148 220 Q 130 280 124 360 Q 122 400 128 420"
              stroke="url(#skin-grad)"
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
              opacity={Math.min(1, (progress - 0.35) * 4)}
            />
            <path
              d="M 252 220 Q 270 280 276 360 Q 278 400 272 420"
              stroke="url(#skin-grad)"
              strokeWidth="14"
              fill="none"
              strokeLinecap="round"
              opacity={Math.min(1, (progress - 0.35) * 4)}
            />
          </>
        )}

        {/* Legs hint (full body) */}
        {progress > 0.45 && (
          <g opacity={Math.min(1, (progress - 0.45) * 3)}>
            <path
              d="M 175 600 L 178 680"
              stroke="url(#skin-grad)"
              strokeWidth="22"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 225 600 L 222 680"
              stroke="url(#skin-grad)"
              strokeWidth="22"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

window.Muse = Muse;
