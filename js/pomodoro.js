/* ============================================================
   pomodoro.js — 番茄钟 + 课程训练 + 打工小镇
   外出系统：学习/锻炼/艺术/打工/冒险
   ============================================================ */

let pomodoroInterval = null;
let pomodoroSeconds = 0;
let pomodoroTotal = 0;
let pomodoroActivity = null; // 'intelligence' | 'strength' | 'charisma' | 'work'

const COURSES = {
  intelligence: { icon: '📚', name: '学习课程', verb: '学习', stat: 'intelligence', emoji: '🧠' },
  strength: { icon: '💪', name: '锻炼健身', verb: '锻炼', stat: 'strength', emoji: '🏋️' },
  charisma: { icon: '🎨', name: '艺术修养', verb: '练习', stat: 'charisma', emoji: '✨' },
};

const JOBS = [
  { name: '便利店店员', icon: '🏪', minLv: 1, coinsPerMin: 1, desc: '在街角便利店帮忙收银' },
  { name: '快递小助手', icon: '📦', minLv: 4, coinsPerMin: 2, desc: '帮快递员叔叔分拣包裹' },
  { name: '咖啡馆服务生', icon: '☕', minLv: 8, coinsPerMin: 3, desc: '在宠物咖啡馆招待客人' },
  { name: '冒险向导', icon: '🗺️', minLv: 13, coinsPerMin: 5, desc: '带领新来的宠物探索世界' },
];

// ==================== 外出选择面板 ====================
function showOutingModal() {
  const overlay = document.getElementById('outingModal');
  if (!overlay) return;
  overlay.classList.add('show');

  // 渲染打工选项
  const jobList = document.getElementById('jobOptions');
  if (jobList) {
    const advLv = (state.stats && state.stats.adventureLv) || 1;
    jobList.innerHTML = JOBS.map(j => {
      const locked = advLv < j.minLv;
      return `<button class="outing-option${locked ? ' locked' : ''}" data-lv="${j.minLv}" onclick="startWork('${j.name}', ${j.coinsPerMin})">
        <span class="opt-icon">${j.icon}</span>
        <span class="opt-title">${j.name}</span>
        <span class="opt-desc">${j.desc} · ${j.coinsPerMin}币/分钟</span>
      </button>`;
    }).join('');
  }
}

function hideOutingModal() {
  const overlay = document.getElementById('outingModal');
  if (overlay) overlay.classList.remove('show');
}

// ==================== 开始课程 ====================
function startCourse(typeKey) {
  const course = COURSES[typeKey];
  if (!course) return;
  hideOutingModal();
  pomodoroActivity = { type: 'course', key: typeKey, ...course };
  document.getElementById('pomodoroLabel').textContent = `${course.icon} ${course.name}中...`;
  document.getElementById('pomodoroPetEmoji').textContent = '📖';
  showTimeSelection();
}

// ==================== 开始打工 ====================
function startWork(jobName, coinsPerMin) {
  hideOutingModal();
  pomodoroActivity = { type: 'work', name: jobName, coinsPerMin };
  document.getElementById('pomodoroLabel').textContent = `💼 ${jobName}中...`;
  document.getElementById('pomodoroPetEmoji').textContent = '💼';
  showTimeSelection();
}

// ==================== 时间选择 ====================
function showTimeSelection() {
  const overlay = document.getElementById('pomodoroOverlay');
  const ringEl = document.getElementById('pomodoroRing');
  const completeEl = document.getElementById('pomodoroComplete');
  const timeSelect = document.getElementById('timeSelection');

  if (overlay) overlay.classList.add('active');
  if (ringEl) ringEl.style.display = 'none';
  if (completeEl) completeEl.classList.remove('show');
  if (timeSelect) timeSelect.style.display = 'block';
}

function selectTime(minutes) {
  document.getElementById('timeSelection').style.display = 'none';
  document.getElementById('pomodoroRing').style.display = 'block';
  document.querySelectorAll('.time-option').forEach(o => o.classList.remove('selected'));
  // 高亮选中的时间按钮
  const btns = document.querySelectorAll('.time-option');
  btns.forEach(b => { if (b.textContent.includes(minutes+'分钟')) b.classList.add('selected'); });
  startPomodoro(minutes);
}

// ==================== 番茄钟计时 ====================
function startPomodoro(minutes) {
  pomodoroSeconds = minutes * 60;
  pomodoroTotal = pomodoroSeconds;
  updatePomodoroDisplay();
  showToast(`开始啦！${minutes} 分钟后宠物就回来～`);

  pomodoroInterval = setInterval(() => {
    pomodoroSeconds--;
    updatePomodoroDisplay();
    if (pomodoroSeconds <= 0) {
      completePomodoro();
    }
  }, 1000);
}

function updatePomodoroDisplay() {
  const timeEl = document.getElementById('pomodoroTime');
  const circle = document.getElementById('pomodoroCircle');
  if (timeEl) {
    const m = Math.floor(pomodoroSeconds / 60);
    const s = pomodoroSeconds % 60;
    timeEl.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  if (circle) {
    const circumference = 2 * Math.PI * 65;
    const progress = 1 - (pomodoroSeconds / pomodoroTotal);
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference * (1 - progress);
  }
}

function completePomodoro() {
  clearInterval(pomodoroInterval);
  pomodoroInterval = null;

  const ringEl = document.getElementById('pomodoroRing');
  const completeEl = document.getElementById('pomodoroComplete');
  if (ringEl) ringEl.style.display = 'none';
  if (completeEl) {
    completeEl.classList.add('show');
    let rewardText = '';
    const act = pomodoroActivity;

    if (act && act.type === 'course') {
      const statKey = act.key;
      const minutes = Math.floor(pomodoroTotal / 60);
      const gain = Math.floor(minutes * 1.5);
      state.stats[statKey] = (state.stats[statKey] || 0) + gain;
      state.totalStudyMinutes = (state.totalStudyMinutes || 0) + minutes;
      rewardText = `${act.emoji} ${act.name}完成！${act.stat === 'intelligence' ? '智力' : act.stat === 'strength' ? '力量' : '魅力'} +${gain}`;
    } else if (act && act.type === 'work') {
      const minutes = Math.floor(pomodoroTotal / 60);
      const coins = minutes * act.coinsPerMin;
      state.stats.coins = (state.stats.coins || 0) + coins;
      rewardText = `💼 打工完成！在${act.name}赚了 ${coins} 金币 🪙`;
    }

    completeEl.querySelector('.reward').textContent = rewardText;
    completeEl.querySelector('p').textContent = `${state.petName}完成了 ${Math.floor(pomodoroTotal/60)} 分钟的任务！`;
  }

  saveState();
  renderStats();
  if (typeof checkAchievements === 'function') checkAchievements();
}

function cancelPomodoro() {
  if (pomodoroInterval) {
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
  }
  // 按比例给一些奖励
  const done = pomodoroTotal - pomodoroSeconds;
  const minutes = Math.floor(done / 60);
  if (minutes >= 1) {
    const act = pomodoroActivity;
    if (act && act.type === 'course') {
      const gain = Math.floor(minutes * 1.5 * 0.5); // 提前结束打对折
      state.stats[act.key] = (state.stats[act.key] || 0) + gain;
    } else if (act && act.type === 'work') {
      const coins = Math.floor(minutes * act.coinsPerMin * 0.5);
      state.stats.coins = (state.stats.coins || 0) + coins;
    }
    addChatBubble('pet', `虽然提前结束了，但还是做了 ${minutes} 分钟呢！下次加油～`);
    saveState();
    renderStats();
  }
  closePomodoro();
}

function closePomodoro() {
  clearInterval(pomodoroInterval);
  pomodoroInterval = null;
  const overlay = document.getElementById('pomodoroOverlay');
  if (overlay) overlay.classList.remove('active');
  pomodoroActivity = null;
  // 回到主页
  if (typeof switchPage === 'function') switchPage('home');
}
