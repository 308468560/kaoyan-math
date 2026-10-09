/* 一元积分计算 · 知识点（来自《【A4】一元积分计算知识点》PDF，共12页）
   每个知识点 = 一页高清图（含公式+手写批注）+ 文字摘要
   match 为空数组 = 通用基础，所有题目都展示 */

window.KNOWLEDGE = [
  { id: 'k01', page: 1,  title: '预备知识：对数 · 立方 · 三角公式',
    img: 'assets/knowledge/k01.jpg',
    desc: '对数恒等/乘法/除法/换底公式；立方公式；三角特殊值、两角和差、二倍角、降幂、和差化积、正割余割、诱导公式、反三角、万能公式。' },
  { id: 'k02', page: 2,  title: '基本概念：不定积分与导积关系',
    img: 'assets/knowledge/k02.jpg',
    desc: '不定积分=找原函数；常数可随意进出积分号，微分内可任意加减常数；导积互逆关系。' },
  { id: 'k03', page: 3,  title: '三大积分法：凑微分 · 分部列表 · 循环积分',
    img: 'assets/knowledge/k03.jpg',
    desc: '凑微分（eˣ速算）；分部积分列表法「上导下积、对角相乘、正负相间、竖线积分」；循环积分型 I=常数倍I；导积终止符：幂函数→0、循环积分→I常数倍。' },
  { id: 'k04', page: 4,  title: '换元法：三角代换 · 根式代换 · 倒代换 · 万能代换 · 整体代换',
    img: 'assets/knowledge/k04.jpg',
    desc: '三角代换（根号下平方和差，回代画三角形）；根式代换（根号下一次方）；倒代换（分母次数较高）；万能代换（三角有理式）；整体代换（含复杂函数）。' },
  { id: 'k05', page: 5,  title: '定积分独有方法：奇偶性 · 平移 · 周期 · Wallis · 区间再现',
    img: 'assets/knowledge/k05.jpg',
    desc: '奇偶性（对称区间偶倍奇零）；平移变换（移到题设区间/构造对称区间）；周期性（任一周期长度积分相等）；Wallis 公式；区间再现（令 x=上限+下限−t，分子为分母一项时适用）。' },
  { id: 'k06', page: 6,  title: '定积分续 + 特殊反常积分：泊松积分',
    img: 'assets/knowledge/k06.jpg',
    desc: 'cos/sin 高次幂定积分；几何面积意义；泊松积分 ∫₀^∞ e^{−x²}dx=√π/2（数一三反复抄写，数二未考概率论也需重视）。' },
  { id: 'k07', page: 7,  title: '特殊反常积分：欧拉积分（伽马 Γ · 贝塔 B）',
    img: 'assets/knowledge/k07.jpg',
    desc: '两类欧拉积分：伽马函数 Γ(α)=∫₀^∞ t^{α−1}e^{−t}dt，Γ(α+1)=αΓ(α)，Γ(1)=1，Γ(1/2)=√π；贝塔函数。' },
  { id: 'k08', page: 8,  title: '化简手法①：拆项',
    img: 'assets/knowledge/k08.jpg',
    desc: '拆项两招：① 分母有什么分子拆什么（方便约分）；② 一分为二，拆出自己需要的那部分。' },
  { id: 'k09', page: 9,  title: '化简手法②：提项 · 同除 · 三角化简 · 分母有理化',
    img: 'assets/knowledge/k09.jpg',
    desc: '提项（提高次/提根号内一项）；同除（除最高次/除 eˣ/二次四次除二次）；根号内部二次多项式配方、利用平方差；质因式分母配方；同乘 eˣ；分母有理化。' },
  { id: 'k10', page: 10, title: '经典题型·有理函数①：分母质因式',
    img: 'assets/knowledge/k10.jpg',
    desc: '分子次数<分母次数且分母质因式（不可分解）：先配方后凑微分。分母二次分子一次 → 分子拆成分母导数+常数，一部分直接凑微分，另一部分配方后凑微分。' },
  { id: 'k11', page: 11, title: '经典题型·有理函数②：分母可因式分解（混合留数法）',
    img: 'assets/knowledge/k11.jpg',
    desc: '分母因式分解到最简；分子待定系数（比底数次数低一次）；通分后分子等于原式分子，对应项系数相等解 ABCDE（特值法取 0,1,2,−1）。' },
  { id: 'k12', page: 12, title: '经典题型：三角组合 · 三角高次幂 · 根号加比减 · 变限积分 · 分段不定积分',
    img: 'assets/knowledge/k12.jpg',
    desc: '三角函数组合：分子拆成 A 倍分母+B 倍分母导数；三角高次幂：奇凑微分、偶降幂；csc/sec 偶次凑微分、奇次分部；辅助角公式；分母齐次同除 cos 往 tan 靠；根号下加比减用平方差同乘拆两项；变限积分定积分：凑微分分部或交换次序；分段函数不定积分：分段求 C，原函数连续对接。' }
];

/* 知识点 PDF 未覆盖、需补充的知识点（按题库分类路径前缀匹配） */
window.SUPPLEMENT = {
  'F.定积分特殊题型|3.罕见题型|d)取整函数': {
    title: '补充：取整函数 [x] 与小数部分 {x}',
    desc: '取整函数 [x]（不超过 x 的最大整数）在 [k,k+1) 上恒等于 k，是阶梯函数；小数部分 {x}=x−[x]，周期 1。积分时按整数点把区间切开，每段 [x]=k 逐段求和，结果常为等差数列。',
    points: [
      '∫₀ⁿ [x]dx = 0+1+…+(n−1) = n(n−1)/2',
      '∫₀ⁿ {x}dx = n/2（每段 ∫₀¹ t dt = 1/2）',
      '含 [g(x)] 时先求 g(x) 取整数值的分界点再切段'
    ]
  },
  'F.定积分特殊题型|3.罕见题型|b)相互抵消': {
    title: '补充：配对抵消型积分',
    desc: '被积函数含两项对称结构（如 1/x 与 ln、x 与 a−x、sin 与 cos）时，对其中一项做换元（区间再现/倒代换/负号替换），使两项在同一积分号下比较：互为相反数则 I=0，相等则 I=2I₁，只算一个简单积分。',
    points: [
      '含 1/x 与 ln 结构时试倒代换 x=1/t 配对',
      '含 x 与 a−x、sin 与 cos 时优先区间再现 x=a+b−t',
      '换元后必须把积分限调成一致再比较被积函数'
    ]
  },
  'G.反常积分特殊题型': {
    title: '补充：反常积分敛散性判别（p 积分 + 比较判别）',
    desc: '先切危险端点（∞、瑕点），每段只留一个危险端；用极限形式比较判别：无穷端找 ~c/xᵖ（p>1 收敛），瑕点 x₀ 找 ~c/(x−x₀)ᵖ（p<1 收敛）。收敛再用原函数取极限算值。',
    points: [
      '无穷端 ∫_a^∞ dx/xᵖ：p>1 收敛于 a^{1−p}/(p−1)，p≤1 发散',
      '瑕点端 ∫ dx/(x−a)ᵖ：p<1 收敛，p≥1 发散',
      '对数因子慢变化：∫ dx/(x·ln^q x) 在 p=1 时看 q>1 收敛',
      '两个危险端点必须切开，不能用一个极限同时代'
    ]
  }
};

/* 题库分类路径前缀 → 知识点 id 列表（按展示顺序） */
window.KNOWLEDGE_MAP = [
  // 通用基础：所有题目先温习
  { match: [], klist: ['k01', 'k02'] },

  // A 有理函数
  { match: ['A.有理函数'], klist: ['k03', 'k08', 'k09'] },
  { match: ['A.有理函数', '1.分母质因式'], klist: ['k10'] },
  { match: ['A.有理函数', '2.分母可因式分解'], klist: ['k11'] },
  { match: ['A.有理函数', '3.有理函数乘其他函数'], klist: ['k03'] },

  // B 含根式
  { match: ['B.含根式'], klist: ['k04', 'k09'] },
  { match: ['B.含根式', '1.根号下一坨'], klist: ['k04'] },
  { match: ['B.含根式', '2.根号x'], klist: ['k04'] },
  { match: ['B.含根式', '3.分母多项式乘根号'], klist: ['k04'] },
  { match: ['B.含根式', '4.根号加比根号减'], klist: ['k09', 'k12'] },
  { match: ['B.含根式', '5.根号下二次多项式'], klist: ['k04', 'k09'] },
  { match: ['B.含根式', '6.根号下绝对值'], klist: ['k09'] },
  { match: ['B.含根式', '7.平方和差'], klist: ['k04', 'k09'] },
  { match: ['B.含根式', '8.根号和差'], klist: ['k09'] },
  { match: ['B.含根式', '9.指数相关'], klist: ['k04', 'k09'] },

  // C 两函数相乘
  { match: ['C.两函数相乘'], klist: ['k03'] },
  { match: ['C.两函数相乘', '1.多次分部'], klist: ['k03'] },
  { match: ['C.两函数相乘', '2.反三角'], klist: ['k03'] },
  { match: ['C.两函数相乘', '3.指对有关'], klist: ['k03', 'k01'] },
  { match: ['C.两函数相乘', '4.一整个函数'], klist: ['k03'] },
  { match: ['C.两函数相乘', '5.递推'], klist: ['k03'] },

  // D 三角相关
  { match: ['D.三角相关'], klist: ['k01', 'k12'] },
  { match: ['D.三角相关', '1.高次幂'], klist: ['k12'] },
  { match: ['D.三角相关', '3.sincos相乘'], klist: ['k01', 'k12'] },
  { match: ['D.三角相关', '4.三角分式'], klist: ['k04', 'k12'] },
  { match: ['D.三角相关', '5.三角线性组合'], klist: ['k12'] },
  { match: ['D.三角相关', '6.三角高次分式'], klist: ['k12'] },
  { match: ['D.三角相关', '7.复杂三角'], klist: ['k09', 'k12'] },

  // E 分段函数
  { match: ['E.分段函数'], klist: ['k12'] },
  { match: ['E.分段函数', '3.分段函数定积分'], klist: ['k05', 'k12'] },
  { match: ['E.分段函数', '4.分段函数反常积分'], klist: ['k07', 'k12'] },

  // F 定积分特殊题型
  { match: ['F.定积分特殊题型'], klist: ['k05'] },
  { match: ['F.定积分特殊题型', '1.奇偶性'], klist: ['k05'] },
  { match: ['F.定积分特殊题型', '2.区间再现'], klist: ['k05'] },
  { match: ['F.定积分特殊题型', '2.区间再现', 'c)指数相关'], klist: ['k05', 'k09'] },
  { match: ['F.定积分特殊题型', '3.罕见题型'], klist: ['k05', 'k06'] },
  { match: ['F.定积分特殊题型', '4.求变限积分的定积分'], klist: ['k12'] },

  // G 反常积分
  { match: ['G.反常积分特殊题型'], klist: ['k06', 'k07'] }
];

/* 根据题目的 cat 路径返回需展示的知识点（保持顺序、去重） */
window.getKnowledgeFor = function (cat) {
  const ids = [];
  const seen = new Set();
  for (const m of window.KNOWLEDGE_MAP) {
    if (m.match.length > cat.length) continue;
    if (m.match.every((seg, i) => seg === cat[i])) {
      for (const id of m.klist) {
        if (!seen.has(id)) { seen.add(id); ids.push(id); }
      }
    }
  }
  return ids.map(id => window.KNOWLEDGE.find(k => k.id === id)).filter(Boolean);
};

/* 根据 cat 路径取补充知识点（最长匹配前缀） */
window.getSupplementFor = function (cat) {
  let best = null, bestLen = -1;
  for (const key in window.SUPPLEMENT) {
    const path = key.split('|');
    if (path.length <= cat.length &&
        path.every((seg, i) => seg === cat[i]) &&
        path.length > bestLen) {
      best = window.SUPPLEMENT[key]; bestLen = path.length;
    }
  }
  return best;
};

/* ============ 一元微分 知识点 ============ */
window.KNOWLEDGE_DIFF = [
  { id: 'dk02', page: 2,  title: '考试大纲·一元微分要求',
    img: 'assets/knowledge_diff/dk02.jpg',
    desc: '一元微分考试大纲要求：导数与微分的概念、几何意义、物理意义；各类函数求导；导数应用（切线法线、单调性极值、凹凸拐点、渐近线、曲率、方程根、不等式）。' },
  { id: 'dk03', page: 3,  title: '导数定义',
    img: 'assets/knowledge_diff/dk03.jpg',
    desc: '导数定义 f′(x₀)=lim_{Δx→0}[f(x₀+Δx)−f(x₀)]/Δx；三种等价形式；用定义求导的步骤与注意事项。' },
  { id: 'dk04', page: 4,  title: '可导充要条件 · 可导必要 · 微分',
    img: 'assets/knowledge_diff/dk04.jpg',
    desc: '可导充要：左右导数存在且相等；可导必要：可导必连续（连续未必可导）；微分 dy=f′(x)dx，可微⇔可导。' },
  { id: 'dk05', page: 5,  title: '实用二级结论①：左右导数、乘积、绝对值',
    img: 'assets/knowledge_diff/dk05.jpg',
    desc: '左右导数存在但不相等→不可导；两个函数乘积可导性；绝对值 |f| 的可导性与 f 的关系。' },
  { id: 'dk06', page: 6,  title: '实用二级结论②：三角导函数连续、f 与 |f| 关系',
    img: 'assets/knowledge_diff/dk06.jpg',
    desc: '三角有关的导函数连续性；f 与 |f| 的连续性、可导性关系结论。' },
  { id: 'dk07', page: 7,  title: '导数计算①：基本公式 · 四则 · 复合函数',
    img: 'assets/knowledge_diff/dk07.jpg',
    desc: '基本初等函数求导公式表；四则运算求导法则；复合函数链式法则。' },
  { id: 'dk08', page: 8,  title: '导数计算②：隐函数 · 反函数 · 参数方程 · 幂指函数',
    img: 'assets/knowledge_diff/dk08.jpg',
    desc: '隐函数求导（两边对 x 求导）；反函数求导 dx/dy=1/(dy/dx)；参数方程 dy/dx=(dy/dt)/(dx/dt)；幂指函数取对数求导或 e 抬升。' },
  { id: 'dk09', page: 9,  title: '导数计算③：高阶导数',
    img: 'assets/knowledge_diff/dk09.jpg',
    desc: '高阶导数求法：归纳法、莱布尼茨公式 (uv)⁽ⁿ⁾=ΣC(n,k)u⁽ᵏ⁾v⁽ⁿ⁻ᵏ⁾、常见函数 n 阶导数公式（sin/cos/eˣ/ln(1+x)/(1+x)^α）。' },
  { id: 'dk10', page: 10, title: '导数应用①：切法线',
    img: 'assets/knowledge_diff/dk10.jpg',
    desc: '切线斜率 k=f′(x₀)，法线斜率 −1/f′(x₀)；切线方程 y−y₀=f′(x₀)(x−x₀)；隐函数/参数方程/极坐标曲线的切线。' },
  { id: 'dk11', page: 11, title: '导数应用②：渐近线',
    img: 'assets/knowledge_diff/dk11.jpg',
    desc: '水平渐近线 y=lim_{x→∞}f(x)；铅直渐近线 x=x₀（f→∞）；斜渐近线 y=kx+b，k=lim f(x)/x，b=lim[f(x)−kx]。' },
  { id: 'dk12', page: 12, title: '导数应用③：曲率 · 极最拐',
    img: 'assets/knowledge_diff/dk12.jpg',
    desc: '曲率 κ=|y″|/(1+y′²)^(3/2)，曲率半径 R=1/κ；单调性与极值、最值的判别步骤。' },
  { id: 'dk13', page: 13, title: '导数应用④：极最拐续',
    img: 'assets/knowledge_diff/dk13.jpg',
    desc: '极值第一/第二充分条件；最值求法（端点+驻点+不可导点比较）。' },
  { id: 'dk14', page: 14, title: '导数应用⑤：凹凸性与拐点 · 高次幂乘积拐点',
    img: 'assets/knowledge_diff/dk14.jpg',
    desc: '凹凸性由 f″ 符号判断；拐点是凹凸性改变的点；高次幂乘积的拐点判别技巧。' },
  { id: 'dk15', page: 15, title: '导数应用⑥：不等式 · 方程根',
    img: 'assets/knowledge_diff/dk15.jpg',
    desc: '不等式证明：构造函数求导看单调性/最值；方程根/零点问题：介值定理+单调性确定根的个数。' }
];

window.KNOWLEDGE_MAP_DIFF = [
  // 通用
  { match: [], klist: ['dk02', 'dk03', 'dk04'] },
  // 1.导数概念
  { match: ['1.导数概念'], klist: ['dk03', 'dk04', 'dk05', 'dk06'] },
  { match: ['1.导数概念', 'a)基本概念题'], klist: ['dk03', 'dk04'] },
  { match: ['1.导数概念', 'b)微分概念'], klist: ['dk04'] },
  { match: ['1.导数概念', 'c)极限与导数'], klist: ['dk03', 'dk05'] },
  { match: ['1.导数概念', 'd)某点的可导问题'], klist: ['dk05', 'dk06'] },
  // 2.导数计算
  { match: ['2.导数计算'], klist: ['dk07', 'dk08', 'dk09'] },
  { match: ['2.导数计算', 'a)乘积求导'], klist: ['dk07'] },
  { match: ['2.导数计算', 'b)复合函数求导'], klist: ['dk07'] },
  { match: ['2.导数计算', 'c)隐函数求导'], klist: ['dk08'] },
  { match: ['2.导数计算', 'd)反函数求导'], klist: ['dk08'] },
  { match: ['2.导数计算', 'e)参数方程求导'], klist: ['dk08'] },
  { match: ['2.导数计算', 'f)幂指函数求导'], klist: ['dk08'] },
  { match: ['2.导数计算', 'g)高阶导'], klist: ['dk09'] },
  // 3.导数应用
  { match: ['3.导数应用'], klist: ['dk10', 'dk11', 'dk12', 'dk14', 'dk15'] },
  { match: ['3.导数应用', 'a)切法线'], klist: ['dk10'] },
  { match: ['3.导数应用', 'b)渐近线'], klist: ['dk11'] },
  { match: ['3.导数应用', 'c)曲率'], klist: ['dk12'] },
  { match: ['3.导数应用', 'd)极最拐'], klist: ['dk12', 'dk13', 'dk14'] },
  { match: ['3.导数应用', 'e)方程根/曲线交点/函数零点'], klist: ['dk15'] },
  { match: ['3.导数应用', 'f)不等式'], klist: ['dk15'] }
];

/* 修改 getKnowledgeFor / getSupplementFor 支持章节 */
const _origGetKp = window.getKnowledgeFor;
const _origGetSupp = window.getSupplementFor;
window.getKnowledgeFor = function (cat) {
  const ch = window.currentChapter || 'jifen';
  if (ch === 'weifen') {
    const ids = []; const seen = new Set();
    for (const m of window.KNOWLEDGE_MAP_DIFF) {
      if (m.match.length > cat.length) continue;
      if (m.match.every((seg, i) => seg === cat[i])) {
        for (const id of m.klist) { if (!seen.has(id)) { seen.add(id); ids.push(id); } }
      }
    }
    return ids.map(id => window.KNOWLEDGE_DIFF.find(k => k.id === id)).filter(Boolean);
  }
  return _origGetKp(cat);
};
window.getSupplementFor = function (cat) {
  const ch = window.currentChapter || 'jifen';
  if (ch === 'weifen') return null;
  return _origGetSupp(cat);
};
