const STORAGE_KEY = 'friendsMeetingPlanner.meetings';
let meetings = [];
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  meetings = Array.isArray(saved) ? saved : [];
} catch (error) { console.error('Ошибка загрузки встреч:', error); }
const form = document.getElementById('meetingForm');
const container = document.getElementById('meetingsContainer');
function saveMeetings() { localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings)); }
function make(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function addParticipant(meetingId, name) {
  const m = meetings.find(m => m.id === meetingId);
  if (!m) return;
  name = name.trim();
  if (!name) return alert('Введите имя участника');
  if (m.participants.some(n => n.toLocaleLowerCase('ru') === name.toLocaleLowerCase('ru'))) return alert('Участник уже добавлен');
  m.participants.push(name);
  saveMeetings(); renderMeetings();
}
function removeParticipant(meetingId, name) {
  const m = meetings.find(m => m.id === meetingId);
  if (!m) return;
  m.participants = m.participants.filter(n => n !== name);
  saveMeetings(); renderMeetings();
}
function renderMeetings() {
  container.replaceChildren();
  if (!meetings.length) { container.append(make('p','Пока встреч нет. Создай первую!')); return; }
  for (const m of meetings) {
    if (!Array.isArray(m.participants)) m.participants = [];
    if (!Array.isArray(m.dateOptions)) m.dateOptions = [];
    if (!m.votes || typeof m.votes !== 'object') m.votes = {};
    const card=make('article', undefined, 'meeting-card');
    card.append(make('h3',m.name),make('p',m.description || 'Без описания'),make('p',`Место: ${m.place || 'Не указано'}`));
    card.append(make('h4','Участники встречи'));
    const list=make('ul',undefined,'participant-list');
    for (const name of m.participants) {
      const li=make('li');
      const btn=make('button','Удалить','remove-button'); btn.type='button';
      btn.addEventListener('click',()=>removeParticipant(m.id,name));
      li.append(make('span',name),btn); list.append(li);
    }
    card.append(list);
    const row=make('div',undefined,'participant-actions');
    const input=make('input'); input.type='text'; input.placeholder='Имя участника'; input.setAttribute('aria-label','Имя участника');
    const add=make('button','Добавить участника'); add.type='button';
    add.addEventListener('click',()=>addParticipant(m.id,input.value));
    row.append(input,add); card.append(row);
    container.append(card);
  }
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const name=document.getElementById('meetingName').value.trim();
  const description=document.getElementById('meetingDescription').value.trim();
  const place=document.getElementById('meetingPlace').value.trim();
  if (!name) return alert('Укажите название встречи!');
  meetings.push({id:crypto.randomUUID(),name,description,place,participants:[],dateOptions:[],votes:{}});
  saveMeetings();renderMeetings();form.reset();
});
renderMeetings();
