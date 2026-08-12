/* ============================================================
   care.js — 照顾系统
   多种食物 + 多种玩耍方式 + 金币消费
   ============================================================ */

// 食物列表
const FOODS = [
  { id: 'kibble', icon: '🦴', name: '普通口粮', desc: '饱腹+25 · 免费', cost: 0, hunger: 25, mood: 0, love: 1, intel: 0, str: 0, cha: 0 },
  { id: 'fish', icon: '🐟', name: '小鱼干', desc: '饱腹+30 心情+5 · 3币', cost: 3, hunger: 30, mood: 5, love: 2, intel: 0, str: 0, cha: 0 },
  { id: 'steak', icon: '🥩', name: ' premium肉', desc: '饱腹+40 心情+8 · 8币', cost: 8, hunger: 40, mood: 8, love: 4, intel: 0, str: 2, cha: 0 },
  { id: 'cake', icon: '🍰', name: '小蛋糕', desc: '饱腹+20 心情+15 好感+5 · 10币', cost: 10, hunger: 20, mood: 15, love: 5, intel: 0, str: 0, cha: 3 },
  { id: 'salad', icon: '🥗', name: '健康沙拉', desc: '饱腹+20 智力+3 · 5币', cost: 5, hunger: 20, mood: 3, love: 2, intel: 3, str: 0, cha: 0 },
  { id: 'milk', icon: '🥛', name: '热牛奶', desc: '饱腹+15 心情+10 · 2币', cost: 2, hunger: 15, mood: 10, love: 3, intel: 0, str: 0, cha: 0 },
];

// 玩耍列表
const PLAYS = [
  { id: 'ball', icon: '🎾', name: '玩球', desc: '心情+18 · 免费', cost: 0, mood: 18, love: 2, intel: 0, str: 1, cha: 0 },
  { id: 'wand', icon: '🧶', name: '逗猫棒/飞盘', desc: '心情+25 好感+4 · 3币', cost: 3, mood: 25, love: 4, intel: 0, str: 2, cha: 0 },
  { id: 'puzzle', icon: '🧩', name: '益智玩具', desc: '心情+15 智力+4 · 5币', cost: 5, mood: 15, love: 2, intel: 4, str: 0, cha: 1 },
  { id: 'music', icon: '🎵', name: '音乐盒', desc: '心情+20 魅力+4 · 8币', cost: 8, mood: 20, love: 3, intel: 0, str: 0, cha: 4 },
  { id: 'chase', icon: '🏃', name: '追逐游戏', desc: '心情+22 力量+3 · 4币', cost: 4, mood: 22, love: 3, intel: 0, str: 3, cha: 0 },
];

// ==================== 打开照顾弹窗 ====================
function showCareModal() {
  const overlay = document.getElementById('careModal');
  if (!overlay) return;
  overlay.classList.add('show');

  // 更新金币显示
  document.getElementById('careCoins').textContent = (state.stats.coins || 0);

  // 渲染食物列表
  const foodEl = document.getElementById('foodOptions');
  if (foodEl) {
    foodEl.innerHTML = FOODS.map(f => `
      <button class="outing-option" onclick="doFeed('${f.id}')">
        <span class="opt-icon">${f.icon}</span><span class="opt-title">${f.name}</span>
        <span class="opt-desc">${f.desc}</span>
      </button>`).join('');
  }

  // 渲染玩耍列表
  const playEl = document.getElementById('playOptions');
  if (playEl) {
    playEl.innerHTML = PLAYS.map(p => `
      <button class="outing-option" onclick="doPlay('${p.id}')">
        <span class="opt-icon">${p.icon}</span><span class="opt-title">${p.name}</span>
        <span class="opt-desc">${p.desc}</span>
      </button>`).join('');
  }
}

function hideCareModal() {
  const overlay = document.getElementById('careModal');
  if (overlay) overlay.classList.remove('show');
}

// ==================== 喂食 ====================
function doFeed(foodId) {
  const food = FOODS.find(f => f.id === foodId);
  if (!food) return;

  const coins = state.stats.coins || 0;
  if (food.cost > coins) {
    showToast('🪙 金币不够啦！去打工赚一些吧～');
    return;
  }

  // 扣金币
  state.stats.coins = coins - food.cost;
  // 加属性
  state.stats.hunger = Math.min(100, (state.stats.hunger || 80) + food.hunger);
  state.stats.mood = Math.min(100, (state.stats.mood || 85) + food.mood);
  state.stats.love = Math.min(100, (state.stats.love || 50) + food.love);
  state.stats.intelligence = (state.stats.intelligence || 0) + food.intel;
  state.stats.strength = (state.stats.strength || 0) + food.str;
  state.stats.charisma = (state.stats.charisma || 0) + food.cha;

  hideCareModal();
  saveState();
  renderStats();

  const replies = [
    `吧唧吧唧～${food.name}好好吃！谢谢主人！${state.petType==='cat'?'喵':'汪'}～`,
    `哇！是我最喜欢的${food.name}！主人最懂我了 ❤️`,
    `好吃好吃！肚子饱饱的，感觉充满了能量！`,
  ];
  addChatBubble('pet', replies[Math.floor(Math.random()*replies.length)]);
  if (typeof checkAchievements === 'function') checkAchievements();
}

// ==================== 玩耍 ====================
function doPlay(playId) {
  const play = PLAYS.find(p => p.id === playId);
  if (!play) return;

  const coins = state.stats.coins || 0;
  if (play.cost > coins) {
    showToast('🪙 金币不够啦！去打工赚一些吧～');
    return;
  }

  state.stats.coins = coins - play.cost;
  state.stats.mood = Math.min(100, (state.stats.mood || 85) + play.mood);
  state.stats.love = Math.min(100, (state.stats.love || 50) + play.love);
  state.stats.intelligence = (state.stats.intelligence || 0) + play.intel;
  state.stats.strength = (state.stats.strength || 0) + play.str;
  state.stats.charisma = (state.stats.charisma || 0) + play.cha;

  hideCareModal();
  saveState();
  renderStats();
  animatePet('happy');

  const replies = [
    `哈哈哈好好玩！${play.name}太有趣了！再来再来～`,
    `和主人一起玩${play.name}，是今天最开心的时刻！`,
    `玩得好尽兴！${state.petType==='cat'?'喵':'汪'}～有点累了但超满足！`,
  ];
  addChatBubble('pet', replies[Math.floor(Math.random()*replies.length)]);
  if (typeof checkAchievements === 'function') checkAchievements();
}

// ==================== 摸摸 ====================
function doCare(action) {
  hideCareModal();

  if (action === 'pet_head') {
    state.stats.mood = Math.min(100, (state.stats.mood || 85) + 10);
    state.stats.love = Math.min(100, (state.stats.love || 50) + 2);
    animatePet('love');
    addChatBubble('pet', `${state.petType==='cat'?'喵呜～':'汪汪！'} 被主人摸头的感觉最好啦～❤️`);
  } else if (action === 'pet_hug') {
    state.stats.mood = Math.min(100, (state.stats.mood || 85) + 15);
    state.stats.love = Math.min(100, (state.stats.love || 50) + 5);
    animatePet('love');
    addChatBubble('pet', `好温暖...🫂 主人的抱抱是世界上最好的东西！`);
  }

  saveState();
  renderStats();
  if (typeof checkAchievements === 'function') checkAchievements();
}
