/* ============================================================
   share.js — 宠物明信片分享卡片
   用 Canvas 生成一张包含宠物状态、话语、日期的卡片
   可保存到相册或分享
   ============================================================ */

// 预加载猫咪图片用于卡片
const cardImage = new Image();
cardImage.src = 'mimi.jpeg';

function generateShareCard() {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d');

  // ===== 背景（暖色渐变） =====
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1000);
  bgGrad.addColorStop(0, '#FFF8F0');
  bgGrad.addColorStop(0.5, '#FFECD2');
  bgGrad.addColorStop(1, '#FFE0C0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 800, 1000);

  // ===== 装饰圆点 =====
  ctx.fillStyle = 'rgba(244,164,96,0.08)';
  for (let i = 0; i < 25; i++) {
    const x = Math.random() * 800;
    const y = Math.random() * 1000;
    const r = 30 + Math.random() * 80;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // ===== 顶部标题栏 =====
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillRect(0, 0, 800, 80);
  ctx.fillStyle = '#4a3728';
  ctx.font = 'bold 32px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`🐾 ${state.petName} 的今日状态`, 400, 52);

  // ===== 猫咪图片（圆形裁剪） =====
  const imgX = 300, imgY = 110, imgSize = 200;
  ctx.save();
  ctx.beginPath();
  ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
  ctx.clip();
  try {
    ctx.drawImage(cardImage, imgX, imgY, imgSize, imgSize);
  } catch(e) {
    // 图片没加载好就画一个占位
    ctx.fillStyle = '#fdd9b5';
    ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4a3728';
    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🐱', imgX + imgSize/2, imgY + imgSize/2 + 25);
  }
  ctx.restore();
  // 圆形边框
  ctx.beginPath();
  ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
  ctx.strokeStyle = '#f4a460';
  ctx.lineWidth = 4;
  ctx.stroke();

  // ===== 宠物名字和阶段 =====
  const stage = typeof getGrowthStage === 'function' ? getGrowthStage() : { name: '🐣 幼年期' };
  ctx.fillStyle = '#4a3728';
  ctx.font = 'bold 28px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.petName, 400, 360);
  ctx.fillStyle = '#f4a460';
  ctx.font = '18px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillText(stage.name, 400, 388);

  // ===== 数值面板 =====
  const st = state.stats || {};
  const statsForCard = [
    { icon: '🍖', label: '饱腹度', val: st.hunger || 80, max: 100 },
    { icon: '😊', label: '心情', val: st.mood || 85, max: 100 },
    { icon: '❤️', label: '好感度', val: st.love || 50, max: 100 },
    { icon: '⭐', label: '冒险等级', val: st.adventureLv || 1, max: 20 },
    { icon: '🧠', label: '智力', val: st.intelligence || 0, max: 100 },
    { icon: '💪', label: '力量', val: st.strength || 0, max: 100 },
    { icon: '🎨', label: '魅力', val: st.charisma || 0, max: 100 },
    { icon: '🪙', label: '金币', val: st.coins || 0, max: null },
  ];

  const panelX = 80, panelY = 430;
  // 面板背景
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, 640, 240, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(244,164,96,0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const cols = 2;
  const rows = Math.ceil(statsForCard.length / cols);
  const cellW = 300, cellH = 52;
  const startX = panelX + 20, startY = panelY + 15;

  statsForCard.forEach((stat, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * cellW;
    const y = startY + row * cellH;

    ctx.fillStyle = '#4a3728';
    ctx.font = '18px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${stat.icon} ${stat.label}`, x, y + 24);

    // 进度条
    const barX = x + 130, barY = y + 12, barW = 120, barH = 10;
    ctx.fillStyle = '#e8ddd0';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 5);
    ctx.fill();

    const pct = stat.max ? Math.min(1, stat.val / stat.max) : Math.min(1, stat.val / 100);
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    barGrad.addColorStop(0, '#f4a460');
    barGrad.addColorStop(1, '#ff8c69');
    ctx.fillStyle = barGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW * pct, barH, 5);
    ctx.fill();

    // 数值
    ctx.fillStyle = '#8b7355';
    ctx.font = '14px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'left';
    const valText = stat.max ? `${stat.val}/${stat.max}` : `${stat.val}`;
    ctx.fillText(valText, barX + barW + 12, y + 24);
  });

  // ===== 宠物的话 =====
  const quotes = [
    `今天和主人在一起的时光，\n是最幸福的时刻～🐾`,
    `谢谢你一直陪着我，\n我也会永远陪着你 ❤️`,
    `每一天都是新的冒险，\n因为有你在身边 ✨`,
    `主人你知道吗？\n你是世界上最好的主人！`,
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  const quoteY = 710;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.roundRect(80, quoteY, 640, 120, 20);
  ctx.fill();

  ctx.fillStyle = '#4a3728';
  ctx.font = 'italic 20px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center';
  const lines = quote.split('\n');
  lines.forEach((line, i) => {
    ctx.fillText(line, 400, quoteY + 42 + i * 30);
  });

  // ===== 底部日期 =====
  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;
  ctx.fillStyle = '#b8a090';
  ctx.font = '16px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`📅 ${dateStr}  ·  连续互动 ${state.streak || 1} 天`, 400, 880);

  // ===== 底部装饰文字 =====
  ctx.fillStyle = '#d4c0a8';
  ctx.font = '14px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillText('— AI 虚拟宠物 · 每一天都值得记录 —', 400, 920);

  // ===== 导出 =====
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.petName}-今日状态-${dateStr}.png`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📸 明信片已保存！');
  }, 'image/png');
}

// 页面加载时预加载图片
cardImage.onload = () => { console.log('📸 卡片图片已就绪'); };
