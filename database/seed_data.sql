
-- Лабораторная работа №4
-- Тестовые данные для планировщика встреч с друзьями
-- Выполнять после database/schema.sql

PRAGMA foreign_keys = ON;

-- 1. Пользователи
INSERT INTO Users (user_id, username, email)
VALUES
    (1, 'alex_ivanov', 'alex@example.com'),
    (2, 'maria_petrova', 'maria@example.com'),
    (3, 'ivan_sidorov', 'ivan@example.com');

-- 2. Встречи
INSERT INTO Meetings
    (meeting_id, title, description, created_by)
VALUES
    (1, 'Поход в кино',
     'Совместный просмотр фильма', 1),
    (2, 'Встреча в кафе',
     'Встреча друзей в выходные', 2);

-- 3. Участники встреч
INSERT INTO Participants
    (participant_id, meeting_id, user_id)
VALUES
    (1, 1, 1),
    (2, 1, 2),
    (3, 1, 3),
    (4, 2, 2),
    (5, 2, 3);

-- 4. Варианты даты и времени
INSERT INTO DateOptions
    (option_id, meeting_id, proposed_datetime)
VALUES
    (1, 1, '2026-11-14 18:00'),
    (2, 1, '2026-11-15 17:00'),
    (3, 2, '2026-11-21 15:00'),
    (4, 2, '2026-11-22 16:00');

-- 5. Голоса участников
INSERT INTO Votes
    (participant_id, option_id)
VALUES
    (1, 1),
    (2, 1),
    (3, 2),
    (1, 2),
    (4, 3),
    (5, 3),
    (4, 4);
