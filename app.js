/* vaïvae — Living Runway: scroll-driven video via frame-capture, GSAP choreography */

// ─── Lenis smooth scroll ──────────────────────────────────
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ─── Elements ─────────────────────────────────────────────
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderPercent = document.getElementById('loader-percent');
const video = document.getElementById('hero-video');
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
const videoWrap = document.querySelector('.video-wrap');
const heroSection = document.querySelector('.hero-standalone');
const scrollContainer = document.getElementById('scroll-container');
const cursorLens = document.getElementById('cursor-lens');

// ─── Frame capture: play the video once, snapshot to bitmaps ──
const TARGET_FRAMES = 120;
const frames = [];   // ImageBitmap[]
let frameW = 1280, frameH = 720;
let videoDuration = 0;
let captureDone = false;

function setProgress(p) {
  loaderBar.style.width = (p * 100).toFixed(0) + '%';
  loaderPercent.textContent = (p * 100).toFixed(0) + '%';
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
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
  // padded cover
  const SCALE = 1.0;
  const scale = Math.max(cw / iw, ch / ih) * SCALE;
  const dw = iw * scale, dh = ih * scale;
  const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
  ctx.fillStyle = '#0a0606';
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);
}

// Offscreen canvas to grab each frame into an ImageBitmap
const grabCanvas = document.createElement('canvas');
const grabCtx = grabCanvas.getContext('2d');

async function captureFrames() {
  const maxW = 1280;
  const ratio = video.videoWidth / video.videoHeight || 16/9;
  frameW = Math.min(maxW, video.videoWidth || maxW);
  frameH = Math.round(frameW / ratio);
  grabCanvas.width = frameW;
  grabCanvas.height = frameH;

  videoDuration = video.duration || 1;
  const total = TARGET_FRAMES;

  video.muted = true;
  video.playsInline = true;
  video.loop = false;
  video.playbackRate = 1.0;
  try { video.currentTime = 0; } catch (e) {}
  try { await video.play(); } catch (e) {}

  // Sample on requestVideoFrameCallback if available, else rAF
  const samples = []; // {t, bitmap}
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

    // Hard timeout: end after duration + 1s
    setTimeout(() => { stop = true; resolve(); }, (videoDuration + 1) * 1000);
  });

  try { video.pause(); } catch (e) {}

  // Resolve all bitmap promises
  const resolved = await Promise.all(samples.map(s => s.bmpPromise.then(b => ({ t: s.t, b }))));
  // Sort by time, dedupe identical timestamps
  resolved.sort((a, b) => a.t - b.t);

  // Bin into TARGET_FRAMES evenly across duration
  for (let i = 0; i < total; i++) {
    const targetT = (i / (total - 1)) * videoDuration;
    // pick the closest sample
    let best = resolved[0], bestD = Math.abs(resolved[0].t - targetT);
    for (let j = 1; j < resolved.length; j++) {
      const d = Math.abs(resolved[j].t - targetT);
      if (d < bestD) { bestD = d; best = resolved[j]; }
    }
    frames[i] = best ? best.b : null;
  }

  // Backfill any gaps
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
video.addEventListener('canplay', onLoadedMetadata, { once: true });
video.addEventListener('loadeddata', onLoadedMetadata, { once: true });

// Force load
try { video.load(); } catch (e) {}

// Trigger if already loaded
if (video.readyState >= 1) onLoadedMetadata();

// User-interaction fallback (some browsers block until gesture)
const startOnGesture = () => {
  if (!onLoadedMetadataFired) onLoadedMetadata();
  document.removeEventListener('click', startOnGesture);
  document.removeEventListener('scroll', startOnGesture);
};
document.addEventListener('click', startOnGesture, { once: true });
document.addEventListener('scroll', startOnGesture, { once: true });

// Safety: bail to no-video mode after 12s
setTimeout(() => {
  if (!captureDone) {
    console.warn('Frame capture timed out; proceeding with whatever frames we have.');
    captureDone = true;
    finishLoading();
  }
}, 12000);

function finishLoading() {
  // Initial paint
  if (frames[0]) drawFrame(0);
  setTimeout(() => {
    loader.classList.add('hidden');
    setTimeout(() => loader.style.display = 'none', 800);
    initScrollChoreography();
  }, 300);
}

// ─── Scroll-driven frame selection ────────────────────────
const VIDEO_START = 0.04;
const VIDEO_END   = 0.92;
const FRAME_SPEED = 1.0;

function updateFrameForProgress(p) {
  let t = (p - VIDEO_START) / (VIDEO_END - VIDEO_START);
  t = Math.max(0, Math.min(1, t)) * FRAME_SPEED;
  t = Math.min(1, t);
  const idx = Math.min(frames.length - 1, Math.floor(t * frames.length));
  if (idx !== currentFrame) {
    currentFrame = idx;
    requestAnimationFrame(() => drawFrame(currentFrame));
  }
}

// ─── Section animations ───────────────────────────────────
function setupSectionAnimation(section) {
  const type = section.dataset.animation;
  const persist = section.dataset.persist === "true";
  const enter = parseFloat(section.dataset.enter) / 100;
  const leave = parseFloat(section.dataset.leave) / 100;
  const mid = (enter + leave) / 2;
  section.style.top = (mid * 100) + '%';

  const children = Array.from(section.querySelectorAll(
    ".section-label, .section-heading, .section-body, .section-note, " +
    ".cta-eyebrow, .cta-heading, .cta-button, .cta-meta, " +
    ".stats-eyebrow, .stat"
  ));
  if (!children.length) return;

  const initial = {
    "slide-left":  { x: -80, y: 0, opacity: 0, scale: 1, rotation: 0 },
    "slide-right": { x: 80,  y: 0, opacity: 0, scale: 1, rotation: 0 },
    "fade-up":     { x: 0, y: 50,  opacity: 0, scale: 1, rotation: 0 },
    "scale-up":    { x: 0, y: 0, scale: 0.85, opacity: 0, rotation: 0 },
    "rotate-in":   { x: 0, y: 40, rotation: 3, opacity: 0, scale: 1 },
    "stagger-up":  { x: 0, y: 60,  opacity: 0, scale: 1, rotation: 0 },
    "clip-reveal": { x: 0, y: 30, opacity: 0, scale: 1, rotation: 0 },
  }[type] || { x: 0, y: 0, opacity: 0, scale: 1, rotation: 0 };

  // Paint initial state
  gsap.set(children, initial);

  // Reveal range: first 30% of section's scroll window animates in,
  // last 20% animates out (unless persist).
  const revealStart = enter;
  const revealEnd = enter + (leave - enter) * 0.30;
  const exitStart = leave - (leave - enter) * 0.20;
  const exitEnd = leave;

  // Stagger amount in normalized progress units
  const staggerSpread = 0.6; // 60% of reveal range used for stagger sweep
  const perChild = staggerSpread / Math.max(1, children.length);

  let revealed = new Array(children.length).fill(0);

  ScrollTrigger.create({
    trigger: scrollContainer,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;

      // Container visibility
      if (p < enter - 0.04) {
        section.style.opacity = 0;
      } else if (p > leave + 0.04 && !persist) {
        section.style.opacity = 0;
      } else {
        section.style.opacity = 1;
      }

      // Per-child reveal value
      for (let i = 0; i < children.length; i++) {
        let v;
        const childStart = revealStart + i * perChild * (revealEnd - revealStart) / staggerSpread;
        const childEnd = childStart + (revealEnd - revealStart) * (1 - staggerSpread + perChild);

        if (p < childStart) v = 0;
        else if (p > childEnd) v = 1;
        else v = (p - childStart) / Math.max(0.0001, (childEnd - childStart));

        // Exit
        if (!persist && p > exitStart) {
          const ex = Math.min(1, (p - exitStart) / Math.max(0.0001, (exitEnd - exitStart)));
          v = v * (1 - ex);
        }

        // Easing — power3.out
        const eased = 1 - Math.pow(1 - v, 3);

        // Apply
        if (Math.abs(eased - revealed[i]) > 0.005) {
          revealed[i] = eased;
          const el = children[i];
          el.style.opacity = eased;
          const x = (initial.x || 0) * (1 - eased);
          const y = (initial.y || 0) * (1 - eased);
          const s = 1 + ((initial.scale || 1) - 1) * (1 - eased);
          const r = (initial.rotation || 0) * (1 - eased);
          el.style.transform = `translate(${x}px, ${y}px) scale(${s}) rotate(${r}deg)`;
        }
      }
    }
  });
}

// ─── Counters ─────────────────────────────────────────────
function setupCounters() {
  document.querySelectorAll(".stat-number").forEach(el => {
    const target = parseFloat(el.dataset.value);
    const decimals = parseInt(el.dataset.decimals || "0");
    gsap.fromTo(el, { textContent: 0 }, {
      textContent: target, duration: 2, ease: "power1.out",
      snap: { textContent: decimals === 0 ? 1 : Math.pow(10, -decimals) },
      scrollTrigger: { trigger: el.closest(".scroll-section"), start: "top 70%", toggleActions: "play none none reverse" },
      onUpdate: function () {
        const v = parseFloat(el.textContent);
        if (target < 10 && decimals === 0) el.textContent = String(Math.round(v)).padStart(2, '0');
      }
    });
  });
}

// ─── Marquees ─────────────────────────────────────────────
function setupMarquees() {
  document.querySelectorAll(".marquee-wrap").forEach(el => {
    const speed = parseFloat(el.dataset.scrollSpeed) || -22;
    const enter = parseFloat(el.dataset.enter || "0");
    const leave = parseFloat(el.dataset.leave || "1");
    const inner = el.querySelector(".marquee-text");
    gsap.to(inner, { xPercent: speed, ease: "none", scrollTrigger: { trigger: scrollContainer, start: "top top", end: "bottom bottom", scrub: true } });
    ScrollTrigger.create({
      trigger: scrollContainer, start: "top top", end: "bottom bottom", scrub: true,
      onUpdate: (self) => {
        const p = self.progress; const fade = 0.04; let opacity = 0;
        if (p >= enter - fade && p < enter) opacity = (p - (enter - fade)) / fade;
        else if (p >= enter && p <= leave) opacity = 1;
        else if (p > leave && p <= leave + fade) opacity = 1 - (p - leave) / fade;
        el.style.opacity = opacity;
      }
    });
  });
}

// ─── Dark overlay ─────────────────────────────────────────
function initDarkOverlay(enter, leave) {
  const overlay = document.getElementById("dark-overlay");
  const fade = 0.04, peak = 0.9;
  ScrollTrigger.create({
    trigger: scrollContainer, start: "top top", end: "bottom bottom", scrub: true,
    onUpdate: (self) => {
      const p = self.progress; let o = 0;
      if (p >= enter - fade && p < enter) o = peak * (p - (enter - fade)) / fade;
      else if (p >= enter && p <= leave) o = peak;
      else if (p > leave && p <= leave + fade) o = peak * (1 - (p - leave) / fade);
      overlay.style.opacity = o;
    }
  });
}

// ─── Hero circle-wipe + frame drive ──────────────────────
function initHeroTransition() {
  ScrollTrigger.create({
    trigger: scrollContainer, start: "top top", end: "bottom bottom", scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      heroSection.style.opacity = Math.max(0, 1 - p * 18);
      const wipeP = Math.min(1, Math.max(0, (p - 0.01) / 0.05));
      videoWrap.style.clipPath = `circle(${wipeP * 80}% at 50% 50%)`;
      updateFrameForProgress(p);
    }
  });
}

function animateHeroIn() {
  gsap.from(".hero-heading .word", { y: 80, opacity: 0, stagger: 0.12, duration: 1.1, ease: "power4.out" });
  gsap.from(".hero-standalone .section-label", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.1 });
  gsap.from(".hero-tagline", { y: 30, opacity: 0, duration: 0.9, ease: "power3.out", delay: 0.6 });
  gsap.from(".scroll-indicator", { opacity: 0, duration: 0.8, ease: "power2.out", delay: 1.2 });
}

function initCursor() {
  let tx = innerWidth/2, ty = innerHeight/2, cx = tx, cy = ty;
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  (function loop() {
    cx += (tx - cx) * 0.15; cy += (ty - cy) * 0.15;
    cursorLens.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();
}

function initScrollChoreography() {
  document.querySelectorAll(".scroll-section").forEach(setupSectionAnimation);
  setupCounters();
  setupMarquees();
  initDarkOverlay(0.64, 0.78);
  initHeroTransition();
  animateHeroIn();
  initCursor();
  // Refresh AFTER loader fully hides + layout settles
  setTimeout(() => ScrollTrigger.refresh(), 50);
  setTimeout(() => ScrollTrigger.refresh(), 400);
  setTimeout(() => ScrollTrigger.refresh(), 1000);
  // Also refresh on first user scroll
  const onFirstScroll = () => { ScrollTrigger.refresh(); };
  lenis.on('scroll', onFirstScroll);
  setTimeout(() => lenis.off && lenis.off('scroll', onFirstScroll), 3000);
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
