const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const path = require("path");
const db = new sqlite3.Database(path.resolve(__dirname, "../backend/events.db"));

const SECRET_KEY = "mysecretkey";

const resolvers = {
  Query: {
    fetchEvents: async () => {
      return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Events", (err, rows) => {
          if (err) return reject(new Error("Failed to fetch events."));
          resolve(rows);
        });
      });
    },

    fetchUserDetails: async (_, { userId }) => {
      return new Promise((resolve, reject) => {
        db.get("SELECT * FROM Users WHERE id = ?", [userId], (err, row) => {
          if (err) return reject(new Error("Failed to fetch user details."));
          if (!row) return reject(new Error("User not found."));
          resolve(row);
        });
      });
    },
  },

  Mutation: {
    // Login Mutation
    login: async (_, { email, password }) => {
      return new Promise((resolve, reject) => {
        db.get(
          "SELECT * FROM Users WHERE email = ? AND password = ?",
          [email, password],
          (err, user) => {
            if (err) return reject(new Error("Login failed. Try again."));
            if (!user) return reject(new Error("Invalid email or password."));

            const token = jwt.sign(
              { userId: user.id, role: user.role },
              SECRET_KEY,
              { expiresIn: "1h" }
            );
            resolve({ token, user });
          }
        );
      });
    },

    // Add Event Mutation (Admin Only)
    addEvent: async (_, { name, description, date, capacity }, { token }) => {
      if (!token) throw new Error("Authentication required.");

      try {
        const user = jwt.verify(token, SECRET_KEY);
        if (user.role !== "Admin") {
          throw new Error("Authorization failed: Only admins can add events.");
        }

        if (!name || !description || !date || capacity <= 0) {
          throw new Error("Invalid input. Please provide valid event details.");
        }

        return new Promise((resolve, reject) => {
          const stmt = db.prepare(
            "INSERT INTO Events (name, description, date, capacity) VALUES (?, ?, ?, ?)"
          );
          stmt.run(name, description, date, capacity, function (err) {
            if (err) return reject(new Error("Failed to add event."));
            resolve({
              id: this.lastID,
              name,
              description,
              date,
              capacity,
            });
          });
        });
      } catch (err) {
        throw new Error(err.message);
      }
    },

    // Delete Event Mutation (Admin Only)
    deleteEvent: async (_, { eventId }, { token }) => {
      if (!token) throw new Error("Authentication required.");

      try {
        const user = jwt.verify(token, SECRET_KEY);
        if (user.role !== "Admin") {
          throw new Error("Authorization failed: Only admins can delete events.");
        }

        return new Promise((resolve, reject) => {
          db.get("SELECT * FROM Events WHERE id = ?", [eventId], (err, row) => {
            if (err) return reject(new Error("Failed to fetch event."));
            if (!row) return reject(new Error("Event not found."));

            const deleteStmt = db.prepare("DELETE FROM Events WHERE id = ?");
            deleteStmt.run(eventId, function (err) {
              if (err) return reject(new Error("Failed to delete event."));
              resolve(row);
            });
          });
        });
      } catch (err) {
        throw new Error(err.message);
      }
    },

    // Register for Event Mutation
    registerForEvent: async (_, { eventId, userId }, { token }) => {
      if (!token) throw new Error("Authentication required.");

      try {
        const user = jwt.verify(token, SECRET_KEY);
        if (!user) throw new Error("Authentication failed.");

        // Check if the user exists
        return new Promise((resolve, reject) => {
          db.get("SELECT * FROM Users WHERE id = ?", [userId], (err, userRecord) => {
            if (err) return reject(new Error("Failed to fetch user."));
            if (!userRecord) return reject(new Error("User not found."));

            db.get("SELECT * FROM Events WHERE id = ?", [eventId], (err, event) => {
              if (err) return reject(new Error("Failed to fetch event."));
              if (!event) return reject(new Error("Event not found."));
              if (event.capacity <= 0) {
                return reject(new Error("Event is full."));
              }

              db.get(
                "SELECT * FROM EventParticipants WHERE eventId = ? AND userId = ?",
                [eventId, userId],
                (err, participant) => {
                  if (err) return reject(new Error("Failed to fetch participants."));
                  if (participant) {
                    return reject(new Error("User already registered."));
                  }

                  const stmt = db.prepare(
                    "INSERT INTO EventParticipants (eventId, userId) VALUES (?, ?)"
                  );
                  stmt.run(eventId, userId, function (err) {
                    if (err) return reject(new Error("Failed to register."));
                    resolve({ eventId, userId });
                  });
                }
              );
            });
          });
        });
      } catch (err) {
        throw new Error(err.message);
      }
    },

    // Add User Mutation (Admin Only)
    addUser: async (_, { name, email, password, role }, { token }) => {
      if (!token) throw new Error("Authentication required.");

      try {
        const user = jwt.verify(token, SECRET_KEY);
        if (user.role !== "Admin") {
          throw new Error("Authorization failed: Only admins can add users.");
        }

        return new Promise((resolve, reject) => {
          db.get("SELECT * FROM Users WHERE email = ?", [email], (err, existingUser) => {
            if (err) return reject(new Error("Failed to check email."));
            if (existingUser) return reject(new Error("User already exists with this email."));

            const stmt = db.prepare(
              "INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)"
            );
            stmt.run(name, email, password, role, function (err) {
              if (err) return reject(new Error("Failed to add user."));
              resolve({
                id: this.lastID,
                name,
                email,
                role,
              });
            });
          });
        });
      } catch (err) {
        throw new Error(err.message);
      }
    },

    // Update Event Capacity Mutation (Admin Only)
    updateEventCapacity: async (_, { eventId, capacity }, { token }) => {
      if (!token) throw new Error("Authentication required.");

      try {
        const user = jwt.verify(token, SECRET_KEY);
        if (user.role !== "Admin") {
          throw new Error("Authorization failed: Only admins can update event capacity.");
        }

        if (capacity <= 0) {
          throw new Error("Invalid capacity. Capacity must be greater than zero.");
        }

        return new Promise((resolve, reject) => {
          db.get("SELECT * FROM Events WHERE id = ?", [eventId], (err, event) => {
            if (err) return reject(new Error("Failed to fetch event."));
            if (!event) return reject(new Error("Event not found."));

            const stmt = db.prepare("UPDATE Events SET capacity = ? WHERE id = ?");
            stmt.run(capacity, eventId, function (err) {
              if (err) return reject(new Error("Failed to update event capacity."));
              resolve({
                id: eventId,
                name: event.name,
                description: event.description,
                date: event.date,
                capacity: capacity, // updated capacity
              });
            });
          });
        });
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
};

module.exports = resolvers;
