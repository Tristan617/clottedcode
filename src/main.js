import pako from 'pako';
import LZ4 from 'lz4js';
import { ZstdCodec } from 'zstd-codec';
import BOOK_TEXT from '../pride-and-prejudice?raw';
import DB_RECORDS_TEXT from '../db-records?raw';

// Injected at build time by vite.config.js
document.getElementById('buildInfo').textContent =
  `${__GIT_BRANCH__}@${__GIT_COMMIT__}`;

// ── Data generators ───────────────────────────────────────────────────────────

const enc = new TextEncoder();
const BOOK_BYTES = enc.encode(BOOK_TEXT);
const DB_RECORDS_BYTES = enc.encode(DB_RECORDS_TEXT);

const DATA_TYPES = [
  {
    key: 'repeated',
    name: 'Repeated',
    desc: 'maximally compressible — single byte 0xAA',
    generate(n) { return new Uint8Array(n).fill(0xAA); }
  },
  {
    key: 'random',
    name: 'Random',
    desc: 'minimally compressible — pseudo-random bytes',
    generate(n) {
      const buf = new Uint8Array(n);
      let s = 0xdeadbeef;
      for (let i = 0; i < n; i++) {
        s = (Math.imul(s, 1664525) + 1013904223) | 0;
        buf[i] = s >>> 24;
      }
      return buf;
    }
  },
  {
    key: 'book',
    name: 'Book Text',
    desc: 'Pride & Prejudice (1813) — natural language',
    generate(n) {
      return BOOK_BYTES.slice(0, n);
    }
  },
  {
    key: 'db',
    name: 'DB Records',
    desc: 'JSON event log rows — 809 unique records',
    generate(n) {
      return DB_RECORDS_BYTES.slice(0, n);
    }
  },
  {
    key: 'custom',
    name: 'Custom',
    desc: 'your own text or file',
    generate(n) { return new Uint8Array(n).fill(0x3f); }
  }
];

// ── Algorithms ────────────────────────────────────────────────────────────────

// zstd: async WASM init
let zstdSimple = null;
let zstdReady  = false;
let zstdError  = '';

const zstdInitTimeout = setTimeout(() => {
  zstdError = 'WASM init timed out';
  refreshAlgoBtns();
}, 10000);

try {
  ZstdCodec.run(zstd => {
    clearTimeout(zstdInitTimeout);
    try {
      zstdSimple = new zstd.Simple();
      zstdReady  = true;
    } catch (e) {
      zstdError = e.message;
    }
    refreshAlgoBtns();
  });
} catch (e) {
  clearTimeout(zstdInitTimeout);
  zstdError = e.message;
}

// LZ4: lz4js — real LZ4 frame format, synchronous, bundled by Vite
function lz4CompressReal(d) {
  const out = LZ4.compress(d);
  return out instanceof Uint8Array ? out : new Uint8Array(out);
}
function lz4DecompressReal(d) {
  // lz4js frame format encodes content size — no origSize needed
  const out = LZ4.decompress(d);
  return out instanceof Uint8Array ? out : new Uint8Array(out);
}

const ALGOS = [
  {
    key: 'deflate', name: 'Deflate',
    available() { return true; },
    compress(d)   { return pako.deflateRaw(d, { level: 6 }); },
    decompress(d) { return pako.inflateRaw(d); },
  },
  {
    key: 'gzip', name: 'Gzip',
    available() { return true; },
    compress(d)   { return pako.gzip(d, { level: 6 }); },
    decompress(d) { return pako.ungzip(d); },
  },
  {
    key: 'lz4', name: 'LZ4',
    available() { return true; },
    compress(d)   { return lz4CompressReal(d); },
    decompress(d) { return lz4DecompressReal(d); },
  },
  {
    key: 'zstd_m1', name: 'zstd L\u22121',
    available() { return zstdReady; },
    unavailableReason() { return zstdError || 'initializing…'; },
    compress(d)   { return zstdSimple.compress(d, -1); },
    decompress(d) { return zstdSimple.decompress(d); },
  },
  {
    key: 'zstd_1', name: 'zstd L1',
    available() { return zstdReady; },
    unavailableReason() { return zstdError || 'initializing…'; },
    compress(d)   { return zstdSimple.compress(d, 1); },
    decompress(d) { return zstdSimple.decompress(d); },
  },
  {
    key: 'zstd_10', name: 'zstd L10',
    available() { return zstdReady; },
    unavailableReason() { return zstdError || 'initializing…'; },
    compress(d)   { return zstdSimple.compress(d, 10); },
    decompress(d) { return zstdSimple.decompress(d); },
  },
];

const REDUNDANCY = [
  { name: '2× Replication',  type: 'replication', n: 2,  k: 1 },
  { name: '3× Replication',  type: 'replication', n: 3,  k: 1 },
  { name: 'RS(4, 2)',         type: 'rs',          n: 4,  k: 2 },
  { name: 'RS(6, 4)',         type: 'rs',          n: 6,  k: 4 },
  { name: 'RS(8, 4)',         type: 'rs',          n: 8,  k: 4 },
  { name: 'RS(10, 6)',        type: 'rs',          n: 10, k: 6 },
  { name: 'RS(16, 10)',       type: 'rs',          n: 16, k: 10 },
];

// ── State ─────────────────────────────────────────────────────────────────────

let currentDataKey      = 'repeated';
let currentAlgoKey      = 'deflate';
let currentSize         = 4096;
let customBytes         = null;
let lastCompressResult  = null; // { origSize, compSize, algoName }

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtBytes(b) {
  if (b < 1024)        return b.toLocaleString() + ' B';
  if (b < 1024 * 1000) return (b / 1024).toFixed(2) + ' KB';
  return (b / (1024 * 1024)).toFixed(2) + ' MB';
}

function fmtMs(ms) {
  if (ms < 0.1)  return '<0.1 ms';
  if (ms < 10)   return ms.toFixed(2) + ' ms';
  if (ms < 1000) return ms.toFixed(1) + ' ms';
  return (ms / 1000).toFixed(2) + ' s';
}

function previewStr(data) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(data);
  } catch {
    const lines = [];
    for (let off = 0; off < data.length; off += 16) {
      const row = data.slice(off, off + 16);
      lines.push(Array.from(row).map(b => b.toString(16).padStart(2, '0')).join(' '));
    }
    return lines.join('\n');
  }
}

function getInputData() {
  if (currentDataKey === 'custom') {
    if (customBytes) return customBytes;
    const txt = document.getElementById('customText').value;
    return enc.encode(txt || '(empty)');
  }
  return DATA_TYPES.find(d => d.key === currentDataKey).generate(currentSize);
}

function hexDump(data, maxBytes = 256) {
  const slice = data.slice(0, maxBytes);
  const lines = [];
  for (let off = 0; off < slice.length; off += 16) {
    const row = slice.slice(off, off + 16);
    const hex = Array.from(row).map(b => b.toString(16).padStart(2, '0'));
    while (hex.length < 16) hex.push('  ');
    const hexStr = hex.slice(0, 8).join(' ') + '  ' + hex.slice(8).join(' ');
    const ascii  = Array.from(row).map(b => (b >= 0x20 && b < 0x7f) ? String.fromCharCode(b) : '.').join('');
    lines.push(
      `<span class="hex-offset">${off.toString(16).padStart(8, '0')}</span>  ` +
      `<span class="hex-bytes">${hexStr}</span>  ` +
      `<span class="hex-ascii">|${ascii}|</span>`
    );
  }
  if (data.length > maxBytes) lines.push(`<span class="hex-offset">…</span>  <span class="hex-ascii">(${data.length - maxBytes} more bytes)</span>`);
  return lines.join('\n');
}

// ── Preview ───────────────────────────────────────────────────────────────────

function updatePreview() {
  const data = getInputData();
  const def  = DATA_TYPES.find(d => d.key === currentDataKey);
  document.getElementById('previewName').textContent  = def.name;
  document.getElementById('previewDesc').textContent  = def.desc;
  document.getElementById('previewSize').textContent  = fmtBytes(data.length);
  document.getElementById('previewBytes').textContent = previewStr(data);
}

// ── Build UI ──────────────────────────────────────────────────────────────────

// Data buttons
const dataBtnsEl = document.getElementById('dataBtns');
DATA_TYPES.forEach(dt => {
  const btn = document.createElement('button');
  btn.className = 'btn' + (dt.key === currentDataKey ? ' active' : '');
  btn.textContent = dt.name;
  btn.onclick = () => {
    currentDataKey = dt.key;
    dataBtnsEl.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('customPanel').classList.toggle('visible', dt.key === 'custom');
    document.getElementById('sizeBlock').style.display = dt.key === 'custom' ? 'none' : '';
    updatePreview();
  };
  dataBtnsEl.appendChild(btn);
});

// Algorithm buttons
function refreshAlgoBtns() {
  const container = document.getElementById('algoBtns');
  container.innerHTML = '';
  ALGOS.forEach(a => {
    const btn    = document.createElement('button');
    const avail  = a.available();
    const reason = !avail && a.unavailableReason ? a.unavailableReason() : '';
    btn.className   = 'btn' + (a.key === currentAlgoKey && avail ? ' active' : '');
    btn.textContent = a.name;
    btn.disabled    = !avail;
    btn.title       = reason ? `Unavailable: ${reason}` : '';
    btn.onclick = () => {
      if (!avail) return;
      currentAlgoKey = a.key;
      container.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };
    container.appendChild(btn);
  });
}
refreshAlgoBtns();

// Size controls
const slider = document.getElementById('sizeSlider');
const numBox = document.getElementById('sizeNum');
function setSize(v) {
  v = Math.max(1, Math.min(100000, v));
  currentSize = v;
  slider.value = v;
  numBox.value = v;
  updatePreview();
}
slider.addEventListener('input',  e => setSize(parseInt(e.target.value, 10)));
numBox.addEventListener('change', e => setSize(parseInt(e.target.value, 10)));

// Custom input
document.getElementById('customText').addEventListener('input', () => {
  customBytes = null;
  document.getElementById('customFileInfo').textContent = 'no file loaded';
  updatePreview();
});

document.getElementById('fileInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    customBytes = new Uint8Array(ev.target.result);
    document.getElementById('customFileInfo').textContent =
      `${file.name} — ${fmtBytes(customBytes.length)}`;
    updatePreview();
  };
  reader.readAsArrayBuffer(file);
});

// Redundancy table — updates after each compression run
function buildRedTable() {
  const origSize = lastCompressResult ? lastCompressResult.origSize : 4096;
  const compSize = lastCompressResult ? lastCompressResult.compSize : 4096;
  const isRef    = !lastCompressResult;

  // Summary line above the table
  const summary = document.getElementById('redSummary');
  if (isRef) {
    summary.innerHTML =
      '<span class="red-ref-note">Showing 4 KB reference &mdash; run a compression to see live results.</span>';
  } else {
    const ratio   = (compSize / origSize * 100).toFixed(1);
    const saved   = origSize - compSize;
    const saveCls = saved >= 0 ? 'good' : 'bad';
    summary.innerHTML =
      `${fmtBytes(origSize)} original &rarr; ` +
      `${fmtBytes(compSize)} compressed ` +
      `<span class="${saveCls}">(${ratio}% of original)</span> ` +
      `&rarr; on-disk sizes per scheme below`;
  }

  const tbody    = document.getElementById('redTbody');
  tbody.innerHTML = '';

  // Bar scale: widest bar = 3× replication of compressed bytes
  const maxOnDisk = Math.ceil(compSize * 3);

  REDUNDANCY.forEach(r => {
    const mult    = r.n / r.k;
    const onDisk  = Math.ceil(compSize * mult);
    const netPct  = (onDisk / origSize - 1) * 100;
    const ftol    = r.n - r.k;
    const tag     = r.type === 'rs'
      ? '<span class="tag tag-blue">erasure</span>'
      : '<span class="tag tag-orange">replication</span>';
    const ftolStr = r.type === 'replication'
      ? `${ftol} full-copy loss`
      : `${ftol} shard loss (of ${r.n})`;
    const barPct  = (onDisk / maxOnDisk * 100).toFixed(1);
    const netCls  = netPct <= 0 ? 'good' : 'bad';
    const netSign = netPct > 0 ? '+' : '';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.name}${tag}</td>
      <td>${fmtBytes(origSize)}</td>
      <td>${fmtBytes(compSize)}</td>
      <td>${fmtBytes(onDisk)}</td>
      <td class="${netCls}">${netSign}${netPct.toFixed(1)}%</td>
      <td>${ftolStr}</td>
      <td class="bar-cell">
        <div class="bar-wrap">
          <div class="bar-fill" style="width:${barPct}%;background:var(--orange)"></div>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}
buildRedTable();

// ── Compress button ───────────────────────────────────────────────────────────

document.getElementById('compressBtn').addEventListener('click', async () => {
  const algo = ALGOS.find(a => a.key === currentAlgoKey);
  if (!algo || !algo.available()) {
    alert('Selected algorithm is not available. ' + (algo?.unavailableReason?.() ?? ''));
    return;
  }

  const btn = document.getElementById('compressBtn');
  btn.disabled    = true;
  btn.textContent = 'Compressing…';

  await new Promise(r => setTimeout(r, 0)); // let browser repaint

  try {
    const input = getInputData();

    const t0         = performance.now();
    const compressed = algo.compress(input);
    const t1         = performance.now();
    const compressMs = t1 - t0;

    const t2           = performance.now();
    const decompressed = algo.decompress(compressed, input.length);
    const t3           = performance.now();
    const decompressMs = t3 - t2;

    // Round-trip verification
    let ok = decompressed && decompressed.length === input.length;
    if (ok) {
      for (let i = 0; i < input.length; i++) {
        if (decompressed[i] !== input[i]) { ok = false; break; }
      }
    }

    const ratio      = compressed.length / input.length;
    const bytesSaved = input.length - compressed.length;

    const stats = [
      { label: 'Original size',   value: fmtBytes(input.length),      sub: '', cls: '' },
      { label: 'Compressed size', value: fmtBytes(compressed.length), sub: (ratio * 100).toFixed(1) + '% of original', cls: ratio < 1 ? 'good' : 'bad' },
      { label: 'Bytes saved',
        value: bytesSaved >= 0 ? fmtBytes(bytesSaved) : '−' + fmtBytes(-bytesSaved),
        sub:   bytesSaved >= 0 ? ((1 - ratio) * 100).toFixed(1) + '% reduction' : 'expansion',
        cls:   bytesSaved > 0 ? 'good' : 'bad' },
      { label: 'Ratio',           value: ((1 - ratio) * 100).toFixed(1) + '%', sub: ratio < 1 ? 'smaller' : 'larger', cls: ratio < 1 ? 'good' : 'bad' },
      { label: 'Compress time',   value: fmtMs(compressMs),   sub: '', cls: '' },
      { label: 'Decompress time', value: fmtMs(decompressMs), sub: '', cls: '' },
      { label: 'Round-trip',      value: ok ? 'OK' : 'FAIL',  sub: ok ? 'decompressed matches input' : 'mismatch!', cls: ok ? 'good' : 'bad' },
    ];

    const grid = document.getElementById('statsGrid');
    grid.innerHTML = '';
    stats.forEach(s => {
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `
        <div class="stat-label">${s.label}</div>
        <div class="stat-value ${s.cls}">${s.value}</div>
        ${s.sub ? `<div class="stat-sub">${s.sub}</div>` : ''}`;
      grid.appendChild(card);
    });

    document.getElementById('hexDump').innerHTML = hexDump(compressed, 256);

    // Update redundancy table with actual compression result
    lastCompressResult = { origSize: input.length, compSize: compressed.length, algoName: algo.name };
    buildRedTable();

    const panel = document.getElementById('resultsPanel');
    panel.classList.add('visible');
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  } catch (err) {
    alert('Compression error: ' + err.message);
    console.error(err);
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Compress';
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────
updatePreview();
