/* ============================================================
   daily.js — 每日一问 + 主动搭话
   每日问题、时段主动问候、空闲提醒
   ============================================================ */

let proactiveTimers = [];
let lastInteractionTime = Date.now();
let dailyQuestionAsked = false;

// ==================== 每日一问 ====================
function checkDailyQuestion() {
  if (dailyQuestionAsked) return;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  if (state.lastDailyQuestion === today) return;

  dailyQuestionAsked = true;
  state.lastDailyQuestion = today;
  saveState();

  // 延迟一下再问，不要一打开就跳出来
  setTimeout(() => {
    const hour = now.getHours();
    let tone = '';
    if (hour < 10) tone = '清晨';
    else if (hour < 14) tone = '上午';
    else if (hour < 18) tone = '下午';
    else tone = '晚上';

    const questions = [
      `主人～${tone}好！今天有什么期待的事情吗？🌟`,
      `${tone}啦！如果今天是一种颜色，你觉得会是什么颜色呢？🎨`,
      `主人主人！我突然好奇——你小时候最想养什么宠物呀？`,
      `今天的天气很适合聊天呢～主人有没有一个很久没联系但很想念的人？`,
      `🤔 如果现在可以实现一个愿望，主人会许什么愿呢？`,
      `我发现了一件有趣的事——主人最近好像比上个月更开心了！你觉得呢？`,
      `${tone}安～今天有什么不一样的事情发生吗？好的坏的我都想听～`,
    ];
    const q = questions[Math.floor(Math.random() * questions.length)];
    addChatBubble('pet', q);
  }, 3000);
}

// ==================== 主动搭话 ====================
function startProactiveChat() {
  stopProactiveChat();
  resetInteractionTime();

  // 空闲提醒：5分钟
  proactiveTimers.push(setInterval(() => {
    const idle = Date.now() - lastInteractionTime;
    if (idle > 5 * 60 * 1000 && idle < 6 * 60 * 1000) {
      addChatBubble('system', '（宠物在角落里自己玩着玩具...）');
      addChatBubble('pet', '主人是不是在忙呀？没关系，我在这儿陪着你～🐾');
    }
    if (idle > 20 * 60 * 1000 && idle < 21 * 60 * 1000) {
      addChatBubble('pet', '主人...还在忙吗？要不休息一下？我给你讲个笑话？😺');
    }
  }, 2 * 60 * 1000)); // 每2分钟检查

  // 时段问候
  proactiveTimers.push(setInterval(() => {
    const h = new Date().getHours();
    const m = new Date().getMinutes();
    const key = `${h}:${Math.floor(m/10)}`;

    // 每个时段只触发一次
    if (state.lastGreeting === key) return;
    const idle = Date.now() - lastInteractionTime;
    if (idle < 60 * 1000) return; // 刚互动过就不打扰

    if (h >= 7 && h <= 9 && m < 30) {
      state.lastGreeting = key;
      addChatBubble('pet', `早安！☀️ 新的一天开始啦～今天也要元气满满哦！${state.petType==='cat'?'喵':'汪'}！`);
    } else if (h >= 12 && h <= 13 && m < 30) {
      state.lastGreeting = key;
      addChatBubble('pet', '到午饭时间啦！🍱 主人有好好吃饭吗？我也想吃...（盯着你的饭）');
    } else if (h >= 20 && h <= 22 && m < 30) {
      state.lastGreeting = key;
      addChatBubble('pet', `晚上好～🌙 今天过得怎么样？我一直在等主人回来呢！`);
    } else if (h >= 23 && m < 20) {
      state.lastGreeting = key;
      addChatBubble('pet', '已经好晚了...主人不困吗？💤 熬夜对身体不好哦...');
    }
    saveState();
  }, 5 * 60 * 1000)); // 每5分钟检查时段
}

function stopProactiveChat() {
  proactiveTimers.forEach(t => clearInterval(t));
  proactiveTimers = [];
}

function resetInteractionTime() {
  lastInteractionTime = Date.now();
}

// ==================== 每日聊天总结 ====================
function checkDailySummary() {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  if (state.lastSummaryDate === today) return;
  // 只在深夜触发（23点之后）
  if (now.getHours() < 23) return;

  const msgs = state.messages || [];
  const todayMsgs = msgs.slice(-30); // 取最近30条（近似今天的）
  if (todayMsgs.length < 4) return; // 太少就不总结

  state.lastSummaryDate = today;
  saveState();

  generateDailySummary(todayMsgs);
}

async function generateDailySummary(msgs) {
  const apiKey = getApiKey();
  if (!apiKey) return;

  // 把对话转成文本
  const convo = msgs.map(m => `${m.role==='user'?'主人':'宠物'}: ${m.content}`).join('\n');

  try {
    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: getModel(),
        messages: [{
          role: 'user',
          content: `你是${state.petName}（一只${state.petType==='cat'?'小猫':'小狗'}），请根据今天主人和你的对话，以你的宠物口吻写一篇简短的"主人今日记录"。\n\n对话内容：\n${convo}\n\n要求：用宠物视角、3-5句话、温暖可爱、像日记一样记录主人今天的状态和心情。直接输出日记内容，不要加标题。`
        }],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    if (resp.ok) {
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content || '';
      if (text.trim()) {
        addDiaryEntry('📝 今日记录', text.trim());
        setTimeout(() => {
          addChatBubble('system', '📝 今天的聊天已经自动记成日记啦～');
        }, 1000);
      }
    }
  } catch(e) {
    // 失败了也不影响使用
  }
}

// ==================== 通知 Toast ====================
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
