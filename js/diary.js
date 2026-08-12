/* ============================================================
   diary.js — 日记系统
   自动记录、手动添加、宠物视角点评
   ============================================================ */

function addDiaryEntry(title, body) {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const petNote = generatePetNote();
  if (!state.diary) state.diary = [];
  state.diary.push({ id: Date.now(), date: dateStr, title, body, petNote });
  saveState();
}

function generatePetNote() {
  const notes = [
    '这是很特别的一天呢！我会永远记住的～🐾',
    '和主人在一起的时光，每一秒都想珍藏 ❤️',
    '以后回来看这条记录，一定会笑出来的！',
    '主人记录下来的瞬间，是我们共同的宝藏 ✨',
    '今天也是被主人爱着的一天！好幸福～',
    '这件事太有趣了，我要讲给窗外的鸟儿听！',
  ];
  return notes[Math.floor(Math.random() * notes.length)];
}

function renderDiary() {
  const list = document.getElementById('diaryList');
  if (!list) return;
  const diary = state.diary || [];
  if (diary.length === 0) {
    list.innerHTML = '<div class="diary-empty">🐾 还没有日记，和宠物一起创造回忆吧～</div>';
    return;
  }
  list.innerHTML = [...diary].reverse().slice(0, 50).map(d => `
    <div class="diary-entry" style="position:relative;">
      <button onclick="deleteDiaryEntry(${d.id})" style="position:absolute;top:8px;right:12px;background:none;border:none;font-size:16px;cursor:pointer;opacity:0.5;" title="删除">🗑️</button>
      <div class="diary-date">📅 ${d.date}</div>
      <div class="diary-title">${d.title}</div>
      <div class="diary-body">${d.body}</div>
      <div class="diary-pet-note">🐾 宠物的话：${d.petNote || ''}</div>
    </div>
  `).join('');
}

function deleteDiaryEntry(id) {
  if (!confirm('确定删除这条日记吗？')) return;
  state.diary = (state.diary || []).filter(d => d.id !== id);
  saveState();
  renderDiary();
  showToast('🗑️ 日记已删除');
}

function promptNewDiary() {
  const text = prompt('今天发生了什么想记录的事呢？📝');
  if (text && text.trim()) {
    const title = prompt('给这条日记起个标题吧～');
    addDiaryEntry(title || '平凡的一天', text.trim());
    renderDiary();
    if (typeof addChatBubble === 'function') {
      addChatBubble('pet', '主人写了新日记！我要好好记住这一天～📝❤️');
    }
  }
}
