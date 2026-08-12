/* ============================================================
   voice.js — 双向语音对话
   🎤 语音输入（Speech Recognition）→ 自动转文字发送
   🔊 语音输出（Speech Synthesis）→ 宠物回复朗读
   零额外成本，全部使用浏览器原生 API
   ============================================================ */

let recognition = null;
let isListening = false;
let voiceOutputEnabled = true; // 宠物朗读开关

// ==================== 初始化语音识别 ====================
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.log('⚠️ 当前浏览器不支持语音识别');
    return null;
  }

  const rec = new SpeechRecognition();
  rec.lang = 'zh-CN';
  rec.interimResults = false;  // 只取最终结果
  rec.continuous = false;      // 说一句就停
  rec.maxAlternatives = 1;

  rec.onresult = (event) => {
    const text = event.results[0][0].transcript.trim();
    if (text) {
      document.getElementById('chatInput').value = text;
      showToast('🎤 识别成功！正在发送...');
      // 自动发送
      setTimeout(() => {
        document.getElementById('sendBtn').click();
      }, 300);
    }
  };

  rec.onerror = (event) => {
    stopListening();
    switch(event.error) {
      case 'not-allowed':
        showToast('❌ 请允许麦克风权限后重试');
        break;
      case 'no-speech':
        showToast('🎤 没有听到声音，再试一次？');
        break;
      case 'network':
        showToast('❌ 语音识别需要网络连接');
        break;
      default:
        showToast('🎤 语音识别出错了，试试打字吧');
    }
  };

  rec.onend = () => {
    stopListening();
  };

  return rec;
}

// ==================== 开始/停止监听 ====================
function startListening() {
  if (isListening) return;

  if (!recognition) {
    recognition = initSpeechRecognition();
  }
  if (!recognition) {
    showToast('❌ 你的浏览器不支持语音输入');
    return;
  }

  try {
    recognition.start();
    isListening = true;
    updateMicButton(true);
  } catch(e) {
    // 可能已经在监听中
    stopListening();
    setTimeout(() => startListening(), 100);
  }
}

function stopListening() {
  if (recognition) {
    try { recognition.stop(); } catch(e) {}
  }
  isListening = false;
  updateMicButton(false);
}

function updateMicButton(active) {
  const btn = document.getElementById('micBtn');
  if (!btn) return;
  if (active) {
    btn.classList.add('listening');
    btn.innerHTML = '🎤';
    btn.style.background = '#f08a8a';
    btn.style.animation = 'petHeartbeat 0.6s infinite';
  } else {
    btn.classList.remove('listening');
    btn.innerHTML = '🎤';
    btn.style.background = '';
    btn.style.animation = '';
  }
}

// ==================== 宠物语音朗读 ====================
function speakPetReply(text) {
  if (!voiceOutputEnabled) return;

  const synth = window.speechSynthesis;
  if (!synth) return;

  // 去掉 emoji（语音读不了）
  const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, '').trim();
  if (!cleanText) return;

  // 先取消之前的朗读
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'zh-CN';
  utterance.rate = 1.15;  // 正常偏快语速
  utterance.pitch = 1.4;  // 略高但不刺耳
  utterance.volume = 0.9;

  // 找最自然的中文语音
  const voices = synth.getVoices();
  // 优先找 Xiaoxiao（Windows 最自然的中文语音）或 其它优质中文语音
  const bestVoice = voices.find(v => v.name.includes('Xiaoxiao') || v.name.includes('xiaoxiao'))
    || voices.find(v => v.lang.startsWith('zh-CN') && v.localService)
    || voices.find(v => v.lang.startsWith('zh-CN'))
    || voices.find(v => v.lang.startsWith('zh'));
  if (bestVoice) utterance.voice = bestVoice;

  synth.speak(utterance);
}

// 预加载语音列表（有些浏览器需要异步获取）
function preloadVoices() {
  const synth = window.speechSynthesis;
  if (synth) {
    synth.getVoices(); // 触发加载
    synth.onvoiceschanged = () => { synth.getVoices(); };
  }
}

// ==================== 朗读开关 ====================
function toggleVoiceOutput() {
  voiceOutputEnabled = !voiceOutputEnabled;
  const btn = document.getElementById('voiceToggleBtn');
  if (btn) {
    btn.textContent = voiceOutputEnabled ? '🔊' : '🔇';
    btn.style.opacity = voiceOutputEnabled ? '1' : '0.5';
  }
  showToast(voiceOutputEnabled ? '🔊 宠物语音已开启' : '🔇 宠物语音已关闭');
}

// 在发送消息后自动朗读宠物回复
// 这个函数会在 chat.js 的 sendMessage 中被调用
function onPetReplied(text) {
  speakPetReply(text);
}

// 初始化
preloadVoices();
