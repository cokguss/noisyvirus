const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const I18N = {
  en: {
    'intro.kicker': 'NOISY VIRUS PRESENTS',
    'intro.l1': 'Scan loud.',
    'intro.l2': 'Stay clean.',
    'intro.enter': 'Enter the lab',
    'sound.on': 'Sound on',
    'sound.off': 'Sound off',
    'nav.scanner': 'Scanner',
    'nav.how': 'How it works',
    'nav.dev': 'Developer',
    'hero.kicker': '70+ engines · Powered by NoisyVirus',
    'hero.t1': 'Scan loud.',
    'hero.t2': 'Stay clean.',
    'hero.sub': "Check any file, hash, or link against the industry's antivirus fleet — before it gets anywhere near your machine.",
    'ph.hash': 'MD5, SHA-1 or SHA-256…',
    'dz.drop': 'Drop a file here or browse',
    'dz.hint': 'Max 32 MB · scanned privately via VirusTotal',
    'action.scanfile': 'Scan file',
    'action.download': 'Download report',
    'action.again': 'Scan another',
    'stage.1': 'Contacting VirusTotal…',
    'stage.2': 'Fingerprinting target…',
    'stage.3': 'Waiting for the engine fleet…',
    'stage.4': 'Compiling report…',
    'results.detections': 'detections',
    'verdict.clean': 'Clean',
    'verdict.suspicious': 'Suspicious',
    'verdict.malicious': 'Malicious',
    'stat.malicious': 'Malicious',
    'stat.suspicious': 'Suspicious',
    'stat.harmless': 'Harmless',
    'stat.undetected': 'Undetected',
    'results.details': 'Details',
    'engines.flagged': 'Flagged engines ({n})',
    'results.allclear': 'No engine flagged this target. All clear.',
    'row.title': 'Title',
    'row.finalurl': 'Final URL',
    'row.http': 'HTTP status',
    'row.respsize': 'Response size',
    'row.categories': 'Categories',
    'row.reputation': 'Community score',
    'row.times': 'Times submitted',
    'row.firstseen': 'First seen',
    'row.lastanalysis': 'Last analysis',
    'row.filename': 'File name',
    'row.othernames': 'Other names',
    'row.filesize': 'File size',
    'row.type': 'Type',
    'row.md5': 'MD5',
    'row.sha1': 'SHA-1',
    'row.sha256': 'SHA-256',
    'row.tags': 'Tags',
    'how.head': 'How the scan works.',
    'how.sub': 'Noisy Virus checks smart, then loud — the same flow analysts use.',
    'how.c1t': 'Hash first.',
    'how.c1b': 'Your file is fingerprinted locally with SHA-256. If VirusTotal already knows it, nothing leaves your machine.',
    'how.c2t': 'Stealth upload.',
    'how.c2b': 'Unknown files are submitted through a stealth browser session — no account, no API key required.',
    'how.c3t': 'Full report.',
    'how.c3b': 'Detections from 70+ engines, file intelligence, and a permanent link you can share with anyone.',
    'footer.powered': 'Powered by NoisyVirus',
    'footer.dev': 'Developed by',
    'dev.r1': 'Creator of Noisy Virus',
    'dev.r2': 'Developer of XtremeUbot',
    'legal.privacy': 'Privacy Policy',
    'legal.terms': 'Terms of Service',
    'health.checking': 'CHECKING…',
    'health.api': 'API MODE',
    'health.stealth': 'STEALTH MODE',
    'health.nobrowser': 'NO BROWSER',
    'health.offline': 'OFFLINE'
  },
  id: {
    'intro.kicker': 'NOISY VIRUS HADIRKAN',
    'intro.l1': 'Pindai keras.',
    'intro.l2': 'Tetap bersih.',
    'intro.enter': 'Masuk ke lab',
    'sound.on': 'Suara nyala',
    'sound.off': 'Suara mati',
    'nav.scanner': 'Pemindai',
    'nav.how': 'Cara kerja',
    'nav.dev': 'Pengembang',
    'hero.kicker': '70+ engine · Didukung NoisyVirus',
    'hero.t1': 'Pindai keras.',
    'hero.t2': 'Tetap bersih.',
    'hero.sub': 'Periksa file, hash, atau tautan apa pun melawan armada antivirus industri — sebelum sampai ke mesin Anda.',
    'ph.hash': 'MD5, SHA-1 atau SHA-256…',
    'dz.drop': 'Tarik & letakkan file di sini, atau telusuri',
    'dz.hint': 'Maks 32 MB · dipindai privat via VirusTotal',
    'action.scanfile': 'Pindai file',
    'action.download': 'Unduh laporan',
    'action.again': 'Pindai yang lain',
    'stage.1': 'Menghubungi VirusTotal…',
    'stage.2': 'Memeriksa sidik jari target…',
    'stage.3': 'Menunggu armada engine…',
    'stage.4': 'Menyusun laporan…',
    'results.detections': 'deteksi',
    'verdict.clean': 'Bersih',
    'verdict.suspicious': 'Mencurigakan',
    'verdict.malicious': 'Berbahaya',
    'stat.malicious': 'Berbahaya',
    'stat.suspicious': 'Mencurigakan',
    'stat.harmless': 'Aman',
    'stat.undetected': 'Tidak terdeteksi',
    'results.details': 'Detail',
    'engines.flagged': 'Engine yang menandai ({n})',
    'results.allclear': 'Tidak ada engine yang menandai target ini. Semua bersih.',
    'row.title': 'Judul',
    'row.finalurl': 'URL akhir',
    'row.http': 'Status HTTP',
    'row.respsize': 'Ukuran respons',
    'row.categories': 'Kategori',
    'row.reputation': 'Skor komunitas',
    'row.times': 'Jumlah dikirim',
    'row.firstseen': 'Pertama terlihat',
    'row.lastanalysis': 'Analisis terakhir',
    'row.filename': 'Nama file',
    'row.othernames': 'Nama lain',
    'row.filesize': 'Ukuran file',
    'row.type': 'Tipe',
    'row.md5': 'MD5',
    'row.sha1': 'SHA-1',
    'row.sha256': 'SHA-256',
    'row.tags': 'Tag',
    'how.head': 'Cara kerja pemindaian.',
    'how.sub': 'Noisy Virus memeriksa dengan cerdas, lalu keras — alur yang sama dipakai para analis.',
    'how.c1t': 'Hash dulu.',
    'how.c1b': 'File Anda di-fingerprint secara lokal dengan SHA-256. Jika VirusTotal sudah mengenalnya, tidak ada yang dikirim dari mesin Anda.',
    'how.c2t': 'Upload stealth.',
    'how.c2b': 'File yang belum dikenal dikirim lewat sesi browser stealth — tanpa akun, tanpa API key.',
    'how.c3t': 'Laporan lengkap.',
    'how.c3b': 'Deteksi dari 70+ engine, intelijen file, dan tautan permanen yang bisa dibagikan.',
    'footer.powered': 'Didukung oleh NoisyVirus',
    'footer.dev': 'Dikembangkan oleh',
    'dev.r1': 'Pencipta Noisy Virus',
    'dev.r2': 'Pengembang XtremeUbot',
    'legal.privacy': 'Kebijakan Privasi',
    'legal.terms': 'Ketentuan Layanan',
    'health.checking': 'MENGECEK…',
    'health.api': 'MODE API',
    'health.stealth': 'MODE STEALTH',
    'health.nobrowser': 'BROWSER TIDAK ADA',
    'health.offline': 'OFFLINE'
  }
};

let currentLang = localStorage.getItem('nv-lang') || 'en';

function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
}

const langToggle = document.getElementById('langToggle');
let healthState = { engine: null, browserReady: false };

function updateBadge() {
  const badge = document.getElementById('engineBadge');
  if (!badge) return;
  if (!healthState.engine) {
    badge.textContent = t('health.checking');
    return;
  }
  if (healthState.offline) {
    badge.textContent = t('health.offline');
    badge.className = 'engine-badge bad';
    return;
  }
  const ok = healthState.engine === 'official' || healthState.browserReady;
  badge.textContent =
    healthState.engine === 'official' ? t('health.api') : healthState.browserReady ? t('health.stealth') : t('health.nobrowser');
  badge.className = `engine-badge ${ok ? 'ok' : 'bad'}`;
}

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('nv-lang', lang);
  document.documentElement.lang = lang === 'id' ? 'id' : 'en';

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh);
  });

  if (langToggle) langToggle.textContent = lang === 'id' ? 'EN' : 'ID';
  updateBadge();

  if (!resultsEl.hidden && lastReportJson) fillDynamic(lastReportJson);
}

if (langToggle) {
  langToggle.addEventListener('click', () => {
    applyLang(currentLang === 'id' ? 'en' : 'id');
  });
}

const soundToggle = document.getElementById('soundToggle');
let soundOn = false;
const YT_VIDEO_ID = 'nfpjsRxRt1g';
let ytState = 'idle';
let ytPlayer = null;

function ensureYouTube() {
  if (ytState !== 'idle') return;
  ytState = 'loading';

  const host = document.createElement('div');
  host.id = 'yt-audio';
  host.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);';
  document.body.appendChild(host);

  const failTimer = setTimeout(() => {
    if (!ytPlayer) ytState = 'failed';
  }, 9000);

  window.onYouTubeIframeAPIReady = () => {
    ytPlayer = new YT.Player('yt-audio', {
      videoId: YT_VIDEO_ID,
      playerVars: { autoplay: 1, mute: 1, controls: 0, loop: 1, playlist: YT_VIDEO_ID },
      events: {
        onReady: () => {
          clearTimeout(failTimer);
          ytState = 'ready';
          ytPlayer.setVolume(45);
          if (soundOn) {
            ytPlayer.unMute();
            ytPlayer.playVideo();
          }
        },
        onError: () => {
          clearTimeout(failTimer);
          ytState = 'failed';
        }
      }
    });
  };

  const api = document.createElement('script');
  api.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(api);
}

if (soundToggle) {
  soundToggle.addEventListener('click', () => {
    soundOn = !soundOn;
    soundToggle.setAttribute('aria-pressed', String(soundOn));
    const label = t(soundOn ? 'sound.on' : 'sound.off');
    soundToggle.querySelector('.sound-label').textContent = label;
    soundToggle.setAttribute('aria-label', label);
    soundToggle.title = label;

    ensureYouTube();
    if (ytState === 'ready' && ytPlayer) {
      if (soundOn) {
        ytPlayer.unMute();
        ytPlayer.setVolume(45);
        if (ytPlayer.getPlayerState() !== 1) ytPlayer.playVideo();
      } else {
        ytPlayer.mute();
      }
    }
  });
}

const intro = document.getElementById('intro');
const enterBtn = document.getElementById('enterBtn');
const introDevStage = document.getElementById('introDevStage');
const introMainStage = document.getElementById('introMainStage');
const toMainStageBtn = document.getElementById('toMainStageBtn');
const skipIntro = (() => {
  try {
    if (new URLSearchParams(location.search).has('skipIntro')) return true;
    if (sessionStorage.getItem('nv-intro-seen') === '1') return true;
  } catch {}
  return false;
})();

// double-rAF ensures a first paint in the pre-animation state; the setTimeout
// fallback keeps the intro working when rAF is paused (hidden/background tab)
function addClassSoon(el, cls) {
  const add = () => el?.classList.add(cls);
  requestAnimationFrame(() => requestAnimationFrame(add));
  setTimeout(add, 90);
}

// watchdog: if the renderer was throttled and the entrance transitions stalled,
// force-commit their end state so elements never stay stuck mid-animation.
// stage 1 glides elements to their end state (avoids a visible snap on slow
// renders); stage 2 removes the transition so fully frozen renderers commit.
let watchdogT = null;
let watchdogT2 = null;
function armWatchdog(cls, ms) {
  const root = document.documentElement;
  root.classList.remove(cls, `${cls}-final`);
  clearTimeout(watchdogT);
  clearTimeout(watchdogT2);
  watchdogT = setTimeout(() => root.classList.add(cls), ms);
  watchdogT2 = setTimeout(() => root.classList.add(`${cls}-final`), ms + 650);
}

function leaveIntro() {
  try { sessionStorage.setItem('nv-intro-seen', '1'); } catch {}
  try { history.replaceState(null, '', location.pathname); } catch {}
  setTimeout(playSiteEntrance, 250);
  if (!intro) return;
  intro.classList.add('leave');
  document.body.classList.remove('locked');
  document.documentElement.classList.remove('locked');
  document.documentElement.classList.add('entered');
  setTimeout(ensureYouTube, 300);
  setTimeout(() => intro.remove(), 1100);
}

// releases the pre-entrance hidden state (applied before first paint) so the
// hero/scanner replay the same choreography as the intro stage while it fades out
function playSiteEntrance() {
  const root = document.documentElement;
  root.classList.add('pre-entrance');
  void document.body.offsetWidth;
  root.classList.remove('pre-entrance');
  armWatchdog('entrance-forced', 2600);
}

function showMainStage() {
  if (!introDevStage || !introMainStage || !intro) return;
  introDevStage.classList.remove('is-active');
  introDevStage.classList.add('is-exiting');
  setTimeout(() => {
    introDevStage.hidden = true;
    introMainStage.hidden = false;
    introMainStage.classList.add('is-active');
    intro.classList.remove('entering');
    void intro.offsetWidth;
    addClassSoon(intro, 'entering');
    armWatchdog('intro-forced', 3200);
  }, 620);
}

if (intro && !prefersReduced && !skipIntro) {
  document.body.classList.add('locked');
  document.documentElement.classList.add('locked');
  document.documentElement.classList.add('pre-entrance');
  addClassSoon(intro, 'entering');
  addClassSoon(introDevStage, 'is-active');
  armWatchdog('intro-forced', 3200);
  if (toMainStageBtn) toMainStageBtn.addEventListener('click', showMainStage);
  if (enterBtn) enterBtn.addEventListener('click', leaveIntro);

  introDevStage?.querySelectorAll('.intro-dev-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  setTimeout(() => introDevStage?.classList.add('intro-done'), 2600);
} else if (intro) {
  if (skipIntro) {
    try { history.replaceState(null, '', location.pathname); } catch {}
  }
  intro.remove();
  document.documentElement.classList.add('entered');
  // play the same intro-style entrance on direct entry
  document.documentElement.classList.add('pre-entrance');
  const releaseEntrance = () => document.documentElement.classList.remove('pre-entrance');
  requestAnimationFrame(() => requestAnimationFrame(releaseEntrance));
  setTimeout(releaseEntrance, 90);
  armWatchdog('entrance-forced', 2600);
  ensureYouTube();
}

const nav = document.querySelector('.site-nav');
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');

function setMenu(open) {
  if (!burger || !mobileMenu) return;
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileMenu.classList.toggle('open', open);
}

if (burger && mobileMenu) {
  burger.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
  mobileMenu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });
}

if (nav) {
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:12px;pointer-events:none;';
  document.body.prepend(sentinel);

  new IntersectionObserver(([entry]) => {
    nav.classList.toggle('scrolled', !entry.isIntersecting);
  }).observe(sentinel);
}

let blipCtx = null;

window.addEventListener('noisy:blip', () => {
  if (!soundOn) return;
  try {
    blipCtx = blipCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (blipCtx.state === 'suspended') blipCtx.resume();

    const now = blipCtx.currentTime;
    const osc = blipCtx.createOscillator();
    const bp = blipCtx.createBiquadFilter();
    const g = blipCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(196, now);
    osc.frequency.exponentialRampToValueAtTime(98, now + 0.22);
    bp.type = 'bandpass';
    bp.frequency.value = 620;
    bp.Q.value = 3.5;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

    osc.connect(bp).connect(g).connect(blipCtx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch {}
});

const revealEls = document.querySelectorAll('[data-reveal]');
const groups = new Map();

revealEls.forEach((el) => {
  const key = el.parentElement;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(el);
});

groups.forEach((els) => {
  els.forEach((el, i) => el.style.setProperty('--rd', i));
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
);

revealEls.forEach((el) => revealObserver.observe(el));

setTimeout(() => {
  document.querySelectorAll('.hero [data-reveal]:not(.is-visible)').forEach((el) => el.classList.add('is-visible'));
}, 800);

window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.92 && r.bottom > 0) el.classList.add('is-visible');
    });
    if (document.getElementById('intro')) {
      document.getElementById('intro').remove();
      document.body.classList.remove('locked');
      document.documentElement.classList.remove('locked');
      document.documentElement.classList.remove('pre-entrance');
      document.documentElement.classList.add('entered');
    }
  }
});

const progressEl = document.getElementById('scrollProgress');
function updateProgress() {
  if (!progressEl) return;
  const max = document.documentElement.scrollHeight - innerHeight;
  progressEl.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}
addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
  });
});

async function fetchHealth() {
  try {
    const res = await fetch('/api/health');
    const json = await res.json();
    healthState = { engine: json.engine, browserReady: json.browserReady };
  } catch {
    healthState = { offline: true };
  }
  updateBadge();
}
fetchHealth();

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.scan-panel');
const tabIndicator = document.querySelector('.tab-indicator');

function updateTabIndicator(activeTab) {
  if (!tabIndicator || !activeTab) return;
  const idx = Array.from(tabs).indexOf(activeTab);
  const gap = 4;
  const w = tabIndicator.offsetWidth || 0;
  tabIndicator.style.transform = w ? `translateX(${idx * (w + gap)}px)` : `translateX(${idx * 100}%)`;
}

const initialTab = document.querySelector('.tab.is-active');
updateTabIndicator(initialTab);
window.addEventListener('resize', () => updateTabIndicator(document.querySelector('.tab.is-active')));

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((tb) => {
      tb.classList.toggle('is-active', tb === tab);
      tb.setAttribute('aria-selected', String(tb === tab));
    });
    panels.forEach((p) => p.classList.toggle('is-active', p.dataset.panel === tab.dataset.tab));
    updateTabIndicator(tab);
  });
});

const statusEl = document.getElementById('scanStatus');
const statusText = document.getElementById('statusText');
const errorEl = document.getElementById('scanError');
const resultsEl = document.getElementById('results');

const STAGE_KEYS = ['stage.1', 'stage.2', 'stage.3', 'stage.4'];
let stageTimer = null;

function setBusy(busy) {
  if (busy) {
    errorEl.hidden = true;
    statusEl.hidden = false;
    let i = 0;
    statusText.textContent = t(STAGE_KEYS[0]);
    stageTimer = setInterval(() => {
      i = Math.min(i + 1, STAGE_KEYS.length - 1);
      statusText.textContent = t(STAGE_KEYS[i]);
    }, 2600);
  } else {
    clearInterval(stageTimer);
    statusEl.hidden = true;
  }
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

async function api(path, options) {
  const res = await fetch(path, options);
  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Server error (HTTP ${res.status}).`);
  }
  if (!json.ok) throw new Error(json.error || `Request failed (HTTP ${res.status}).`);
  return json;
}

let lastReportJson = null;

function fmtBytes(bytes) {
  if (!bytes) return '—';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(currentLang === 'id' ? 'id-ID' : 'en-US');
}

function row(label, value, mono = false) {
  const wrap = document.createElement('div');
  wrap.className = 'detail-row';
  const dt = document.createElement('dt');
  dt.textContent = label;
  const dd = document.createElement('dd');
  if (mono) dd.className = 'mono';
  dd.textContent = value ?? '—';
  wrap.append(dt, dd);
  return wrap;
}

function fillDynamic(result) {
  const { stats, verdict, details } = result;

  resultsEl.classList.remove('v-clean', 'v-suspicious', 'v-malicious');
  resultsEl.classList.add(`v-${verdict}`);

  document.getElementById('verdictRing').setAttribute('class', `verdict-ring v-${verdict}`);
  document.getElementById('ringLabel').textContent = `${stats.malicious}/${stats.total}`;
  document.getElementById('verdictChip').textContent = t(`verdict.${verdict}`);

  const name = result.type === 'url' ? details.url : details.fileName || result.target;
  document.getElementById('targetName').textContent = name;
  document.getElementById('targetSub').textContent =
    result.type === 'url' ? result.target : `sha256 · ${details.sha256 || result.target}`;

  document.getElementById('statMal').textContent = stats.malicious;
  document.getElementById('statSus').textContent = stats.suspicious;
  document.getElementById('statHar').textContent = stats.harmless;
  document.getElementById('statUnd').textContent = stats.undetected;

  const rows = document.getElementById('detailRows');
  rows.innerHTML = '';
  if (result.type === 'url') {
    rows.append(
      row(t('row.title'), details.title),
      row(t('row.finalurl'), details.finalUrl),
      row(t('row.http'), details.httpResponseCode),
      row(t('row.respsize'), fmtBytes(details.responseSize)),
      row(t('row.categories'), (details.categories || []).join(', ') || null),
      row(t('row.reputation'), result.reputation === null ? null : String(result.reputation)),
      row(t('row.times'), result.timesSubmitted),
      row(t('row.firstseen'), fmtDate(result.firstSeen)),
      row(t('row.lastanalysis'), fmtDate(result.lastAnalysis))
    );
  } else {
    rows.append(
      row(t('row.filename'), details.fileName),
      row(t('row.othernames'), (details.otherNames || []).join(', ') || null),
      row(t('row.filesize'), fmtBytes(details.size)),
      row(t('row.type'), details.typeDescription),
      row(t('row.md5'), details.md5, true),
      row(t('row.sha1'), details.sha1, true),
      row(t('row.sha256'), details.sha256, true),
      row(t('row.tags'), (result.tags || []).join(', ') || null),
      row(t('row.times'), result.timesSubmitted),
      row(t('row.firstseen'), fmtDate(result.firstSeen)),
      row(t('row.lastanalysis'), fmtDate(result.lastAnalysis))
    );
  }

  const flagged = result.engines.filter(
    (e) => e.category === 'malicious' || e.category === 'suspicious'
  );
  flagged.sort((a, b) => (a.category === 'malicious' ? -1 : 0) - (b.category === 'malicious' ? -1 : 0));

  document.getElementById('enginesTitle').textContent =
    flagged.length > 0 ? t('engines.flagged').replace('{n}', flagged.length) : t('engines.flagged').replace('({n})', '');

  const list = document.getElementById('engineList');
  list.innerHTML = '';

  if (flagged.length === 0) {
    const li = document.createElement('li');
    li.className = 'all-clear';
    li.textContent = t('results.allclear');
    list.appendChild(li);
  } else {
    flagged.forEach((e) => {
      const li = document.createElement('li');
      li.className = `engine-item c-${e.category}`;
      const nameSpan = document.createElement('span');
      nameSpan.className = 'engine-name';
      nameSpan.textContent = e.engine;
      const resSpan = document.createElement('span');
      resSpan.className = 'engine-result';
      resSpan.textContent = e.result || e.category;
      li.append(nameSpan, resSpan);
      list.appendChild(li);
    });
  }
}

function renderResult(result) {
  lastReportJson = result;
  resultsEl.hidden = false;

  const { stats } = result;
  const detected = stats.malicious + stats.suspicious;
  const ratio = stats.total > 0 ? detected / stats.total : 0;
  const CIRC = 2 * Math.PI * 52;

  const ringValue = document.getElementById('ringValue');
  ringValue.style.strokeDashoffset = CIRC;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ringValue.style.strokeDashoffset = CIRC * (1 - ratio);
    });
  });

  fillDynamic(result);
  resultsEl.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
}

document.getElementById('downloadBtn').addEventListener('click', () => {
  if (!lastReportJson) return;
  const blob = new Blob([JSON.stringify(lastReportJson, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `noisy-virus-report-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('resetBtn').addEventListener('click', () => {
  resultsEl.hidden = true;
  lastReportJson = null;
  document.getElementById('top').scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
});

document.getElementById('urlForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = document.getElementById('urlInput').value.trim();
  if (!value) return;
  setBusy(true);
  try {
    const json = await api('/api/check/url', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: value })
    });
    renderResult(json.result);
  } catch (err) {
    showError(err.message);
  } finally {
    setBusy(false);
  }
});

document.getElementById('hashForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = document.getElementById('hashInput').value.trim();
  if (!value) return;
  setBusy(true);
  try {
    const json = await api('/api/check/hash', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ hash: value })
    });
    renderResult(json.result);
  } catch (err) {
    showError(err.message);
  } finally {
    setBusy(false);
  }
});

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const fileScanBtn = document.getElementById('fileScanBtn');
const fileHint = document.getElementById('fileHint');
let selectedFile = null;

function setSelectedFile(file) {
  selectedFile = file || null;
  dropzone.classList.toggle('has-file', Boolean(selectedFile));
  fileScanBtn.disabled = !selectedFile;
  fileHint.textContent = selectedFile
    ? `${selectedFile.name} · ${fmtBytes(selectedFile.size)}`
    : t('dz.hint');
}

fileInput.addEventListener('change', () => setSelectedFile(fileInput.files[0]));

['dragenter', 'dragover'].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
  });
});

dropzone.addEventListener('drop', (e) => {
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    fileInput.files = e.dataTransfer.files;
    setSelectedFile(file);
  }
});

fileScanBtn.addEventListener('click', async () => {
  if (!selectedFile) return;
  setBusy(true);
  try {
    const fd = new FormData();
    fd.append('file', selectedFile);
    const json = await api('/api/check/file', { method: 'POST', body: fd });
    renderResult(json.result);
  } catch (err) {
    showError(err.message);
  } finally {
    setBusy(false);
  }
});

applyLang(currentLang);

// ---- legal pages open in-page (modal) so the YouTube player keeps playing ----
const legalModal = document.getElementById('legalModal');
const legalModalContent = document.getElementById('legalModalContent');
const legalDocs = new Map();

function hideLegalModal() {
  if (!legalModal) return;
  legalModal.hidden = true;
  legalModalContent.replaceChildren();
  document.documentElement.classList.remove('locked', 'legal-open');
  document.body.classList.remove('locked');
}

async function openLegalDoc(path) {
  if (!legalModal || !legalModalContent) {
    location.href = path;
    return;
  }
  legalModal.hidden = false;
  document.documentElement.classList.add('locked', 'legal-open');
  document.body.classList.add('locked');
  try {
    let docEl = legalDocs.get(path);
    if (!docEl) {
      const res = await fetch(path);
      const page = new DOMParser().parseFromString(await res.text(), 'text/html');
      docEl = page.querySelector('.legal-main');
      if (!docEl) throw new Error('document not found');
      legalDocs.set(path, docEl);
    }
    legalModalContent.replaceChildren(docEl.cloneNode(true));
    legalModal.querySelector('.legal-modal-scroll').scrollTop = 0;
    try { history.pushState({ nvLegal: path }, '', path); } catch {}
  } catch {
    hideLegalModal();
    location.href = path;
  }
}

if (legalModal) {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href$="/privacy.html"], a[href$="/terms.html"]');
    if (!a || a.target === '_blank') return;
    e.preventDefault();
    openLegalDoc(a.getAttribute('href'));
  });

  document.getElementById('legalModalClose').addEventListener('click', () => {
    if (history.state && history.state.nvLegal) history.back();
    else hideLegalModal();
  });
  document.getElementById('legalModalBackdrop').addEventListener('click', () => {
    if (history.state && history.state.nvLegal) history.back();
    else hideLegalModal();
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !legalModal.hidden) {
      if (history.state && history.state.nvLegal) history.back();
      else hideLegalModal();
    }
  });
  addEventListener('popstate', () => {
    if (!legalModal.hidden) hideLegalModal();
  });
}
