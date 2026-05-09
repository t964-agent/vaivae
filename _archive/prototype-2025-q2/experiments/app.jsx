// Main app — scroll-driven living runway

const { useState, useEffect, useRef, useMemo } = React;

const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "openingPalette": "molten",
  "outfitOrder": "brown-blue-salmon-beige",
  "endingMode": "studio",
  "cursorHeat": true,
  "idleBreathe": true,
  "scrollInertia": true,
  "ambientSound": false,
  "showCaptions": true,
  "novelty": "moderate"
}/*EDITMODE-END*/;

// Outfit story keyed to scroll progress
const OUTFITS = {
  'brown-blue-salmon-beige': [
    { name: 'Brown',  state: 'brown',  label: 'Look 01 / Terracotta',  price: 'From €1,180' },
    { name: 'Blue',   state: 'blue',   label: 'Look 02 / Glacial',     price: 'From €1,420' },
    { name: 'Salmon', state: 'salmon', label: 'Look 03 / Coral',       price: 'From €980'   },
    { name: 'Beige',  state: 'beige',  label: 'Look 04 / Linen',       price: 'From €1,620' },
  ],
  'salmon-beige-blue-brown': [
    { name: 'Salmon', state: 'salmon', label: 'Look 01 / Coral',       price: 'From €980'   },
    { name: 'Beige',  state: 'beige',  label: 'Look 02 / Linen',       price: 'From €1,620' },
    { name: 'Blue',   state: 'blue',   label: 'Look 03 / Glacial',     price: 'From €1,420' },
    { name: 'Brown',  state: 'brown',  label: 'Look 04 / Terracotta',  price: 'From €1,180' },
  ],
};

const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAKS_DEFAULTS);
  const [progress, setProgress] = useState(0); // 0..1 across whole document
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [cursor, setCursor] = useState({ x: -200, y: -200 });
  const [idle, setIdle] = useState(true);
  const idleTimer = useRef(null);
  const audioRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);

  // --- Scroll progress (with inertia-smoothing) ---
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      setProgress(p);
      // bump idle
      setIdle(false);
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setIdle(true), 1400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Smooth progress with rAF interpolation for inertia feel
  useEffect(() => {
    let raf;
    const tick = () => {
      setSmoothProgress(prev => {
        const target = progress;
        const k = tweaks.scrollInertia ? 0.08 : 0.4;
        const next = prev + (target - prev) * k;
        return Math.abs(next - target) < 0.0001 ? target : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress, tweaks.scrollInertia]);

  // Cursor
  useEffect(() => {
    const onMove = (e) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Sound (synthesized ambient drone via WebAudio so we don't need an asset)
  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);
  const oscsRef = useRef([]);
  useEffect(() => {
    if (!soundOn) {
      if (gainRef.current) {
        try {
          gainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.4);
        } catch (e) {}
      }
      return;
    }
    if (!audioCtxRef.current) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);
      const freqs = [110, 165, 220, 277];
      const oscs = freqs.map((f, i) => {
        const o = ctx.createOscillator();
        o.frequency.value = f;
        o.type = i % 2 ? 'sine' : 'triangle';
        const g = ctx.createGain();
        g.gain.value = 0.05 + i * 0.02;
        o.connect(g); g.connect(gain);
        o.start();
        return { o, g };
      });
      audioCtxRef.current = ctx;
      gainRef.current = gain;
      oscsRef.current = oscs;
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    gainRef.current.gain.setTargetAtTime(0.18, audioCtxRef.current.currentTime, 0.6);
  }, [soundOn]);

  // Pitch drift with progress for atmospheric feel
  useEffect(() => {
    if (!soundOn || !oscsRef.current.length) return;
    const t = audioCtxRef.current.currentTime;
    const base = 110 + smoothProgress * 60;
    oscsRef.current.forEach((entry, i) => {
      entry.o.frequency.setTargetAtTime(base * (1 + i * 0.5), t, 0.3);
    });
  }, [smoothProgress, soundOn]);

  // --- Scene determination ---
  const scene = useMemo(() => {
    const p = smoothProgress;
    if (p < 0.10) return { id: 'opening', label: '00 / FORMATION' };
    if (p < 0.22) return { id: 'forming', label: '01 / FORMATION' };
    if (p < 0.85) return { id: 'runway',  label: '02 / RUNWAY'    };
    return { id: 'arrival', label: '03 / ARRIVAL' };
  }, [smoothProgress]);

  // Outfit slot during runway: 0.22..0.85
  const outfitsArr = OUTFITS[tweaks.outfitOrder] || OUTFITS['brown-blue-salmon-beige'];
  const outfitIndex = useMemo(() => {
    if (smoothProgress < 0.22) return -1;
    if (smoothProgress > 0.85) return outfitsArr.length;
    const seg = (smoothProgress - 0.22) / 0.63;
    return Math.min(outfitsArr.length - 1, Math.floor(seg * outfitsArr.length));
  }, [smoothProgress, outfitsArr.length]);

  const currentOutfit = outfitsArr[outfitIndex];

  const museState =
    smoothProgress < 0.18 ? 'forming' :
    smoothProgress > 0.85 ? 'final' :
    (currentOutfit ? currentOutfit.state : 'forming');

  // Background opacity per layer (cross-fades)
  const layers = {
    molten:  smoothProgress < 0.30 ? 1 : Math.max(0, 1 - (smoothProgress - 0.30) * 6),
    brown:   museState === 'brown'  ? 1 : 0,
    blue:    museState === 'blue'   ? 1 : 0,
    salmon:  museState === 'salmon' ? 1 : 0,
    beige:   museState === 'beige'  ? 1 : 0,
    studio:  smoothProgress > 0.78 ? Math.min(1, (smoothProgress - 0.78) * 8) : 0,
  };

  // In studio, swap cursor look
  const studioMode = layers.studio > 0.4;

  // Logo opacity sequence: visible at start (blurred), fades, then sharp at end
  const logoOpening = smoothProgress < 0.10 ? 1 - smoothProgress * 6 : 0;

  // CTA at the very end
  const showCTA = smoothProgress > 0.92;

  // Scroll hint visibility
  const showScrollHint = smoothProgress < 0.04;

  // Caption fade per outfit segment
  const captionOpacity = useMemo(() => {
    if (!currentOutfit || !tweaks.showCaptions) return 0;
    const seg = (smoothProgress - 0.22) / 0.63;
    const within = seg * outfitsArr.length - outfitIndex;     // 0..1 within current outfit
    // Fade in the first 20% of the segment, out the last 20%
    if (within < 0.2) return within / 0.2;
    if (within > 0.8) return (1 - within) / 0.2;
    return 1;
  }, [smoothProgress, outfitIndex, currentOutfit, outfitsArr.length, tweaks.showCaptions]);

  // Mid-runway "fabric words" reveal
  const fabricWord = useMemo(() => {
    if (smoothProgress < 0.50 || smoothProgress > 0.78) return null;
    const seg = (smoothProgress - 0.50) / 0.28;
    if (seg < 0.33) return 'Liquid form.';
    if (seg < 0.66) return 'Living cloth.';
    return 'A new house.';
  }, [smoothProgress]);

  // Click CTA
  const onEnter = () => {
    document.body.style.transition = 'opacity 0.8s';
    document.body.style.opacity = 0;
    setTimeout(() => {
      alert('→ Collection page would load here.');
      document.body.style.opacity = 1;
    }, 700);
  };

  return (
    <>
      {/* Cursor */}
      {tweaks.cursorHeat && (
        <>
          <div
            className={`cursor ${studioMode ? 'studio' : ''}`}
            style={{ transform: `translate(${cursor.x}px, ${cursor.y}px) translate(-50%, -50%)` }}
          />
          <div
            className={`lens ${studioMode ? 'studio' : ''}`}
            style={{ left: cursor.x, top: cursor.y }}
          />
        </>
      )}

      {/* Sticky stage */}
      <div className="stage">
        {/* Background layers */}
        <div className="bg-layer bg-molten" style={{ opacity: layers.molten }}>
          <div className="heat-waves" />
        </div>
        <div className="bg-layer bg-tint brown"  style={{ opacity: layers.brown }} />
        <div className="bg-layer bg-tint blue"   style={{ opacity: layers.blue }} />
        <div className="bg-layer bg-tint salmon" style={{ opacity: layers.salmon }} />
        <div className="bg-layer bg-tint beige"  style={{ opacity: layers.beige }} />
        <div className="bg-layer bg-tint studio" style={{ opacity: layers.studio }} />

        {/* Opening blurred logo */}
        <div className="opening-logo" style={{ opacity: logoOpening }}>
          vaïvae
        </div>

        {/* Mid-scroll fabric word */}
        {fabricWord && (
          <div className="fabric-words">
            <div
              className="word"
              key={fabricWord}
              style={{
                color: studioMode ? '#1a0f08' : undefined,
                background: studioMode ? 'none' : undefined,
                WebkitBackgroundClip: studioMode ? 'unset' : undefined,
                opacity: 0.92,
                animation: 'fadeWord 1.2s ease',
              }}
            >
              {fabricWord}
            </div>
          </div>
        )}

        {/* The muse */}
        <Muse
          progress={smoothProgress}
          outfitState={museState}
          idleBreathe={tweaks.idleBreathe && idle}
        />

        {/* Outfit caption */}
        {currentOutfit && tweaks.showCaptions && (
          <div className="outfit-caption" style={{ opacity: captionOpacity, color: studioMode ? '#1a0f08' : 'var(--ink)' }}>
            <span className="label">{currentOutfit.label}</span>
            <span className="name">{currentOutfit.name}</span>
            <span className="price">{currentOutfit.price}</span>
          </div>
        )}

        {/* Scene label (left rotated) */}
        <div className="scene-label" style={{ color: studioMode ? '#1a0f08' : 'var(--ink)', opacity: 0.45 }}>
          {scene.label}
        </div>

        {/* End CTA */}
        <div className={`cta-wrap ${showCTA ? 'show' : ''}`}>
          <span className="eyebrow" style={{ color: studioMode ? '#1a0f08' : 'var(--ink)' }}>
            Drop 01 — Available now
          </span>
          <button className="cta" onClick={onEnter}>
            Enter the Collection
          </button>
        </div>
      </div>

      {/* Top nav */}
      <nav className="nav">
        <div className="brand">vaïvae</div>
        <div className="links">
          <a href="#">Lookbook</a>
          <a href="#">Atelier</a>
          <a href="#">Stockists</a>
          <a href="#">Bag</a>
        </div>
      </nav>

      {/* Right progress dots */}
      <div className="progress">
        {[0, 0.20, 0.42, 0.62, 0.95].map((p, i) => (
          <div
            key={i}
            className={`dot ${Math.abs(smoothProgress - p) < 0.10 ? 'active' : ''}`}
            style={{ background: studioMode ? '#1a0f08' : 'var(--ink)' }}
          />
        ))}
      </div>

      {/* Sound */}
      <button
        className="sound-toggle"
        onClick={() => setSoundOn(s => !s)}
        style={{ color: studioMode ? '#1a0f08' : 'var(--ink)' }}
      >
        {soundOn ? '◉ Sound on' : '○ Sound'}
      </button>

      {/* Scroll hint */}
      <div className="scroll-hint" style={{ opacity: showScrollHint ? 0.6 : 0, color: studioMode ? '#1a0f08' : 'var(--ink)' }}>
        Scroll to begin
        <span className="line" />
      </div>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Color story">
          <TweakRadio
            label="Outfit order"
            value={tweaks.outfitOrder}
            onChange={v => setTweak('outfitOrder', v)}
            options={[
              { value: 'brown-blue-salmon-beige', label: 'Warm → Cool' },
              { value: 'salmon-beige-blue-brown', label: 'Soft → Bold' },
            ]}
          />
        </TweakSection>

        <TweakSection title="Motion">
          <TweakToggle
            label="Scroll inertia"
            value={tweaks.scrollInertia}
            onChange={v => setTweak('scrollInertia', v)}
          />
          <TweakToggle
            label="Cursor heat distortion"
            value={tweaks.cursorHeat}
            onChange={v => setTweak('cursorHeat', v)}
          />
          <TweakToggle
            label="Idle muse breathing"
            value={tweaks.idleBreathe}
            onChange={v => setTweak('idleBreathe', v)}
          />
        </TweakSection>

        <TweakSection title="Display">
          <TweakToggle
            label="Outfit captions"
            value={tweaks.showCaptions}
            onChange={v => setTweak('showCaptions', v)}
          />
        </TweakSection>

        <TweakSection title="Jump to scene">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { label: 'Open', p: 0 },
              { label: 'Form', p: 0.15 },
              { label: 'Brown', p: 0.28 },
              { label: 'Blue', p: 0.44 },
              { label: 'Salmon', p: 0.60 },
              { label: 'Beige', p: 0.76 },
              { label: 'End', p: 0.96 },
            ].map(s => (
              <button
                key={s.label}
                onClick={() => {
                  const max = document.documentElement.scrollHeight - window.innerHeight;
                  window.scrollTo({ top: max * s.p, behavior: 'smooth' });
                }}
                style={{
                  padding: '6px 10px',
                  fontSize: 11,
                  fontFamily: 'Inter Tight, sans-serif',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  background: 'transparent',
                  color: '#f6f1ea',
                  border: '1px solid rgba(246,241,234,0.3)',
                  borderRadius: 999,
                  cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </TweakSection>
      </TweaksPanel>

      <style>{`
        @keyframes fadeWord {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 0.92; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
