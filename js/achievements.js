/* ============================================================
   achievements.js — 成就徽章系统
   20+ 成就、5 个分类、解锁通知
   ============================================================ */

// 成就定义
const ACHIEVEMENTS = [
  // 💬 互动类
  { id: 'first_chat', icon: '💬', name: '初次对话', desc: '和宠物说第一句话', cat: '互动', check: s => (s.totalChats||0) >= 1 },
  { id: 'chat_50', icon: '💭', name: '话痨伙伴', desc: '累计对话 50 次', cat: '互动', check: s => (s.totalChats||0) >= 50 },
  { id: 'chat_200', icon: '🗣️', name: '无话不谈', desc: '累计对话 200 次', cat: '互动', check: s => (s.totalChats||0) >= 200 },
  { id: 'streak_3', icon: '🔥', name: '三日连续', desc: '连续 3 天互动', cat: '互动', check: s => (s.streak||0) >= 3 },
  { id: 'streak_7', icon: '🌟', name: '一周陪伴', desc: '连续 7 天互动', cat: '互动', check: s => (s.streak||0) >= 7 },

  // 🌱 成长类
  { id: 'love_50', icon: '💗', name: '亲密好友', desc: '好感度达到 50', cat: '成长', check: s => ((s.stats||{}).love||0) >= 50 },
  { id: 'love_100', icon: '❤️‍🔥', name: '灵魂伴侣', desc: '好感度达到 100', cat: '成长', check: s => ((s.stats||{}).love||0) >= 100 },
  { id: 'stage_adult', icon: '🦁', name: '长大成兽', desc: '成长到完全体', cat: '成长', check: s => {
    const days = (Date.now() - (s.startedAt||Date.now())) / (24*60*60*1000);
    return days >= 14;
  }},

  // 🗺️ 冒险类
  { id: 'adv_5', icon: '🗺️', name: '初级探险家', desc: '完成 5 次冒险', cat: '冒险', check: s => (s.totalAdventures||0) >= 5 },
  { id: 'adv_20', icon: '🧭', name: '资深冒险家', desc: '完成 20 次冒险', cat: '冒险', check: s => (s.totalAdventures||0) >= 20 },
  { id: 'adv_forest', icon: '🌳', name: '森林来客', desc: '解锁森林区域', cat: '冒险', check: s => ((s.stats||{}).adventureLv||1) >= 5 },
  { id: 'adv_ocean', icon: '🌊', name: '海边旅人', desc: '解锁海边区域', cat: '冒险', check: s => ((s.stats||{}).adventureLv||1) >= 9 },
  { id: 'adv_magic', icon: '✨', name: '魔法使', desc: '解锁魔法世界', cat: '冒险', check: s => ((s.stats||{}).adventureLv||1) >= 17 },

  // 📚 学习类
  { id: 'intel_10', icon: '📚', name: '小学者', desc: '智力达到 10', cat: '学习', check: s => ((s.stats||{}).intelligence||0) >= 10 },
  { id: 'str_10', icon: '💪', name: '小力士', desc: '力量达到 10', cat: '学习', check: s => ((s.stats||{}).strength||0) >= 10 },
  { id: 'cha_10', icon: '🎨', name: '小明星', desc: '魅力达到 10', cat: '学习', check: s => ((s.stats||{}).charisma||0) >= 10 },
  { id: 'all_30', icon: '🏆', name: '全面发展', desc: '三项属性都达到 30', cat: '学习', check: s => {
    const st = s.stats||{};
    return (st.intelligence||0)>=30 && (st.strength||0)>=30 && (st.charisma||0)>=30;
  }},

  // 💰 收集类
  { id: 'coins_100', icon: '🪙', name: '小有积蓄', desc: '攒到 100 金币', cat: '收集', check: s => ((s.stats||{}).coins||0) >= 100 },
  { id: 'coins_500', icon: '💰', name: '小富翁', desc: '攒到 500 金币', cat: '收集', check: s => ((s.stats||{}).coins||0) >= 500 },
  { id: 'diary_10', icon: '📝', name: '回忆收藏家', desc: '写 10 条日记', cat: '收集', check: s => (s.diary||[]).length >= 10 },
];

// ==================== 检查成就 ====================
function checkAchievements() {
  if (!state.unlockedAchievements) state.unlockedAchievements = [];
  let newUnlocks = [];

  for (const ach of ACHIEVEMENTS) {
    if (state.unlockedAchievements.includes(ach.id)) continue;
    if (ach.check(state)) {
      state.unlockedAchievements.push(ach.id);
      newUnlocks.push(ach);
    }
  }

  // 显示解锁通知
  newUnlocks.forEach((ach, i) => {
    setTimeout(() => {
      addChatBubble('system', `🏅 成就解锁：${ach.icon} ${ach.name}！`);
      showToast(`🏅 新成就！${ach.icon} ${ach.name}`);
    }, i * 1500);
  });

  if (newUnlocks.length > 0) saveState();
}

// ==================== 渲染成就页 ====================
function renderAchievements() {
  const grid = document.getElementById('achievementsGrid');
  if (!grid) return;

  const unlocked = state.unlockedAchievements || [];

  grid.innerHTML = ACHIEVEMENTS.map(ach => {
    const isUnlocked = unlocked.includes(ach.id);
    return `
      <div class="achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}">
        <span class="ach-icon">${ach.icon}</span>
        <div class="ach-name">${ach.name}</div>
        <div class="ach-desc">${isUnlocked ? ach.desc : '???'}</div>
      </div>`;
  }).join('');
}

// ==================== 连续天数 ====================
function updateStreak() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  if (state.lastInteractionDate === dateStr) return;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;

  if (state.lastInteractionDate === yesterdayStr) {
    state.streak = (state.streak || 0) + 1;
  } else {
    state.streak = 1;
  }
  state.lastInteractionDate = dateStr;
  saveState();

  // 连续天数里程碑
  if (state.streak === 3 || state.streak === 7 || state.streak === 30) {
    setTimeout(() => {
      addChatBubble('pet', `🎉 主人已经连续 ${state.streak} 天来看我了！好幸福～这是我们共同的记录！`);
    }, 2000);
  }
}
