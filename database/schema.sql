
-- Лабораторная работа №4
-- Проект: Планировщик встреч с друзьями
-- Нормализованная схема базы данных SQLite (3NF)
-- Исправленная версия

PRAGMA foreign_keys = ON;

-- ============================================
-- 1. Пользователи
-- ============================================

CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- 2. Встречи
-- ============================================

CREATE TABLE Meetings (
    meeting_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    final_option_id INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    created_by INTEGER NOT NULL,

    FOREIGN KEY (created_by)
        REFERENCES Users(user_id)
        ON DELETE CASCADE,

    -- Итоговый вариант должен принадлежать
    -- именно этой встрече
    FOREIGN KEY (final_option_id, meeting_id)
        REFERENCES DateOptions(option_id, meeting_id)
);

-- ============================================
-- 3. Участники встреч
-- ============================================

CREATE TABLE Participants (
    participant_id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,

    -- Пользователь не может быть добавлен
    -- в одну встречу дважды
    UNIQUE (meeting_id, user_id),

    -- Для составного внешнего ключа Votes
    UNIQUE (participant_id, meeting_id),

    FOREIGN KEY (meeting_id)
        REFERENCES Meetings(meeting_id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE
);

-- ============================================
-- 4. Варианты даты и времени
-- ============================================

CREATE TABLE DateOptions (
    option_id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    proposed_datetime TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),

    -- Запрет одинаковых вариантов
    -- в пределах одной встречи
    UNIQUE (meeting_id, proposed_datetime),

    -- Для составных внешних ключей
    UNIQUE (option_id, meeting_id),

    FOREIGN KEY (meeting_id)
        REFERENCES Meetings(meeting_id)
        ON DELETE CASCADE
);

-- ============================================
-- 5. Голоса участников
-- ============================================

CREATE TABLE Votes (
    vote_id INTEGER PRIMARY KEY AUTOINCREMENT,
    participant_id INTEGER NOT NULL,
    option_id INTEGER NOT NULL,
    meeting_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),

    -- Один голос за один вариант
    UNIQUE (participant_id, option_id),

    -- Участник должен принадлежать
    -- указанной встрече
    FOREIGN KEY (participant_id, meeting_id)
        REFERENCES Participants(participant_id, meeting_id)
        ON DELETE CASCADE,

    -- Вариант даты должен принадлежать
    -- той же встрече
    FOREIGN KEY (option_id, meeting_id)
        REFERENCES DateOptions(option_id, meeting_id)
        ON DELETE CASCADE
);

-- ============================================
-- 6. Индексы для оптимизации запросов
-- ============================================

-- Поиск встреч по организатору
CREATE INDEX idx_meetings_created_by
    ON Meetings(created_by);

-- Поиск окончательно выбранного варианта
CREATE INDEX idx_meetings_final_option
    ON Meetings(final_option_id, meeting_id);

-- Поиск участий пользователя
CREATE INDEX idx_participants_user_id
    ON Participants(user_id);

-- Поиск вариантов по встрече
CREATE INDEX idx_dateoptions_meeting_id
    ON DateOptions(meeting_id);

-- Поиск вариантов по дате и времени
CREATE INDEX idx_dateoptions_datetime
    ON DateOptions(proposed_datetime);

-- Подсчёт голосов за вариант
CREATE INDEX idx_votes_option_id
    ON Votes(option_id);

-- Проверка голосов участника во встрече
CREATE INDEX idx_votes_participant_meeting
    ON Votes(participant_id, meeting_id);
