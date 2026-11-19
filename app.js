/* ================= 数据与状态 ================= */
let P, CATS, byId;
const CHAPTERS = {
  jifen: { name: '一元积分', total: 185, data: window.QB, storeKey: 'jifen_card_progress_v1',
           hero: '积分计算核心题库', sub: '7 大题型 · 46 个做题模板 · 每题含题干、详解与手写批注。先想后看，按模板总结套路。' },
  weifen: { name: '一元微分', total: 140, data: window.QB_DIFF, storeKey: 'weifen_card_progress_v1',
            hero: '一元微分核心题库', sub: '4 大板块 · 导数概念/计算/应用 · 匹配知识点 PDF 页码，先回忆再做题。' },
  c2: { name: '积分应用', total: 57, data: window.QB_DG.c2, storeKey: 'dg_c2_v1',
        hero: '积分应用（大观严选）', sub: '几何应用 · 物理应用 · 每题含题干与详解。', method: null },
  c3: { name: '反常积分审敛', total: 12, data: window.QB_DG.c3, storeKey: 'dg_c3_v1',
        hero: '反常积分审敛（大观严选）', sub: '审敛 · 敛散性与参数的关系。', method: null },
  c4: { name: '其他积分题型', total: 21, data: window.QB_DG.c4, storeKey: 'dg_c4_v1',
        hero: '其他积分题型（大观严选）', sub: '几何意义 · 三大定理 · 比大小 · 变限积分。', method: null },
  d: { name: '多元微分', total: 68, data: window.QB_DG.d, storeKey: 'dg_d_v1',
       hero: '多元微分（大观严选）', sub: '概念 · 重极限 · 偏导数 · 极值最值。', method: null },
  e: { name: '二重积分', total: 59, data: window.QB_DG.e, storeKey: 'dg_e_v1',
       hero: '二重积分（大观严选）', sub: '直角坐标 · 极坐标 · 分段函数 · 交换次序。', method: null },
  f: { name: '微分方程', total: 93, data: window.QB_DG.f, storeKey: 'dg_f_v1',
       hero: '微分方程（大观严选）', sub: '解的结构 · 求解 · 逆问题 · 解的处理 · 各种给式。', method: null },
  g: { name: '级数', total: 142, data: window.QB_DG.g, storeKey: 'dg_g_v1',
       hero: '级数（大观严选）', sub: '数项级数 · 幂级数收敛域/求和/展开 · 傅里叶。', method: null },
  la: { name: '线代', total: 337, data: window.QB_LA.la, storeKey: 'la_v1',
        hero: '线代臻选题（答案书）', sub: '行列式 · 矩阵 · 向量 · 方程组 · 特征值 · 二次型 · 数一专项。', method: null }
};
let currentChapter = 'jifen';
window.currentChapter = currentChapter;
let progress = {};

const state = {
  view: 'home',
  filterPath: null,
  keyword: '',
  queue: [],
  pos: 0,
  shuffled: false
};

function switchChapter(ch) {
  currentChapter = ch;
  window.currentChapter = ch;
  const chData = CHAPTERS[ch];
  P = chData.data.problems;
  CATS = chData.data.cats;
  byId = {};
  P.forEach(p => byId[p.id] = p);
  try { progress = JSON.parse(localStorage.getItem(chData.storeKey) || '{}'); } catch (e) { progress = {}; }
  state.filterPath = null;
  state.keyword = '';
  state.queue = [];
  state.pos = 0;
  state.shuffled = false;
}
function saveProgress() { localStorage.setItem(CHAPTERS[currentChapter].storeKey, JSON.stringify(progress)); }

// 默认积分
switchChapter('jifen');

const LETTER_COLORS = {
  A: '#4263eb', B: '#e8590c', C: '#0ca678', D: '#9c36b5',
  E: '#1098ad', F: '#f08c00', G: '#e03131',
  '1': '#4263eb', '2': '#0ca678', '3': '#e8590c'
};

/* ================= 工具 ================= */
const $ = s => document.querySelector(s);
// Unicode 数学记号 → KaTeX 印刷体（mathfmt.js 先于本文件加载）；无模块时退化为转义文本
const MF = t => window.mathFmt
  ? window.mathFmt(t == null ? '' : String(t))
  : String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function letterOf(cat) {
  const s = Array.isArray(cat) ? (cat[0] || '') : (cat || '');
  return s.match(/^([A-G]|\d)\./)?.[1] || '?';
}
function nodeProblems(node) {
  const out = [];
  (function walk(n) {
    if (n.pid) out.push(byId[n.pid]);
    (n.kids || []).forEach(walk);
  })(node);
  return out;
}
function countLeaves(node) {
  if (node.pid) return 1;
  return (node.kids || []).reduce((s, c) => s + countLeaves(c), 0);
}
function findNode(path) {
  let kids = CATS, node = null;
  for (const seg of path) {
    node = kids.find(k => k.t === seg);
    if (!node) return null;
    kids = node.kids || [];
  }
  return node;
}
function filteredProblems() {
  let list = P;
  if (!state.keyword && state.filterPath) {
    const path = state.filterPath;
    list = list.filter(p => path.every((seg, i) => p.cat[i] === seg));
  }
  const kw = state.keyword.trim().toLowerCase();
  if (kw) {
    list = list.filter(p => {
      const hay = (p.title + ' ' + (p.prefix || '') + ' ' + p.cat.join(' ') + ' p' + p.page).toLowerCase();
      return hay.includes(kw);
    });
  }
  return list;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ================= 侧边栏 ================= */
function buildSidebar() {
  const root = $('#catTree');
  root.innerHTML = '';
  CATS.forEach(cat => root.appendChild(renderNode(cat, [])));
}
function renderNode(node, path) {
  const selfPath = path.concat(node.t);
  const wrap = document.createElement('div');
  wrap.className = 't-node';
  const hasKids = (node.kids || []).length > 0;
  const n = countLeaves(node);
  const row = document.createElement('button');
  row.className = 't-row';
  const letter = selfPath.length === 1 ? letterOf(selfPath) : null;
  row.innerHTML =
    (hasKids ? '<span class="t-caret">▼</span>' : '<span class="t-caret"></span>') +
    (letter ? `<span class="t-letter" style="background:${LETTER_COLORS[letter]};color:#fff">${letter}</span>`
            : '<span class="t-dot" style="background:#c8cde0"></span>') +
    `<span class="t-name">${node.t.replace(/^[A-G]\.\s*/, '')}</span>` +
    `<span class="t-count">${n}</span>`;
  row.addEventListener('click', () => {
    state.keyword = '';
    $('#searchInput').value = '';
    state.shuffled = false; $('#shuffleBtn').classList.remove('on');
    if (node.pid) {
      // 叶子（具体题目）：以上一级分类为队列，直接进入该题
      state.filterPath = selfPath.slice(0, -1);
      startStudy(node.pid);
    } else {
      state.filterPath = selfPath;
      showView('grid');
    }
    if (window.innerWidth <= 900) $('#sidebar').classList.remove('open');
  });
  wrap.appendChild(row);
  if (hasKids) {
    const childBox = document.createElement('div');
    childBox.className = 't-children';
    node.kids.forEach(k => childBox.appendChild(renderNode(k, selfPath)));
    wrap.appendChild(childBox);
    if (selfPath.length >= 2) wrap.classList.add('collapsed');
  }
  return wrap;
}
function highlightSidebar() {
  document.querySelectorAll('#catTree .t-row').forEach(r => r.classList.remove('active'));
  if (!state.filterPath || state.view === 'home') return;
  // 按路径顺序依次展开父节点并高亮当前节点
  let path = state.filterPath.slice();
  let container = $('#catTree');
  let acc = [];
  for (const seg of path) {
    acc.push(seg);
    const target = Array.from(container.children).find(ch => {
      const nm = ch.querySelector('.t-name').textContent;
      return nm === seg.replace(/^[A-G]\.\s*/, '');
    });
    if (!target) break;
    target.classList.remove('collapsed');
    if (acc.length === path.length) target.querySelector('.t-row').classList.add('active');
    container = target.querySelector('.t-children') || container;
  }
}

/* ================= 首页 ================= */
function masteryStats() {
  let k = 0, w = 0;
  P.forEach(p => {
    if (progress[p.id] === 2) k++;
    else if (progress[p.id] === 1) w++;
  });
  return { total: P.length, know: k, weak: w, fresh: P.length - k - w };
}
function renderHome() {
  // 章节标题
  const ch = CHAPTERS[currentChapter];
  $('#heroTitle').innerHTML = `${ch.hero || ch.name} <span class="hero-badge">卡片复习</span>`;
  $('#heroSub').textContent = ch.sub || '';
  document.querySelectorAll('.ch-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.ch === currentChapter));

  const s = masteryStats();
  const pct = Math.round(s.know / s.total * 100);
  $('#heroStats').innerHTML = `
    <div class="hstat"><span class="num">${s.total}</span><span class="lab">题库总题数</span></div>
    <div class="hstat"><span class="num">${s.know}</span><span class="lab">已掌握</span></div>
    <div class="hstat"><span class="num">${s.weak}</span><span class="lab">标记模糊</span></div>
    <div class="hstat"><span class="num">${pct}%</span><span class="lab">掌握进度</span></div>`;

  const m = ch.method !== undefined ? ch.method
    : (currentChapter === 'weifen' ? window.METHOD_INTRO_DIFF : window.METHOD_INTRO);
  $('#methodCard').style.display = m ? '' : 'none';
  if (m) $('#methodCard').innerHTML = `
    <h3>🧭 ${m.title}</h3>
    <div class="method-flow">
      ${m.flow.map((t, i) => `<div class="flow-step"><b>第 ${['一', '二', '三'][i] || (i + 1)} 步</b><span>${MF(t)}</span></div>`).join('')}
    </div>
    <div class="method-toolkit">
      ${m.toolkit.map(t => `<div class="toolkit-item">${MF(t)}</div>`).join('')}
    </div>`;

  $('#catGrid').innerHTML = CATS.map(cat => {
    const letter = letterOf(cat.t);
    const subs = (cat.kids || []).map(k => k.t.replace(/^\d+\.\s*/, '')).slice(0, 6);
    const n = countLeaves(cat);
    return `
      <button class="cat-tile" data-path="${encodeURIComponent(cat.t)}">
        <div class="cat-tile-top">
          <span class="cat-tile-letter" style="background:${LETTER_COLORS[letter]}">${letter}</span>
          <span class="cat-tile-name">${cat.t.replace(/^[A-G]\.\s*/, '')}</span>
        </div>
        <div class="cat-tile-meta">${n} 题 · ${(cat.kids || []).length} 个题型</div>
        <div class="cat-tile-subs">${subs.map(s => `<span class="mini-tag">${s}</span>`).join('')}</div>
      </button>`;
  }).join('');
  $('#catGrid').querySelectorAll('.cat-tile').forEach(btn => {
    btn.addEventListener('click', () => {
      state.filterPath = [decodeURIComponent(btn.dataset.path)];
      state.keyword = ''; $('#searchInput').value = '';
      showView('grid');
    });
  });
}

/* ================= 网格浏览 ================= */
function renderGrid() {
  const list = filteredProblems();
  const chips = $('#filterChips');
  const path = state.keyword ? ['搜索：' + state.keyword] : (state.filterPath || ['全部题目']);
  chips.innerHTML = path.map((seg, i) => {
    const last = i === path.length - 1;
    return `<button class="chip ${last ? 'active' : ''}" data-i="${i}">${seg.replace(/^[A-G]\.\s*/, '')}${last ? '' : '　›'}</button>`;
  }).join('');
  chips.querySelectorAll('.chip').forEach(c => {
    c.addEventListener('click', () => {
      if (state.keyword) { state.keyword = ''; $('#searchInput').value = ''; renderGrid(); return; }
      const i = +c.dataset.i;
      state.filterPath = i === 0 ? null : state.filterPath.slice(0, i + 1);
      renderGrid();
    });
  });

  const grid = $('#cardGrid');
  if (!list.length) {
    grid.innerHTML = '<div class="empty-tip">没有匹配的题目，换个关键词试试～</div>';
    return;
  }
  grid.innerHTML = list.map(p => {
    const st = progress[p.id];
    const letter = letterOf(p.cat);
    const sub = p.cat.slice(1).map(s => s.replace(/^[a-z]\)\s*/, '')).join(' / ');
    return `
      <button class="p-tile" data-id="${p.id}">
        <div class="p-tile-thumb"><img loading="lazy" src="${p.q}" alt=""></div>
        <div class="p-tile-body">
          <div class="p-tile-title">${(p.prefix ? p.prefix + ' ' : '')}${p.title}</div>
          <div class="p-tile-sub">${sub}</div>
          <div class="p-tile-foot">
            <span class="p-tile-idx">
              <span style="color:${LETTER_COLORS[letter]};font-weight:700">${letter}</span>
              · 第 ${p.page} 页
            </span>
            ${st === 1 ? '<span class="mini-state s1">模糊</span>' : st === 2 ? '<span class="mini-state s2">掌握</span>' : ''}
          </div>
        </div>
      </button>`;
  }).join('');
  grid.querySelectorAll('.p-tile').forEach(t => {
    t.addEventListener('click', () => startStudy(t.dataset.id));
  });
}

/* ================= 卡片复习 ================= */
function startStudy(id) {
  let list = filteredProblems();
  if (!state.keyword && state.shuffled) list = shuffle(list);
  state.queue = list.map(p => p.id);
  const idx = state.queue.findIndex(q => String(q) === String(id));
  state.pos = idx < 0 ? 0 : idx;
  showView('study');
}
function startQueue(ids, pos0) {
  state.queue = ids.slice();
  state.pos = pos0 || 0;
  showView('study');
}
function curProblem() { return byId[state.queue[state.pos]]; }

/* 左列「完整解题过程」按行渲染：按逗号/句号断行，一步一行不合并 */
function stepLeft(text) {
  const s = String(text ?? '').trim();
  if (!s) return '';
  const lines = s.split(/(?<=[。；!?？；，])/).map(t => t.trim()).filter(t => t);
  return lines.map(line => `<div class="wk-line">${MF(line)}</div>`).join('');
}

/* 右列解析文本：按行解析标记段（原理/心理/陷阱/自检/考点） */
function walkRight(text) {
  const simpleTags = [
    [/^原理[：:]\s*/, 'wk-why', '原理'],
    [/^心理[：:]\s*/, 'wk-mind', '💭 心理'],
    [/^陷阱[：:]\s*/, 'wk-trap', '⚠️ 陷阱'],
    [/^自检[：:]\s*/, 'wk-check', '✓ 自检']
  ];
  return text.split('\n').filter(s => s.trim()).map(line => {
    const km = line.match(/^考点\s*([①-⑳⓪]*)\s*[：:]\s*(.*)$/);
    if (km) return `<div class="wk-line wk-kp"><span class="wk-lab">考点${km[1]}</span><span class="wk-txt">${MF(km[2])}</span></div>`;
    for (const [re, cls, lab] of simpleTags) {
      if (re.test(line)) {
        return `<div class="wk-line ${cls}"><span class="wk-lab">${lab}</span><span class="wk-txt">${MF(line.replace(re, ''))}</span></div>`;
      }
    }
    return `<div class="wk-line">${MF(line)}</div>`;
  }).join('');
}

/* 考生真实做题过程（固定表格结构）；无 walk 字段时逐级回退 */
function renderThink(id) {
  const ref = $('#thinkRef');
  const el = $('#thinkCard');
  // 原两章读 ANALYSIS，大观严选章节读 ANALYSIS_DG，线代读 ANALYSIS_LA
  const src = (currentChapter === 'jifen' || currentChapter === 'weifen')
    ? window.ANALYSIS
    : (currentChapter === 'la'
      ? (window.ANALYSIS_LA && window.ANALYSIS_LA)
      : (window.ANALYSIS_DG && window.ANALYSIS_DG[currentChapter]));
  const a = src && src[id];
  ref.removeAttribute('open');
  if (!a) { ref.classList.add('hidden'); el.innerHTML = ''; return; }
  ref.classList.remove('hidden');

  if (a.walk && Array.isArray(a.walk.steps) && a.walk.steps.length) {
    const w = a.walk;
    const circ = n => ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫','⑬','⑭','⑮'][n] || `(${n+1})`;
    el.innerHTML = `
      <div class="think-answer">最后答案：<b>${MF(a.answer || '')}</b></div>
      <div class="wk-banner">题目深度解析区</div>
      <div class="wk-analyze">
        <div class="wka-block">
          <div class="wka-h">✅ 解题突破口（初期猜想）</div>
          <div class="wka-b">${MF(w.breakthrough)}</div>
        </div>
        <div class="wka-block">
          <div class="wka-h">✅ 已知条件（题干 → 数学条件）</div>
          <ul class="wka-list">${(w.conditions || []).map(c => `<li>${MF(c)}</li>`).join('')}</ul>
        </div>
        <div class="wka-block">
          <div class="wka-h">✅ 知识点 &amp; 考研考点清单</div>
          <ul class="wka-list wka-kps">${(w.kps || []).map((k, i) => `<li><b class="kp-no">${circ(i)}</b>${MF(k)}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="wk-grid">
        <div class="wk-col-head wk-left-head">完整解题过程（不跳步）</div>
        <div class="wk-col-head wk-right-head">知识点匹配与步骤解析</div>
        ${w.steps.map((s, i) => `
          <div class="wk-cell wk-left"><span class="step-no">${i + 1}</span><div class="step-l">${stepLeft(s.l)}</div></div>
          <div class="wk-cell wk-right">${walkRight(s.r)}</div>`).join('')}
      </div>
      <div class="wk-summary">
        <div class="wks-block wks-avoid">
          <div class="wks-h">【避坑清单】本题专属易错点</div>
          <ul>${(w.avoid || []).map(x => `<li>${MF(x)}</li>`).join('')}</ul>
        </div>
        <div class="wks-block wks-generic">
          <div class="wks-h">【通用模板】同类题标准流程</div>
          <div class="wks-b">${MF(w.generic || '')}</div>
        </div>
      </div>`;
  } else if (Array.isArray(a.think) && a.think.length) {
    el.innerHTML = `
      <div class="think-legacy-note">该题暂用时间线版思路，双栏表格版待重录</div>
      <div class="think-answer">最后答案：<b>${MF(a.answer || '')}</b></div>
      <ol class="think-flow">
        ${a.think.map(s => `<li><span class="tf-phase">${MF(s.phase)}</span><div class="tf-text">${MF(s.text)}</div></li>`).join('')}
      </ol>
      ${a.recap ? `<div class="think-recap"><span class="tr-kicker">一句话复盘</span><div>${MF(a.recap)}</div></div>` : ''}`;
  } else {
    const routeTag = t => t === '秒杀' ? 'ana-tag kill' : t === '技巧' ? 'ana-tag skill' : 'ana-tag';
    el.innerHTML = `
      <div class="think-legacy-note">以下为旧版结构化剖析，新版「真实做题思路」待重录</div>
      <div class="ana-answer">答：<b>${MF(a.answer)}</b></div>
      <div class="ana-sec ana-examine">
        <h4><span class="ico">审</span>审题 · 条件转化</h4>
        <ul>${(a.examine || []).map(x => `<li><div class="ex-cond">${MF(x.cond)}</div><div class="ex-trans">→ ${MF(x.trans)}</div></li>`).join('')}</ul>
      </div>
      <div class="ana-sec ana-knowledge">
        <h4><span class="ico">串</span>知识点串讲（本题专用）</h4>
        ${(a.knowledge || []).map(x => `<div class="kn-item"><div class="kn-point">${MF(x.point)}</div><div class="kn-detail">${MF(x.detail)}</div></div>`).join('')}
      </div>
      <div class="ana-sec ana-routes">
        <h4><span class="ico">路</span>解题路线</h4>
        ${(a.routes || []).map(r => `<div class="rt-item"><div class="rt-head"><span class="${routeTag(r.tag)}">${r.tag}</span><span class="rt-name">${MF(r.name)}</span></div><div class="rt-body">${MF(r.body)}</div></div>`).join('')}
      </div>
      <div class="ana-sec ana-pitfalls">
        <h4><span class="ico">坑</span>易错提醒</h4>
        <ul>${(a.pitfalls || []).map(x => `<li>${MF(x)}</li>`).join('')}</ul>
      </div>
      <div class="ana-sec ana-extend">
        <h4><span class="ico">迁</span>迁移拓展 · 卡壳自救</h4>
        <div class="extend-body">${MF(a.extend || '')}</div>
      </div>`;
  }
}

function renderCard() {
  const p = curProblem();
  if (!p) return;
  const cat = p.cat;
  const letter = letterOf(cat);

  // 面包屑
  $('#crumb').innerHTML =
    cat.map((s, i) => `<b>${s}</b>${i < cat.length - 1 ? '<span class="sep">/</span>' : ''}`).join('');

  // 标签
  $('#qTags').innerHTML =
    `<span class="q-tag" style="background:${LETTER_COLORS[letter]}1f;color:${LETTER_COLORS[letter]}">${cat[0]}</span>` +
    cat.slice(1).map(s => `<span class="q-tag lvl">${s}</span>`).join('');

  const st = progress[p.id] || 0;
  $('#stateBadge').className = 'state-badge' + (st ? ' s' + st : '');
  $('#stateBadge').textContent = st === 1 ? '🔖 模糊' : st === 2 ? '✓ 已掌握' : '';
  $('#weakBtn').classList.toggle('on', st === 1);
  $('#knowBtn').classList.toggle('on', st === 2);

  $('#qTitle').textContent = (p.prefix ? p.prefix + ' ' : '') + p.title;

  // 题干：优先原书切图；无图时才用文字题干（qtext）兜底
  const qTextEl = $('#qText');
  const qImgEl = $('#qImg');
  if (p.q) {
    qTextEl.classList.add('hidden');
    qImgEl.classList.remove('hidden');
    qImgEl.classList.toggle('qa', String(p.q).indexOf('assets/la/') === 0);
    qImgEl.src = p.q;
  } else {
    qImgEl.classList.add('hidden');
    qTextEl.classList.remove('hidden');
    qTextEl.innerHTML = MF(p.qtext || '');
  }

  // 考生真实思路（独立折叠面板）
  renderThink(p.id);

  // 参考答案与手写批注（独立折叠版块）
  $('#answerImgs').innerHTML =
    p.a.map(src => `<img class="math-img" loading="lazy" src="${src}" alt="解答">`).join('');

  // 做题模板（独立折叠版块，排在最前）
  const tpl = window.findTemplate(cat);
  $('#tplFold').classList.toggle('hidden', !tpl);
  if (tpl) {
    const theoremHtml = Array.isArray(tpl.theorems) && tpl.theorems.length ? `
        <div class="tpl-sec sec-theorem">
          <h4><span class="ico">理</span>权威定理 · 核心公式</h4>
          ${tpl.theorems.map(s => `
            <div class="thm-block">
              <div class="thm-h">${MF(s.name)}</div>
              <div class="thm-stmt">${(s.stmt || '').split('\n').filter(Boolean).map(line => `<p>${MF(line)}</p>`).join('')}</div>
            </div>`).join('')}
        </div>` : '';
    const cueHtml = tpl.cue ? `
        <div class="tpl-sec sec-cue">
          <h4><span class="ico">题</span>点题 · 什么时候用、怎么用</h4>
          <div class="cue-body">${MF(tpl.cue)}</div>
        </div>` : '';
    $('#tplCard').innerHTML = `
      <div class="tpl-head">
        <div class="tpl-kicker">题型做题模板 · TEMPLATE</div>
        <div class="tpl-title">${tpl.title}</div>
      </div>
      <div class="tpl-body">
        ${theoremHtml}
        ${cueHtml}
        <div class="tpl-sec sec-recognize">
          <h4><span class="ico">识</span>题型识别</h4>
          <ul>${tpl.recognize.map(x => `<li>${MF(x)}</li>`).join('')}</ul>
        </div>
        <div class="tpl-sec sec-idea">
          <h4><span class="ico">路</span>核心思路</h4>
          <div class="tpl-idea">${MF(tpl.idea)}</div>
        </div>
        <div class="tpl-sec sec-steps">
          <h4><span class="ico">步</span>解题步骤（做题模板）</h4>
          <ul>${tpl.steps.map((x, i) => `<li><b style="color:#1c7ed6">${i + 1}.</b> ${MF(x)}</li>`).join('')}</ul>
        </div>
        <div class="tpl-sec sec-skills">
          <h4><span class="ico">巧</span>化简技巧 · 命题眼</h4>
          <ul>${tpl.skills.map(x => `<li>${MF(x)}</li>`).join('')}</ul>
        </div>
        <div class="tpl-sec sec-formulas">
          <h4><span class="ico">式</span>核心公式 · 知识点</h4>
          <ul class="tpl-formulas">${tpl.formulas.map(x => `<li>${MF(x)}</li>`).join('')}</ul>
        </div>
        <div class="tpl-sec sec-pitfalls">
          <h4><span class="ico">坑</span>易错提醒</h4>
          <ul>${tpl.pitfalls.map(x => `<li>${MF(x)}</li>`).join('')}</ul>
        </div>
      </div>`;
  } else {
    $('#tplCard').innerHTML = '';
  }

  // 每题重置：三个子版块默认收起，先想后看，按需单独展开
  $('#tplFold').open = false;
  $('#ansFold').open = false;
  $('#posText').textContent = `${state.pos + 1} / ${state.queue.length}`;
  $('#progressFill').style.width = ((state.pos + 1) / state.queue.length * 100) + '%';
  window.scrollTo({ top: 0 });
}
function mark(st) {
  const p = curProblem();
  progress[p.id] = progress[p.id] === st ? 0 : st;
  saveProgress();
  renderCard();
}
function move(d) {
  if (!state.queue.length) return;
  state.pos = (state.pos + d + state.queue.length) % state.queue.length;
  renderCard();
}

/* ================= 视图切换 ================= */
function showView(v) {
  state.view = v;
  $('#homeView').classList.toggle('hidden', v !== 'home');
  $('#gridView').classList.toggle('hidden', v !== 'grid');
  $('#studyView').classList.toggle('hidden', v !== 'study');
  $('#sidebar').classList.remove('open');
  if (v === 'home') {
    $('#crumb').innerHTML = '<b>复习导览</b>';
    renderHome();
  } else if (v === 'grid') {
    renderGrid();
    $('#crumb').innerHTML = state.filterPath
      ? state.filterPath.map((s, i) => `<b>${s}</b>`).join('<span class="sep">/</span>')
      : '<b>全部题目</b>';
  } else if (v === 'study') {
    renderCard();
  }
  highlightSidebar();
}

/* ================= 事件 ================= */
$('#homeBtn').addEventListener('click', () => showView('home'));
// 章节切换
document.querySelectorAll('.ch-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    switchChapter(btn.dataset.ch);
    buildSidebar();
    renderHome();
    showView('home');
  });
});
$('#crumb').addEventListener('click', () => {
  if (state.view === 'study') showView('grid');
});
$('#crumb').style.cursor = 'pointer';
$('#crumb').title = '返回题目列表';
$('#menuToggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
$('#prevBtn').addEventListener('click', () => move(-1));
$('#nextBtn').addEventListener('click', () => move(1));
$('#weakBtn').addEventListener('click', () => mark(1));
$('#knowBtn').addEventListener('click', () => {
  const p = curProblem();
  progress[p.id] = progress[p.id] === 2 ? 0 : 2;
  saveProgress(); renderCard();
});
$('#startAllBtn').addEventListener('click', () => {
  state.filterPath = null; state.keyword = ''; $('#searchInput').value = '';
  state.shuffled = false; $('#shuffleBtn').classList.remove('on');
  startQueue(P.map(p => p.id), 0);
});
$('#continueBtn').addEventListener('click', () => {
  const first = P.findIndex(p => progress[p.id] !== 2);
  startQueue(P.map(p => p.id), first < 0 ? 0 : first);
});
$('#reviewWeakBtn').addEventListener('click', () => {
  const ids = P.filter(p => progress[p.id] === 1).map(p => p.id);
  if (!ids.length) { alert('还没有标记「模糊」的题目，刷题时点「🔖 标记模糊」即可收集到这里。'); return; }
  startQueue(ids, 0);
});
$('#shuffleBtn').addEventListener('click', () => {
  state.shuffled = !state.shuffled;
  $('#shuffleBtn').classList.toggle('on', state.shuffled);
  if (state.view === 'study') {
    const curId = state.queue[state.pos];
    let list = filteredProblems();
    list = state.shuffled ? shuffle(list) : list;
    state.queue = list.map(p => p.id);
    state.pos = Math.max(0, state.queue.indexOf(curId));
    renderCard();
  }
});
$('#searchInput').addEventListener('input', e => {
  state.keyword = e.target.value;
  if (state.view !== 'grid') showView('grid');
  else renderGrid();
});
document.addEventListener('keydown', e => {
  if (state.view !== 'study') return;
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'ArrowLeft') move(-1);
  else if (e.key === 'ArrowRight') move(1);
  else if (e.key === ' ') {
    e.preventDefault();
    const r = $('#thinkRef');
    if (!r.classList.contains('hidden')) r.open = !r.open;
  }
  else if (e.key === '1') mark(1);
  else if (e.key === '2') {
    const p = curProblem();
    progress[p.id] = progress[p.id] === 2 ? 0 : 2;
    saveProgress(); renderCard();
  }
});
// 图片放大（事件委托：题干、解答、知识点图片）
document.addEventListener('click', e => {
  if (e.target.classList && (e.target.classList.contains('math-img') || e.target.classList.contains('kp-img'))) {
    $('#lightboxImg').src = e.target.src;
    $('#lightbox').classList.remove('hidden');
  }
});
$('#lightbox').addEventListener('click', () => $('#lightbox').classList.add('hidden'));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') $('#lightbox').classList.add('hidden');
});

/* ================= 启动 ================= */
buildSidebar();
showView('home');
