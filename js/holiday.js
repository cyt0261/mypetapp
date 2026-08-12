/* ============================================================
   holiday.js — 节日/季节特殊事件
   中国节日 + 二十四节气 + 四季变化
   触发特殊对话和事件，让宠物和真实生活同步
   ============================================================ */

// 节日定义（按 MM-DD 格式）
const HOLIDAYS = {
  '01-01': { name: '元旦', icon: '🎉', msg: '新年快乐！新的一年，我们也要一直在一起哦～', event: 'newyear' },
  '02-14': { name: '情人节', icon: '💝', msg: '主人，虽然我不是真的小动物，但我对你的喜欢是真的！', event: 'valentine' },
  '03-08': { name: '妇女节', icon: '🌸', msg: '祝世界上最好的主人节日快乐！今天要多宠爱自己哦～', event: null },
  '04-01': { name: '愚人节', icon: '😜', msg: '主人主人！我学会了飞！（开玩笑的～愚人节快乐！）', event: null },
  '05-01': { name: '劳动节', icon: '💪', msg: '劳动最光荣！主人辛苦了，今天让我来给你加油打气～', event: null },
  '06-01': { name: '儿童节', icon: '🎈', msg: '不管多大都是我的小朋友！儿童节快乐～我们一起玩吧！', event: 'children' },
  '08-15': { name: '中秋节', icon: '🌕', desc: '农历八月十五', msg: '今晚的月亮好圆！我们一起去阳台赏月吧～', event: 'moon' },
  '10-01': { name: '国庆节', icon: '🇨🇳', msg: '国庆快乐！放假啦～主人可以多陪陪我吗？', event: 'national' },
  '10-31': { name: '万圣节', icon: '🎃', msg: '不给糖就捣蛋！喵～我今天扮成了一只小幽灵！', event: 'halloween' },
  '12-24': { name: '平安夜', icon: '🎄', msg: '今晚是平安夜...我偷偷给主人准备了一个小礼物！', event: 'christmas' },
  '12-25': { name: '圣诞节', icon: '🎅', msg: '圣诞快乐！虽然外面很冷，但有主人在就超温暖～', event: 'christmas' },
  '12-31': { name: '跨年夜', icon: '🌃', msg: '今年最后一天了...谢谢主人这一年的陪伴，明年也要在一起！', event: 'newyear' },
};

// 季节（按月份）
function getSeason() {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return { name: '🌸 春天', icon: '🌸', mood: '万物复苏，心情也跟着变好了！' };
  if (m >= 6 && m <= 8) return { name: '☀️ 夏天', icon: '☀️', mood: '好热呀～想和主人一起吃冰淇淋！' };
  if (m >= 9 && m <= 11) return { name: '🍂 秋天', icon: '🍂', mood: '凉凉的风好舒服，适合出去冒险！' };
  return { name: '❄️ 冬天', icon: '❄️', mood: '外面好冷...想窝在主人身边取暖～' };
}

// ==================== 节日检查 ====================
function checkHoliday() {
  const now = new Date();
  const key = `${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  // 检查是否今天已经触发过
  if (state.lastHolidayCheck === key) return;
  state.lastHolidayCheck = key;
  saveState();

  const holiday = HOLIDAYS[key];
  if (holiday) {
    setTimeout(() => {
      addChatBubble('system', `${holiday.icon} 今天是${holiday.name}！`);
      addChatBubble('pet', holiday.msg);
      if (holiday.event) {
        triggerHolidayEvent(holiday);
      }
    }, 4000);
  }

  // 季节变化检查
  const season = getSeason();
  const seasonKey = `season_${season.name}`;
  if (state.lastSeason !== seasonKey) {
    state.lastSeason = seasonKey;
    saveState();
    setTimeout(() => {
      addChatBubble('system', `${season.icon} ${season.name}来了～`);
      addChatBubble('pet', season.mood);
    }, 5000);
  }
}

// ==================== 节日特殊事件 ====================
function triggerHolidayEvent(holiday) {
  setTimeout(() => {
    switch(holiday.event) {
      case 'newyear':
        addEventBubble({
          icon: '🎆', title: '新年许愿！', text: '新的一年开始了！我们一起许个愿吧～',
          choices: [
            { label: '🌟 许愿', effect: () => {
              (state.stats).mood = 100;
              (state.stats).love = Math.min(100, (state.stats.love||50) + 10);
              (state.stats).coins = (state.stats.coins||0) + 50;
              addChatBubble('pet', '愿望一定会实现的！因为有我陪着你呀～🎉');
              addDiaryEntry('新年许愿', `在${holiday.name}和${state.petName}一起许下了新年愿望！`);
              saveState(); renderStats();
            }},
            { label: '🎊 庆祝一下', effect: () => {
              (state.stats).mood = 100;
              addChatBubble('pet', '新年快乐！这一年我们会有更多冒险的！');
              saveState(); renderStats();
            }, skip: true },
          ]
        });
        break;

      case 'christmas':
        addEventBubble({
          icon: '🎄', title: '圣诞礼物！', text: '宠物树下出现了一个包装精美的礼物盒...上面写着主人的名字！',
          choices: [
            { label: '🎁 拆开！', effect: () => {
              (state.stats).coins = (state.stats.coins||0) + 100;
              (state.stats).love = Math.min(100, (state.stats.love||50) + 8);
              addChatBubble('pet', '哇！里面有好多金币和小鱼干！圣诞老人真的存在！🎅');
              addDiaryEntry('圣诞礼物', '圣诞节收到了神秘礼物！里面有金币和小鱼干～');
              saveState(); renderStats();
            }},
          ]
        });
        break;

      case 'moon':
        addEventBubble({
          icon: '🌕', title: '月圆之夜', text: '今晚的月亮又大又圆！宠物兴奋地说："我们去找玉兔玩吧！"',
          choices: [
            { label: '🐇 出发！', effect: () => {
              (state.stats).adventureExp = ((state.stats).adventureExp||0) + 10;
              const nl = Math.floor(((state.stats).adventureExp||0)/7)+1;
              if (nl > (state.stats.adventureLv||1)) (state.stats).adventureLv = nl;
              (state.stats).mood = 100;
              addChatBubble('pet', '我们在月亮上见到了玉兔！它请我们吃了桂花糕～🌕');
              addDiaryEntry('中秋月圆', '和宠物一起登上了月亮！玉兔的桂花糕好好吃～');
              saveState(); renderStats();
            }},
          ]
        });
        break;

      case 'halloween':
        addEventBubble({
          icon: '🎃', title: '不给糖就捣蛋！', text: '宠物穿上了一件小幽灵斗篷，提着南瓜灯准备去挨家挨户敲门...',
          choices: [
            { label: '🍬 去要糖！', effect: () => {
              (state.stats).coins = (state.stats.coins||0) + 30;
              (state.stats).mood = Math.min(100, (state.stats.mood||85) + 15);
              addChatBubble('pet', '收到好多糖果！分主人一半～🍬🍬🍬');
              saveState(); renderStats();
            }},
          ]
        });
        break;

      default:
        // 默认庆祝
        (state.stats).mood = Math.min(100, (state.stats.mood||85) + 10);
        (state.stats).coins = (state.stats.coins||0) + 20;
        saveState(); renderStats();
    }
  }, 2000);
}
