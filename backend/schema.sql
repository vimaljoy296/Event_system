CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,  -- Password field added
    role TEXT NOT NULL
);

CREATE TABLE Events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    capacity INTEGER NOT NULL
);

CREATE TABLE EventParticipants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    FOREIGN KEY (eventId) REFERENCES Events (id),
    FOREIGN KEY (userId) REFERENCES Users (id)
);

-- Insert mock data into Users with passwords
INSERT OR IGNORE INTO Users (name, email, password, role) VALUES
('Vimal', 'vimal098@gmail.com', '122345678', 'Admin'),
('Liya', 'Liya123@gmail.com', '01234567', 'User');

-- Insert mock data into Events
INSERT OR IGNORE INTO Events (name, description, date, capacity) VALUES
('Tech Meetup', 'A tech gathering for enthusiasts.', '2024-12-05', 50),
('Art Workshop', 'Learn the basics of painting.', '2024-12-10', 30);
