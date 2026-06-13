import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { initSocket } from './config/socket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Attach Socket.io server
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server listening in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
