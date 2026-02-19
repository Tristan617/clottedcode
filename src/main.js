import pako from 'pako';
import LZ4 from 'lz4js';
import { ZstdCodec } from 'zstd-codec';

// Injected at build time by vite.config.js
document.getElementById('buildInfo').textContent =
  `${__GIT_BRANCH__}@${__GIT_COMMIT__}`;

// ── Book text (~13 KB of Pride and Prejudice, public domain 1813) ─────────────
const BOOK_TEXT = `PRIDE AND PREJUDICE
By Jane Austen (1813)

Chapter 1

It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"

Mr. Bennet replied that he had not.

"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."

Mr. Bennet made no answer.

"Do you not want to know who has taken it?" cried his wife impatiently.

"You want to tell me, and I have no objection to hearing it."

This was invitation enough.

"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week."

"What is his name?"

"Bingley."

"Is he married or single?"

"Oh! Single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!"

"How so? Can it affect them?"

"My dear Mr. Bennet," replied his wife, "how can you be so tiresome! You must know that I am thinking of his marrying one of them."

"Is that his design in settling here?"

"Design! Nonsense, how can you talk so! But it is very likely that he may fall in love with one of them, and therefore you must visit him as soon as he comes."

"I see no occasion for that. You and the girls may go, or you may send them by themselves, which perhaps will be still better, for as you are as handsome as any of them, Mr. Bingley may like you the best of the party."

"My dear, you flatter me. I certainly have had my share of beauty, but I do not pretend to be anything extraordinary now. When a woman has five grown-up daughters, she ought to give over thinking of her own beauty."

"In such cases, a woman has not often much beauty to think of."

"But, my dear, you must indeed go and see Mr. Bingley when he comes into the neighbourhood."

"It is more than I engage for, I assure you."

"But consider your daughters. Only think what an establishment it would be for one of them. Sir William and Lady Lucas are determined to go, merely on that account, for in general, you know, they visit no newcomers. Indeed you must go, for it will be impossible for us to visit him if you do not."

"You are over-scrupulous, surely. I dare say Mr. Bingley will be very glad to see you; and I will send a few lines by you to assure him of my hearty consent to his marrying whichever he chooses of our girls; though I must throw in a good word for my little Lizzy."

"I desire you will do no such thing. Lizzy is not a bit better than the others; and I am sure she is not half so handsome as Jane, nor half so good-humoured as Lydia. But you are always giving her the preference."

"They have none of them much to recommend them," replied he; "they are all silly and ignorant like other girls; but Lizzy has something more of quickness than her sisters."

"Mr. Bennet, how can you abuse your own children so? You take delight in vexing me. You have no compassion on my poor nerves."

"You mistake me, my dear. I have a high respect for your nerves. They are my old friends. I have heard you mention them with consideration these twenty years at least."

"Ah, you do not know what I suffer."

"But I hope you will get over it, and live to see many young men of four thousand a year come into the neighbourhood."

"It will be no use to us, if twenty such should come, since you will not visit them."

"Depend upon it, my dear, that when there are twenty, I will visit them all."

Mr. Bennet was so odd a mixture of quick parts, satirical humour, reserve, and caprice, that the experience of three and twenty years had been insufficient to make his wife understand his character. Her mind was less difficult to develop. She was a woman of mean understanding, little information, and uncertain temper. When she was discontented, she fancied herself nervous. The business of her life was to get her daughters married; its solace was visiting and news.

Chapter 2

Mr. Bennet was among the earliest of his neighbours in paying his respects to Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid, she had no knowledge of it. It was then disclosed in the following manner. Observing his second daughter employed in trimming a hat, he suddenly addressed her with, "I hope Mr. Bingley will like it, Lizzy."

"We are not in a way to know what Mr. Bingley likes," said her mother resentfully, "since we are not to visit."

"But you forget, mamma," said Elizabeth, "that we shall meet him at the assemblies, and that Mrs. Long has promised to introduce him."

"I do not believe Mrs. Long will do any such thing. She has two nieces of her own. She is a selfish, hypocritical woman, and I have no opinion of her."

"No more have I," said Mr. Bennet; "and I am glad to find that you do not depend on her serving you."

Mrs. Bennet deigned not to make any reply; but unable to contain herself, began scolding one of her daughters.

"Stop your coughing so, Kitty, for heaven's sake! Have a little compassion on my nerves. You tear them to pieces."

"Kitty has no discretion in her coughs," said her father; "she times them ill."

"I do not cough for my own amusement," replied Kitty fretfully.

"When is your next ball to be, Lizzy?"

"To-morrow fortnight."

"Aye, so it is," cried her mother, "and Mrs. Long does not come back till the day before; so it will be impossible for her to introduce him, for she will not know him herself."

"Then, my dear, you may have the advantage of your friend, and introduce Mr. Bingley to her."

"Impossible, Mr. Bennet, impossible, when I am not acquainted with him myself; how can you be so teasing?"

"I honour your circumspection. A fortnight's acquaintance is certainly very little. One cannot know what a man really is by the end of a fortnight. But if we do not venture, somebody else will; and after all, Mrs. Long and her nieces must stand their chance; and therefore, as she will think it an act of kindness, if you decline the office, I will take it on myself."

The girls stared at their father. Mrs. Bennet said only, "Nonsense, nonsense!"

"What can be the meaning of that emphatic exclamation?" cried he. "Do you consider the forms of introduction, and the stress that is laid on them, as nonsense? I cannot quite agree with you there. What say you, Mary? for you are a young lady of deep reflection I know, and read great books, and make extracts."

Mary wished to say something very sensible, but knew not how.

"While Mary is adjusting her ideas," he continued, "let us return to Mr. Bingley."

"I am sick of Mr. Bingley," cried his wife.

"I am sorry to hear that; but why did not you tell me so before? If I had known as much this morning, I certainly would not have called on him. It is very unlucky; but as I have actually paid the visit, we cannot escape the acquaintance now."

The astonishment of the ladies was just what it wished to be; that of Mrs. Bennet perhaps surpassing the rest; though when the first tumult of joy was over, she began to declare that it was what she had expected all the while.

Chapter 3

Not all that Mrs. Bennet, however, with the assistance of her five daughters, could ask on the subject was sufficient to draw from her husband any satisfactory description of Mr. Bingley. They attacked him in various ways; with barefaced questions, ingenious suppositions, and distant surmises; but he eluded the skill of them all; and they were at last obliged to accept the second-hand intelligence of their neighbour Lady Lucas. Her report was highly favourable. Sir William had been delighted with him. He was quite young, wonderfully handsome, extremely agreeable, and to crown the whole, he meant to be at the next assembly with a large party. Nothing could be more delightful! To be fond of dancing was a certain step towards falling in love; and very lively hopes of Mr. Bingley's heart were entertained.

"If I can but see one of my daughters happily settled at Netherfield," said Mrs. Bennet to her husband, "and all the others equally well married, I shall have nothing to wish for."

In a few days Mr. Bingley returned Mr. Bennet's visit, and sat about ten minutes with him in his library. He had entertained hopes of being admitted to a sight of the young ladies, of whose beauty he had heard much; but he saw only the father. The ladies were somewhat more fortunate, for they had the advantage of ascertaining from an upper window that he wore a blue coat and rode a black horse.

An invitation to dinner was soon afterwards dispatched; and already had Mrs. Bennet planned the courses that were to do credit to her housekeeping, when an answer arrived which deferred it all. Mr. Bingley was obliged to be in town the following day, and consequently unable to accept the honour of their invitation. Mrs. Bennet was quite disconcerted. She could not imagine what business he could have in town so soon after his arrival in Hertfordshire; and she began to fear that he might be always flying about from one place to another, and never settled at Netherfield as he ought to be. Lady Lucas quieted her fears a little by starting the idea of his being gone to London only to get a large party for the ball; and a report soon followed that Mr. Bingley was to bring twelve ladies and seven gentlemen with him to the assembly. The girls grieved over such a number of ladies; but were comforted the day before the ball by hearing that instead of twelve, he had brought only six with him from London, his five sisters and a cousin. And when the party entered the assembly room, it consisted of only five altogether: Mr. Bingley, his two sisters, the husband of the eldest, and another young man.

Mr. Bingley had not been of age two years, when he was tempted by an accidental recommendation to look at Netherfield House. He did look at it and into it for half an hour, was pleased with the situation and the principal rooms, satisfied with what the owner said in its praise, and took it immediately.

Between him and Darcy there was a very steady friendship, in spite of a great opposition of character. Bingley was endeared to Darcy by the easiness, openness, and ductility of his temper, though no disposition could offer a greater contrast to his own, and though with his own he never appeared dissatisfied. On the strength of Darcy's regard Bingley had the firmest reliance, and of his judgment the highest opinion. In understanding, Darcy was the superior. Bingley was by no means deficient, but Darcy was clever. He was at the same time haughty, reserved, and fastidious, and his manners, though well bred, were not inviting. In that respect his friend had greatly the advantage. Bingley was sure of being liked wherever he appeared; Darcy was continually giving offence.

The manner in which they spoke of the Meryton assembly was sufficiently characteristic. Bingley had never met with pleasanter people or prettier girls in his life; every body had been most kind and attentive to him, there had been no formality, no stiffness, he had soon felt acquainted with all the room; and as to Miss Bennet, he could not conceive an angel more beautiful. Darcy, on the contrary, had seen a collection of people in whom there was little beauty and no fashion, for none of whom he had felt the smallest interest, and from none received either attention or pleasure. Miss Bennet he acknowledged to be pretty, but she smiled too much.

Mrs. Hurst and her sister allowed it to be so — but still they admired her and liked her, and pronounced her to be a sweet girl, and one whom they should not object to know more of. Miss Bennet was therefore established as a sweet girl, and their brother felt authorized by such commendation to think of her as he chose.`;

// ── Data generators ───────────────────────────────────────────────────────────

const enc = new TextEncoder();
const BOOK_BYTES = enc.encode(BOOK_TEXT);

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
      const buf = new Uint8Array(n);
      for (let i = 0; i < n; i++) buf[i] = BOOK_BYTES[i % BOOK_BYTES.length];
      return buf;
    }
  },
  {
    key: 'db',
    name: 'DB Records',
    desc: 'JSON event log rows — structured, repetitive',
    generate(n) {
      const rows = [
        '{"id":1,"ts":"2024-03-15T08:23:11Z","user":"usr_a4f2","event":"page_view","path":"/dashboard","ms":142,"country":"US"}\n',
        '{"id":2,"ts":"2024-03-15T08:23:14Z","user":"usr_b9c7","event":"click","path":"/products","ms":38,"country":"DE"}\n',
        '{"id":3,"ts":"2024-03-15T08:23:19Z","user":"usr_a4f2","event":"api_call","path":"/api/v2/items","ms":307,"country":"US"}\n',
        '{"id":4,"ts":"2024-03-15T08:23:22Z","user":"usr_k1d3","event":"page_view","path":"/checkout","ms":198,"country":"GB"}\n',
        '{"id":5,"ts":"2024-03-15T08:23:25Z","user":"usr_m7e9","event":"purchase","path":"/order/confirm","ms":512,"country":"CA"}\n',
      ];
      const src = enc.encode(rows.join(''));
      const buf = new Uint8Array(n);
      for (let i = 0; i < n; i++) buf[i] = src[i % src.length];
      return buf;
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

let currentDataKey = 'repeated';
let currentAlgoKey = 'deflate';
let currentSize    = 4096;
let customBytes    = null;

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

// Redundancy table (reference, fixed at 4 KB input)
(function buildRedTable() {
  const tbody   = document.getElementById('redTbody');
  const refSize = 4096;
  const maxOut  = Math.ceil(refSize * 3); // 3× replication is the widest bar
  REDUNDANCY.forEach(r => {
    const mult    = r.n / r.k;
    const outSz   = Math.ceil(refSize * mult);
    const ftol    = r.n - r.k;
    const tag     = r.type === 'rs'
      ? '<span class="tag tag-blue">erasure</span>'
      : '<span class="tag tag-orange">replication</span>';
    const ftolStr = r.type === 'replication'
      ? `${ftol} full-copy loss`
      : `${ftol} shard loss (of ${r.n})`;
    const barPct  = (outSz / maxOut * 100).toFixed(1);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.name}${tag}</td>
      <td>${fmtBytes(refSize)}</td>
      <td>${fmtBytes(outSz)}</td>
      <td class="bad">${mult.toFixed(2)}&times;</td>
      <td>${ftolStr}</td>
      <td class="bar-cell">
        <div class="bar-wrap">
          <div class="bar-fill" style="width:${barPct}%;background:var(--orange)"></div>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
})();

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
