const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load env variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server (required for Socket.io)
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // During development, allow frontend to connect from any port
    methods: ["GET", "POST"]
  }
});

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('SystemForge API is running...');
});

app.use('/api/projects', require('./routes/projectRoutes'));

const { startSimulation, stopSimulation } = require('./services/simulationEngine');

app.use('/api/projects', require('./routes/projectRoutes'));
// Add this line:
app.use('/api/auth', require('./routes/authRoutes'));

// --- WebSocket Logic (The Simulation Engine) ---
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Join the room
  socket.on('join_project', (projectId) => {
    socket.join(projectId);
    console.log(`Socket ${socket.id} joined project room: ${projectId}`);
  });

  // 2. Start the engine (NO MORE setInterval HERE!)
  socket.on('start_simulation', (projectId) => {
    console.log(`Starting simulation for project: ${projectId}`);
    startSimulation(io, projectId);
  });

  // 3. Stop the engine
  socket.on('stop_simulation', (projectId) => {
    stopSimulation(projectId);
  });
    
  // 4. Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});