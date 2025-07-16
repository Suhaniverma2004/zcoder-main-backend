// --- SECTION 1: IMPORTS ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Model Imports
const ChatRoom = require('./models/ChatRoom');
const Message = require('./models/Message');

// Route Imports
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookmarkRoutes = require('./routes/bookmarks');
const leaderboardRoutes = require('./routes/leaderboard');

// --- SECTION 2: APP CONFIGURATION ---
const app = express();

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://zcoder-frontend-theta.vercel.app'
  ],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// --- SECTION 3: DATABASE CONNECTION ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
};
connectDB();

// --- SECTION 4: API ROUTES ---
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('ZCoder Backend is Live 🚀');
});

// --- SECTION 5: SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions
});

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('joinRoom', async ({ problemId }) => {
    try {
      socket.join(problemId);
      let chatRoom = await ChatRoom.findOne({ problemId });
      if (!chatRoom) {
        chatRoom = new ChatRoom({ problemId });
        await chatRoom.save();
      }

      const messages = await Message.find({ chatRoom: chatRoom._id })
                                    .sort({ createdAt: 'asc' });
      socket.emit('previousMessages', messages);
    } catch (err) {
      console.error('❌ Error in joinRoom:', err);
    }
  });

  socket.on('sendMessage', async ({ room, user, text }) => {
    try {
      const chatRoom = await ChatRoom.findOne({ problemId: room });
      if (!chatRoom) return;

      const message = new Message({
        text,
        user,
        chatRoom: chatRoom._id
      });
      await message.save();

      io.to(room).emit('receiveMessage', {
        _id: message._id,
        text: message.text,
        user: message.user,
        timestamp: message.createdAt.toISOString(), // ISO timestamp
      });
    } catch (err) {
      console.error('❌ Error in sendMessage:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('⚡ User disconnected:', socket.id);
  });
});

// --- SECTION 6: START SERVER ---
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 ZCoder API is running on port ${PORT}`);
});
