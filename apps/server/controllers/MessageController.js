import PrismaClient from "../utils/PrismaClient.js";

export const createMessage = async (req, res, next) => {
  try {
    const prisma = PrismaClient.instance;
    const { message, from, to } = req.body;
    const isUserOnline = global.onlineUsers.has(+to);
    if (message && from && to) {
      const newMessage = await prisma.message.create({
        data: {
          text: message,
          sender: { connect: { id: +from } },
          receiver: { connect: { id: +to } },
          status: isUserOnline ? "delivered" : "sent",
        },
      });
      return res.json({
        message: "Message sent.",
        data: newMessage,
        status: true,
      });
    }
    return res.json({ message: "Invalid message data", status: false });
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const prisma = PrismaClient.instance;
    const { from, to } = req.body;
    if (from && to) {
      // Update messages status sent to the current user to read
      await prisma.message.updateMany({
        data: {
          status: "read",
        },
        where: {
          senderId: +to,
          NOT: {
            status: "read",
          },
        },
      });

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: +from, receiverId: +to },
            { senderId: +to, receiverId: +from },
          ],
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return res.json({
        message: "Messages found.",
        data: messages,
        status: true,
      });
    }
    return res.json({ message: "Invalid message data", status: false });
  } catch (err) {
    next(err);
  }
};

export const getChats = async (req, res, next) => {
  try {
    const prisma = PrismaClient.instance;
    const { id } = req.body;
    if (id) {
      // Update messages status sent to the current user to delivered
      await prisma.message.updateMany({
        data: {
          status: "delivered",
        },
        where: {
          senderId: +id,
          status: "sent",
        },
      });

      const chats = await prisma.message.findMany({
        where: {
          OR: [{ senderId: +id }, { receiverId: +id }],
        },
        orderBy: { createdAt: "desc" },
      });

      // If last message is image, voice or video, then show it its type
      chats.forEach((chat) => {
        if (chat.type !== "text") {
          chat.text = chat.type.charAt(0).toUpperCase() + chat.type.slice(1);
        }
      });

      const groupedByUser = {};
      chats.forEach((chat) => {
        if (chat.senderId === +id && !groupedByUser[chat.receiverId]) {
          groupedByUser[chat.receiverId] = chat;
        }
        if (chat.receiverId === +id && !groupedByUser[chat.senderId]) {
          groupedByUser[chat.senderId] = chat;
        }
      });

      return res.json({
        message: "Chats found.",
        data: groupedByUser,
        status: true,
      });
    }
    return res.json({ message: "Invalid user ID", status: false });
  } catch (err) {
    next(err);
  }
};

export const createMediaMessage = async (req, res, next) => {
  try {
    if (req.file) {
      const type = req.fileCategory;
      const prisma = PrismaClient.instance;
      const { from, to } = req.body;
      if (from && to) {
        const newMessage = await prisma.message.create({
          data: {
            text: req.file.filename,
            type: type,
            sender: { connect: { id: +from } },
            receiver: { connect: { id: +to } },
          },
        });
        return res.json({
          message: "Message sent.",
          data: newMessage,
          status: true,
        });
      }
      return res.json({ message: "Invalid message data", status: false });
    }
    return res.json({ message: "Invalid image", status: false });
  } catch (err) {
    next(err);
  }
};
