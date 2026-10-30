
'use strict';

const STORAGE_KEY = 'friendsMeetingPlanner.meetings';

let meetings = [];

try {
  const saved = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || '[]'
  );
  meetings = Array.isArray(saved) ? saved : [];
} catch (error) {
  console.error('Ошибка загрузки встреч:', error);
}

const form = document.getElementById('meetingForm');
const container = document.getElementById('meetingsContainer');

function saveMeetings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
    return true;
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    alert('Не удалось сохранить изменения.');
    return false;
  }
}

function make(tag, text, className) {
  const element = document.createElement(tag);

  if (text !== undefined) {
    element.textContent = text;
  }

  if (className) {
    element.className = className;
  }

  return element;
}

function normalizeMeeting(meeting) {
  if (!Array.isArray(meeting.participants)) {
    meeting.participants = [];
  }

  if (!Array.isArray(meeting.dateOptions)) {
    meeting.dateOptions = [];
  }

  if (
    !meeting.votes ||
    typeof meeting.votes !== 'object' ||
    Array.isArray(meeting.votes)
  ) {
    meeting.votes = {};
  }

  return meeting;
}

// Добавление участника
function addParticipant(meetingId, name) {
  const meeting = meetings.find(item => item.id === meetingId);
  if (!meeting) return;

  normalizeMeeting(meeting);

  const cleanName = name.trim();

  if (!cleanName) {
    alert('Введите имя участника.');
    return;
  }

  const duplicate = meeting.participants.some(
    participant =>
      participant.toLocaleLowerCase('ru') ===
      cleanName.toLocaleLowerCase('ru')
  );

  if (duplicate) {
    alert('Этот участник уже добавлен.');
    return;
  }

  meeting.participants.push(cleanName);
  saveMeetings();
  renderMeetings();
}

// Удаление участника
function removeParticipant(meetingId, name) {
  const meeting = meetings.find(item => item.id === meetingId);
  if (!meeting) return;

  normalizeMeeting(meeting);

  meeting.participants = meeting.participants.filter(
    participant => participant !== name
  );

  // Удаляем также голоса удалённого участника
  delete meeting.votes[name];

  saveMeetings();
  renderMeetings();
}

// Добавление варианта даты и времени
function addDateOption(meetingId, value) {
  const meeting = meetings.find(item => item.id === meetingId);
  if (!meeting) return;

  normalizeMeeting(meeting);

  if (!value || !Number.isFinite(new Date(value).getTime())) {
    alert('Выберите корректную дату и время.');
    return;
  }

  const duplicate = meeting.dateOptions.some(
    option => option.value === value
  );

  if (duplicate) {
    alert('Такой вариант уже существует.');
    return;
  }

  meeting.dateOptions.push({
    id: crypto.randomUUID(),
    value
  });

  saveMeetings();
  renderMeetings();
}

// Подсчёт количества голосов
function countVotes(meeting, optionId) {
  return meeting.participants.filter(participant => {
    const selected = meeting.votes[participant];

    return Array.isArray(selected) &&
      selected.includes(optionId);
  }).length;
}

// Сохранение голоса участника
function saveVote(meetingId, participant, selectedIds) {
  const meeting = meetings.find(item => item.id === meetingId);
  if (!meeting) return;

  normalizeMeeting(meeting);

  if (!meeting.participants.includes(participant)) {
    alert('Сначала выберите участника.');
    return;
  }

  const validIds = new Set(
    meeting.dateOptions.map(option => option.id)
  );

  meeting.votes[participant] = [
    ...new Set(selectedIds.filter(id => validIds.has(id)))
  ];

  if (saveMeetings()) {
    alert('Голос успешно сохранён!');
  }

  renderMeetings();
}

// Форматирование даты
function formatDate(value) {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Отображение встреч
function renderMeetings() {
  container.replaceChildren();

  if (meetings.length === 0) {
    container.append(
      make('p', 'Пока встреч нет. Создай первую!')
    );
    return;
  }

  for (const meeting of meetings) {
    normalizeMeeting(meeting);

    const card = make('article', undefined, 'meeting-card');

    // Основная информация
    card.append(
      make('h3', meeting.name),
      make('p', meeting.description || 'Без описания'),
      make('p', `Место: ${meeting.place || 'Не указано'}`)
    );

    // Раздел участников
    card.append(make('h4', 'Участники встречи'));

    const participantList = make(
      'ul',
      undefined,
      'participant-list'
    );

    for (const name of meeting.participants) {
      const item = make('li');

      const removeButton = make(
        'button',
        'Удалить',
        'remove-button'
      );

      removeButton.type = 'button';

      removeButton.addEventListener('click', () => {
        removeParticipant(meeting.id, name);
      });

      item.append(make('span', name), removeButton);
      participantList.append(item);
    }

    card.append(participantList);

    const participantRow = make(
      'div',
      undefined,
      'participant-actions'
    );

    const participantInput = make('input');
    participantInput.type = 'text';
    participantInput.placeholder = 'Имя участника';
    participantInput.setAttribute(
      'aria-label',
      'Имя нового участника'
    );

    const addParticipantButton = make(
      'button',
      'Добавить участника'
    );

    addParticipantButton.type = 'button';

    addParticipantButton.addEventListener('click', () => {
      addParticipant(meeting.id, participantInput.value);
    });

    participantRow.append(
      participantInput,
      addParticipantButton
    );

    card.append(participantRow);

    // Раздел вариантов даты и времени
    card.append(make('h4', 'Варианты даты и времени'));

    const dateRow = make(
      'div',
      undefined,
      'participant-actions'
    );

    const dateInput = make('input');
    dateInput.type = 'datetime-local';
    dateInput.setAttribute(
      'aria-label',
      'Предлагаемая дата и время'
    );

    const addDateButton = make(
      'button',
      'Предложить дату'
    );

    addDateButton.type = 'button';

    addDateButton.addEventListener('click', () => {
      addDateOption(meeting.id, dateInput.value);
    });

    dateRow.append(dateInput, addDateButton);
    card.append(dateRow);

    // Выбор участника
    card.append(make('h4', 'Голосование'));

    const personLabel = make(
      'label',
      'Кто голосует?'
    );

    const personSelect = make('select');

    personSelect.append(
      new Option('Выберите участника', '')
    );

    for (const name of meeting.participants) {
      personSelect.append(new Option(name, name));
    }

    card.append(personLabel, personSelect);

    const voteList = make(
      'div',
      undefined,
      'vote-list'
    );

    card.append(voteList);

    const saveVoteButton = make(
      'button',
      'Сохранить голос'
    );

    saveVoteButton.type = 'button';
    saveVoteButton.disabled = true;

    card.append(saveVoteButton);

    // Отображение вариантов и результатов
    function showVoting() {
      voteList.replaceChildren();

      const selectedParticipant = personSelect.value;

      saveVoteButton.disabled =
        !selectedParticipant ||
        meeting.dateOptions.length === 0;

      if (meeting.dateOptions.length === 0) {
        voteList.append(
          make('p', 'Варианты даты ещё не предложены.')
        );
        return;
      }

      const counts = meeting.dateOptions.map(
        option => countVotes(meeting, option.id)
      );

      const maximum = Math.max(...counts);

      const participantVotes = Array.isArray(
        meeting.votes[selectedParticipant]
      )
        ? meeting.votes[selectedParticipant]
        : [];

      meeting.dateOptions.forEach((option, index) => {
        const row = make(
          'label',
          undefined,
          'vote-option'
        );

        if (maximum > 0 && counts[index] === maximum) {
          row.classList.add('vote-leader');
        }

        const checkbox = make('input');
        checkbox.type = 'checkbox';
        checkbox.value = option.id;
        checkbox.disabled = !selectedParticipant;

        checkbox.checked = participantVotes.includes(
          option.id
        );

        const caption = make(
          'span',
          `${formatDate(option.value)} — голосов: ${counts[index]}`
        );

        row.append(checkbox, caption);
        voteList.append(row);
      });
    }

    personSelect.addEventListener('change', showVoting);

    saveVoteButton.addEventListener('click', () => {
      const selectedIds = [
        ...voteList.querySelectorAll(
          'input[type="checkbox"]:checked'
        )
      ].map(checkbox => checkbox.value);

      saveVote(
        meeting.id,
        personSelect.value,
        selectedIds
      );
    });

    showVoting();

    container.append(card);
  }
}

// Создание новой встречи
form.addEventListener('submit', event => {
  event.preventDefault();

  const name = document
    .getElementById('meetingName')
    .value.trim();

  const description = document
    .getElementById('meetingDescription')
    .value.trim();

  const place = document
    .getElementById('meetingPlace')
    .value.trim();

  if (!name) {
    alert('Укажите название встречи!');
    return;
  }

  meetings.push({
    id: crypto.randomUUID(),
    name,
    description,
    place,
    participants: [],
    dateOptions: [],
    votes: {}
  });

  saveMeetings();
  renderMeetings();
  form.reset();
});

renderMeetings();
