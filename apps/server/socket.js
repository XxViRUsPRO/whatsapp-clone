const TIMEOUT_MS = 10000;
const INTERVAL_MS = 500;

const io = (io) => {
  global.onlineUsers = new Map();
  global.currentRooms = new Map();

  io.on("connection", (socket) => {
    global.socket = socket;
    console.log("User connected", socket.id);

    /**
     * User add event handler
     * @param {Object} data - {id}
     * @returns {void}
     */
    socket.on("addUser", (data) => {
      console.log("New user added! { " + data.id + " : " + socket.id + " }");
      global.onlineUsers.set(data.id, socket.id);
      socket.emit("userAdded", { id: socket.id });
    });

    /**
     * Message outgoing event handler
     * @param {Object} data - {id, text, type, status, senderId, receiverId}
     * @returns {void}
     */
    socket.on("messageOut", (data) => {
      const receiverSocketId = global.onlineUsers.get(data.receiverId);
      if (receiverSocketId) socket.to(receiverSocketId).emit("messageIn", data);
    });

    /**
     * Call outgoing event handler
     * @param {Object} data - {fromId, toId, type}
     * @returns {void}
     */
    socket.on("callOut", (data) => {
      let timeout, interval;
      interval = setInterval(() => {
        const receiverSocketId = global.onlineUsers.get(data.toId);
        if (receiverSocketId) {
          socket.to(receiverSocketId).emit("callIn", {
            peerId: data.fromId,
            roomId: data.roomId,
            type: data.type,
          });
        }
      }, INTERVAL_MS);
      timeout = setTimeout(() => {
        clearInterval(interval);
        const receiverSocketId = global.onlineUsers.get(data.toId);
        if (receiverSocketId) {
          socket.to(receiverSocketId).emit("callEnded");
        }
        socket.emit("callEnded");
      }, TIMEOUT_MS);
      currentRooms.set(data.fromId, {
        fromId: data.fromId,
        toId: data.toId,
        type: data.type,
        timeout,
        interval,
      });
    });

    /**
     * Call accept event handler
     */
    socket.on("callAccept", (data) => {
      const receiverSocketId = global.onlineUsers.get(data.toId);
      if (receiverSocketId) {
        if (currentRooms.has(data.toId)) {
          const { timeout, interval } = currentRooms.get(data.toId);
          clearTimeout(timeout);
          clearInterval(interval);
          currentRooms.delete(data.toId);
        }
        socket.to(receiverSocketId).emit("callAccepted");
      }
    });

    /**
     * Call reject event handler
     */
    socket.on("callReject", (data) => {
      const receiverSocketId = global.onlineUsers.get(data.toId);
      if (receiverSocketId) {
        if (currentRooms.has(data.toId)) {
          const { timeout, interval } = currentRooms.get(data.toId);
          clearTimeout(timeout);
          clearInterval(interval);
          currentRooms.delete(data.toId);
        }
        socket.to(receiverSocketId).emit("callRejected");
      }
    });

    /**
     * Call end event handler
     */
    socket.on("callEnd", (data) => {
      const receiverSocketId = global.onlineUsers.get(data.toId);
      if (receiverSocketId) {
        if (currentRooms.has(data.fromId)) {
          const { timeout, interval } = currentRooms.get(data.fromId);
          clearTimeout(timeout);
          clearInterval(interval);
          currentRooms.delete(data.fromId);
        }
        socket.to(receiverSocketId).emit("callEnded");
      }
    });

    //#region Video Chat
    // Triggered when a peer hits the join room button.
    socket.on("join", (roomName) => {
      const { rooms } = io.sockets.adapter;
      const room = rooms.get(roomName);

      // room == undefined when no such room exists.
      if (room === undefined) {
        socket.join(roomName);
        socket.emit("created");
        console.log(`User ${socket.id} created room ${roomName}`);
      } else if (room.size === 1) {
        // room.size == 1 when one person is inside the room.
        socket.join(roomName);
        socket.emit("joined");
        console.log(`User ${socket.id} joined room ${roomName}`);
      } else {
        // when there are already two people inside the room.
        socket.emit("full");
      }
    });

    // Triggered when the person who joined the room is ready to communicate.
    socket.on("ready", (roomName) => {
      socket.broadcast.to(roomName).emit("ready"); // Informs the other peer in the room.
    });

    // Triggered when server gets an icecandidate from a peer in the room.
    socket.on("ice-candidate", (candidate, roomName) => {
      socket.broadcast.to(roomName).emit("ice-candidate", candidate); // Sends Candidate to the other peer in the room.
    });

    // Triggered when server gets an offer from a peer in the room.
    socket.on("offer", (offer, roomName) => {
      socket.broadcast.to(roomName).emit("offer", offer); // Sends Offer to the other peer in the room.
    });

    // Triggered when server gets an answer from a peer in the room
    socket.on("answer", (answer, roomName) => {
      socket.broadcast.to(roomName).emit("answer", answer); // Sends Answer to the other peer in the room.
    });

    socket.on("leave", (roomName) => {
      socket.leave(roomName);
      socket.broadcast.to(roomName).emit("leave");
    });
    //#endregion

    /**
     * Socket disconnect event handler
     * @param {void}
     * @returns {void}
     */
    socket.on("disconnecting", () => {
      const rooms = socket.rooms;
      rooms.forEach((room) => {
        console.log("User left room", room);
        socket.broadcast.to(room).emit("leave");
      });
    });

    socket.on("disconnect", () => {
      global.onlineUsers.delete(socket.id);
      console.log("User disconnected", socket.id);
    });
  });
};

export default io;
