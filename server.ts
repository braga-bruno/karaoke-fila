import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("karaoke.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    singer TEXT NOT NULL,
    songTitle TEXT NOT NULL,
    artist TEXT,
    status TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  INSERT OR IGNORE INTO settings (key, value) VALUES ('queue_status', 'open');
`);

interface Setting {
  key: string;
  value: string;
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  app.use(express.json());

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Send initial state
    const requests = db.prepare("SELECT * FROM requests ORDER BY createdAt ASC").all();
    const settings = db.prepare("SELECT * FROM settings").all() as Setting[];
    const queueStatus = settings.find(s => s.key === 'queue_status')?.value || 'open';
    
    socket.emit("initial_state", { requests, queueStatus });

    socket.on("add_request", (data) => {
      const currentStatus = (db.prepare("SELECT value FROM settings WHERE key = 'queue_status'").get() as Setting | undefined)?.value;
      if (currentStatus === 'closed') {
        socket.emit("error", "A fila está encerrada e não aceita novos pedidos.");
        return;
      }

      const { id, singer, songTitle, artist, status, createdAt } = data;
      try {
        const stmt = db.prepare(
          "INSERT INTO requests (id, singer, songTitle, artist, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
        );
        stmt.run(id, singer, songTitle, artist || "", status, createdAt);
        io.emit("request_added", data);
      } catch (err) {
        console.error("Error adding request:", err);
      }
    });

    socket.on("toggle_queue", (newStatus) => {
      try {
        db.prepare("UPDATE settings SET value = ? WHERE key = 'queue_status'").run(newStatus);
        io.emit("queue_status_changed", newStatus);
      } catch (err) {
        console.error("Error toggling queue:", err);
      }
    });

    socket.on("update_status", ({ id, status }) => {
      try {
        // If status is 'singing', set all other 'singing' to 'completed'
        if (status === 'singing') {
          db.prepare("UPDATE requests SET status = 'completed' WHERE status = 'singing'").run();
        }
        
        db.prepare("UPDATE requests SET status = ? WHERE id = ?").run(status, id);
        
        // Broadcast full state refresh to be safe and handle the multi-update logic
        const allRequests = db.prepare("SELECT * FROM requests ORDER BY createdAt ASC").all();
        io.emit("initial_state", allRequests);
      } catch (err) {
        console.error("Error updating status:", err);
      }
    });

    socket.on("remove_request", (id) => {
      try {
        db.prepare("DELETE FROM requests WHERE id = ?").run(id);
        io.emit("request_removed", id);
      } catch (err) {
        console.error("Error removing request:", err);
      }
    });

    socket.on("clear_all", () => {
      try {
        db.prepare("DELETE FROM requests").run();
        io.emit("initial_state", []);
      } catch (err) {
        console.error("Error clearing requests:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
