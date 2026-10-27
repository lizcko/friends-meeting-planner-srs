
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

function renderMeetings() {
    container.replaceChildren();

    if (meetings.length === 0) {
        const empty = document.createElement('p');
        empty.textContent = 'Пока встреч нет. Создай первую!';
        container.appendChild(empty);
        return;
    }

    meetings.forEach(meeting => {
        const card = document.createElement('article');
        card.className = 'meeting-card';

        const title = document.createElement('h3');
        title.textContent = meeting.name;

        const description = document.createElement('p');
        description.textContent = meeting.description || 'Без описания';

        const place = document.createElement('p');
        place.textContent = `Место: ${meeting.place || 'Не указано'}`;

        card.append(title, description, place);
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
