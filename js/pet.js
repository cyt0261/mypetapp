/* ============================================================
   pet.js — 宠物 SVG 渲染（v2 优化版）
   毛绒滤镜、全身形象、多表情、粒子效果
   ============================================================ */

// 依赖：需要全局 state 对象（由 app.js 提供）

function renderPet() {
  const canvas = document.getElementById('petCanvas');
  if (!canvas) return;
  const isCat = state.petType === 'cat';
  const mood = state.stats.mood;
  const hunger = state.stats.hunger;

  let expression = 'happy';
  if (hunger < 20) expression = 'hungry';
  else if (mood < 30) expression = 'sad';
  else if (mood > 85) expression = 'veryHappy';
  else if (mood > 60) expression = 'happy';

  // 更新名字和阶段
  const petNameEl = document.getElementById('petName');
  if (petNameEl) petNameEl.textContent = state.petName;
  const headerEl = document.getElementById('headerName');
  if (headerEl) headerEl.textContent = state.petName;
  const stage = getGrowthStage();
  const stageEl = document.getElementById('petStage');
  if (stageEl) stageEl.textContent = stage.name;

  if (isCat) {
    canvas.innerHTML = `<img src="mimi.jpeg" alt="${state.petName}" style="width:100%;height:100%;object-fit:contain;animation:petIdle 3s ease-in-out infinite;" />`;
  } else {
    canvas.innerHTML = fluffyDogSVG(expression);
  }
}

// 橘猫配色（模块级常量，fluffyCatSVG 和 getCatFace 共用）
const CAT_COLORS = {
  orangeBody: '#F5A623',
  orangeLight: '#FCC87A',
  orangeDark: '#D4862E',
  stripeColor: '#C87030',
  whiteFur: '#FFF8F0',
  whiteMuzzle: '#FFFFFF',
  pinkEar: '#F0A0B0',
  pinkEarDark: '#E88898',
  pinkNose: '#F08898',
  eyeIris: '#B8D860',
  eyeIrisDark: '#8CB840',
  pawPink: '#F8C8D0',
};

// ==================== 毛绒小猫 SVG（三视图风格：橘色虎斑 + 白手套 + 白肚皮） ====================
function fluffyCatSVG(expr) {
  const C = CAT_COLORS;

  const face = getCatFace(expr);

  return `
  <svg viewBox="0 0 140 160" width="140" height="140">
    <defs>
      <filter id="fur" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="3" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="softFur" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
        <feOffset dx="0" dy="2"/>
        <feComponentTransfer><feFuncA type="linear" slope="0.15"/></feComponentTransfer>
        <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <radialGradient id="bodyGradCat" cx="40%" cy="30%">
        <stop offset="0%" stop-color="${C.orangeLight}"/>
        <stop offset="50%" stop-color="${C.orangeBody}"/>
        <stop offset="100%" stop-color="${C.orangeDark}"/>
      </radialGradient>
      <radialGradient id="headGrad" cx="45%" cy="35%">
        <stop offset="0%" stop-color="${C.orangeLight}"/>
        <stop offset="60%" stop-color="${C.orangeBody}"/>
        <stop offset="100%" stop-color="${C.orangeDark}"/>
      </radialGradient>
      <radialGradient id="bellyGrad" cx="50%" cy="40%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="${C.whiteFur}"/>
      </radialGradient>
    </defs>

    <!-- ===== 身体 ===== -->
    <g filter="url(#shadow)">
      <!-- 主身体 -->
      <ellipse cx="70" cy="125" rx="35" ry="28" fill="url(#bodyGradCat)" filter="url(#fur)"/>

      <!-- 背部虎斑条纹 -->
      <path d="M 45 108 Q 70 100 95 108" fill="none" stroke="${C.stripeColor}" stroke-width="2.5" opacity="0.5"/>
      <path d="M 48 114 Q 70 106 92 114" fill="none" stroke="${C.stripeColor}" stroke-width="2" opacity="0.4"/>
      <path d="M 50 120 Q 70 113 90 120" fill="none" stroke="${C.stripeColor}" stroke-width="1.8" opacity="0.35"/>

      <!-- 白色肚皮 -->
      <ellipse cx="70" cy="128" rx="22" ry="18" fill="url(#bellyGrad)" filter="url(#softFur)" opacity="0.9"/>

      <!-- 左前爪（白色手套） -->
      <ellipse cx="47" cy="138" rx="14" ry="9" fill="${C.whiteFur}" filter="url(#softFur)"/>
      <ellipse cx="47" cy="140" rx="11" ry="5" fill="${C.whiteFur}"/>
      <!-- 爪趾线 -->
      <line x1="40" y1="142" x2="40" y2="138" stroke="#e8ddd0" stroke-width="0.6"/>
      <line x1="47" y1="143" x2="47" y2="138" stroke="#e8ddd0" stroke-width="0.6"/>
      <line x1="54" y1="142" x2="54" y2="138" stroke="#e8ddd0" stroke-width="0.6"/>
      <!-- 粉色肉垫 -->
      <ellipse cx="43" cy="141" rx="3" ry="2.5" fill="${C.pawPink}" opacity="0.7"/>
      <ellipse cx="51" cy="141" rx="3" ry="2.5" fill="${C.pawPink}" opacity="0.7"/>
      <ellipse cx="47" cy="143" rx="3.5" ry="2" fill="${C.pawPink}" opacity="0.5"/>

      <!-- 右前爪（白色手套） -->
      <ellipse cx="93" cy="138" rx="14" ry="9" fill="${C.whiteFur}" filter="url(#softFur)"/>
      <ellipse cx="93" cy="140" rx="11" ry="5" fill="${C.whiteFur}"/>
      <line x1="86" y1="142" x2="86" y2="138" stroke="#e8ddd0" stroke-width="0.6"/>
      <line x1="93" y1="143" x2="93" y2="138" stroke="#e8ddd0" stroke-width="0.6"/>
      <line x1="100" y1="142" x2="100" y2="138" stroke="#e8ddd0" stroke-width="0.6"/>
      <ellipse cx="89" cy="141" rx="3" ry="2.5" fill="${C.pawPink}" opacity="0.7"/>
      <ellipse cx="97" cy="141" rx="3" ry="2.5" fill="${C.pawPink}" opacity="0.7"/>
      <ellipse cx="93" cy="143" rx="3.5" ry="2" fill="${C.pawPink}" opacity="0.5"/>
    </g>

    <!-- ===== 尾巴 ===== -->
    <g filter="url(#softFur)">
      <path d="M 98 120 Q 120 108 118 85 Q 116 70 110 65" fill="none" stroke="${C.orangeBody}" stroke-width="7" stroke-linecap="round"/>
      <!-- 尾巴条纹 -->
      <path d="M 118 95 L 108 92" stroke="${C.stripeColor}" stroke-width="2" opacity="0.5" stroke-linecap="round"/>
      <path d="M 119 82 L 109 79" stroke="${C.stripeColor}" stroke-width="2" opacity="0.5" stroke-linecap="round"/>
      <path d="M 116 72 L 108 70" stroke="${C.stripeColor}" stroke-width="1.8" opacity="0.45" stroke-linecap="round"/>
      <!-- 尾巴尖（白色） -->
      <circle cx="110" cy="65" r="5" fill="${C.whiteFur}"/>
    </g>

    <!-- ===== 头部 ===== -->
    <g filter="url(#shadow)">
      <!-- 头主体 -->
      <ellipse cx="70" cy="78" rx="40" ry="36" fill="url(#headGrad)" filter="url(#fur)"/>

      <!-- 额头虎斑"M"纹 -->
      <path d="M 52 52 L 58 60 L 64 52 L 70 62 L 76 52 L 82 60 L 88 52"
        fill="none" stroke="${C.stripeColor}" stroke-width="2.2" opacity="0.55" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- 额头两侧条纹 -->
      <path d="M 44 56 Q 46 64 50 70" fill="none" stroke="${C.stripeColor}" stroke-width="1.8" opacity="0.4" stroke-linecap="round"/>
      <path d="M 96 56 Q 94 64 90 70" fill="none" stroke="${C.stripeColor}" stroke-width="1.8" opacity="0.4" stroke-linecap="round"/>
    </g>

    <!-- ===== 耳朵 ===== -->
    <g filter="url(#softFur)">
      <!-- 左耳 -->
      <polygon points="32,50 24,18 50,42" fill="${C.orangeBody}"/>
      <polygon points="34,48 28,24 46,42" fill="${C.pinkEar}"/>
      <polygon points="33,44 29,28 42,42" fill="${C.pinkEarDark}" opacity="0.5"/>
      <!-- 右耳 -->
      <polygon points="108,50 116,18 90,42" fill="${C.orangeBody}"/>
      <polygon points="106,48 112,24 94,42" fill="${C.pinkEar}"/>
      <polygon points="107,44 111,28 98,42" fill="${C.pinkEarDark}" opacity="0.5"/>
    </g>

    <!-- ===== 白色口鼻区域 ===== -->
    <g filter="url(#softFur)">
      <!-- 口鼻白毛 -->
      <ellipse cx="70" cy="88" rx="24" ry="18" fill="${C.whiteMuzzle}" opacity="0.95"/>
      <!-- 鼻梁到额头过渡 -->
      <ellipse cx="70" cy="72" rx="14" ry="10" fill="${C.whiteFur}" opacity="0.4"/>
    </g>

    <!-- ===== 眼睛 ===== -->
    ${face.eyes}

    <!-- ===== 鼻子 ===== -->
    <g>
      <ellipse cx="70" cy="83" rx="4" ry="3" fill="${C.pinkNose}"/>
      <ellipse cx="68.5" cy="82" rx="1.2" ry="0.8" fill="white" opacity="0.6"/>
      <!-- 鼻线 -->
      <line x1="70" y1="86" x2="70" y2="90" stroke="#e8d0d8" stroke-width="0.8"/>
    </g>

    <!-- ===== 嘴巴 ===== -->
    ${face.mouth}

    <!-- ===== 胡须 ===== -->
    <g stroke="#ddd" stroke-width="0.7" opacity="0.7">
      <line x1="22" y1="80" x2="46" y2="83"/>
      <line x1="20" y1="85" x2="45" y2="87"/>
      <line x1="24" y1="90" x2="46" y2="90"/>
      <line x1="118" y1="80" x2="94" y2="83"/>
      <line x1="120" y1="85" x2="95" y2="87"/>
      <line x1="116" y1="90" x2="94" y2="90"/>
    </g>

    <!-- ===== 腮红 ===== -->
    <ellipse cx="48" cy="88" rx="7" ry="4" fill="${C.pinkNose}" opacity="0.2"/>
    <ellipse cx="92" cy="88" rx="7" ry="4" fill="${C.pinkNose}" opacity="0.2"/>

    ${face.extra}
  </svg>`;
}

function getCatFace(expr) {
  const C = CAT_COLORS;
  switch(expr) {
    case 'veryHappy':
      return {
        eyes: `
          <!-- 左眼 -->
          <ellipse cx="52" cy="76" rx="8" ry="9" fill="white"/>
          <ellipse cx="53" cy="75" rx="6" ry="7" fill="${C.eyeIris}"/>
          <ellipse cx="53" cy="75" rx="4.5" ry="6" fill="#222"/>
          <circle cx="55" cy="73" r="2" fill="white"/>
          <circle cx="51" cy="76" r="0.8" fill="white" opacity="0.7"/>
          <!-- 右眼 -->
          <ellipse cx="88" cy="76" rx="8" ry="9" fill="white"/>
          <ellipse cx="87" cy="75" rx="6" ry="7" fill="${C.eyeIris}"/>
          <ellipse cx="87" cy="75" rx="4.5" ry="6" fill="#222"/>
          <circle cx="89" cy="73" r="2" fill="white"/>
          <circle cx="85" cy="76" r="0.8" fill="white" opacity="0.7"/>`,
        mouth: `<path d="M 60 90 Q 70 98 80 90" fill="none" stroke="#999" stroke-width="1.3" stroke-linecap="round"/>`,
        extra: `<text x="70" y="112" text-anchor="middle" font-size="16">💕</text>`
      };
    case 'happy':
      return {
        eyes: `
          <ellipse cx="52" cy="77" rx="7.5" ry="8.5" fill="white"/>
          <ellipse cx="53" cy="76" rx="5.5" ry="6.5" fill="${C.eyeIris}"/>
          <ellipse cx="53" cy="76" rx="4" ry="5" fill="#222"/>
          <circle cx="55" cy="74" r="1.8" fill="white"/>
          <circle cx="51" cy="78" r="0.7" fill="white" opacity="0.6"/>
          <ellipse cx="88" cy="77" rx="7.5" ry="8.5" fill="white"/>
          <ellipse cx="87" cy="76" rx="5.5" ry="6.5" fill="${C.eyeIris}"/>
          <ellipse cx="87" cy="76" rx="4" ry="5" fill="#222"/>
          <circle cx="89" cy="74" r="1.8" fill="white"/>
          <circle cx="85" cy="78" r="0.7" fill="white" opacity="0.6"/>`,
        mouth: `<path d="M 62 89 Q 70 95 78 89" fill="none" stroke="#999" stroke-width="1.2" stroke-linecap="round"/>`,
        extra: ''
      };
    case 'sad':
      return {
        eyes: `
          <ellipse cx="52" cy="79" rx="7.5" ry="8" fill="white"/>
          <ellipse cx="53" cy="79" rx="5.5" ry="6" fill="${C.eyeIris}" opacity="0.7"/>
          <ellipse cx="53" cy="79" rx="4" ry="4.5" fill="#333"/>
          <circle cx="55" cy="77" r="1.5" fill="white" opacity="0.5"/>
          <ellipse cx="88" cy="79" rx="7.5" ry="8" fill="white"/>
          <ellipse cx="87" cy="79" rx="5.5" ry="6" fill="${C.eyeIris}" opacity="0.7"/>
          <ellipse cx="87" cy="79" rx="4" ry="4.5" fill="#333"/>
          <circle cx="89" cy="77" r="1.5" fill="white" opacity="0.5"/>
          <!-- 眉毛下垂 -->
          <line x1="44" y1="70" x2="58" y2="72" stroke="${C.orangeDark}" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="96" y1="70" x2="82" y2="72" stroke="${C.orangeDark}" stroke-width="1.5" stroke-linecap="round"/>`,
        mouth: `<path d="M 63 91 Q 70 87 77 91" fill="none" stroke="#999" stroke-width="1.2" stroke-linecap="round"/>`,
        extra: `<text x="70" y="112" text-anchor="middle" font-size="14">💧</text>`
      };
    case 'hungry':
      return {
        eyes: `
          <ellipse cx="52" cy="77" rx="7" ry="8" fill="white"/>
          <ellipse cx="53" cy="77" rx="5" ry="6" fill="${C.eyeIris}" opacity="0.8"/>
          <ellipse cx="53" cy="77" rx="3.5" ry="4.5" fill="#333"/>
          <circle cx="55" cy="75" r="1.3" fill="white" opacity="0.4"/>
          <ellipse cx="88" cy="77" rx="7" ry="8" fill="white"/>
          <ellipse cx="87" cy="77" rx="5" ry="6" fill="${C.eyeIris}" opacity="0.8"/>
          <ellipse cx="87" cy="77" rx="3.5" ry="4.5" fill="#333"/>
          <circle cx="89" cy="75" r="1.3" fill="white" opacity="0.4"/>`,
        mouth: `<ellipse cx="70" cy="91" rx="6" ry="4.5" fill="#888"/>`,
        extra: ''
      };
    default:
      return getCatFace('happy');
  }
}

// ==================== 毛绒小狗 SVG ====================
function fluffyDogSVG(expr) {
  const bodyColor = '#c49060';
  const bodyLight = '#e8c8a0';
  const innerEar = '#e8c8a0';
  const noseColor = '#333';
  const earDark = '#a07040';

  const face = getDogFace(expr);

  return `
  <svg viewBox="0 0 120 140" width="140" height="140">
    <defs>
      <filter id="fur" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="softFur" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <radialGradient id="bodyGradDog" cx="40%" cy="35%">
        <stop offset="0%" stop-color="${bodyLight}"/>
        <stop offset="60%" stop-color="${bodyColor}"/>
        <stop offset="100%" stop-color="${earDark}"/>
      </radialGradient>
    </defs>

    <!-- 身体 -->
    <ellipse cx="60" cy="115" rx="28" ry="22" fill="url(#bodyGradDog)" filter="url(#fur)"/>
    <!-- 前爪 -->
    <ellipse cx="42" cy="130" rx="11" ry="7" fill="${bodyLight}" filter="url(#softFur)"/>
    <ellipse cx="78" cy="130" rx="11" ry="7" fill="${bodyLight}" filter="url(#softFur)"/>

    <!-- 尾巴（短而翘） -->
    <path d="M 84 108 Q 100 98 97 85" fill="none" stroke="${bodyColor}" stroke-width="5" stroke-linecap="round" filter="url(#softFur)"/>
    <circle cx="97" cy="83" r="5" fill="${bodyLight}" filter="url(#softFur)"/>

    <!-- 头 -->
    <ellipse cx="60" cy="68" rx="33" ry="30" fill="url(#bodyGradDog)" filter="url(#fur)"/>

    <!-- 耳朵（垂耳） -->
    <ellipse cx="24" cy="42" rx="12" ry="18" fill="${earDark}" filter="url(#softFur)" transform="rotate(-20,24,42)"/>
    <ellipse cx="96" cy="42" rx="12" ry="18" fill="${earDark}" filter="url(#softFur)" transform="rotate(20,96,42)"/>
    <ellipse cx="24" cy="42" rx="7" ry="12" fill="${innerEar}" transform="rotate(-20,24,42)"/>
    <ellipse cx="96" cy="42" rx="7" ry="12" fill="${innerEar}" transform="rotate(20,96,42)"/>

    <!-- 额头斑纹 -->
    <ellipse cx="60" cy="52" rx="12" ry="10" fill="${bodyLight}" opacity="0.5"/>

    <!-- 眼睛 -->
    ${face.eyes}

    <!-- 鼻子 -->
    <ellipse cx="60" cy="72" rx="4.5" ry="3.5" fill="${noseColor}"/>
    <ellipse cx="58" cy="71" rx="1.5" ry="1" fill="#555" opacity="0.5"/>

    <!-- 嘴巴 -->
    ${face.mouth}

    <!-- 腮红 -->
    <ellipse cx="38" cy="78" rx="6" ry="3" fill="#f08a8a" opacity="0.25"/>
    <ellipse cx="82" cy="78" rx="6" ry="3" fill="#f08a8a" opacity="0.25"/>

    ${face.extra}
  </svg>`;
}

function getDogFace(expr) {
  switch(expr) {
    case 'veryHappy':
      return {
        eyes: `
          <circle cx="45" cy="66" r="5.5" fill="white"/>
          <circle cx="75" cy="66" r="5.5" fill="white"/>
          <circle cx="46" cy="65" r="3" fill="#333"/>
          <circle cx="76" cy="65" r="3" fill="#333"/>
          <circle cx="48" cy="63" r="1" fill="white"/>`,
        mouth: `<path d="M 50 78 Q 60 86 70 78" fill="none" stroke="#666" stroke-width="1.3" stroke-linecap="round"/>
                <ellipse cx="60" cy="84" rx="5" ry="6" fill="#f08a8a"/>`,
        extra: `<text x="60" y="102" text-anchor="middle" font-size="14">💕</text>`
      };
    case 'happy':
      return {
        eyes: `
          <circle cx="45" cy="68" r="5.5" fill="white"/>
          <circle cx="75" cy="68" r="5.5" fill="white"/>
          <circle cx="46" cy="68" r="3" fill="#333"/>
          <circle cx="76" cy="68" r="3" fill="#333"/>`,
        mouth: `<path d="M 52 78 Q 60 83 68 78" fill="none" stroke="#666" stroke-width="1.2" stroke-linecap="round"/>
                <ellipse cx="60" cy="82" rx="4" ry="5" fill="#f08a8a"/>`,
        extra: ''
      };
    case 'sad':
      return {
        eyes: `
          <circle cx="45" cy="70" r="5.5" fill="white"/>
          <circle cx="75" cy="70" r="5.5" fill="white"/>
          <circle cx="46" cy="71" r="2.8" fill="#333"/>
          <circle cx="76" cy="71" r="2.8" fill="#333"/>`,
        mouth: `<path d="M 53 79 Q 60 75 67 79" fill="none" stroke="#666" stroke-width="1.2" stroke-linecap="round"/>`,
        extra: `<text x="60" y="100" text-anchor="middle" font-size="12">💧</text>`
      };
    case 'hungry':
      return {
        eyes: `
          <circle cx="45" cy="68" r="5" fill="white"/>
          <circle cx="75" cy="68" r="5" fill="white"/>
          <circle cx="46" cy="69" r="2.5" fill="#333"/>
          <circle cx="76" cy="69" r="2.5" fill="#333"/>`,
        mouth: `<ellipse cx="60" cy="80" rx="5" ry="4" fill="#666"/>`,
        extra: ''
      };
    default:
      return getDogFace('happy');
  }
}

// ==================== 粒子效果 ====================
function spawnParticles(emoji, count = 5) {
  const canvas = document.getElementById('petCanvas');
  if (!canvas) return;

  // 移除旧粒子容器
  const old = canvas.querySelector('.particles-container');
  if (old) old.remove();

  const container = document.createElement('div');
  container.className = 'particles-container';
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    p.textContent = emoji;
    p.style.setProperty('--dx', `${(Math.random()-0.5)*80}px`);
    p.style.setProperty('--dy', `${-40 - Math.random()*60}px`);
    p.style.left = `${30 + Math.random()*60}%`;
    p.style.top = `${40 + Math.random()*30}%`;
    p.style.animationDelay = `${Math.random()*0.3}s`;
    p.style.fontSize = `${12 + Math.random()*16}px`;
    container.appendChild(p);
  }
  canvas.appendChild(container);
  setTimeout(() => container.remove(), 2000);
}

// ==================== 宠物动画 ====================
function animatePet(type) {
  const canvas = document.getElementById('petCanvas');
  if (!canvas) return;
  canvas.classList.add(type);
  setTimeout(() => canvas.classList.remove(type), 600);

  if (type === 'happy' || type === 'love') {
    const particles = type === 'love' ? ['❤️','💕','💖'] : ['✨','🌟','💫'];
    spawnParticles(particles[Math.floor(Math.random()*particles.length)], 6);
  }
}

// ==================== 更新阶段徽章 ====================
const ALL_STAGES = [
  { name: '🥚 蛋蛋期', minDays: 0, emoji: '🥚', desc: '一颗小小的蛋，里面孕育着新生命' },
  { name: '🐣 幼年期', minDays: 1, emoji: '🐣', desc: '刚刚破壳，对世界充满好奇' },
  { name: '🐤 成长期', minDays: 3, emoji: '🐤', desc: '活泼好动，每天都在长大' },
  { name: '🦊 成熟期', minDays: 7, emoji: '🦊', desc: '变得越来越可靠了' },
  { name: '🦁 完全体', minDays: 14, emoji: '🦁', desc: '最好的伙伴！已经离不开彼此了' },
];

function getGrowthStage() {
  const days = (Date.now() - (state.startedAt || Date.now())) / (24*60*60*1000);
  let stage = ALL_STAGES[0];
  for (const s of ALL_STAGES) { if (days >= s.minDays) stage = s; }
  return stage;
}

// ==================== 成长加速事件 ====================
const GROWTH_EVENTS = [
  { id: 'study_hard', icon: '📚', title: '认真学习', desc: '智力 ≥ 15：宠物用学到的知识加速了自己的成长！', req: { intel: 15 }, reward: '缩短 0.5 天', apply: s => { s.growthBoost = (s.growthBoost||0) + 0.5; } },
  { id: 'strong_body', icon: '💪', title: '强健体魄', desc: '力量 ≥ 15：强壮的身体让成长更快了！', req: { str: 15 }, reward: '缩短 0.5 天', apply: s => { s.growthBoost = (s.growthBoost||0) + 0.5; } },
  { id: 'charming', icon: '🎨', title: '魅力四射', desc: '魅力 ≥ 15：好人缘带来了更多成长机会！', req: { cha: 15 }, reward: '缩短 0.5 天', apply: s => { s.growthBoost = (s.growthBoost||0) + 0.5; } },
  { id: 'all_round', icon: '🌟', title: '全面发展', desc: '三项属性 ≥ 20：全面发展让成长飞速！', req: { intel: 20, str: 20, cha: 20 }, reward: '缩短 1.5 天', apply: s => { s.growthBoost = (s.growthBoost||0) + 1.5; } },
  { id: 'adventure_luck', icon: '🍀', title: '冒险奇遇', desc: '冒险等级 ≥ 8 且完成过 5 次冒险：在冒险中遇到了成长之泉！', req: { advLv: 8, advCount: 5 }, reward: '缩短 1 天', apply: s => { s.growthBoost = (s.growthBoost||0) + 1; } },
];

function getGrowthEvent() {
  // 每天随机选一个成长事件
  const today = new Date().toDateString();
  if (state.growthEventDate === today && state.currentGrowthEvent) {
    return state.currentGrowthEvent;
  }

  // 随机选一个事件
  const ev = GROWTH_EVENTS[Math.floor(Math.random() * GROWTH_EVENTS.length)];
  state.growthEventDate = today;
  state.currentGrowthEvent = ev.id;
  saveState();
  return ev;
}

function checkGrowthEvent() {
  const ev = GROWTH_EVENTS.find(e => e.id === state.currentGrowthEvent);
  if (!ev) return false;
  if (state.growthEventCompleted === state.growthEventDate) return false; // 今天已完成

  const s = state.stats || {};
  const ta = state.totalAdventures || 0;
  const req = ev.req;
  let met = true;
  if (req.intel && (s.intelligence||0) < req.intel) met = false;
  if (req.str && (s.strength||0) < req.str) met = false;
  if (req.cha && (s.charisma||0) < req.cha) met = false;
  if (req.advLv && (s.adventureLv||1) < req.advLv) met = false;
  if (req.advCount && ta < req.advCount) met = false;

  return met;
}

function completeGrowthEvent() {
  const ev = GROWTH_EVENTS.find(e => e.id === state.currentGrowthEvent);
  if (!ev) return;
  if (!checkGrowthEvent()) {
    showToast('⚠️ 条件还没满足，继续加油吧！');
    return;
  }

  ev.apply(state);
  state.growthEventCompleted = state.growthEventDate;
  saveState();
  renderGrowthModal();
  addChatBubble('pet', `🎉 成长事件完成！成长速度加快了 ${ev.reward}！${state.petType==='cat'?'喵':'汪'}～`);
  showToast(`⚡ ${ev.reward}！`);
}

// ==================== 成长弹窗 ====================
function showGrowthModal() {
  const overlay = document.getElementById('growthModal');
  if (!overlay) return;
  overlay.classList.add('show');
  renderGrowthModal();
}

function hideGrowthModal() {
  document.getElementById('growthModal').classList.remove('show');
}

function renderGrowthModal() {
  const days = (Date.now() - (state.startedAt || Date.now())) / (24*60*60*1000);
  const boostDays = state.growthBoost || 0;
  const effectiveDays = days + boostDays;
  const current = getGrowthStage();

  // 渲染时间线
  const timeline = document.getElementById('growthTimeline');
  if (timeline) {
    timeline.innerHTML = ALL_STAGES.map((s, i) => {
      const reached = effectiveDays >= s.minDays;
      const isCurrent = current.name === s.name;
      const next = ALL_STAGES[i+1];
      let info = '';
      if (reached) {
        info = '<span style="color:#90c695;">✅ 已达成</span>';
      } else if (next) {
        const remaining = (s.minDays - effectiveDays).toFixed(1);
        info = `<span style="color:#f4a460;">还需 ${remaining} 天</span>`;
      }
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;${isCurrent?'background:var(--bg-warm);border-radius:8px;padding:8px;':''}${!reached&&!isCurrent?'opacity:0.5;':''}">
          <span style="font-size:24px;">${s.emoji}</span>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:${isCurrent?'700':'500'};">${s.name} ${isCurrent?'👈':''}</div>
            <div style="font-size:11px;color:var(--text-light);">${s.desc}</div>
            ${info ? `<div style="font-size:11px;">${info}</div>` : ''}
          </div>
        </div>`;
    }).join('');

    // 加速说明
    if (boostDays > 0) {
      timeline.innerHTML += `<div style="font-size:11px;color:var(--accent);text-align:center;margin-top:4px;">⚡ 已通过成长事件加速 ${boostDays.toFixed(1)} 天</div>`;
    }
  }

  // 渲染成长事件
  const eventEl = document.getElementById('growthEvent');
  if (eventEl) {
    const ev = getGrowthEvent();
    const completed = state.growthEventCompleted === state.growthEventDate;
    const met = checkGrowthEvent();

    if (completed) {
      eventEl.innerHTML = `<div style="text-align:center;color:#90c695;">✅ 今天的成长事件已完成！明天再来～</div>`;
    } else {
      const s = state.stats || {};
      const ta = state.totalAdventures || 0;
      const req = ev.req;
      const checks = [];
      if (req.intel) checks.push(`🧠 智力 ${s.intelligence||0}/${req.intel} ${(s.intelligence||0)>=req.intel?'✅':'❌'}`);
      if (req.str) checks.push(`💪 力量 ${s.strength||0}/${req.str} ${(s.strength||0)>=req.str?'✅':'❌'}`);
      if (req.cha) checks.push(`🎨 魅力 ${s.charisma||0}/${req.cha} ${(s.charisma||0)>=req.cha?'✅':'❌'}`);
      if (req.advLv) checks.push(`⭐ 冒险等级 ${s.adventureLv||1}/${req.advLv} ${(s.adventureLv||1)>=req.advLv?'✅':'❌'}`);
      if (req.advCount) checks.push(`🗺️ 冒险次数 ${ta}/${req.advCount} ${ta>=req.advCount?'✅':'❌'}`);

      eventEl.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <span style="font-size:20px;">${ev.icon}</span>
          <span style="font-size:13px;font-weight:600;">${ev.title}</span>
        </div>
        <div style="font-size:11px;color:var(--text-light);margin-bottom:6px;">${ev.desc}</div>
        <div style="font-size:11px;margin-bottom:6px;">${checks.join(' · ')}</div>
        <div style="font-size:12px;color:var(--accent);margin-bottom:8px;">🏆 奖励：${ev.reward}</div>
        ${met ? `<button class="modal-btn" onclick="completeGrowthEvent()" style="font-size:13px;">🎉 领取奖励！</button>` : '<span style="font-size:11px;color:var(--text-light);">条件未满足，继续培养宠物吧～</span>'}
      `;
    }
  }
}
