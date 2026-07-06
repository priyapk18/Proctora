import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import violationRoutes from './routes/violationRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Routes
app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/violations', violationRoutes);

// Socket.io
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('violation_detected', (data) => {
    io.emit('hr_violation_alert', data);
  });

  socket.on('candidate_status_change', (data) => {
    io.emit('hr_status_update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export { app, io, httpServer };
