/* ============================================================
   voice.js — 双向语音对话
   🎤 语音输入（Speech Recognition）→ 自动转文字发送
   🔊 语音输出（Speech Synthesis）→ 宠物回复朗读
   ============================================================ */

let recognition = null;
let isListening = false;
let voiceOutputEnabled = true;

// ==================== 创建语音识别实例（每次都新建，Android 兼容） ====================
function createRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const rec = new SpeechRecognition();
  rec.lang = 'zh-CN';
  rec.interimResults = true;   // 实时显示识别结果
  rec.continuous = false;
  rec.maxAlternatives = 3;     // 多给几个候选

  // 实时显示正在识别的内容
  rec.onresult = (event) => {
    let finalText = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalText += event.results[i][0].transcript;
      }
    }
    if (finalText.trim()) {
      document.getElementById('chatInput').value = finalText.trim();
      // 拿到最终结果就停止
      stopListening();
      showToast('🎤 识别成功！正在发送...');
      setTimeout(() => {
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) sendBtn.click();
      }, 300);
    }
  };

  rec.onerror = (event) => {
    console.log('语音识别错误:', event.error, event.message);
    stopListening();
    switch(event.error) {
      case 'not-allowed':
        showToast('❌ 麦克风权限被拒绝，请在浏览器设置中允许');
        break;
      case 'no-speech':
        showToast('🎤 没有听到声音，请再试一次');
        break;
      case 'audio-capture':
        showToast('❌ 找不到麦克风，请检查手机权限');
        break;
      case 'network':
        showToast('❌ 语音识别需要网络，请检查连接');
        break;
      case 'service-not-allowed':
        showToast('❌ 语音服务不可用，请检查 Google App 是否已更新');
        break;
      case 'language-not-supported':
        showToast('❌ 中文语音包未下载，请在手机设置中下载');
        break;
      default:
        showToast('🎤 语音服务不可用，试试点键盘上的 🎤 按钮吧');
    }
  };

  // Android 上这两个事件很重要
  rec.onspeechstart = () => {
    // 用户开始说话
  };

  rec.onspeechend = () => {
    // 用户停止说话，Android 会自动停止
  };

  rec.onend = () => {
    stopListening();
  };

  return rec;
}

// ==================== 开始/停止监听 ====================
function checkSpeechSupport() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return false;
  // Android 上即使有 API，也可能因为没有 Google 服务而失败
  // 做一次快速测试
  return true;
}

function startListening() {
  if (isListening) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('💡 试试用键盘上的 🎤 按钮语音输入吧！');
    return;
  }

  // Android 上每次创建新的实例更稳定
  if (recognition) {
    try { recognition.abort(); } catch(e) {}
  }
  recognition = createRecognition();

  if (!recognition) {
    showToast('💡 试试用键盘上的 🎤 按钮语音输入吧！');
    return;
  }

  try {
    recognition.start();
    isListening = true;
    updateMicButton(true);
  } catch(e) {
    isListening = false;
    updateMicButton(false);
    // 可能在后台运行中，重置再试
    recognition.abort();
    recognition = createRecognition();
    if (recognition) {
      try {
        recognition.start();
        isListening = true;
        updateMicButton(true);
      } catch(e2) {
        showToast('🎤 语音启动失败，试试打字吧');
      }
    }
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
    btn.style.background = '#f08a8a';
    btn.style.animation = 'petHeartbeat 0.6s infinite';
    btn.textContent = '🔴';
  } else {
    btn.style.background = '';
    btn.style.animation = '';
    btn.textContent = '🎤';
  }
}

// ==================== 宠物语音朗读 ====================
function speakPetReply(text) {
  if (!voiceOutputEnabled) return;

  const synth = window.speechSynthesis;
  if (!synth) return;

  const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, '').trim();
  if (!cleanText) return;

  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'zh-CN';
  utterance.rate = 1.1;
  utterance.pitch = 1.3;
  utterance.volume = 0.9;

  const voices = synth.getVoices();
  const bestVoice = voices.find(v => v.lang.startsWith('zh-CN') && v.localService)
    || voices.find(v => v.lang.startsWith('zh-CN'))
    || voices.find(v => v.lang.startsWith('zh'));
  if (bestVoice) utterance.voice = bestVoice;

  synth.speak(utterance);
}

function preloadVoices() {
  const synth = window.speechSynthesis;
  if (synth) {
    synth.getVoices();
    synth.onvoiceschanged = () => { synth.getVoices(); };
  }
}

function toggleVoiceOutput() {
  voiceOutputEnabled = !voiceOutputEnabled;
  const btn = document.getElementById('voiceToggleBtn');
  if (btn) {
    btn.textContent = voiceOutputEnabled ? '🔊' : '🔇';
    btn.style.opacity = voiceOutputEnabled ? '1' : '0.5';
  }
  showToast(voiceOutputEnabled ? '🔊 宠物语音已开启' : '🔇 宠物语音已关闭');
}

function onPetReplied(text) {
  speakPetReply(text);
}

preloadVoices();
