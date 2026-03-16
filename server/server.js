const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const httpServer = require('http').createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://aether-forge-c4gr.vercel.app",
  "https://aether-forge-production.vercel.app"
];

const io = require('socket.io')(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(bodyParser.json());

// Initialize DB if not exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
}

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// Auth Endpoints
app.post('/api/auth/signup', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  const newUser = { email, password, profile: null, createdAt: new Date().toISOString() };
  db.users.push(newUser);
  writeDB(db);
  res.status(201).json({ message: 'User created' });
});

app.post('/api/auth/onboarding', (req, res) => {
  const { email, profile } = req.body;
  const db = readDB();
  const userIndex = db.users.findIndex(u => u.email === email);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  db.users[userIndex].profile = profile;
  writeDB(db);
  res.json({ message: 'Profile updated' });
});

// Admin Endpoint
app.post('/api/admin/users', (req, res) => {
  const { password } = req.body;
  // Master password check (moved to env-based check for CI security)
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'Lalitha76!';
  if (password !== ADMIN_PASS) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const db = readDB();
  res.json(db.users);
});

// Socket.io Collaboration Logic
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-project", (projectId) => {
    socket.join(projectId);
  });

  socket.on("cursor-move", (data) => {
    socket.to(data.projectId).emit("user-cursor", {
      userId: socket.id,
      position: data.position
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
