
-- Лабораторная работа №4
-- Нормализованная схема SQLite (3NF)
-- Проект: Планировщик встреч с друзьями

PRAGMA foreign_keys = ON;

-- 1. Пользователи
CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 2. Встречи
CREATE TABLE Meetings (
    meeting_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    created_by INTEGER NOT NULL,
    FOREIGN KEY (created_by)
        REFERENCES Users(user_id)
        ON DELETE CASCADE
);

-- 3. Участники встреч
CREATE TABLE Participants (
    participant_id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    UNIQUE (meeting_id, user_id),
    FOREIGN KEY (meeting_id)
        REFERENCES Meetings(meeting_id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE
);

-- 4. Варианты даты и времени
CREATE TABLE DateOptions (
    option_id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    proposed_datetime TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (meeting_id)
        REFERENCES Meetings(meeting_id)
        ON DELETE CASCADE
);

-- 5. Голоса участников
CREATE TABLE Votes (
    vote_id INTEGER PRIMARY KEY AUTOINCREMENT,
    participant_id INTEGER NOT NULL,
    option_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE (participant_id, option_id),
    FOREIGN KEY (participant_id)
        REFERENCES Participants(participant_id)
        ON DELETE CASCADE,
    FOREIGN KEY (option_id)
        REFERENCES DateOptions(option_id)
        ON DELETE CASCADE
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_meetings_created_by
    ON Meetings(created_by);

CREATE INDEX idx_participants_user_id
    ON Participants(user_id);

CREATE INDEX idx_dateoptions_meeting_id
    ON DateOptions(meeting_id);

CREATE INDEX idx_dateoptions_datetime
    ON DateOptions(proposed_datetime);

CREATE INDEX idx_votes_option_id
    ON Votes(option_id);
