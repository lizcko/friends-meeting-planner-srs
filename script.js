
const STORAGE_KEY = 'friendsMeetingPlanner.meetings';

let meetings = [];

try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    meetings = Array.isArray(saved) ? saved : [];
} catch (error) {
    console.error('Ошибка загрузки встреч:', error);
}

const form = document.getElementById('meetingForm');
const container = document.getElementById('meetingsContainer');

function saveMeetings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
}

function addParticipant(meetingId) {
    const meeting = meetings.find(item => item.id === meetingId);
    if (!meeting) return;

    const input = document.getElementById(`participant-${meetingId}`);
    const name = input.value.trim();

    if (!name) {
        alert('Введите имя участника!');
        return;
    }

    if (!Array.isArray(meeting.participants)) {
        meeting.participants = [];
    }

    const exists = meeting.participants.some(
        participant => participant.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
        alert('Этот участник уже добавлен!');
        return;
    }

    meeting.participants.push(name);
    saveMeetings();
    renderMeetings();
}

function removeParticipant(meetingId, participantName) {
    const meeting = meetings.find(item => item.id === meetingId);
    if (!meeting || !Array.isArray(meeting.participants)) return;

    meeting.participants = meeting.participants.filter(
        participant => participant !== participantName
    );

    saveMeetings();
    renderMeetings();
}

function renderMeetings() {
    container.replaceChildren();

    if (meetings.length === 0) {
        const empty = document.createElement('p');
        empty.textContent = 'Пока встреч нет. Создай первую!';
        container.appendChild(empty);
        return;
    }

    meetings.forEach(meeting => {
        if (!Array.isArray(meeting.participants)) {
            meeting.participants = [];
        }

        const card = document.createElement('article');
        card.className = 'meeting-card';

        const title = document.createElement('h3');
        title.textContent = meeting.name;

        const description = document.createElement('p');
        description.textContent = meeting.description || 'Без описания';

        const place = document.createElement('p');
        place.textContent = `Место: ${meeting.place || 'Не указано'}`;

        const participantsTitle = document.createElement('h4');
        participantsTitle.textContent = 'Участники встречи';

        const participantList = document.createElement('ul');
        participantList.className = 'participant-list';

        meeting.participants.forEach(name => {
            const item = document.createElement('li');

            const nameSpan = document.createElement('span');
            nameSpan.textContent = name;

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.textContent = 'Удалить';
            removeButton.className = 'remove-button';
            removeButton.addEventListener('click', () => {
                removeParticipant(meeting.id, name);
            });

            item.append(nameSpan, removeButton);
            participantList.appendChild(item);
        });

        const participantInput = document.createElement('input');
        participantInput.type = 'text';
        participantInput.id = `participant-${meeting.id}`;
        participantInput.placeholder = 'Имя участника';

        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.textContent = 'Добавить участника';
        addButton.addEventListener('click', () => {
            addParticipant(meeting.id);
        });

        card.append(
            title,
            description,
            place,
            participantsTitle,
            participantList,
            participantInput,
            addButton
        );

        container.appendChild(card);
    });
}

form.addEventListener('submit', event => {
    event.preventDefault();

    const name = document.getElementById('meetingName').value.trim();
    const description = document.getElementById('meetingDescription').value.trim();
    const place = document.getElementById('meetingPlace').value.trim();

    if (!name) {
        alert('Укажите название встречи!');
        return;
    }

    const meeting = {
        id: crypto.randomUUID(),
        name,
        description,
        place,
        participants: [],
        dateOptions: [],
        votes: {}
    };

    meetings.push(meeting);
    saveMeetings();
    renderMeetings();
    form.reset();
});

renderMeetings();
