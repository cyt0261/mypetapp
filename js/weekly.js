/* ============================================================
   weekly.js — 周报/月报
   数据总结 + AI 生成宠物书信
   ============================================================ */

// 检查是否需要生成周报
function checkWeeklyReport() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=周日
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  // 周日触发周报
  if (dayOfWeek === 0 && state.lastWeeklyDate !== today) {
    state.lastWeeklyDate = today;
    saveState();
    setTimeout(() => generateWeeklyReport(), 5000);
  }

  // 每月1号触发月报
  if (now.getDate() === 1 && state.lastMonthlyDate !== today) {
    state.lastMonthlyDate = today;
    saveState();
    setTimeout(() => generateMonthlyReport(), 8000);
  }
}

// ==================== 周报 ====================
async function generateWeeklyReport() {
  const stats = buildReportStats();
  const apiKey = getApiKey();
  if (!apiKey) {
    // 没有 API Key 就显示纯数据报告
    addReportBubble(buildFallbackReport(stats, '本周'));
    return;
  }

  showTyping();
  try {
    const prompt = `你是${state.petName}（一只${state.petType==='cat'?'小猫':'小狗'}），请用你可爱的口吻给主人写一封简短的"本周小结"。

本周数据：对话${stats.totalChats}次，冒险${stats.totalAdv}次，日记${stats.diaryCount}条，学习${stats.studyMin}分钟，赚了${stats.coins}金币。
好感度${stats.love}/100，连续互动${stats.streak}天。

要求：
- 用宠物视角写，温暖可爱
- 格式：一个简单的称呼 + 3-5句话 + 一个小小的下周期待
- 控制在100字以内
- 自然地提到1-2个数据亮点`;

    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: getModel(),
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 250,
        temperature: 0.9,
      }),
    });

    hideTyping();
    if (resp.ok) {
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content || '';
      addReportBubble(`<h3>📊 ${state.petName}的周报</h3>${text}<div style="margin-top:10px;font-size:11px;color:var(--text-lighter)">📅 ${new Date().toLocaleDateString('zh-CN')}</div>`);
    } else {
      addReportBubble(buildFallbackReport(stats, '本周'));
    }
  } catch(e) {
    hideTyping();
    addReportBubble(buildFallbackReport(stats, '本周'));
  }
}

// ==================== 月报 ====================
async function generateMonthlyReport() {
  const stats = buildReportStats();
  const apiKey = getApiKey();

  if (!apiKey) {
    addReportBubble(buildFallbackReport(stats, '本月'));
    return;
  }

  showTyping();
  try {
    const prompt = `你是${state.petName}（一只${state.petType==='cat'?'小猫':'小狗'}），请给主人写一封温暖的"月度小结"信。

本月数据：对话${stats.totalChats}次，冒险${stats.totalAdv}次，日记${stats.diaryCount}条，学习${stats.studyMin}分钟，赚了${stats.coins}金币。
好感度${stats.love}/100，连续互动${stats.streak}天。

要求：
- 像真正的宠物写给主人的信一样
- 包含：回顾这个月的感觉 + 提到1-2个具体数据 + 对主人的感谢 + 下个月的小期待
- 温暖有爱但不肉麻，保持宠物的天真视角
- 控制在150字以内`;

    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: getModel(),
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 350,
        temperature: 0.9,
      }),
    });

    hideTyping();
    if (resp.ok) {
      const data = await resp.json();
      const text = data.choices?.[0]?.message?.content || '';
      addReportBubble(`<h3>📊 ${state.petName}的月报</h3>${text}<div style="margin-top:10px;font-size:11px;color:var(--text-lighter)">📅 ${new Date().toLocaleDateString('zh-CN')}</div>`);
    } else {
      addReportBubble(buildFallbackReport(stats, '本月'));
    }
  } catch(e) {
    hideTyping();
    addReportBubble(buildFallbackReport(stats, '本月'));
  }
}

function buildReportStats() {
  const st = state.stats || {};
  return {
    totalChats: state.totalChats || 0,
    totalAdv: state.totalAdventures || 0,
    diaryCount: (state.diary || []).length,
    love: st.love || 50,
    streak: state.streak || 1,
    studyMin: state.totalStudyMinutes || 0,
    coins: st.coins || 0,
    intel: st.intelligence || 0,
    str: st.strength || 0,
    cha: st.charisma || 0,
  };
}

function buildFallbackReport(stats, period) {
  const petName = state.petName || '宠物';
  return `<h3>📊 ${petName}的${period}报告</h3>
    <div class="stat-line"><span>💬 对话次数</span><span>${stats.totalChats} 次</span></div>
    <div class="stat-line"><span>🗺️ 冒险次数</span><span>${stats.totalAdv} 次</span></div>
    <div class="stat-line"><span>📝 日记条数</span><span>${stats.diaryCount} 条</span></div>
    <div class="stat-line"><span>📚 学习时长</span><span>${stats.studyMin} 分钟</span></div>
    <div class="stat-line"><span>🪙 当前金币</span><span>${stats.coins} 币</span></div>
    <div class="stat-line"><span>🧠 智力/💪 力量/🎨 魅力</span><span>${stats.intel} / ${stats.str} / ${stats.cha}</span></div>
    <div class="stat-line"><span>🔥 连续互动</span><span>${stats.streak} 天</span></div>
    <div style="margin-top:8px;font-size:12px;color:var(--text-light);text-align:center">🐾 一起继续加油吧！</div>`;
}
