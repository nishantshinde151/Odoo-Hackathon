import { getIO } from '../../config/socket.js';

export const registerKitchenEvents = (socket) => {
  // Listen for chef markings
  socket.on('kds:start_preparing', (orderId) => {
    console.log(`Chef started preparing order #${orderId}`);
    // Broadcast status change back to POS terminals
    const io = getIO();
    io.emit('pos:order_preparing', orderId);
  });

  socket.on('kds:complete_order', (orderId) => {
    console.log(`Chef completed order #${orderId}`);
    const io = getIO();
    io.emit('pos:order_completed', orderId);
  });
};
