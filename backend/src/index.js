import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import disasterRoutes from './routes/disaster.routes.js';
import reportRoutes from './routes/report.routes.js';
import resourceRoutes from './routes/resource.routes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Fallback to Vite's default port
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Attach socket.io to request object for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/disasters/:disaster_id/resources', resourceRoutes);
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Disaster Response Coordination Platform API' });
});

// Use disaster routes
app.use('/api/disasters', disasterRoutes);

// Use report routes (nested under disasters)
app.use('/api/disasters/:disaster_id/reports', reportRoutes);

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
