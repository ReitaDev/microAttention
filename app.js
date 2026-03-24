/* ============================================
   microAttention — Interactive JavaScript
   ============================================ */

'use strict';

// ============================================
// THEME TOGGLE
// ============================================
(function() {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);

  const moonIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  const sunIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;

  function setToggleIcon() {
    if (toggle) toggle.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
  }

  setToggleIcon();

  if (toggle) {
    toggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      setToggleIcon();
      toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
    });
  }
})();

// ============================================
// PIPELINE STEPPER
// ============================================
const TOTAL_STAGES = 6;
let currentStage = 0;
let isPlaying = false;
let playInterval = null;
let activeTab = 'ir';

const stepBtns = document.querySelectorAll('.step-btn');
const stageViews = document.querySelectorAll('.stage-view');
const progressFill = document.getElementById('progressFill');
const stageLabel = document.getElementById('stageLabel');
const playBtn = document.getElementById('playBtn');

function setStage(n) {
  currentStage = Math.max(0, Math.min(TOTAL_STAGES, n));

  // Update step buttons
  stepBtns.forEach((btn, i) => {
    btn.classList.toggle('active', i === currentStage);
    btn.setAttribute('aria-selected', i === currentStage ? 'true' : 'false');
  });

  // Update stage views
  stageViews.forEach((view, i) => {
    view.classList.toggle('active', i === currentStage);
  });

  // Update progress
  const pct = (currentStage / TOTAL_STAGES) * 100;
  progressFill.style.width = pct + '%';
  stageLabel.textContent = `Stage ${currentStage} / ${TOTAL_STAGES}`;

  // Update sidebar metrics
  updateSidebarMetrics(currentStage);

  // Ensure correct tab view
  setTab(activeTab);

  // Build graph for this stage if on graphs tab
  if (activeTab === 'graphs') {
    buildGraph(currentStage);
  }
}

stepBtns.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    stopPlay();
    setStage(i);
  });
});

// Play / Stop
function startPlay() {
  isPlaying = true;
  playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause`;
  playInterval = setInterval(() => {
    if (currentStage < TOTAL_STAGES) {
      setStage(currentStage + 1);
    } else {
      stopPlay();
    }
  }, 1800);
}

function stopPlay() {
  isPlaying = false;
  clearInterval(playInterval);
  playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg> Play`;
}

playBtn.addEventListener('click', () => {
  if (isPlaying) {
    stopPlay();
  } else {
    if (currentStage >= TOTAL_STAGES) setStage(0);
    startPlay();
  }
});

// ============================================
// VIEW TABS
// ============================================
const tabBtns = document.querySelectorAll('.tab-btn');

function setTab(tab) {
  activeTab = tab;
  tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));

  stageViews.forEach((view, i) => {
    const irPanel = view.querySelector('.split-panel, .code-panel');
    const graphPanel = view.querySelector('.graph-panel');
    const stageInfo = view.querySelector('.stage-info');
    const metricsRow = view.querySelector('.metrics-row');

    if (graphPanel) {
      if (tab === 'graphs') {
        graphPanel.classList.remove('hidden');
        graphPanel.classList.add('visible');
        if (i === currentStage) buildGraph(i);
      } else {
        graphPanel.classList.add('hidden');
        graphPanel.classList.remove('visible');
      }
    }
  });
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => setTab(btn.dataset.tab));
});

// ============================================
// OPERATIONS HIGHLIGHT
// ============================================
document.querySelectorAll('.op-item').forEach(item => {
  item.addEventListener('click', function() {
    const panel = this.closest('.ops-panel');
    panel.querySelectorAll('.op-item').forEach(o => o.classList.remove('highlighted'));
    this.classList.add('highlighted');
  });
});

// ============================================
// COPY CODE
// ============================================
function copyCode(btn) {
  const codeBlock = btn.closest('.code-panel').querySelector('.code-block pre');
  const text = codeBlock.innerText;
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = original, 1500);
  }).catch(() => {
    btn.textContent = 'Error';
    setTimeout(() => btn.textContent = 'Copy', 1500);
  });
}

window.copyCode = copyCode;

// ============================================
// SIDEBAR METRICS
// ============================================
function updateSidebarMetrics(stage) {
  const ops = ['3 matmuls', '3 matmuls', '4 matmuls', '4 + softmax', '5 matmuls', '5 + mask', '5h matmuls'];
  const complexity = ['O(T·d²)', 'O(T·d²)', 'O(T²·d)', 'O(T²·d)', 'O(T²·d)', 'O(T²)', 'O(T²·d)'];
  const opsEl = document.getElementById('sidebar-ops');
  const cplxEl = document.getElementById('sidebar-complexity');
  if (opsEl) opsEl.textContent = ops[stage] || ops[0];
  if (cplxEl) cplxEl.textContent = complexity[stage] || complexity[0];
}

// ============================================
// GRAPH BUILDERS
// ============================================
function buildGraph(stage) {
  switch (stage) {
    case 2: buildScoreMatrix(); break;
    case 3: buildSoftmaxViz(); break;
    case 4: buildValueAggViz(); break;
    case 5: buildMaskViz(); break;
    case 6: buildMultiheadViz(); break;
  }
}

// Score matrix visualization
function buildScoreMatrix() {
  const container = document.getElementById('score-matrix-container');
  if (!container || container.dataset.built) return;
  container.dataset.built = '1';

  const tokens = ['The', 'cat', 'sat', 'down'];
  const T = tokens.length;

  // Simulated raw scores
  const rawScores = [
    [3.2, 0.8, -0.5, 0.1],
    [0.4, 4.1, 1.2, -0.3],
    [-0.2, 1.8, 3.8, 2.1],
    [0.1, -0.4, 2.2, 4.5]
  ];

  // Softmax helper
  function softmax(arr) {
    const max = Math.max(...arr);
    const exps = arr.map(x => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(x => x / sum);
  }

  const weights = rawScores.map(row => softmax(row));

  // Build grid
  const wrap = document.createElement('div');
  wrap.style.cssText = 'overflow-x:auto;';

  const table = document.createElement('table');
  table.style.cssText = 'border-collapse:separate;border-spacing:3px;margin:0 auto;';

  // Header row
  const thead = document.createElement('tr');
  const empty = document.createElement('td');
  empty.style.cssText = 'width:48px;';
  thead.appendChild(empty);
  tokens.forEach(tok => {
    const th = document.createElement('td');
    th.textContent = tok;
    th.style.cssText = 'font-family:var(--font-mono);font-size:0.65rem;color:var(--color-text-muted);text-align:center;padding:4px 2px;width:52px;';
    thead.appendChild(th);
  });
  table.appendChild(thead);

  // Data rows
  weights.forEach((row, i) => {
    const tr = document.createElement('tr');
    const rowLabel = document.createElement('td');
    rowLabel.textContent = tokens[i];
    rowLabel.style.cssText = 'font-family:var(--font-mono);font-size:0.65rem;color:var(--color-text-muted);text-align:right;padding-right:6px;';
    tr.appendChild(rowLabel);

    row.forEach((w, j) => {
      const td = document.createElement('td');
      const alpha = Math.round(w * 255);
      const bg = `rgba(245,158,11,${w.toFixed(3)})`;
      td.style.cssText = `
        width:52px;height:42px;
        background:${bg};
        border-radius:4px;
        cursor:pointer;
        transition:transform 0.2s, box-shadow 0.2s;
        position:relative;
      `;
      td.title = `${tokens[i]} → ${tokens[j]}: ${w.toFixed(3)}`;

      const span = document.createElement('span');
      span.textContent = w.toFixed(2);
      span.style.cssText = `
        position:absolute;inset:0;
        display:flex;align-items:center;justify-content:center;
        font-family:var(--font-mono);font-size:0.6rem;font-weight:600;
        color:${w > 0.3 ? '#fff' : 'var(--color-text)'};
      `;
      td.appendChild(span);

      td.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.12)';
        this.style.boxShadow = 'var(--shadow-md)';
        this.style.zIndex = '5';
      });
      td.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
        this.style.zIndex = '';
      });
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  wrap.appendChild(table);

  const note = document.createElement('p');
  note.textContent = 'Brighter = higher attention weight. Each row sums to 1.0.';
  note.style.cssText = 'font-family:var(--font-mono);font-size:0.65rem;color:var(--color-text-muted);margin-top:12px;text-align:center;';

  container.appendChild(wrap);
  container.appendChild(note);
}

// Softmax visualization
function buildSoftmaxViz() {
  const container = document.getElementById('softmax-viz');
  if (!container || container.dataset.built) return;
  container.dataset.built = '1';

  const title = document.createElement('div');
  title.textContent = 'Effect of Scaling on Softmax Distribution';
  title.style.cssText = 'font-family:var(--font-mono);font-size:0.65rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px;';
  container.appendChild(title);

  const rawScores = [2.5, 1.0, -0.5, 3.2, 0.8];
  const dKValues = [1, 8, 64];
  const labels = ['token_0', 'token_1', 'token_2', 'token_3', 'token_4'];

  function softmax(arr) {
    const max = Math.max(...arr);
    const exps = arr.map(x => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(x => x / sum);
  }

  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:16px;';

  dKValues.forEach(dk => {
    const scaled = rawScores.map(s => s / Math.sqrt(dk));
    const weights = softmax(scaled);
    const maxW = Math.max(...weights);

    const card = document.createElement('div');
    card.style.cssText = 'background:var(--color-surface-2);border:1px solid var(--color-border);border-radius:8px;padding:16px;';

    const cardTitle = document.createElement('div');
    cardTitle.textContent = `d_k = ${dk}  (÷√${dk} = ÷${Math.sqrt(dk).toFixed(2)})`;
    cardTitle.style.cssText = 'font-family:var(--font-mono);font-size:0.6rem;color:var(--color-primary);margin-bottom:12px;font-weight:600;';
    card.appendChild(cardTitle);

    weights.forEach((w, i) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:6px;';

      const lbl = document.createElement('span');
      lbl.textContent = labels[i];
      lbl.style.cssText = 'font-family:var(--font-mono);font-size:0.6rem;color:var(--color-text-muted);width:54px;flex-shrink:0;';

      const track = document.createElement('div');
      track.style.cssText = 'flex:1;height:8px;background:var(--color-surface-offset);border-radius:4px;overflow:hidden;';

      const fill = document.createElement('div');
      fill.style.cssText = `height:100%;width:${(w/maxW)*100}%;background:var(--color-primary);border-radius:4px;transition:width 0.5s;`;
      track.appendChild(fill);

      const val = document.createElement('span');
      val.textContent = w.toFixed(3);
      val.style.cssText = 'font-family:var(--font-mono);font-size:0.6rem;color:var(--color-text);width:38px;text-align:right;';

      row.appendChild(lbl);
      row.appendChild(track);
      row.appendChild(val);
      card.appendChild(row);
    });

    const entropy = -weights.reduce((a, w) => a + (w > 0 ? w * Math.log(w) : 0), 0);
    const info = document.createElement('div');
    info.textContent = `entropy: ${entropy.toFixed(3)}`;
    info.style.cssText = 'font-family:var(--font-mono);font-size:0.6rem;color:var(--color-text-faint);margin-top:8px;border-top:1px solid var(--color-divider);padding-top:8px;';
    card.appendChild(info);

    grid.appendChild(card);
  });

  container.appendChild(grid);

  const note = document.createElement('p');
  note.textContent = 'Larger d_k → larger raw dot products → peakier softmax → lower entropy. Scaling by 1/√d_k restores spread.';
  note.style.cssText = 'font-family:var(--font-mono);font-size:0.65rem;color:var(--color-text-muted);margin-top:16px;max-width:72ch;';
  container.appendChild(note);
}

// Value aggregation visualization
function buildValueAggViz() {
  const container = document.getElementById('value-agg-viz');
  if (!container || container.dataset.built) return;
  container.dataset.built = '1';

  const tokens = ['The', 'cat', 'sat', 'down'];
  const attnWeights = [
    [0.72, 0.12, 0.10, 0.06],
    [0.08, 0.68, 0.16, 0.08],
    [0.05, 0.15, 0.62, 0.18],
    [0.04, 0.08, 0.22, 0.66]
  ];

  const colors = ['#7c3aed', '#0369a1', '#b45309', '#065f46'];

  const wrap = document.createElement('div');
  wrap.style.cssText = 'overflow-x:auto;';

  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:12px;max-width:640px;';

  tokens.forEach((tok, i) => {
    const col = document.createElement('div');
    col.style.cssText = 'display:flex;flex-direction:column;gap:4px;align-items:center;';

    const header = document.createElement('div');
    header.textContent = `out[${i}]`;
    header.style.cssText = `font-family:var(--font-mono);font-size:0.65rem;font-weight:700;color:${colors[i]};margin-bottom:6px;`;
    col.appendChild(header);

    const desc = document.createElement('div');
    desc.textContent = `"${tok}"`;
    desc.style.cssText = 'font-family:var(--font-mono);font-size:0.6rem;color:var(--color-text-muted);margin-bottom:8px;';
    col.appendChild(desc);

    attnWeights[i].forEach((w, j) => {
      const bar = document.createElement('div');
      bar.style.cssText = `
        width:100%;padding:4px 6px;
        border-radius:4px;
        background:${colors[j]};
        opacity:${0.15 + w * 0.85};
        font-family:var(--font-mono);font-size:0.6rem;
        color:#fff;font-weight:600;
        text-align:center;
        transition:transform 0.2s;
        cursor:pointer;
        min-height:28px;
        display:flex;align-items:center;justify-content:center;
      `;
      bar.textContent = `${(w*100).toFixed(0)}% V[${j}]`;
      bar.title = `${(w*100).toFixed(1)}% of V["${tokens[j]}"]`;
      bar.addEventListener('mouseenter', () => bar.style.transform = 'scaleY(1.1)');
      bar.addEventListener('mouseleave', () => bar.style.transform = '');
      col.appendChild(bar);
    });

    const sum = document.createElement('div');
    sum.textContent = '= 100%';
    sum.style.cssText = 'font-family:var(--font-mono);font-size:0.6rem;color:var(--color-text-muted);margin-top:6px;border-top:1px solid var(--color-divider);padding-top:4px;width:100%;text-align:center;';
    col.appendChild(sum);

    grid.appendChild(col);
  });

  wrap.appendChild(grid);
  container.appendChild(wrap);

  const note = document.createElement('p');
  note.textContent = 'Each output token blends values from all positions. Height of bar = attention weight (hover to see exact %).';
  note.style.cssText = 'font-family:var(--font-mono);font-size:0.65rem;color:var(--color-text-muted);margin-top:16px;';
  container.appendChild(note);
}

// Mask visualization
function buildMaskViz() {
  const container = document.getElementById('mask-viz');
  if (!container || container.dataset.built) return;
  container.dataset.built = '1';

  const T = 5;
  const tokens = ['I', 'love', 'cats', 'and', 'dogs'];

  const title = document.createElement('div');
  title.textContent = 'Causal Mask (T=5) — Lower Triangular';
  title.style.cssText = 'font-family:var(--font-mono);font-size:0.65rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px;';
  container.appendChild(title);

  const tableWrap = document.createElement('div');
  tableWrap.style.cssText = 'overflow-x:auto;';

  const table = document.createElement('table');
  table.style.cssText = 'border-collapse:separate;border-spacing:3px;margin-bottom:16px;';

  // Header
  const headRow = document.createElement('tr');
  const empty = document.createElement('td');
  empty.style.cssText = 'width:50px;';
  headRow.appendChild(empty);
  tokens.forEach(tok => {
    const th = document.createElement('td');
    th.textContent = tok;
    th.style.cssText = 'font-family:var(--font-mono);font-size:0.65rem;color:var(--color-text-muted);text-align:center;padding:2px 4px;min-width:52px;';
    headRow.appendChild(th);
  });
  table.appendChild(headRow);

  for (let i = 0; i < T; i++) {
    const tr = document.createElement('tr');
    const rowLbl = document.createElement('td');
    rowLbl.textContent = tokens[i];
    rowLbl.style.cssText = 'font-family:var(--font-mono);font-size:0.65rem;color:var(--color-text-muted);text-align:right;padding-right:6px;';
    tr.appendChild(rowLbl);

    for (let j = 0; j < T; j++) {
      const td = document.createElement('td');
      const canAttend = j <= i;

      if (canAttend) {
        const diag = i === j;
        td.textContent = diag ? 'self' : '✓';
        td.style.cssText = `
          width:52px;height:40px;
          background:${diag ? 'var(--color-primary)' : 'oklch(0.9 0.06 40)'};
          color:${diag ? '#fff' : 'var(--color-primary)'};
          border-radius:4px;
          font-family:var(--font-mono);font-size:0.65rem;font-weight:700;
          text-align:center;vertical-align:middle;cursor:default;
        `;
      } else {
        td.textContent = '−∞';
        td.style.cssText = `
          width:52px;height:40px;
          background:var(--color-surface-offset);
          color:var(--color-text-faint);
          border-radius:4px;
          font-family:var(--font-mono);font-size:0.65rem;
          text-align:center;vertical-align:middle;cursor:default;
          opacity:0.5;
        `;
      }

      td.title = canAttend ? `"${tokens[i]}" can attend to "${tokens[j]}"` : `"${tokens[i]}" CANNOT attend to "${tokens[j]}" (future)`;
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }

  tableWrap.appendChild(table);
  container.appendChild(tableWrap);

  const legend = document.createElement('div');
  legend.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;';
  legend.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:0.65rem;color:var(--color-text-muted)">
      <div style="width:16px;height:16px;border-radius:3px;background:var(--color-primary)"></div> self-attention
    </div>
    <div style="display:flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:0.65rem;color:var(--color-text-muted)">
      <div style="width:16px;height:16px;border-radius:3px;background:oklch(0.9 0.06 40)"></div> can attend (past)
    </div>
    <div style="display:flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:0.65rem;color:var(--color-text-muted)">
      <div style="width:16px;height:16px;border-radius:3px;background:var(--color-surface-offset)"></div> masked (-∞ → 0 after softmax)
    </div>
  `;
  container.appendChild(legend);
}

// Multi-head visualization
function buildMultiheadViz() {
  const container = document.getElementById('multihead-viz');
  if (!container || container.dataset.built) return;
  container.dataset.built = '1';

  const H = 4; // show 4 heads for legibility
  const headColors = ['#7c3aed', '#b45309', '#0369a1', '#065f46'];
  const headLabels = ['Syntactic', 'Co-reference', 'Semantic', 'Positional'];

  const title = document.createElement('div');
  title.textContent = 'Multi-Head Attention (h=4 shown)';
  title.style.cssText = 'font-family:var(--font-mono);font-size:0.65rem;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:20px;';
  container.appendChild(title);

  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:16px;max-width:640px;';

  headColors.forEach((color, i) => {
    const card = document.createElement('div');
    card.style.cssText = `border:1.5px solid ${color};border-radius:8px;padding:14px;background:var(--color-surface-2);`;

    const hdr = document.createElement('div');
    hdr.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;';
    hdr.innerHTML = `
      <div style="width:22px;height:22px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:0.6rem;font-weight:800;color:#fff">${i+1}</div>
      <span style="font-family:var(--font-display);font-size:0.85rem;font-weight:700;color:var(--color-text)">Head ${i+1}</span>
      <span style="font-family:var(--font-mono);font-size:0.6rem;color:var(--color-text-muted)">${headLabels[i]}</span>
    `;
    card.appendChild(hdr);

    // Mini attention heatmap (2x4)
    const tokens = ['The', 'cat', 'sat'];
    const miniScores = Array.from({length: 3}, (_, ri) =>
      Array.from({length: 3}, (_, ci) => {
        // Different pattern per head
        if (i === 0) return ri === ci ? 0.7 : 0.15; // diagonal (syntactic)
        if (i === 1) return ci === 0 ? 0.6 : 0.2; // attend to first (co-ref)
        if (i === 2) return Math.random() * 0.4 + (ri === ci ? 0.3 : 0.1); // mixed
        return 1 / 3; // uniform
      })
    );

    // Normalize rows
    miniScores.forEach(row => {
      const sum = row.reduce((a, b) => a + b, 0);
      row.forEach((_, j) => row[j] /= sum);
    });

    const matrixWrap = document.createElement('div');
    matrixWrap.style.cssText = 'display:grid;grid-template-columns:auto repeat(3,1fr);gap:2px;';

    // Header
    const cornerEmpty = document.createElement('div');
    matrixWrap.appendChild(cornerEmpty);
    tokens.forEach(tok => {
      const th = document.createElement('div');
      th.textContent = tok;
      th.style.cssText = 'font-family:var(--font-mono);font-size:0.55rem;color:var(--color-text-muted);text-align:center;padding-bottom:2px;';
      matrixWrap.appendChild(th);
    });

    miniScores.forEach((row, ri) => {
      const lbl = document.createElement('div');
      lbl.textContent = tokens[ri];
      lbl.style.cssText = 'font-family:var(--font-mono);font-size:0.55rem;color:var(--color-text-muted);text-align:right;padding-right:4px;align-self:center;';
      matrixWrap.appendChild(lbl);

      row.forEach(w => {
        const cell = document.createElement('div');
        cell.style.cssText = `
          height:22px;border-radius:3px;
          background:${color};opacity:${0.1 + w * 0.9};
          display:flex;align-items:center;justify-content:center;
          font-family:var(--font-mono);font-size:0.55rem;
          color:${w > 0.4 ? '#fff' : 'transparent'};font-weight:600;
        `;
        cell.textContent = w.toFixed(2);
        matrixWrap.appendChild(cell);
      });
    });

    card.appendChild(matrixWrap);

    const dkInfo = document.createElement('div');
    dkInfo.textContent = `d_k = 64  |  W_Q, W_K, W_V ∈ ℝ^(512×64)`;
    dkInfo.style.cssText = 'font-family:var(--font-mono);font-size:0.6rem;color:var(--color-text-faint);margin-top:10px;padding-top:8px;border-top:1px solid var(--color-divider);';
    card.appendChild(dkInfo);

    grid.appendChild(card);
  });

  container.appendChild(grid);

  const concat = document.createElement('div');
  concat.style.cssText = 'margin-top:20px;padding:12px 16px;background:var(--color-surface-offset);border-radius:8px;border:1px solid var(--color-border);';
  concat.innerHTML = `
    <div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--color-text-muted);margin-bottom:6px;">OUTPUT PROJECTION</div>
    <div style="font-family:var(--font-mono);font-size:0.75rem;color:var(--color-text)">
      Concat[head₁, head₂, ..., head_h] → W_O → output (B, T, d_model)
    </div>
  `;
  container.appendChild(concat);
}

// ============================================
// SCROLL REVEAL
// ============================================
const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => observer.observe(el));

// ============================================
// TABLE OF CONTENTS — ACTIVE LINK
// ============================================
const sections = document.querySelectorAll('.content-section');
const tocLinks = document.querySelectorAll('.toc-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      tocLinks.forEach(link => {
        const href = link.getAttribute('href').slice(1);
        link.classList.toggle('active', href === id);
      });
    }
  });
}, { threshold: 0.5 });

sections.forEach(s => sectionObserver.observe(s));

// ============================================
// HEADER SCROLL BEHAVIOR
// ============================================
const header = document.querySelector('.site-header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  if (scrollY > lastScroll && scrollY > 80) {
    header.style.transform = 'translateY(-100%)';
  } else {
    header.style.transform = 'translateY(0)';
  }
  if (scrollY > 10) {
    header.style.boxShadow = 'var(--shadow-md)';
  } else {
    header.style.boxShadow = 'none';
  }
  lastScroll = scrollY;
}, { passive: true });

// ============================================
// ANIMATED SPEEDUP COUNTER (stage 4)
// ============================================
function animateSpeedup() {
  const el = document.getElementById('speedup-val');
  const bar = document.getElementById('speedup-bar');
  if (!el || el.dataset.animated) return;
  el.dataset.animated = '1';
  let v = 1;
  const target = 32;
  const duration = 1200;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    v = 1 + (target - 1) * eased;
    el.textContent = `${Math.round(v)}×`;
    if (bar) bar.style.width = `${(v / target) * 100}%`;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Watch for stage 4 becoming active
const stage4 = document.getElementById('stage-4');
if (stage4) {
  new MutationObserver(() => {
    if (stage4.classList.contains('active')) animateSpeedup();
  }).observe(stage4, { attributes: true });
}

// ============================================
// INIT
// ============================================
setStage(0);
