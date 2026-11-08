
-- Лабораторная работа №4
-- Проект: Планировщик встреч с друзьями
-- Реляционная база данных SQLite (3НФ)

PRAGMA foreign_keys = ON;

-- 1. Пользователи
CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Встречи
CREATE TABLE Meetings (
    meeting_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    description TEXT,
    location TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
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
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    is_final INTEGER NOT NULL DEFAULT 0
        CHECK (is_final IN (0, 1)),

    UNIQUE (meeting_id, proposed_datetime),

    FOREIGN KEY (meeting_id)
        REFERENCES Meetings(meeting_id)
        ON DELETE CASCADE
);

-- 5. Голосование участников
CREATE TABLE Votes (
    vote_id INTEGER PRIMARY KEY AUTOINCREMENT,
    participant_id INTEGER NOT NULL,
    option_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),

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

-- Только одна итоговая дата для каждой встречи
CREATE UNIQUE INDEX idx_one_final_option_per_meeting
    ON DateOptions(meeting_id)
    WHERE is_final = 1;

-- Запрет голосовать за дату другой встречи
CREATE TRIGGER check_vote_meeting_insert
BEFORE INSERT ON Votes
FOR EACH ROW
WHEN
    (SELECT meeting_id FROM Participants
     WHERE participant_id = NEW.participant_id)
    <>
    (SELECT meeting_id FROM DateOptions
     WHERE option_id = NEW.option_id)
BEGIN
    SELECT RAISE(
        ABORT,
        'Participant and date option belong to different meetings'
    );
END;

-- Та же проверка при изменении голоса
CREATE TRIGGER check_vote_meeting_update
BEFORE UPDATE OF participant_id, option_id ON Votes
FOR EACH ROW
WHEN
    (SELECT meeting_id FROM Participants
     WHERE participant_id = NEW.participant_id)
    <>
    (SELECT meeting_id FROM DateOptions
     WHERE option_id = NEW.option_id)
BEGIN
    SELECT RAISE(
        ABORT,
        'Participant and date option belong to different meetings'
    );
END;

-- Нельзя перенести участника с голосами в другую встречу
CREATE TRIGGER prevent_participant_move_with_votes
BEFORE UPDATE OF meeting_id ON Participants
FOR EACH ROW
WHEN NEW.meeting_id <> OLD.meeting_id
    AND EXISTS (
        SELECT 1 FROM Votes
        WHERE participant_id = OLD.participant_id
    )
BEGIN
    SELECT RAISE(
        ABORT,
        'Cannot change meeting for participant with votes'
    );
END;

-- Нельзя перенести вариант даты с голосами в другую встречу
CREATE TRIGGER prevent_date_option_move_with_votes
BEFORE UPDATE OF meeting_id ON DateOptions
FOR EACH ROW
WHEN NEW.meeting_id <> OLD.meeting_id
    AND EXISTS (
        SELECT 1 FROM Votes
        WHERE option_id = OLD.option_id
    )
BEGIN
    SELECT RAISE(
        ABORT,
        'Cannot change meeting for date option with votes'
    );
END;
