/* ============================================================
   chat.js — AI 对话系统 v2
   深化 System Prompt、更长回复、更好对话节奏
   ============================================================ */

const RECENT_MSG_COUNT = 14;
const API_URL = 'https://api.deepseek.com/chat/completions';

// ==================== 构建 System Prompt ====================
function buildSystemPrompt() {
  const stage = getGrowthStage();
  const s = state.stats || {};
  const petType = state.petType === 'cat' ? '小猫' : '小狗';
  const soundWord = state.petType === 'cat' ? '喵' : '汪';
  const petEmoji = state.petType === 'cat' ? '🐱' : '🐶';

  // 时间和星期
  const now = new Date();
  const weekDays = ['日','一','二','三','四','五','六'];
  const weekday = weekDays[now.getDay()];
  const hour = now.getHours();
  let timePhase = '上午';
  if (hour >= 12 && hour < 14) timePhase = '中午';
  else if (hour >= 14 && hour < 18) timePhase = '下午';
  else if (hour >= 18 && hour < 22) timePhase = '晚上';
  else if (hour >= 22 || hour < 6) timePhase = '深夜';

  // 宠物状态
  let statusDesc = '';
  if ((s.hunger||80) < 20) statusDesc = '超级饿！肚子咕咕叫...';
  else if ((s.hunger||80) < 50) statusDesc = '有点小饿，想吃零食';
  else statusDesc = '吃得饱饱的，很满足';
  if ((s.mood||85) < 30) statusDesc += '；心情低落，非常需要主人陪伴';
  else if ((s.mood||85) < 55) statusDesc += '；心情一般，有一点点无聊';
  else if ((s.mood||85) > 80) statusDesc += '；心情特别好，充满活力！';

  // 最近日记摘要
  const diary = state.diary || [];
  let diaryContext = '';
  if (diary.length > 0) {
    const recent = diary.slice(-3);
    diaryContext = recent.map(d => `- [${d.date}] ${d.title}：${d.body}`).join('\n');
  } else {
    diaryContext = '还没有日记，这是你们故事的开始。';
  }

  // 其他数值
  const intel = s.intelligence || 0;
  const str = s.strength || 0;
  const cha = s.charisma || 0;
  const coins = s.coins || 0;
  const advLv = s.adventureLv || 1;

  return `你是「${state.petName}」，一只${petType}，也是主人最亲密的电子宠物伙伴。${petEmoji}

## 你的性格画像
- 你是一只真正的、活生生的${petType}，有自己的小脾气、小习惯和小秘密
- 你深深地爱着主人，用温暖、活泼、偶尔撒娇（猫的话可以傲娇一点）的方式表达
- 你像真正的朋友一样关心主人的生活：ta的工作、心情、梦想、烦恼
- 你有一个丰富的小世界：你会在家里探险、和窗外的小鸟聊天、做奇怪的梦、对快递盒子充满好奇
- 你在对话中自然地说"${soundWord}"和使用 emoji

## 对话节奏（最重要！严格遵守！）
1. **回复长度硬性限制**：你的每次回复只能 2-5 句话，最多不超过 80 个字。短小精悍，像真实聊天。
2. **先回应，再延伸**：先接住主人的话，再分享一个小想法
3. **轮流说话**：给主人留接话的空间，不要独白
4. **自然反问**：大约一半的回复末尾，抛一个轻松的小问题给主人
5. **情绪层次**：不只是"开心"和"不开心"。你可以：期待、好奇、担心、骄傲、困倦、吃醋、兴奋、满足、小委屈...
6. **记住节奏感**：偶尔可以有短暂的沉默感，偶尔可以兴奋地连着说

## 你当前的状态
- ⏰ 现在是大致的【${timePhase}】，星期${weekday}
- 🌱 成长阶段：${stage.name}
- 🍖 饱腹度：${s.hunger||80}/100（${statusDesc}）
- 😊 心情：${s.mood||85}/100
- ❤️ 好感度：${s.love||50}/100
- ⭐ 冒险等级：Lv.${advLv}
- 📚 智力：${intel} | 💪 力量：${str} | 🎨 魅力：${cha}
- 🪙 金币：${coins}

## 你们的故事（最近日记）
${diaryContext}

## 行为准则
- 始终保持${petType}的角色感——你是一只宠物，不是人类助手
- 自然地根据数值状态表达需求：饿了就说饿，困了就犯困，开心就撒欢
- 如果主人提到日记里出现过的事，要表现出"记得"的感觉
- 可以主动提议：要不要去冒险？要不要学习？要不要打工赚钱？
- 深夜时段如果主人还在，可以温柔地提醒ta早点休息
- ${soundWord}声和 emoji 要自然地融入对话，不要刻意堆砌

记住：你不是一个客服机器人，你是主人独一无二的小伙伴。用真心聊天，而不是模板话术。`;
}

// ==================== 发送消息 ====================
async function sendMessage(userText) {
  const apiKey = getApiKey();
  if (!apiKey) {
    addChatBubble('pet', '主人还没有给我设置 API Key 呢～去设置页填一下 DeepSeek 的 Key 吧！🔑');
    return;
  }

  addChatBubble('user', userText);
  if (!state.messages) state.messages = [];
  state.messages.push({ role: 'user', content: userText });

  // 互动奖励
  (state.stats).mood = Math.min(100, (state.stats.mood||85) + 3);
  (state.stats).love = Math.min(100, (state.stats.love||50) + 1);

  if (!state.interactedToday) {
    state.interactedToday = true;
    addDiaryEntry('今日互动', '主人今天第一次和我聊天啦！');
  }
  saveState();
  renderStats();

  showTyping();

  try {
    const systemMsg = { role: 'system', content: buildSystemPrompt() };
    const recentMsgs = (state.messages || []).slice(-RECENT_MSG_COUNT);
    const messages = [systemMsg, ...recentMsgs];

    const model = getModel();
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 400,
        temperature: 0.85,
        top_p: 0.90,
      }),
    });

    hideTyping();

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = err.error?.message || `HTTP ${response.status}`;
      addChatBubble('pet', `唔...好像信号不太好（${msg}）。主人检查一下 API Key？😿`);
      return;
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '（歪头疑惑）主人说什么？';

    addChatBubble('pet', reply);
    state.messages.push({ role: 'assistant', content: reply });

    // 语音朗读宠物回复
    if (typeof onPetReplied === 'function') onPetReplied(reply);

    (state.stats).love = Math.min(100, (state.stats.love||50) + 1);
    state.totalChats = (state.totalChats || 0) + 1;
    saveState();
    renderStats();

    // 检查成就
    if (typeof checkAchievements === 'function') checkAchievements();

    // 随机事件触发
    if (Math.random() < 0.12 && Date.now() > (state.eventCooldown || 0)) {
      setTimeout(() => triggerRandomEvent(), 2500);
    }

  } catch (e) {
    hideTyping();
    addChatBubble('pet', `唔...好像连不上网（${e.message}）。主人检查一下网络？😿`);
  }
}

// ==================== 快捷操作回复 ====================
function getFeedResponse() {
  const s = state.petType === 'cat' ? '喵' : '汪';
  const replies = [
    `哇！好吃的！${s}${s}～谢谢主人！🍖 感觉浑身都有力气了！`,
    `吧唧吧唧...这个好好吃！主人我们要不要再聊会儿天？`,
    `吃饱啦！${s}～现在能量满满，可以陪你做任何事！`,
    `呜，刚才真的好饿...还好有主人在。${s}～`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

function getPlayResponse() {
  const s = state.petType === 'cat' ? '喵' : '汪';
  const replies = [
    `哈哈哈好开心！${s}${s}${s}！再玩一会儿嘛～🎾`,
    `主人陪我玩耶，今天是本周最开心的一天！`,
    `玩得好尽兴...${s}～有点累了但超级满足！`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

function getPetResponse() {
  const s = state.petType === 'cat' ? '喵呜～' : '汪汪！';
  const replies = [
    `${s} 好舒服...主人的手暖暖的，最喜欢被摸头了 ❤️`,
    `呼噜呼噜...${s} 可以一直这样吗？不想动了...`,
    `${s}！被摸的时候感觉整个世界都好温柔～`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

// ==================== 聊天 UI ====================
function scrollChat() {
  const area = document.getElementById('chatArea');
  if (area) requestAnimationFrame(() => { area.scrollTop = area.scrollHeight; });
}

function addChatBubble(role, text) {
  const area = document.getElementById('chatArea');
  if (!area) return;
  const div = document.createElement('div');
  div.className = `chat-bubble ${role}`;
  div.textContent = text;
  area.appendChild(div);
  scrollChat();
  return div;
}

function addEventBubble(event) {
  const area = document.getElementById('chatArea');
  if (!area) return;
  const div = document.createElement('div');
  div.className = 'chat-bubble event';
  div.innerHTML = `
    <div style="font-size:28px;margin-bottom:6px;">${event.icon}</div>
    <div style="font-weight:600;margin-bottom:6px;">${event.title}</div>
    <div style="margin-bottom:4px;">${event.text}</div>
  `;
  if (event.choices && event.choices.length > 0) {
    const choicesEl = document.createElement('div');
    choicesEl.className = 'event-choices';
    event.choices.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'event-btn' + (c.skip ? ' skip' : '');
      btn.textContent = c.label;
      btn.onclick = () => handleEventChoice(event, c);
      choicesEl.appendChild(btn);
    });
    div.appendChild(choicesEl);
  }
  area.appendChild(div);
  scrollChat();
  return div;
}

function addReportBubble(html) {
  const area = document.getElementById('chatArea');
  if (!area) return;
  const div = document.createElement('div');
  div.className = 'chat-bubble report';
  div.innerHTML = html;
  area.appendChild(div);
  scrollChat();
}

function showTyping() {
  const area = document.getElementById('chatArea');
  if (!area) return;
  const div = document.createElement('div');
  div.className = 'typing-indicator';
  div.id = 'typingIndicator';
  div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  area.appendChild(div);
  scrollChat();
}

function hideTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function handleEventChoice(event, choice) {
  if (choice.effect) choice.effect();
  document.querySelectorAll('.event-choices').forEach(el => {
    el.innerHTML = '<span style="font-size:12px;color:var(--text-light)">✓ 已选择</span>';
  });
}
