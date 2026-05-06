/* vaïvae — Living Runway: scroll-driven video via frame-capture, GSAP choreography
 * ────────────────────────────────────────────────────────────────────────────
 * Master scroll envelope (0 → 1):
 *   0.000 – 0.020   Hero settled, video clip-path = circle(0%)
 *   0.020 – 0.080   Hero fades out + circle-wipe expands 0 → 82%   (synchronized)
 *   0.080 – 0.110   Pure video breath (no text)
 *   0.110 – 0.230   01 Formation     [enter 0.110-0.150 · hold · exit 0.205-0.230]
 *   0.230 – 0.350   02 Terracotta    [same envelope shape]
 *   0.350 – 0.470   03 Glacial
 *   0.470 – 0.590   04 Coral
 *   0.560 – 0.730   Dark overlay     (overlaps 05 Stats)
 *   0.590 – 0.720   05 Stats         (counters drive on enter)
 *   0.720 – 0.840   06 Linen
 *   0.840 – 1.000   07 CTA           (data-persist, never exits)
 *
 * Marquees:
 *   top    visible 0.260 – 0.560   (Terracotta + Glacial)
 *   bottom visible 0.640 – 0.820   (Stats + Linen entry)
 * ──────────────────────────────────────────────────────────────────────────── */

// ─── Lenis smooth scroll ──────────────────────────────────
const lenis = new Lenis({
  duration: 1.25,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1.0,
  touchMultiplier: 1.6,
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
// expose for debugging / external scripts
window.lenis = lenis;

// ─── Elements ─────────────────────────────────────────────
const loader          = document.getElementById('loader');
const loaderBar       = document.getElementById('loader-bar');
const loaderPercent   = document.getElementById('loader-percent');
const video           = document.getElementById('hero-video');
const canvas          = document.getElementById('hero-canvas');
const ctx             = canvas.getContext('2d');
const videoWrap       = document.querySelector('.video-wrap');
const heroSection     = document.querySelector('.hero-standalone');
const scrollIndicator = document.querySelector('.scroll-indicator');
const scrollContainer = document.getElementById('scroll-container');
const cursorLens      = document.getElementById('cursor-lens');
const darkOverlay     = document.getElementById('dark-overlay');

// ─── Easing helpers ───────────────────────────────────────
const PI = Math.PI;
const clamp01 = (v) => v < 0 ? 0 : (v > 1 ? 1 : v);
const lerp    = (a, b, t) => a + (b - a) * t;

// 0 → 1 cosine ramp inside [start, end]
function ramp(p, start, end) {
  if (end <= start) return p >= end ? 1 : 0;
  const t = clamp01((p - start) / (end - start));
  return 0.5 - 0.5 * Math.cos(t * PI);
}

// 1 → 0 cosine ramp inside [start, end]
function rampOut(p, start, end) { return 1 - ramp(p, start, end); }

// power3.out (smooth deceleration)
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

// ─── Frame capture ────────────────────────────────────────
const TARGET_FRAMES = 120;
const frames = [];
let frameW = 1280, frameH = 720;
let videoDuration = 0;
let captureDone = false;

function setProgress(p) {
  loaderBar.style.width = (p * 100).toFixed(0) + '%';
  loaderPercent.textContent = (p * 100).toFixed(0) + '%';
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width  = window.innerWidth  * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width  = window.innerWidth  + 'px';
  canvas.style.height = window.innerHeight + 'px';
}
window.addEventListener('resize', () => { resizeCanvas(); drawFrame(currentFrame); });
resizeCanvas();

let currentFrame = 0;
function drawFrame(i) {
  const img = frames[i];
  if (!img) return;
  const cw = canvas.width, ch = canvas.height;
  const iw = img.width, ih = img.height;
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale, dh = ih * scale;
  const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
  ctx.fillStyle = '#0a0606';
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);
}

const grabCanvas = document.createElement('canvas');
const grabCtx    = grabCanvas.getContext('2d');

async function captureFrames() {
  const maxW  = 1280;
  const ratio = video.videoWidth / video.videoHeight || 16/9;
  frameW = Math.min(maxW, video.videoWidth || maxW);
  frameH = Math.round(frameW / ratio);
  grabCanvas.width  = frameW;
  grabCanvas.height = frameH;

  videoDuration = video.duration || 1;
  const total = TARGET_FRAMES;

  video.muted = true;
  video.playsInline = true;
  video.loop = false;
  video.playbackRate = 1.0;
  try { video.currentTime = 0; } catch (e) {}
  try { await video.play(); } catch (e) {}

  const samples = [];
  let lastT = -1;

  await new Promise((resolve) => {
    let stop = false;
    function onEnded() { stop = true; resolve(); }
    video.addEventListener('ended', onEnded, { once: true });

    function snap() {
      const t = video.currentTime;
      if (t !== lastT && t > 0) {
        try {
          grabCtx.drawImage(video, 0, 0, frameW, frameH);
          const bmpPromise = createImageBitmap(grabCanvas);
          samples.push({ t, bmpPromise });
          lastT = t;
          setProgress(0.05 + 0.85 * Math.min(1, t / videoDuration));
        } catch (e) {}
      }
    }

    if (video.requestVideoFrameCallback) {
      const cb = () => {
        snap();
        if (!stop) video.requestVideoFrameCallback(cb);
      };
      video.requestVideoFrameCallback(cb);
    } else {
      function tick() {
        if (stop) return;
        snap();
        if (video.ended) { resolve(); return; }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    setTimeout(() => { stop = true; resolve(); }, (videoDuration + 1) * 1000);
  });

  try { video.pause(); } catch (e) {}

  const resolved = await Promise.all(samples.map(s => s.bmpPromise.then(b => ({ t: s.t, b }))));
  resolved.sort((a, b) => a.t - b.t);

  for (let i = 0; i < total; i++) {
    const targetT = (i / (total - 1)) * videoDuration;
    let best = resolved[0], bestD = Math.abs(resolved[0].t - targetT);
    for (let j = 1; j < resolved.length; j++) {
      const d = Math.abs(resolved[j].t - targetT);
      if (d < bestD) { bestD = d; best = resolved[j]; }
    }
    frames[i] = best ? best.b : null;
  }

  let lastGood = null;
  for (let i = 0; i < total; i++) { if (frames[i]) lastGood = frames[i]; else if (lastGood) frames[i] = lastGood; }
  for (let i = total - 1; i >= 0; i--) { if (frames[i]) lastGood = frames[i]; else if (lastGood) frames[i] = lastGood; }

  captureDone = true;
  setProgress(1);
}

let onLoadedMetadataFired = false;
function onLoadedMetadata() {
  if (onLoadedMetadataFired) return;
  onLoadedMetadataFired = true;
  setProgress(0.1);
  captureFrames().then(finishLoading);
}

video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
video.addEventListener('canplay',        onLoadedMetadata, { once: true });
video.addEventListener('loadeddata',     onLoadedMetadata, { once: true });

try { video.load(); } catch (e) {}
if (video.readyState >= 1) onLoadedMetadata();

const startOnGesture = () => {
  if (!onLoadedMetadataFired) onLoadedMetadata();
  document.removeEventListener('click',  startOnGesture);
  document.removeEventListener('scroll', startOnGesture);
};
document.addEventListener('click',  startOnGesture, { once: true });
document.addEventListener('scroll', startOnGesture, { once: true });

setTimeout(() => {
  if (!captureDone) {
    console.warn('Frame capture timed out; proceeding with whatever frames we have.');
    captureDone = true;
    finishLoading();
  }
}, 12000);

let finishedLoading = false;
function finishLoading() {
  if (finishedLoading) return;
  finishedLoading = true;
  if (frames[0]) drawFrame(0);
  setTimeout(() => {
    loader.classList.add('hidden');
    setTimeout(() => loader.style.display = 'none', 800);
    initScrollChoreography();
  }, 250);
}

// ─── Scroll-driven frame selection ────────────────────────
// Frames are mapped LINEARLY across most of the scroll so the muse keeps
// evolving past the stats / linen sections rather than locking to its final
// frame at ~62% (which previously made the video appear to stop). The last
// frame settles just as the CTA fully takes over.
const VIDEO_START = 0.02;
const VIDEO_END   = 0.92;

function updateFrameForProgress(p) {
  const t = clamp01((p - VIDEO_START) / (VIDEO_END - VIDEO_START));
  const idx = Math.min(frames.length - 1, Math.floor(t * frames.length));
  if (idx !== currentFrame) {
    currentFrame = idx;
    requestAnimationFrame(() => drawFrame(currentFrame));
  }
}

// ─── Section choreography ─────────────────────────────────
// Every section follows the SAME envelope shape inside its [enter, leave] window:
//   block opacity:    cosine-fade in (0–8%) · hold · cosine-fade out (92–100%)
//   children reveal:  staggered from 0 → 50% of section, exit 80 → 100%
function setupSectionAnimation(section) {
  const type    = section.dataset.animation || 'fade-up';
  const persist = section.dataset.persist === "true";
  const enter   = parseFloat(section.dataset.enter) / 100;
  const leave   = parseFloat(section.dataset.leave) / 100;
  const range   = leave - enter;
  const mid     = (enter + leave) / 2;
  section.style.top = (mid * 100) + '%';

  // Block-level fade windows (very gentle so it never snaps)
  const blockInStart  = enter - 0.005;
  const blockInEnd    = enter + range * 0.05;
  const blockOutStart = leave - range * 0.05;
  const blockOutEnd   = leave + 0.005;

  // Children: stagger over first 50% of section, exit over last 20%
  const childRevealStart = enter + range * 0.02;
  const childRevealEnd   = enter + range * 0.50;
  const childExitStart   = leave - range * 0.20;
  const childExitEnd     = leave - range * 0.02;

  const children = Array.from(section.querySelectorAll(
    ".section-label, .section-heading, .section-body, .section-note, " +
    ".cta-eyebrow, .cta-heading, .cta-button, .cta-meta, " +
    ".stats-eyebrow, .stat"
  ));
  if (!children.length) return;

  const initial = {
    "slide-left":  { x: -90, y: 0,  opacity: 0, scale: 1,    rotation: 0 },
    "slide-right": { x: 90,  y: 0,  opacity: 0, scale: 1,    rotation: 0 },
    "fade-up":     { x: 0,   y: 60, opacity: 0, scale: 1,    rotation: 0 },
    "scale-up":    { x: 0,   y: 0,  opacity: 0, scale: 0.88, rotation: 0 },
    "rotate-in":   { x: 0,   y: 50, opacity: 0, scale: 1,    rotation: 3 },
    "stagger-up":  { x: 0,   y: 70, opacity: 0, scale: 1,    rotation: 0 },
    "clip-reveal": { x: 0,   y: 40, opacity: 0, scale: 1,    rotation: 0 },
  }[type];

  // Paint initial state
  gsap.set(children, initial);
  // section starts hidden
  section.style.opacity = '0';
  section.style.willChange = 'opacity';

  // Each child gets its own slot inside [childRevealStart, childRevealEnd]
  // and a synchronised exit inside [childExitStart, childExitEnd].
  const N = children.length;
  // 35% of the reveal window is dedicated to stagger spread, 65% to per-child fade
  const staggerSpread = (childRevealEnd - childRevealStart) * 0.35;
  const perChildLen   = (childRevealEnd - childRevealStart) - staggerSpread;
  const childIn  = new Array(N);
  const childOut = new Array(N);
  for (let i = 0; i < N; i++) {
    const offset = (N === 1 ? 0 : i / (N - 1)) * staggerSpread;
    childIn[i]  = { s: childRevealStart + offset, e: childRevealStart + offset + perChildLen };
    childOut[i] = { s: childExitStart + offset * 0.5, e: childExitEnd };
  }

  const lastVal = new Array(N).fill(-1);

  function update(p) {
    // Block opacity envelope
    let blockOp;
    if (p < blockInStart)        blockOp = 0;
    else if (p < blockInEnd)     blockOp = ramp(p, blockInStart, blockInEnd);
    else if (p < blockOutStart)  blockOp = 1;
    else if (p < blockOutEnd)    blockOp = persist ? 1 : rampOut(p, blockOutStart, blockOutEnd);
    else                         blockOp = persist ? 1 : 0;
    section.style.opacity = blockOp.toFixed(3);

    if (blockOp <= 0) {
      // Off-screen — make sure transforms/opacity are reset cheaply once
      for (let i = 0; i < N; i++) {
        if (lastVal[i] !== 0) {
          lastVal[i] = 0;
          children[i].style.opacity = '0';
        }
      }
      return;
    }

    for (let i = 0; i < N; i++) {
      // reveal value 0 → 1
      let v = ramp(p, childIn[i].s, childIn[i].e);
      // exit fades it back out
      if (!persist) v *= rampOut(p, childOut[i].s, childOut[i].e);

      if (Math.abs(v - lastVal[i]) < 0.003) continue;
      lastVal[i] = v;

      const inv = 1 - v;
      const x = (initial.x        || 0) * inv;
      const y = (initial.y        || 0) * inv;
      const r = (initial.rotation || 0) * inv;
      const s = 1 + ((initial.scale ?? 1) - 1) * inv;
      const el = children[i];
      el.style.opacity = v.toFixed(3);
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${s.toFixed(4)}) rotate(${r.toFixed(2)}deg)`;
    }
  }

  return update;
}

// ─── Counters (driven by the master timeline, not GSAP scrollTrigger) ─
function buildCounters() {
  const counters = [];
  document.querySelectorAll(".stat-number").forEach(el => {
    const target   = parseFloat(el.dataset.value);
    const decimals = parseInt(el.dataset.decimals || "0");
    const section  = el.closest(".scroll-section");
    const enter    = parseFloat(section.dataset.enter) / 100;
    const leave    = parseFloat(section.dataset.leave) / 100;
    const range    = leave - enter;
    counters.push({
      el, target, decimals,
      start: enter + range * 0.05,
      end:   enter + range * 0.55,
      lastV: -1,
    });
  });
  return counters;
}
function updateCounters(counters, p) {
  for (const c of counters) {
    const t = ramp(p, c.start, c.end);
    const v = c.target * easeOutCubic(t);
    if (Math.abs(v - c.lastV) < (c.target < 10 ? 0.05 : 0.5)) continue;
    c.lastV = v;
    if (c.target < 10 && c.decimals === 0) {
      c.el.textContent = String(Math.round(v)).padStart(2, '0');
    } else if (c.decimals === 0) {
      c.el.textContent = Math.round(v).toLocaleString();
    } else {
      c.el.textContent = v.toFixed(c.decimals);
    }
  }
}

// ─── Marquees ─────────────────────────────────────────────
function buildMarquees() {
  const out = [];
  document.querySelectorAll(".marquee-wrap").forEach(el => {
    const speed = parseFloat(el.dataset.scrollSpeed) || -22;
    const enter = parseFloat(el.dataset.enter || "0");
    const leave = parseFloat(el.dataset.leave || "1");
    const inner = el.querySelector(".marquee-text");
    out.push({ el, inner, speed, enter, leave });
  });
  return out;
}
function updateMarquees(marquees, p) {
  for (const m of marquees) {
    // horizontal slide (across full scroll)
    m.inner.style.transform = `translate3d(${(m.speed * p).toFixed(2)}%, 0, 0)`;
    // smooth fade (8% windows, cosine)
    const fade = 0.08;
    let op;
    if (p < m.enter - fade)            op = 0;
    else if (p < m.enter)              op = ramp(p, m.enter - fade, m.enter);
    else if (p < m.leave)              op = 1;
    else if (p < m.leave + fade)       op = rampOut(p, m.leave, m.leave + fade);
    else                               op = 0;
    m.el.style.opacity = op.toFixed(3);
  }
}

// ─── Dark overlay ─────────────────────────────────────────
// Peak reduced from 0.92 to 0.72 so the stats moment doesn't kill the muse
// underneath. Combined with the radial vignette in CSS, the effective darkness
// is ~50% in the centre and ~60% at the edges — enough for the gold counters
// to read crisply without dimming the whole page.
const OVERLAY_ENTER = 0.560;
const OVERLAY_LEAVE = 0.730;
const OVERLAY_FADE  = 0.06;
const OVERLAY_PEAK  = 0.72;
function updateDarkOverlay(p) {
  let o;
  if (p < OVERLAY_ENTER - OVERLAY_FADE)       o = 0;
  else if (p < OVERLAY_ENTER)                  o = OVERLAY_PEAK * ramp(p, OVERLAY_ENTER - OVERLAY_FADE, OVERLAY_ENTER);
  else if (p < OVERLAY_LEAVE)                  o = OVERLAY_PEAK;
  else if (p < OVERLAY_LEAVE + OVERLAY_FADE)   o = OVERLAY_PEAK * rampOut(p, OVERLAY_LEAVE, OVERLAY_LEAVE + OVERLAY_FADE);
  else                                         o = 0;
  darkOverlay.style.opacity = o.toFixed(3);
}

// ─── Hero exit + circle wipe (synchronized) ───────────────
const HERO_EXIT_START  = 0.020;
const HERO_EXIT_END    = 0.075;
const WIPE_START       = 0.020;
const WIPE_END         = 0.085;
const WIPE_RADIUS_PEAK = 82;     // %

function updateHeroAndWipe(p) {
  // Hero fades out as wipe expands — both in cosine
  const heroOp = rampOut(p, HERO_EXIT_START, HERO_EXIT_END);
  heroSection.style.opacity = heroOp.toFixed(3);
  heroSection.style.pointerEvents = heroOp < 0.02 ? 'none' : '';

  const wipe = ramp(p, WIPE_START, WIPE_END);
  const r = wipe * WIPE_RADIUS_PEAK;
  videoWrap.style.clipPath = `circle(${r.toFixed(2)}% at 50% 50%)`;

  // Scroll indicator fades out at the very first hint of scroll.
  // BEFORE p ≥ 0.001 we leave the element alone so the GSAP entry tween
  // can animate it from 0 → 0.7 without us overwriting every frame.
  if (scrollIndicator && p >= 0.001) {
    const indOp = 0.7 * rampOut(p, 0.002, 0.030);
    scrollIndicator.style.opacity = indOp.toFixed(3);
  }
}

// ─── Hero entry animation (one-shot on load) ──────────────
// scroll-indicator opacity is driven by scroll progress, so we DO NOT animate
// it here — that would fight the master ScrollTrigger.
function animateHeroIn() {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.from(".hero-standalone .section-label", { y: 24, opacity: 0, duration: 0.85 }, 0.05)
    .from(".hero-heading .word",              { y: 90, opacity: 0, duration: 1.10, stagger: 0.11, ease: "power4.out" }, 0.15)
    .from(".hero-tagline",                    { y: 24, opacity: 0, duration: 0.85 }, 0.85);
  // scroll indicator: fade in via plain GSAP tween (no `from` snap)
  if (scrollIndicator) {
    scrollIndicator.style.opacity = '0';
    gsap.to(scrollIndicator, { opacity: 0.7, duration: 0.9, ease: "power2.out", delay: 1.3 });
  }
}

// ─── Cursor lens ──────────────────────────────────────────
function initCursor() {
  let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty;
  let visible = false;
  cursorLens.style.opacity = '0';
  addEventListener('mousemove', (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!visible) { visible = true; cursorLens.style.opacity = '1'; }
  });
  addEventListener('mouseleave', () => { visible = false; cursorLens.style.opacity = '0'; });
  (function loop() {
    cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
    cursorLens.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();
}

// ─── Master scroll choreographer ──────────────────────────
function initScrollChoreography() {
  // Build per-section update functions
  const sectionUpdaters = Array.from(document.querySelectorAll(".scroll-section"))
    .map(setupSectionAnimation)
    .filter(Boolean);
  const counters  = buildCounters();
  const marquees  = buildMarquees();

  animateHeroIn();
  initCursor();

  // ONE master ScrollTrigger drives everything in lockstep — no drift between layers
  ScrollTrigger.create({
    trigger: scrollContainer,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      updateHeroAndWipe(p);
      updateFrameForProgress(p);
      updateDarkOverlay(p);
      updateMarquees(marquees, p);
      updateCounters(counters, p);
      for (let i = 0; i < sectionUpdaters.length; i++) sectionUpdaters[i](p);
    }
  });

  // Refresh after layout settles
  setTimeout(() => ScrollTrigger.refresh(), 50);
  setTimeout(() => ScrollTrigger.refresh(), 400);
  setTimeout(() => ScrollTrigger.refresh(), 1000);
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
