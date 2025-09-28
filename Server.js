const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Database connection
require('./config/database');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'gweru-tech-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/gweru-technologies'
  }),
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', require('./routes/auth'));
app.use('/business', require('./routes/business'));
app.use('/products', require('./routes/products'));
app.use('/social', require('./routes/social'));

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected');
  
  socket.on('join-chat', (userId) => {
    socket.join(userId);
  });
  
  socket.on('send-message', (data) => {
    io.emit('new-message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Gweru Technologies server running on port ${PORT}`);
});
