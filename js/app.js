/* ============================================================
   app.js — 主入口、状态管理、初始化
   ============================================================ */

// ==================== 全局状态 ====================
const DEFAULT_STATE = {
  petType: 'cat',
  petName: '豆豆',
  stats: {
    hunger: 80, mood: 85, love: 50,
    adventureExp: 0, adventureLv: 1,
    intelligence: 0, strength: 0, charisma: 0,
    coins: 0, accessories: [],
  },
  lastUpdate: Date.now(),
  startedAt: Date.now(),
  messages: [],
  diary: [],
  eventCooldown: 0,
  interactedToday: false,
  totalChats: 0,
  totalAdventures: 0,
  totalStudyMinutes: 0,
  streak: 1,
  unlockedAchievements: [],
  lastInteractionDate: '',
  lastDailyQuestion: '',
  lastWeeklyDate: '',
  lastMonthlyDate: '',
  lastGreeting: '',
};
let state = {};

// ==================== 状态持久化 ====================
function loadState() {
  try {
    const raw = localStorage.getItem('petAppState');
    if (raw) {
      const saved = JSON.parse(raw);
      state = deepMerge(JSON.parse(JSON.stringify(DEFAULT_STATE)), saved);
      // 确保嵌套对象完整
      state.stats = { ...DEFAULT_STATE.stats, ...(saved.stats || {}) };
      if (!state.diary) state.diary = [];
      if (!state.messages) state.messages = [];
      if (!state.unlockedAchievements) state.unlockedAchievements = [];
    } else {
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  } catch(e) {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function saveState() {
  state.lastUpdate = Date.now();
  try { localStorage.setItem('petAppState', JSON.stringify(state)); } catch(e) {}
}

// API 配置
function getApiKey() { return localStorage.getItem('petAppApiKey') || ''; }
function setApiKey(k) { localStorage.setItem('petAppApiKey', k); }
function getModel() { return localStorage.getItem('petAppModel') || 'deepseek-chat'; }
function setModel(m) { localStorage.setItem('petAppModel', m); }

// ==================== 时间衰减 ====================
function applyDecay() {
  const now = Date.now();
  const elapsed = now - (state.lastUpdate || now);
  if (elapsed <= 0) return;

  const s = state.stats;
  s.hunger = Math.max(0, s.hunger - Math.floor(elapsed / (30*60*1000)) * 2);
  s.mood = Math.max(0, s.mood - Math.floor(elapsed / (60*60*1000)) * 1);
  const days = elapsed / (24*60*60*1000);
  if (days > 1) s.love = Math.max(0, s.love - Math.floor(days));

  state.lastUpdate = now;
}

// ==================== 状态条渲染 ====================
function renderStats() {
  const grid = document.getElementById('statsGrid');
  if (!grid) return;

  const s = state.stats || {};
  const statDefs = [
    { icon: '🍖', key: 'hunger', cls: 'hunger', val: s.hunger||80, max: 100 },
    { icon: '😊', key: 'mood', cls: 'mood', val: s.mood||85, max: 100 },
    { icon: '❤️', key: 'love', cls: 'love', val: s.love||50, max: 100 },
    { icon: '⭐', key: 'adventure', cls: 'adventure', val: s.adventureLv||1, max: 20 },
    { icon: '🧠', key: 'intelligence', cls: 'intelligence', val: s.intelligence||0, max: 100 },
    { icon: '💪', key: 'strength', cls: 'strength', val: s.strength||0, max: 100 },
    { icon: '🎨', key: 'charisma', cls: 'charisma', val: s.charisma||0, max: 100 },
  ];

  grid.innerHTML = statDefs.map(sd => {
    const pct = Math.min(100, (sd.val / sd.max) * 100);
    return `
      <div class="stat-row">
        <span class="stat-icon">${sd.icon}</span>
        <div class="stat-bar-wrap"><div class="stat-bar-fill ${sd.cls}" style="width:${pct}%"></div></div>
        <span class="stat-val">${sd.val}${sd.max < 100 ? '/'+sd.max : ''}</span>
      </div>`;
  }).join('');

  // 金币显示
  const coinsEl = document.getElementById('coinsDisplay');
  if (coinsEl) coinsEl.textContent = `🪙 ${s.coins || 0}`;
}

// ==================== 页面切换 ====================
function switchPage(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  const page = document.getElementById(`page-${pageName}`);
  if (page) page.classList.add('active');
  const tabBtn = document.querySelector(`[data-page="${pageName}"]`);
  if (tabBtn) tabBtn.classList.add('active');

  if (pageName === 'diary') {
    renderDiary();
    renderAchievements();
  }
  if (pageName === 'home') {
    renderStats();
  }
}

// ==================== 定时器 ====================
let decayTimer = null;
function startTimers() {
  if (decayTimer) clearInterval(decayTimer);
  decayTimer = setInterval(() => {
    applyDecay();
    saveState();
    renderStats();

    // 低数值提醒
    const s = state.stats || {};
    if (s.hunger < 20 && s.hunger > 0) {
      const sw = state.petType === 'cat' ? '喵...' : '呜...';
      addChatBubble('pet', `${sw}主人...肚子好饿...有吃的吗？🍖`);
    }
    if (s.mood < 25 && s.mood > 0) {
      addChatBubble('pet', '主人...陪我玩一下好不好？有点寂寞...😢');
    }
  }, 90000); // 每1.5分钟检查

  // 每日重置
  const now = new Date();
  const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1).getTime() - now.getTime();
  setTimeout(() => {
    state.interactedToday = false;
    dailyQuestionAsked = false;
    saveState();
    setInterval(() => { state.interactedToday = false; dailyQuestionAsked = false; saveState(); }, 24*60*60*1000);
  }, msToMidnight + 1000);
}

// ==================== Toast ====================
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ==================== 事件绑定 ====================
function bindEvents() {
  // Tab 切换
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchPage(btn.dataset.page));
  });

  // 子标签（日记/成就）
  document.querySelectorAll('.sub-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.sub;
      document.getElementById('diarySection').style.display = target === 'diary' ? '' : 'none';
      document.getElementById('achievementsSection').style.display = target === 'achievements' ? '' : 'none';
      if (target === 'achievements') renderAchievements();
    });
  });

  // 快捷操作
  document.querySelectorAll('.quick-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => doAction(btn.dataset.action));
  });

  // 照顾按钮
  const careBtn = document.getElementById('careBtn');
  if (careBtn) careBtn.addEventListener('click', showCareModal);
  const closeCare = document.getElementById('closeCareModal');
  if (closeCare) closeCare.addEventListener('click', hideCareModal);

  // 聊天发送
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      resetInteractionTime();
      updateStreak();
      sendMessage(text);
    });
  }
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });
    input.addEventListener('focus', () => resetInteractionTime());
  }

  // 成长阶段点击
  const stageEl = document.getElementById('petStage');
  if (stageEl) {
    stageEl.style.cursor = 'pointer';
    stageEl.addEventListener('click', showGrowthModal);
  }
  const closeGrowth = document.getElementById('closeGrowthModal');
  if (closeGrowth) closeGrowth.addEventListener('click', hideGrowthModal);

  // 宠物点击
  const petCanvas = document.getElementById('petCanvas');
  if (petCanvas) {
    petCanvas.addEventListener('click', () => {
      animatePet('love');
      (state.stats).love = Math.min(100, ((state.stats).love||50) + 2);
      (state.stats).mood = Math.min(100, ((state.stats).mood||85) + 5);
      saveState();
      renderStats();
      resetInteractionTime();
      const s = state.petType === 'cat' ? '喵呜～❤️' : '汪汪！❤️';
      addChatBubble('pet', `${s} 被主人摸的感觉最好啦！`);
      if (typeof checkAchievements === 'function') checkAchievements();
    });
  }

  // 设置页保存
  const saveBtn = document.getElementById('saveSettingsBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const type = document.getElementById('settingPetType').value;
      const name = document.getElementById('settingPetName').value.trim();
      const apiKey = document.getElementById('settingApiKey').value.trim();
      const model = document.getElementById('settingModel').value;
      if (name) state.petName = name;
      state.petType = type;
      if (apiKey) setApiKey(apiKey);
      setModel(model);
      saveState();
      renderPet();
      renderStats();
      if (document.getElementById('headerName')) document.getElementById('headerName').textContent = state.petName;
      document.getElementById('settingPetType').value = state.petType;
      document.getElementById('settingPetName').value = state.petName;
      document.getElementById('settingApiKey').value = getApiKey();
      document.getElementById('settingModel').value = getModel();
      addChatBubble('pet', '设置好啦！我们继续吧～🐾');
      switchPage('home');
    });
  }

  // 重置
  const resetBtn = document.getElementById('resetDataBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('确定要重置吗？所有数据都会被清除！')) {
        localStorage.removeItem('petAppState');
        localStorage.removeItem('petAppApiKey');
        localStorage.removeItem('petAppModel');
        location.reload();
      }
    });
  }

  // 导出数据
  const exportBtn = document.getElementById('exportDataBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const data = {
        petAppState: localStorage.getItem('petAppState'),
        petAppApiKey: localStorage.getItem('petAppApiKey'),
        petAppModel: localStorage.getItem('petAppModel'),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pet-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('📤 数据已导出！');
    });
  }

  // 导入数据
  const importBtn = document.getElementById('importDataBtn');
  const importFile = document.getElementById('importFileInput');
  if (importBtn && importFile) {
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.petAppState) localStorage.setItem('petAppState', data.petAppState);
          if (data.petAppApiKey) localStorage.setItem('petAppApiKey', data.petAppApiKey);
          if (data.petAppModel) localStorage.setItem('petAppModel', data.petAppModel);
          showToast('📥 数据已导入！刷新后生效');
          setTimeout(() => location.reload(), 1500);
        } catch(e) {
          showToast('❌ 文件格式不对，请重新选择');
        }
      };
      reader.readAsText(file);
    });
  }

  // 语音按钮
  const micBtn = document.getElementById('micBtn');
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      if (isListening) { stopListening(); } else { startListening(); }
    });
  }

  // 分享明信片按钮
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      generateShareCard();
      addChatBubble('pet', '📸 明信片生成好啦！快去看看相册～');
    });
  }

  // 日记按钮
  const addDiaryBtn = document.getElementById('addDiaryBtn');
  if (addDiaryBtn) addDiaryBtn.addEventListener('click', promptNewDiary);

  // 欢迎弹窗 - 宠物选择
  document.querySelectorAll('.pet-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.pet-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  // 欢迎弹窗 - 开始
  const startBtn = document.getElementById('welcomeStart');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      const selType = document.querySelector('.pet-option.selected')?.dataset?.type || 'cat';
      const name = document.getElementById('welcomeName').value.trim() || '豆豆';
      state.petType = selType;
      state.petName = name;
      state.startedAt = Date.now();
      state.lastUpdate = Date.now();
      saveState();
      renderPet();
      renderStats();
      document.getElementById('headerName').textContent = name;
      document.getElementById('settingPetType').value = selType;
      document.getElementById('settingPetName').value = name;
      document.getElementById('welcomeModal').classList.remove('show');
      const sw = selType === 'cat' ? '喵' : '汪';
      addChatBubble('pet', `你好呀主人！我是${name}～从今天起，我会一直陪着你的！${sw}～🐾`);
      addDiaryEntry('我们相遇的那天', `主人给我起名叫"${name}"，从今天起我们就是一家人了！`);
      renderDiary();
      updateStreak();
      checkDailyQuestion();
      startProactiveChat();
      checkWeeklyReport();
    });
  }

  // 外出弹窗关闭
  const closeOuting = document.getElementById('closeOutingModal');
  if (closeOuting) closeOuting.addEventListener('click', hideOutingModal);

  // 课程按钮
  document.querySelectorAll('[data-course]').forEach(btn => {
    btn.addEventListener('click', () => startCourse(btn.dataset.course));
  });

  // 番茄钟操作
  const cancelPomo = document.getElementById('cancelPomodoro');
  if (cancelPomo) cancelPomo.addEventListener('click', cancelPomodoro);
  const closePomo = document.getElementById('closePomodoro');
  if (closePomo) closePomo.addEventListener('click', closePomodoro);
}

// ==================== 欢迎弹窗 ====================
function showWelcomeIfNeeded() {
  const apiKey = getApiKey();
  if (!apiKey) {
    document.getElementById('welcomeModal').classList.add('show');
    document.getElementById('welcomeName').value = state.petName || '豆豆';
    document.querySelectorAll('.pet-option').forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.type === state.petType);
    });
  }
}

// ==================== 初始化 ====================
function init() {
  loadState();
  applyDecay();
  renderPet();
  renderStats();
  bindEvents();
  startTimers();

  // 回填设置页
  document.getElementById('settingPetType').value = state.petType;
  document.getElementById('settingPetName').value = state.petName;
  document.getElementById('settingApiKey').value = getApiKey();
  document.getElementById('settingModel').value = getModel();

  // 恢复聊天历史
  if (state.messages && state.messages.length > 0) {
    const area = document.getElementById('chatArea');
    if (area) {
      area.innerHTML = '';
      state.messages.slice(-20).forEach(m => {
        const role = m.role === 'user' ? 'user' : 'pet';
        addChatBubble(role, m.content);
      });
    }
  }

  // 首次设置
  showWelcomeIfNeeded();

  // 如果已经设置过，启动各种功能
  if (getApiKey()) {
    updateStreak();
    checkDailyQuestion();
    startProactiveChat();
    checkWeeklyReport();
    checkAchievements();
    if (typeof checkHoliday === 'function') checkHoliday();
    if (typeof checkDailySummary === 'function') checkDailySummary();
  }

  console.log('🐾 宠物 App v2 初始化完成！');
  console.log(`   ${state.petType==='cat'?'🐱':'🐶'} ${state.petName} | Lv.${state.stats.adventureLv||1}`);
  console.log(`   🍖${state.stats.hunger} 😊${state.stats.mood} ❤️${state.stats.love} | 🪙${state.stats.coins||0}`);
  console.log(`   📝${(state.diary||[]).length}条日记 | 💬${(state.messages||[]).length}条消息 | 🏅${(state.unlockedAchievements||[]).length}个成就`);
}

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
document.addEventListener('DOMContentLoaded', init);
