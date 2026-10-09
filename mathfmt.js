/* ============================================================
 * mathfmt.js —— Unicode 数学文本 → KaTeX 印刷体公式
 * 数据中的公式全部是 Unicode 记号（x²、∛(1+x)、∫₀^∞、a/b、π/4），
 * 本模块在渲染时自动：切出数学片段 → 转 LaTeX → KaTeX 排版。
 * 对外：window.mathFmt(text) -> 安全 HTML
 *      window.mathFmt._convert(run) -> TeX 字符串（供离线校验）
 * ============================================================ */
(function (root, factory) {
  var mod = factory(root.katex);
  root.mathFmt = mod.mathFmt;
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
})(typeof window !== 'undefined' ? window : globalThis, function (katex) {
  'use strict';

  /* ---------- 上标 / 下标字符解码 ---------- */
  var SUPER_PAIRS =
    '⁰0¹1²2³3⁴4⁵5⁶6⁷7⁸8⁹9⁺+⁻-⁼=⁽(⁾)ⁿn' +
    'ᵃaᵇbᶜcᵈdᵉeᶠfᵍgʰhⁱiʲjᵏkˡlᵐmⁿnᵒoᵖpʳrˢsᵗtᵘuᵛvʷwˣxʸyᶻz' +
    'ᵅαᵝβᵟδᵠφᵡχᵀT';
  var SUB_PAIRS =
    '₀0₁1₂2₃3₄4₅5₆6₇7₈8₉9₊+₋-₌=₍(₎)' +
    'ₐaₑeₒoₓxₔəₕhₖkₗlₘmₙnₚpₛsₜt' +
    'ᵦβᵧγᵨρᵩφᵪχⱼjᵢiᵤuᵥvᶜc';
  // 个别散落在其他区块的上标记号
  var SUPER_EXTRA = { 'ᐟ': '/' };

  function buildMap(pairs, extra) {
    var m = Object.assign({}, extra || {});
    for (var i = 0; i < pairs.length; i += 2) m[pairs[i]] = pairs[i + 1];
    return m;
  }
  var SUPER_MAP = buildMap(SUPER_PAIRS, SUPER_EXTRA);
  var SUB_MAP = buildMap(SUB_PAIRS);
  var SUPER_CHARS = Object.keys(SUPER_MAP).join('');
  var SUB_CHARS = Object.keys(SUB_MAP).join('');
  var SUPER_RE = new RegExp('[' + SUPER_CHARS + ']+', 'g');
  var SUB_RE = new RegExp('[' + SUB_CHARS + ']+', 'g');

  function decode(seq, map) {
    var out = '';
    for (var i = 0; i < seq.length; i++) {
      var ch = seq[i];
      if (map[ch] != null) out += map[ch];
      else {
        var d = ch.normalize('NFKD');
        out += /[\u0020-\u007E]/.test(d) ? d : ch;
      }
    }
    return out;
  }

  /* ---------- 逐字符符号表（上下标分组之后再用） ---------- */
  var SYM = {
    '−': '-', '×': '\\times', '÷': '\\div', '±': '\\pm', '∓': '\\mp',
    '≤': '\\le', '≥': '\\ge', '≠': '\\ne', '≈': '\\approx', '≡': '\\equiv', '∼': '\\sim',
    '∞': '\\infty', '∈': '\\in', '∉': '\\notin',
    '→': '\\to', '↔': '\\leftrightarrow', '⇒': '\\Rightarrow', '⇐': '\\Leftarrow',
    '⇔': '\\Leftrightarrow', '⟹': '\\Longrightarrow', '⟺': '\\Longleftrightarrow',
    '⇏': '\\not\\Rightarrow', '↦': '\\mapsto',
    '∴': '\\therefore', '∵': '\\because',
    '∪': '\\cup', '∩': '\\cap', '⊂': '\\subset', '⊆': '\\subseteq',
    '∀': '\\forall', '∃': '\\exists',
    '·': '\\cdot', '…': '\\cdots', '⋯': '\\cdots', '∂': '\\partial',
    '°': '^{\\circ}', '∶': ':',
    'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma', 'δ': '\\delta',
    'ε': '\\varepsilon', 'ϵ': '\\epsilon', 'ζ': '\\zeta', 'η': '\\eta',
    'θ': '\\theta', 'ι': '\\iota', 'κ': '\\kappa', 'λ': '\\lambda',
    'μ': '\\mu', 'ν': '\\nu', 'ξ': '\\xi', 'π': '\\pi',
    'ρ': '\\rho', 'σ': '\\sigma', 'τ': '\\tau', 'υ': '\\upsilon',
    'φ': '\\varphi', 'χ': '\\chi', 'ψ': '\\psi', 'ω': '\\omega',
    'Γ': '\\Gamma', 'Δ': '\\Delta', 'Θ': '\\Theta', 'Λ': '\\Lambda',
    'Ξ': '\\Xi', 'Π': '\\Pi', 'Φ': '\\Phi', 'Ψ': '\\Psi', 'Ω': '\\Omega',
    'ℝ': '\\mathbb{R}', 'ℤ': '\\mathbb{Z}', 'ℕ': '\\mathbb{N}',
    '□': '\\square', '∫': '\\int ', '∬': '\\iint ', '∮': '\\oint ',
    '∏': '\\prod ', 'Σ': '\\sum ',
    '√': '\uE000', '∛': '\uE001',   // 根号占位符，稍后按配对参数处理
    '½': '\\frac{1}{2}', '⅓': '\\frac{1}{3}', '¼': '\\frac{1}{4}',
    '¾': '\\frac{3}{4}', '⅔': '\\frac{2}{3}',
    '′': "''", '″': "''", '‴': "'''", '⁗': "''''", '‷': "'''",
    'ẋ': '\\dot{x}', 'ẍ': '\\ddot{x}', 'ẏ': '\\dot{y}', 'ÿ': '\\ddot{y}',
    'Ḡ': '\\bar{G}'
  };
  // 注意：′ 与 ″ 的映射在源码中是 1 / 2 个撇号
  SYM['′'] = "'"; SYM['″'] = "''"; SYM['‴'] = "'''"; SYM['⁗'] = "''''"; SYM['‷'] = "'''";
  var ROOT = '\uE000', CUBE = '\uE001';

  var FUNCTIONS = ['arctan', 'arcsin', 'arccos', 'sinh', 'cosh', 'tanh',
    'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
    'ln', 'log', 'exp', 'max', 'min', 'sup', 'inf', 'det'];

  /* ---------- 数学片段识别 ---------- */
  function isMathChar(ch) {
    var c = ch.codePointAt(0);
    if (c >= 0x20 && c <= 0x7e) return !'"$#@%&~'.includes(ch);
    if (c >= 0x4e00 && c <= 0x9fff) return false;          // CJK 汉字
    if (c >= 0x3000 && c <= 0x303f) return false;           // CJK 标点
    if (c >= 0xff00 && c <= 0xffef) return false;           // 全角字符
    if (ch === '‘' || ch === '’' || ch === '“' || ch === '”') return false;
    if (ch === '—' || ch === '–') return false;
    if (c >= 0x2460 && c <= 0x2473) return false;           // ①–⑳
    if (c >= 0x2160 && c <= 0x217f) return false;           // 罗马数字
    if (ch === '✓' || ch === '✗' || ch === '↑' || ch === '↓') return false;
    if (SUPER_MAP[ch] || SUB_MAP[ch]) return true;
    if (SYM[ch]) return true;
    if (c >= 0x370 && c <= 0x3ff) return true;              // 希腊字母
    if (c >= 0x1f00 && c <= 0x1fff) return true;            // 上标小写字母
    if (c >= 0x1d40 && c <= 0x1dbf) return true;            // 上/下标扩展
    if (c >= 0x2070 && c <= 0x209f) return true;
    if (c >= 0x2100 && c <= 0x214f) return true;
    if (c >= 0x2190 && c <= 0x22ff) return true;            // 箭头/数学算子
    if (c >= 0x27f0 && c <= 0x27ff) return true;            // ⟹ ⟺
    if (c === 0x25a1 || c === 0xb0 || c === 0x2c7c) return true;
    return false;
  }

  /* ---------- 小工具：括号配平 ---------- */
  function matchGroup(s, openIdx, open, close) {
    var depth = 0;
    for (var i = openIdx; i < s.length; i++) {
      if (s[i] === open) depth++;
      else if (s[i] === close) { depth--; if (depth === 0) return i; }
    }
    return -1;
  }

  /* ---------- 分式原子读取（向后 / 向前） ---------- */
  var TOKEN_RE = /[A-Za-z0-9.']/;
  var ARG_CMDS = /^(?:\\sqrt|\\frac|\\dot|\\ddot|\\bar|\\hat|\\vec|\\underline|\\overline|\\mathbb|\\mathrm|\\mathbf|\\operatorname|\\text)/;

  function skipSpace(s, i) { while (i < s.length && s[i] === ' ') i++; return i; }

  // 从 k 起向前读一个原子，返回 { text, end }
  function readAtomFwd(s, k) {
    k = skipSpace(s, k);
    var start = k, parts = [];
    if (s[k] === '+' || s[k] === '-') {
      if (k + 1 < s.length && /[0-9A-Za-z\\({\[]/.test(s[k + 1])) parts.push(s[k]), k++;
    }
    var bracket = null;
    if (s[k] === '(') { var j = matchGroup(s, k, '(', ')'); bracket = ['(', ')', j]; }
    else if (s[k] === '[') { j = matchGroup(s, k, '[', ']'); bracket = ['[', ']', j]; }
    if (bracket) {
      if (bracket[2] === -1) return null;
      var inner = fracPass(s.slice(k + 1, bracket[2]));
      parts.push(bracket[0] + inner + bracket[1]);   // 保留括号，是否剥壳最后统一决定
      k = bracket[2] + 1;
    } else if (s[k] === '{') {
      j = matchGroup(s, k, '{', '}');
      if (j === -1) return null;
      parts.push(fracPass(s.slice(k + 1, j)));
      k = j + 1;
    } else {
      // 基础 token：允许反斜杠命令连成一串
      var base = '';
      while (k < s.length) {
        // 微分 dx/dt 不属于分母原子（如 1/√(…)dx）
        if (/^(?:\\,)?d[xtuvzswab](?![A-Za-z])/.test(s.slice(k))) break;
        if (s[k] === '\\') {
          var m = /^\\[a-zA-Z]+|^\\[^a-zA-Z]/.exec(s.slice(k));
          if (!m) break;
          base += m[0]; k += m[0].length;
          // 带参数的命令（\sqrt{}、\frac{}{}、\bar{} 等）把参数整体吸收进原子
          if (/^\\[a-zA-Z]+/.test(m[0]) && ARG_CMDS.test(m[0])) {
            var wants2 = /^\\(?:frac|binom|dfrac|tfrac)/.test(m[0]), t;
            if (/^\\sqrt$/.test(m[0]) && s[k] === '[') { t = matchGroup(s, k, '[', ']'); if (t === -1) break; base += s.slice(k, t + 1); k = t + 1; }
            if (s[k] === '{') {
              t = matchGroup(s, k, '{', '}'); if (t === -1) break;
              base += s.slice(k, t + 1); k = t + 1;
              if (wants2 && s[k] === '{') { t = matchGroup(s, k, '{', '}'); if (t === -1) break; base += s.slice(k, t + 1); k = t + 1; }
            }
          }
        } else if (TOKEN_RE.test(s[k])) {
          base += s[k]; k++;
        } else break;
      }
      if (!base) return null;
      parts.push(base);
    }
    // 尾随的上下标组、撇号、紧贴的括号组
    while (k < s.length) {
      if (s[k] === '^' || s[k] === '_') {
        var op = s[k], g;
        if (s[k + 1] === '{') { g = matchGroup(s, k + 1, '{', '}'); if (g === -1) break; parts.push(op + s.slice(k + 1, g + 1)); k = g + 1; }
        else if (s[k + 1] === '\\') {
          // ^\beta、^\sqrt{…}：把命令及其参数完整消费
          var cm = /^\\[a-zA-Z]+|^\\[^a-zA-Z]/.exec(s.slice(k + 1));
          if (!cm) break;
          var pk = k + 1 + cm[0].length;
          if (/^\\sqrt/.test(cm[0]) && s[pk] === '[') { g = matchGroup(s, pk, '[', ']'); if (g === -1) break; pk = g + 1; }
          if (s[pk] === '{') { g = matchGroup(s, pk, '{', '}'); if (g === -1) break; pk = g + 1; }
          parts.push(s.slice(k, pk)); k = pk;
        }
        else if (k + 1 < s.length) { parts.push(op + s[k + 1]); k += 2; } else break;
      } else if (s[k] === "'") { parts.push("'"); k++; }
      else if (s[k] === '(') { var p = matchGroup(s, k, '(', ')'); if (p === -1) break; parts.push('(' + fracPass(s.slice(k + 1, p)) + ')'); k = p + 1; }
      else break;
    }
    return { text: parts.join(''), end: k };
  }

  // 从 out 末尾向后剥一个原子，返回 { prefix, atom }
  function popAtomBack(out) {
    var j = out.length;
    while (j > 0 && out[j - 1] === ' ') j--;
    var pieces = [];
    while (j > 0) {
      while (j > 0 && out[j - 1] === ' ') j--;
      if (j === 0) break;
      if (out[j - 1] === '}') {
        var depth = 0, k2 = j;
        while (k2 > 0) {
          k2--;
          if (out[k2] === '}') depth++;
          else if (out[k2] === '{') { depth--; if (depth === 0) break; }
        }
        if (depth !== 0) return null;
        var content = out.slice(k2 + 1, j - 1);
        var head = out.slice(0, k2);
        var mc = /\\(?:sqrt|frac|dot|ddot|bar|hat|vec|underline|overline|mathbb|mathrm|mathbf|operatorname|text)(?:\[[^\]]*\])?$/.exec(head);
        if (mc) {
          pieces.unshift(mc[0] + '{' + content + '}');
          j = head.length - mc[0].length;
          continue;
        }
        if (head[head.length - 1] === '^' || head[head.length - 1] === '_') {
          // 已有后剥片段（如 (t-1)）时，仅当上下标显式绑定在变量/括号底数上才吞并，
          // 否则上标属于前面的积分限等（如 _{1}^{∞}(t-1)/t）
          if (pieces.length) {
            var hc = head[head.length - 2];
            if (hc == null || !/[A-Za-z0-9)\]'.!]/.test(hc)) { break; }
          }
          pieces.unshift(head[head.length - 1] + '{' + content + '}');
          j = k2 - 1;
          continue;
        }
        // 整个 \frac{…}{…}（含一层嵌套）作为一个原子：支持 a/b/c 连除（本管线 frac 无斜杠）
        var fm = /(\\(?:frac|binom|dfrac|tfrac)(?:\[[^\]]*\])?\{(?:[^{}]|\{[^{}]*\})*\})$/.exec(head);
        if (fm) {
          var wholeFrac = fm[1] + '{' + content + '}';
          var startF = out.length - wholeFrac.length;
          // 必须与 out 末尾严格吻合，防止花括号失衡时游标回跳
          if (startF >= 0 && out.slice(startF) === wholeFrac) {
            pieces.unshift(wholeFrac);
            j = startF;
            continue;
          }
        }
        break; // 裸花括号组不单独当原子，原子到此为止
      }
      if (out[j - 1] === ')') {
        var po = -1, dep = 0;
        for (var z = j - 1; z >= 0; z--) {
          if (out[z] === ')') dep++;
          else if (out[z] === '(') { dep--; if (dep === 0) { po = z; break; } }
        }
        if (po === -1) return null;
        pieces.unshift('(' + fracPass(out.slice(po + 1, j - 1)) + ')');
        j = po;
        continue;
      }
      if (out[j - 1] === ']') {
        var bo = -1, d2 = 0;
        for (z = j - 1; z >= 0; z--) {
          if (out[z] === ']') d2++;
          else if (out[z] === '[') { d2--; if (d2 === 0) { bo = z; break; } }
        }
        if (bo === -1) return null;
        pieces.unshift('[' + fracPass(out.slice(bo + 1, j - 1)) + ']');
        j = bo;
        continue;
      }
      // 一元正负号并入原子；二元正负号留在 prefix
      if (out[j - 1] === '+' || out[j - 1] === '-') {
        var pc = j - 1;
        if (pc === 0 || /[([]/.test(out[pc - 1])) { pieces.unshift(out[pc]); j = pc; continue; }
        break;
      }
      // 基础 token（含反斜杠命令）；遇到括号组交给外层处理
      var stop = j, had = false;
      while (j > 0 && out[j - 1] !== '}' && out[j - 1] !== ')' && out[j - 1] !== ']') {
        if (TOKEN_RE.test(out[j - 1])) { j--; had = true; }
        else if (out[j - 1] === '\\') {
          // 连其前面的命令字母一起带走
          var q = j - 1;
          while (q > 0 && /[a-zA-Z]/.test(out[q - 1])) q--;
          j = q; had = true;
        } else break;
      }
      if (had) {
        pieces.unshift(out.slice(j, stop));
        // 停在括号/花括号前：交给外层循环继续吸收（如 d^{2}y）
        if (j > 0 && /[})\]]/.test(out[j - 1])) continue;
        // 函数名随其参数一起入分子：\sin x/y → \frac{\sin x}{y}（必须紧贴在 prefix 末尾）
        var pfx = out.slice(0, j).replace(/\s+$/, '');
        var fnm = /\\(?:sin|cos|tan|cot|sec|csc|sinh|cosh|arcsin|arccos|arctan|ln|log|exp)(?:\s+)?$/.exec(pfx);
        if (fnm) { pieces.unshift(fnm[0].replace(/\s+$/, '') + ' '); j = pfx.length - fnm[0].length; }
        break;
      }
      break;
    }
    var atom = pieces.join('');
    return { prefix: out.slice(0, j), atom: atom };
  }

  // 分数操作数的外层括号：方括号一律剥；圆括号仅当内含运算号时剥（f(x) 这类保留）
  function stripOuter(t) {
    if (t.length < 2) return t;
    var a = t[0], b = t[t.length - 1];
    if (a === '[' && b === ']') return t.slice(1, -1);
    if (a === '(' && b === ')') {
      var c = t.slice(1, -1);
      if (/[+\-=<>]|\\to|\\lim|\\sum|\\cup|\\cap/.test(c) || c.indexOf('(') === -1) return c;
    }
    return t;
  }

  /* ---------- 斜杠分式（保留括号结构，仅在作分子分母时剥壳） ---------- */
  function fracPass(s) {
    var out = '', i = 0;
    while (i < s.length) {
      var ch = s[i];
      if (ch === '(') {
        var j = matchGroup(s, i, '(', ')');
        if (j === -1) { out += ch; i++; continue; }
        out += '(' + fracPass(s.slice(i + 1, j)) + ')'; i = j + 1;
      } else if (ch === '[') {
        j = matchGroup(s, i, '[', ']');
        if (j === -1) { out += ch; i++; continue; }
        out += '[' + fracPass(s.slice(i + 1, j)) + ']'; i = j + 1;
      } else if (ch === '{') {
        j = matchGroup(s, i, '{', '}');
        if (j === -1) { out += ch; i++; continue; }
        out += '{' + fracPass(s.slice(i + 1, j)) + '}'; i = j + 1;
      } else if (ch === '/') {
        var back = popAtomBack(out);
        var fwd = readAtomFwd(s, i + 1);
        if (back && fwd && fwd.text && fwd.end > i + 1) {
          var num = stripOuter(back.atom), den = stripOuter(fwd.text).replace(/^\\,/, '');
          out = back.prefix + '\\frac{' + num + '}{' + den + '}';
          i = fwd.end;
        } else { out += ch; i++; }
      } else { out += ch; i++; }
    }
    return out;
  }

  /* ---------- 根号（在分式之前处理） ---------- */
  function rootPass(s) {
    var out = '', i = 0;
    while (i < s.length) {
      if (s[i] === ROOT || s[i] === CUBE) {
        var cube = s[i] === CUBE, k = skipSpace(s, i + 1), arg = null, end = k;
        // √[3]… 形式的立方根
        if (!cube && s[k] === '[' && s[k + 1] === '3' && s[k + 2] === ']') { cube = true; k = skipSpace(s, k + 3); end = k; }
        if (s[k] === '(') { var j = matchGroup(s, k, '(', ')'); if (j > k) { arg = rootPass(s.slice(k + 1, j)); end = j + 1; } }
        else if (s[k] === '[') { j = matchGroup(s, k, '[', ']'); if (j > k) { arg = rootPass(s.slice(k + 1, j)); end = j + 1; } }
        else if (s[k] === '{') { j = matchGroup(s, k, '{', '}'); if (j > k) { arg = rootPass(s.slice(k + 1, j)); end = j + 1; } }
        else {
          // 裸参数：一个 token（字母/数字 + 上下标与撇号）
          var st = k;
          if (s[k] === '\\') { var m = /^\\[a-zA-Z]+|^\\[^a-zA-Z]/.exec(s.slice(k)); if (m) k += m[0].length; }
          else if (TOKEN_RE.test(s[k])) { while (k < s.length && TOKEN_RE.test(s[k])) k++; }
          while (k < s.length && (s[k] === '^' || s[k] === '_' || s[k] === "'")) {
            if (s[k] === '^' || s[k] === '_') {
              if (s[k + 1] === '{') { var g = matchGroup(s, k + 1, '{', '}'); k = g + 1; } else k += 2;
            } else k++;
          }
          if (k > st) { arg = rootPass(s.slice(st, k)); end = k; }
        }
        if (arg != null) { out += cube ? '\\sqrt[3]{' + arg + '}' : '\\sqrt{' + arg + '}'; i = end; continue; }
        out += cube ? '\\sqrt[3]{}' : '\\sqrt{}'; i++; continue;
      }
      out += s[i]; i++;
    }
    return out;
  }

  // 字母型控制字后紧贴字母时补空格（根号/分式阶段产生的命令用，此时不存在融合词）
  function splitCommands(str) {
    return str.replace(/\\[a-zA-Z]+/g, function (m, off, st) {
      var nx = st[off + m.length];
      return nx && /[a-zA-Z]/.test(nx) ? m + ' ' : m;
    });
  }

  // 已知控制字词典：符号映射后原始字母会与命令直接粘连（\cdotln），按最长前缀切开
  var KNOWN_WORDS = (function () {
    var set = {};
    FUNCTIONS.forEach(function (f) { set[f] = 1; });
    ['lim', 'sum', 'int', 'iint', 'oint', 'prod', 'sqrt', 'frac', 'dot', 'ddot',
     'bar', 'hat', 'vec', 'text', 'mathrm', 'mathbb', 'mathbf', 'operatorname',
     'infty', 'to', 'Rightarrow', 'Leftarrow', 'Leftrightarrow', 'Longrightarrow',
     'Longleftrightarrow', 'mapsto', 'therefore', 'because', 'cdot', 'times', 'div',
     'pm', 'mp', 'le', 'ge', 'ne', 'approx', 'equiv', 'sim', 'in', 'notin',
     'cup', 'cap', 'subset', 'subseteq', 'forall', 'exists', 'cdots', 'partial',
     'circ', 'square', 'alpha', 'beta', 'gamma', 'delta', 'varepsilon', 'epsilon',
     'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi',
     'rho', 'sigma', 'tau', 'upsilon', 'varphi', 'phi', 'chi', 'psi', 'omega',
     'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Phi', 'Psi', 'Omega'
    ].forEach(function (w) { set[w] = 1; });
    Object.keys(SYM).forEach(function (k) {
      var mm = SYM[k].match(/\\([a-zA-Z]+)/g);
      if (mm) mm.forEach(function (x) { set[x.slice(1)] = 1; });
    });
    return Object.keys(set).sort(function (a, b) { return b.length - a.length; });
  })();
  // 手工扫描切词（避免正则回溯把 \int 拆成 \in t、\infty 拆成 \inf ty）
  function splitFused(str) {
    var out = '', i = 0;
    while (i < str.length) {
      if (str[i] === '\\') {
        var m = /^\\([a-zA-Z]+)/.exec(str.slice(i));
        if (m) {
          var word = m[1], after = str[i + m[0].length], hit = null;
          for (var qi = 0; qi < KNOWN_WORDS.length; qi++) {
            if (word.indexOf(KNOWN_WORDS[qi]) === 0) { hit = KNOWN_WORDS[qi]; break; }
          }
          out += '\\';
          if (hit) {
            out += hit;
            if (word.length > hit.length) out += ' ' + word.slice(hit.length);
            else if (after && /[a-zA-Z]/.test(after)) out += ' ';
          } else out += word;
          i += m[0].length;
          continue;
        }
      }
      out += str[i]; i++;
    }
    return out;
  }

  // 最终清理：合并粘连上下标、丢弃悬空操作符、未配对花括号转义为可见括号
  function finalTidy(str0) {
    var s = str0;
    // 片段开头孤立的微分细间距去掉
    s = s.replace(/^\s*\\,/, '');
    // ^\mp^{x} / _a_{b} 型：操作符 + 命令 + 同类花括号组 → 合并
    s = s.replace(/([_^])\s*(\\[a-zA-Z]+)\s*\1\{([^{}]*)\}/g, '$1{$2 $3}');
    // 相邻同类上下标组 ^{a}^{b} → ^{a b}
    s = s.replace(/\^\{([^{}]*)\}(\s*)\^\{([^{}]*)\}/g, '^{$1 $3}');
    s = s.replace(/_\{([^{}]*)\}(\s*)_\{([^{}]*)\}/g, '_{$1 $3}');
    // ^\sin 型：函数命令直接当上下标时加花括号
    s = s.replace(/([_^])(\\(?:sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|ln|log|exp|max|min))(?![a-zA-Z{])/g, '$1{$2}');
    // 片段截断造成的悬空 ^{ / _ { / ^ / _
    s = s.replace(/[_^]\s*\{\s*$/g, '');
    s = s.replace(/[_^]\s*$/g, '');
    // 未配对花括号：开括号转义成可见 {，多余的闭括号转义成可见 }
    var marks = new Array(s.length).fill(0); // 1=未配对开括号, 2=未配对闭括号
    var stack = [];
    for (var i = 0; i < s.length; i++) {
      if (s[i] === '{') stack.push(i);
      else if (s[i] === '}') { if (stack.length) stack.pop(); else marks[i] = 2; }
    }
    stack.forEach(function (p) { marks[p] = 1; });
    var out = '';
    for (i = 0; i < s.length; i++) {
      if (marks[i] === 1) { out += '\\{'; if (s[i + 1] === '^' || s[i + 1] === '_') out += ' '; }
      else if (marks[i] === 2) out += '\\}';
      else out += s[i];
    }
    return out;
  }

  /* ---------- 单条数学片段：Unicode → TeX ---------- */
  function convertRun(raw0) {
    var s = raw0;
    // 0) 片段首尾的 ASCII 引号（'lim …'）不是数学撇号，去掉；闭括号后的撇号同理
    s = s.replace(/^'+/, '').replace(/'+$/, '');
    s = s.replace(/(?<=[)\]}])\s*'(?![A-Za-z0-9])/g, '');
    // 1) 上下标 Unicode 分组（前面已有显式 ^/_ 时不再重复输出操作符）
    s = s.replace(SUPER_RE, function (seq, off) {
      var pre = s[off - 1];
      return (pre === '^' || pre === '_') ? '{' + decode(seq, SUPER_MAP) + '}' : '^{' + decode(seq, SUPER_MAP) + '}';
    });
    s = s.replace(SUB_RE, function (seq, off) {
      var pre = s[off - 1];
      return (pre === '^' || pre === '_') ? '{' + decode(seq, SUB_MAP) + '}' : '_{' + decode(seq, SUB_MAP) + '}';
    });
    // 2) lim(...) 与 Σ(...→...)
    s = s.replace(/lim\s*\(([^()]*?)\)/g, '\\lim_{$1}');
    s = s.replace(/Σ\s*\(([^()]*?)→([^()]*?)\)/g, '\\sum_{$1}^{$2}');
    // 3) 复合点字母等先做（避免被逐字符拆散）
    ['ẋ', 'ẍ', 'ẏ', 'ÿ', 'Ḡ'].forEach(function (sp) {
      s = s.split(sp).join(SYM[sp]);
    });
    // 4) 逐字符符号
    var out = '';
    for (var i = 0; i < s.length; i++) out += (SYM[s[i]] != null ? SYM[s[i]] : s[i]);
    s = out;
    // 4.5) 刚生成的符号命令（\cdot、\alpha 等）若与后续字母粘连，按词典最长前缀切开
    s = splitFused(s);
    // 5) ^{+} 后紧跟 ∞：合并为 ^{+\infty}
    s = s.replace(/\^\{([^{}]+)\}\\infty/g, '^{$1\\infty}');
    // 6) ASCII 尖号/下划线带括号：^( ... ) → ^{ ... }（按括号配平替换）
    s = (function caretParen(str) {
      var o = '', k = 0;
      while (k < str.length) {
        if ((str[k] === '^' || str[k] === '_') && str[k + 1] === '(') {
          var j = matchGroup(str, k + 1, '(', ')');
          if (j > 0) { o += str[k] + '{' + str.slice(k + 2, j) + '}'; k = j + 1; continue; }
        }
        o += str[k]; k++;
      }
      return o;
    })(s);
    // 7) 函数名加反斜杠
    var fre = new RegExp('(^|[^A-Za-z\\\\])(' + FUNCTIONS.join('|') + ')(?![a-zA-Z])', 'g');
    s = s.replace(fre, '$1\\$2');
    // 8) 微分 dx/dt/du 前加细间距
    s = s.replace(/(?<![A-Za-z\\])d(?=[a-z]|\()/g, '\\,d');
    // 9) 根号 → 分式
    s = rootPass(s);
    // 9.1) ^√… / _√…：把带参数的根号整体纳入上下标花括号
    s = (function wrapScriptRoot(str) {
      var o = '', i = 0;
      while (i < str.length) {
        if ((str[i] === '^' || str[i] === '_') && str[i + 1] === '\\') {
          var mm = /^\\sqrt(\[[^\]]*\])?\{/.exec(str.slice(i + 1));
          if (mm) {
            var bPos = i + 1 + mm[0].length - 1;
            var g = matchGroup(str, bPos, '{', '}');
            if (g > 0) { o += str[i] + '{' + str.slice(i + 1, g + 1) + '}'; i = g + 1; continue; }
          }
        }
        o += str[i]; i++;
      }
      return o;
    })(s);
    // 9.2) 根号已成型，对 d√… 这类微分再补一轮细间距
    s = s.replace(/(?<![A-Za-z\\,])d(?=[a-z(\\])/g, '\\,d');
    // 9.25) 上下标作用域：∫₋π/2^π/2 这类裸操作数（含斜杠分式）整体纳入 {…}
    s = (function scriptScope(str) {
      var isBoundary = c => c == null || /\s/.test(c) || '^_|=,<>'.indexOf(c) !== -1;
      var ARG_RE = /^\\(?:sqrt|frac|binom|dfrac|tfrac|dot|ddot|hat|vec|bar|overline|underline|mathbb|mathrm|operatorname|text)\b/;
      var BIG_RE = /^\\(?:int|iint|iiint|oint|sum|prod|lim|bigcup|bigcap)\b/;
      var FN_RE = /^\\(?:sin|cos|tan|cot|sec|csc|sinh|cosh|arcsin|arccos|arctan|ln|log|exp|max|min|gcd|det)\b/;
      // 带参命令整体消费；非带参命令返回 -2；无法配平返回 -1
      function argCmdEnd(str, p) {
        var mm = /^\\[a-zA-Z]+/.exec(str.slice(p));
        if (!mm || !ARG_RE.test(str.slice(p))) return -2;
        var q = p + mm[0].length, t;
        if (/^\\sqrt/.test(mm[0]) && str[q] === '[') { t = matchGroup(str, q, '[', ']'); if (t < 0) return -1; q = t + 1; }
        if (str[q] === '{') {
          t = matchGroup(str, q, '{', '}'); if (t < 0) return -1; q = t + 1;
          if (/^\\(?:frac|binom|dfrac|tfrac)/.test(mm[0]) && str[q] === '{') {
            t = matchGroup(str, q, '{', '}'); if (t < 0) return -1; q = t + 1;
          }
        }
        return q;
      }
      var o = '', i = 0;
      while (i < str.length) {
        var ch = str[i];
        if (ch !== '^' && ch !== '_') { o += ch; i++; continue; }
        var ctx = str.slice(Math.max(0, i - 12), i);
        var operatorCtx = /\\(?:int|iint|iiint|oint|sum|prod|lim)/.test(ctx) || str[i - 1] === '|';
        // 已花括号化的操作数
        if (str[i + 1] === '{') {
          var gb = matchGroup(str, i + 1, '{', '}');
          if (gb < 0) { o += ch; i++; continue; }
          var after = gb + 1, inner = str.slice(i + 2, gb);
          // 仅积分/求和/求值竖线后的短下标组允许向后吞并（₋ 后缺下标希腊字母等）
          if (ch === '_' && operatorCtx && /^-?[A-Za-z0-9.]*$/.test(inner) &&
              /[\\0-9A-Za-z.\-−\/]/.test(str[after])) {
            var e2 = after, okExt = true;
            while (e2 < str.length) {
              var c2 = str[e2];
              // 斜杠后允许跳过一个空格（π/ 2）
              if (c2 === ' ' && str[e2 - 1] === '/') { e2++; continue; }
              if (isBoundary(c2) || '()[]{}'.indexOf(c2) !== -1) break;
              if (c2 === '+' || c2 === '-' || c2 === '−') { break; }
              if (c2 === '\\') {
                if (ARG_RE.test(str.slice(e2)) || BIG_RE.test(str.slice(e2))) { okExt = false; break; }
                var m2 = /^\\[a-zA-Z]+|^\\[^a-zA-Z]/.exec(str.slice(e2));
                e2 += m2 ? m2[0].length : 1; continue;
              }
              e2++;
            }
            if (okExt && e2 > after) { o += '_{' + inner + str.slice(after, e2) + '}'; i = e2; continue; }
          }
          o += str.slice(i, gb + 1); i = gb + 1; continue;
        }
        // 裸操作数：读到作用域边界；括号/大算子不属于上/下标，遇微分 dx 即止
        var k = i + 1, started = false;
        outer:
        while (k < str.length) {
          var c = str[k];
          if (isBoundary(c) || '()[]{}'.indexOf(c) !== -1) break;
          if (started && (c === '+' || c === '-' || c === '−')) break;
          if (/^(?:\\,)?d[xtuvzswab]\b/.test(str.slice(k))) break;
          if (c === '\\') {
            // 操作数开头（或一元正负号后）允许是整体的带参命令（如 ^¼、^-½）
            if (!started || (k === i + 2 && (str[i + 1] === '-' || str[i + 1] === '−'))) {
              var qe = argCmdEnd(str, k); if (qe > 0) { k = qe; started = true; continue outer; }
            }
            if (ARG_RE.test(str.slice(k)) || BIG_RE.test(str.slice(k)) || FN_RE.test(str.slice(k))) break;
            var mcmd = /^\\[a-zA-Z]+|^\\[^a-zA-Z]/.exec(str.slice(k));
            k += mcmd ? mcmd[0].length : 1; started = true; continue;
          }
          if (c === '/') {
            // 裸下标只在积分/求和语境里吃斜杠
            if (ch === '_' && !operatorCtx) break;
            var p = k + 1;
            if (str[p] === ' ') p++;
            if (str[p] === '-' || str[p] === '−') p++;
            var d0 = p, dm;
            if ((dm = /^\\[a-zA-Z]+|^\\[^a-zA-Z]/.exec(str.slice(p)))) {
              if (ARG_RE.test(str.slice(p)) || BIG_RE.test(str.slice(p)) || FN_RE.test(str.slice(p))) break;
              p += dm[0].length;
            } else if ((dm = /^[A-Za-z0-9.]+/.exec(str.slice(p)))) {
              p += dm[0].length;
            } else break;
            // 尾随上下标（如 s^{3}）
            while (str[p] === '^' || str[p] === '_') {
              p++;
              if (str[p] === '{') { var gg = matchGroup(str, p, '{', '}'); if (gg < 0) break; p = gg + 1; }
              else p++;
            }
            // 分母必须含数字（π/2、1/2、s³），否则视为作用域外（a^α/b^α）
            if (p <= d0 || !/[0-9]/.test(str.slice(d0, p))) break;
            if (!(str[p] == null || /[\s^_|=,<>]/.test(str[p]) || '()[]{}'.indexOf(str[p]) !== -1 || str[p] === '/' || str[p] === '+' || str[p] === '−' || str[p] === '-')) break;
            k = p; started = true; continue;
          }
          k++; started = true;
        }
        var operand = str.slice(i + 1, k).replace(/\s*(?:\\(?:cdot|times|div|pm|mp|ast|star|circ))+\s*$/, '');
        if (operand.trim()) { o += ch + '{' + operand + '}'; i = k; continue; }
        o += ch; i++;
      }
      return o;
    })(s);
    // 9.3) ^\lim_{…}、^\sin 型：运算符类命令作上下标时整体包进花括号
    s = (function wrapScriptOp(str) {
      var OPS = { lim: 1, sup: 1, inf: 1, max: 1, min: 1, sin: 1, cos: 1, tan: 1,
        cot: 1, sec: 1, csc: 1, log: 1, ln: 1, exp: 1, gcd: 1, det: 1,
        arcsin: 1, arccos: 1, arctan: 1 };
      var o = '', i = 0;
      while (i < str.length) {
        if ((str[i] === '^' || str[i] === '_') && str[i + 1] === '\\') {
          var mm = /^\\([a-zA-Z]+)/.exec(str.slice(i + 1));
          if (mm && OPS[mm[1]] && str[i + 1 + mm[0].length] !== '{') {
            var k = i + 1 + mm[0].length, guard = 0;
            while (guard++ < 4 && (str[k] === '_' || str[k] === '^') && str[k + 1] === '{') {
              var g = matchGroup(str, k + 1, '{', '}');
              if (g < 0) break;
              k = g + 1;
            }
            o += str[i] + '{' + str.slice(i + 1, k) + '}'; i = k; continue;
          }
        }
        o += str[i]; i++;
      }
      return o;
    })(s);
    s = fracPass(s);
    // 9.5) 根号/分式阶段新产生的命令再做一次分词
    s = splitCommands(s);
    // 10) 修正常见小毛病
    s = s.replace(/\^{([^{}]+)\}\s*\\,d/g, '^{$1}\\,d');
    s = finalTidy(s);
    s = s.replace(/\s+/g, ' ').trim();
    return s;
  }

  /* ---------- HTML 转义 ---------- */
  function esc(t) {
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---------- 对外主函数：混排文本 → HTML ---------- */
  function mathFmt(text) {
    if (text == null) return '';
    var html = '', run = '', flush = function () {
      if (!run) return;
      var r = run.trim();
      if (r) {
        try {
          var tex = convertRun(r);
          if (katex && katex.renderToString) {
            html += '<span class="m">' + katex.renderToString(tex, { throwOnError: false, displayMode: false }) + '</span>';
          } else {
            html += '<span class="m m-raw">' + esc(r) + '</span>';
          }
        } catch (e) {
          html += '<span class="m m-raw">' + esc(r) + '</span>';
        }
      }
      run = '';
    };
    var str = String(text);
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      if (ch === '\n') { flush(); html += '<br>'; continue; }
      if (isMathChar(ch)) run += ch;
      else { flush(); html += esc(ch); }
    }
    flush();
    return html;
  }

  return { mathFmt: mathFmt, _convert: convertRun, _isMathChar: isMathChar };
});
