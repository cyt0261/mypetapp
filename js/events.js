/* ============================================================
   events.js — 冒险 + 随机事件系统 v2
   20+ 种冒险、5 个区域、多步冒险、解锁机制
   ============================================================ */

// ==================== 冒险数据 ====================
const ADVENTURE_ZONES = {
  home: {
    name: '🏡 家附近', minLv: 1, color: '#90c695',
    adventures: [
      { icon: '🎁', title: '发现神秘宝箱！', text: '在后院的老树洞里，我们发现了一个落满灰尘的宝箱。上面刻着奇怪的花纹...',
        rewards: { exp: 3, coins: 5, desc: '+3 冒险经验, +5 金币' } },
      { icon: '🛋️', title: '沙发底下的秘密', text: '小球滚进沙发底下了！我们趴下去找的时候，居然发现了一张泛黄的"藏宝图"...',
        rewards: { exp: 2, coins: 3, desc: '+2 冒险经验, +3 金币' } },
      { icon: '🪴', title: '阳台植物园', text: '阳台上的花盆里长出了奇怪的小芽！宠物说这可能是魔法植物...',
        rewards: { exp: 3, coins: 8, desc: '+3 冒险经验, +8 金币' } },
      { icon: '📦', title: '快递盒城堡', text: '新到的快递盒堆成了小山！宠物兴奋地钻了进去，说这是它的"城堡"...',
        rewards: { exp: 2, coins: 4, desc: '+2 冒险经验, +4 金币' } },
      { icon: '🍪', title: '厨房大冒险', text: '厨房飘来饼干的香味！我们偷偷溜进去...原来主人昨天烤了曲奇！',
        rewards: { exp: 2, coins: 5, desc: '+2 冒险经验, +5 金币' } },
    ]
  },
  forest: {
    name: '🌳 大森林', minLv: 5, color: '#7ec8a0',
    adventures: [
      { icon: '🌈', title: '彩虹桥奇遇', text: '追着一只七彩蝴蝶，我们穿过树林，发现了一座闪着微光的彩虹桥！桥那头...有一只戴眼镜的猫头鹰。',
        rewards: { exp: 5, coins: 12, desc: '+5 冒险经验, +12 金币' } },
      { icon: '🍄', title: '蘑菇村的秘密', text: '在一棵老榕树下，我们发现了一个只有手掌大的蘑菇村！村民们正在举办蘑菇汤派对...',
        rewards: { exp: 6, coins: 15, desc: '+6 冒险经验, +15 金币' } },
      { icon: '✨', title: '萤火虫之舞', text: '夜幕降临，森林里的萤火虫全部亮了起来！它们围成圈跳舞，好像在邀请我们一起...',
        rewards: { exp: 5, coins: 10, desc: '+5 冒险经验, +10 金币' } },
      { icon: '🦊', title: '狐狸的谜语', text: '一只毛色火红的狐狸拦住了去路："回答我的谜语，才能通过！"它狡黠地眨了眨眼...',
        rewards: { exp: 7, coins: 18, desc: '+7 冒险经验, +18 金币' } },
    ]
  },
  ocean: {
    name: '🌊 海边', minLv: 9, color: '#7ec8e3',
    adventures: [
      { icon: '🐚', title: '贝壳沙滩', text: '潮水退去，沙滩上散落着闪闪发光的贝壳！每一个贝壳里好像都藏着一个小小的故事...',
        rewards: { exp: 8, coins: 20, desc: '+8 冒险经验, +20 金币' } },
      { icon: '🪸', title: '珊瑚礁迷宫', text: '我们戴上潜水镜，潜入浅海。五颜六色的珊瑚礁组成了一个天然迷宫！小丑鱼在前面带路...',
        rewards: { exp: 9, coins: 25, desc: '+9 冒险经验, +25 金币' } },
      { icon: '🏝️', title: '海龟爷爷', text: '一只巨大的海龟游过来，背上长满了绿色的海藻。"上来吧，我带你们去一个神奇的地方。"',
        rewards: { exp: 10, coins: 30, desc: '+10 冒险经验, +30 金币' } },
      { icon: '🗼', title: '古老的灯塔', text: '海岸边的老灯塔已经废弃很久了，但今天塔顶居然亮着灯！我们爬上去看看...',
        rewards: { exp: 8, coins: 22, desc: '+8 冒险经验, +22 金币' } },
    ]
  },
  city: {
    name: '🏙️ 城市', minLv: 13, color: '#a78bfa',
    adventures: [
      { icon: '☕', title: '宠物咖啡馆', text: '街角有一家只有宠物才能看到的咖啡馆！店长是一只戴着领结的布偶猫...',
        rewards: { exp: 11, coins: 35, desc: '+11 冒险经验, +35 金币' } },
      { icon: '📚', title: '会说话的书店', text: '旧书店的老板说，午夜时分，书架上的书会自己聊天！我们决定留下来验证...',
        rewards: { exp: 12, coins: 38, desc: '+12 冒险经验, +38 金币' } },
      { icon: '🌆', title: '天台星空', text: '我们爬到了城市最高楼的楼顶。城市的灯光像地上的星星，而天上的星星像远方的城市...',
        rewards: { exp: 10, coins: 32, desc: '+10 冒险经验, +32 金币' } },
      { icon: '🎪', title: '神秘马戏团', text: '一个只在满月出现的马戏团来到了城市！据说表演者全是会才艺的动物...',
        rewards: { exp: 13, coins: 42, desc: '+13 冒险经验, +42 金币' } },
    ]
  },
  magic: {
    name: '✨ 魔法世界', minLv: 17, color: '#f8a8c0',
    adventures: [
      { icon: '🏰', title: '云端城堡', text: '一朵巨大的棉花糖云停在了窗边，上面有一座闪闪发光的城堡！我们小心翼翼地踏上去...',
        rewards: { exp: 15, coins: 50, desc: '+15 冒险经验, +50 金币' } },
      { icon: '🌌', title: '星星草原', text: '穿过一道突然出现的门，我们来到了一片长满发光草的原野。每踩一步，草地就泛起涟漪般的星光...',
        rewards: { exp: 16, coins: 55, desc: '+16 冒险经验, +55 金币' } },
      { icon: '⏳', title: '时间花园', text: '花园里的花每一朵都在不同的季节盛开——左边是春天的樱花，右边是秋天的枫叶，中间是一棵结满星星的树...',
        rewards: { exp: 18, coins: 65, desc: '+18 冒险经验, +65 金币' } },
      { icon: '🐉', title: '小龙的蛋', text: '在一座古老石台上，我们发现了一颗温热的、闪着金光的蛋。一条小龙正在里面沉睡...',
        rewards: { exp: 20, coins: 80, desc: '+20 冒险经验, +80 金币', rare: true } },
    ]
  },
};

// ==================== 获取可用区域 ====================
function getAvailableZones() {
  const lv = (state.stats && state.stats.adventureLv) || 1;
  const zones = [];
  for (const [key, zone] of Object.entries(ADVENTURE_ZONES)) {
    if (lv >= zone.minLv) {
      zones.push({ key, ...zone });
    }
  }
  return zones;
}

// ==================== 开始冒险 ====================
function startAdventure() {
  addChatBubble('pet', '🗺️ 出发去冒险！让我看看今天能发现什么...');
  animatePet('happy');
  state.eventCooldown = Date.now() + 5 * 60 * 1000;

  setTimeout(() => {
    const zones = getAvailableZones();
    // 随机选择区域（高等级区域概率更高）
    const zoneIdx = Math.floor(Math.random() * zones.length);
    const zone = zones[zoneIdx];
    const adv = zone.adventures[Math.floor(Math.random() * zone.adventures.length)];

    const isRare = adv.rewards && adv.rewards.rare && Math.random() < 0.3;

    const eventData = {
      ...adv,
      zoneName: zone.name,
      choices: [
        {
          label: '🎉 太棒了！',
          effect: () => applyAdventureReward(adv, zone),
        },
        {
          label: '📝 记在日记里',
          effect: () => {
            applyAdventureReward(adv, zone);
            addDiaryEntry(adv.title, `${adv.text}\n（在${zone.name}发现的！）`);
            addChatBubble('pet', '已经记好啦！以后回看一定很有趣～📝');
          },
          skip: true,
        },
      ],
    };

    // 稀有冒险可能有额外选项
    if (isRare) {
      eventData.text += ' 🌟这好像是稀有事件！';
      eventData.choices.push({
        label: '📸 拍照留念！',
        effect: () => {
          applyAdventureReward(adv, zone);
          (state.stats).coins = ((state.stats).coins || 0) + 30; // 额外金币
          addChatBubble('pet', '咔嚓！这张照片会成为我们的珍贵回忆～📸✨');
          addDiaryEntry('📸 ' + adv.title, `${adv.text}\n还拍了照片！这是我们的特别纪念～`);
          saveState(); renderStats();
        },
        skip: true,
      });
    }

    addEventBubble(eventData);
  }, 2000);
}

function applyAdventureReward(adv, zone) {
  const s = state.stats;
  s.adventureExp = (s.adventureExp || 0) + (adv.rewards.exp || 3);
  s.coins = (s.coins || 0) + (adv.rewards.coins || 5);
  s.mood = Math.min(100, (s.mood || 85) + 5);

  // 升级检查
  const newLv = Math.floor(s.adventureExp / 7) + 1;
  if (newLv > (s.adventureLv || 1)) {
    s.adventureLv = newLv;
    addChatBubble('pet', `🎉 冒险等级提升到 Lv.${newLv}！我们越来越厉害了！${state.petType==='cat'?'喵':'汪'}～`);
    addDiaryEntry('冒险升级！', `冒险等级提升到了 Lv.${newLv}！在${zone.name}探索的时候突破的～`);

    // 解锁新区域提示
    for (const [key, z] of Object.entries(ADVENTURE_ZONES)) {
      if (newLv === z.minLv && key !== 'home') {
        setTimeout(() => {
          addChatBubble('system', `🔓 解锁了新区域：${z.name}！`);
        }, 1500);
      }
    }
  }

  addChatBubble('pet', `${adv.rewards.desc}（${zone.name}）`);
  (state.stats).mood = Math.min(100, (s.mood || 85) + 3);
  state.totalAdventures = (state.totalAdventures || 0) + 1;
  saveState();
  renderStats();
  if (typeof checkAchievements === 'function') checkAchievements();
}

// ==================== 快速操作 ====================
function doAction(action) {
  switch(action) {
    case 'outing':
      showOutingModal();
      break;
  }
}

// ==================== 随机事件 ====================
function triggerRandomEvent() {
  state.eventCooldown = Date.now() + 10 * 60 * 1000;
  saveState();

  const events = [
    {
      icon: '💤', title: '好困...', text: '主人，我眼皮好重...可以靠在你旁边睡一小会儿吗？就五分钟...',
      choices: [
        { label: '🛌 睡吧宝贝', effect: () => {
          (state.stats).mood = Math.min(100, ((state.stats).mood||85) + 15);
          (state.stats).love = Math.min(100, ((state.stats).love||50) + 3);
          addChatBubble('pet', 'Zzz...（梦到了和主人在星星草原野餐）💤✨');
        }},
        { label: '☕ 再坚持一下', effect: () => {
          (state.stats).mood = Math.min(100, ((state.stats).mood||85) + 5);
          addChatBubble('pet', '好...好吧！为了主人我再撑一下！💪（打了个哈欠）');
        }},
      ]
    },
    {
      icon: '🦋', title: '窗外来客', text: '一只漂亮的蓝色蝴蝶停在窗户上！它好像在对我们打招呼...',
      choices: [
        { label: '🪟 去打个招呼', effect: () => {
          (state.stats).mood = Math.min(100, ((state.stats).mood||85) + 18);
          addChatBubble('pet', '蝴蝶说今天天气很好，让我们也出去走走！它飞走的时候还在空中画了个爱心 🦋✨');
        }},
        { label: '🤫 安静看看', effect: () => {
          (state.stats).love = Math.min(100, ((state.stats).love||50) + 4);
          addChatBubble('pet', '和主人一起安安静静地看着，也很幸福呢～');
        }, skip: true },
      ]
    },
    {
      icon: '💌', title: '神秘来信', text: '门缝下面塞进来一封信，信封上画着一个小爪印...会是谁寄来的？',
      choices: [
        { label: '📨 打开看看', effect: () => {
          (state.stats).adventureExp = ((state.stats).adventureExp||0) + 4;
          const nl = Math.floor(((state.stats).adventureExp||0)/7)+1;
          if (nl > ((state.stats).adventureLv||1)) (state.stats).adventureLv = nl;
          addChatBubble('pet', '是宠物小镇的年度聚会邀请函！🎉 下个月满月之夜，所有宠物都会去！');
          addDiaryEntry('收到邀请', '宠物小镇寄来了年度聚会的邀请函！好期待～');
        }},
        { label: '🤔 先收起来', effect: () => {
          addChatBubble('pet', '嗯，等准备好了再打开！说不定是什么惊喜呢～');
        }, skip: true },
      ]
    },
    {
      icon: '🎵', title: '突然想唱歌', text: '不知道为什么，我现在特别想唱一首歌给主人听...',
      choices: [
        { label: '🎤 洗耳恭听！', effect: () => {
          (state.stats).mood = Math.min(100, ((state.stats).mood||85) + 20);
          (state.stats).love = Math.min(100, ((state.stats).love||50) + 5);
          const s = state.petType === 'cat' ? '喵喵喵～🎵' : '汪汪汪～🎵';
          addChatBubble('pet', `${s}（虽然有点跑调，但是充满了爱！）好听吗主人？😳`);
        }},
        { label: '🤫 下次吧', effect: () => {
          addChatBubble('pet', '那好吧...我先偷偷练习一下！下次一定要让主人惊艳！');
        }, skip: true },
      ]
    },
    {
      icon: '🌈', title: '雨后彩虹', text: '外面刚下过雨，一道彩虹挂在天上！从我们这个角度看特别清楚...',
      choices: [
        { label: '📸 快看！', effect: () => {
          (state.stats).mood = Math.min(100, ((state.stats).mood||85) + 15);
          addChatBubble('pet', '好漂亮！彩虹的尽头好像就在我们小区...要不要去找找传说中的彩虹宝藏？🌈✨');
        }},
      ]
    },
  ];

  const ev = events[Math.floor(Math.random() * events.length)];
  addEventBubble(ev);
}
