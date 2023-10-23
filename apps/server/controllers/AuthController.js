import PrismaClient from "../utils/PrismaClient.js";

export const checkUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({ message: "Email is required.", status: false });
    }
    const prisma = PrismaClient.instance;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json({ message: "User not found.", status: false });
    } else {
      return res.json({ message: "User found.", data: user, status: true });
    }
  } catch (err) {
    next(err);
  }
};

export const onBoardUser = async (req, res, next) => {
  try {
    const { email, name, profileImg, about } = req.body;
    if (!email || !name) {
      return res.json({
        message: "Email and name are required.",
        status: false,
      });
    }
    const prisma = PrismaClient.instance;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return res.json({ message: "User already exists.", status: false });
    } else {
      const newUser = await prisma.user.create({
        data: { email, name, profileImg, about },
      });
      return res.json({
        message: "User created.",
        data: newUser,
        status: true,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const prisma = PrismaClient.instance;
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        profileImg: true,
        about: true,
      },
      orderBy: { name: "asc" },
    });

    const usersByAlphabet = {};
    users.forEach((user) => {
      const firstLetter = user.name[0].toUpperCase();
      if (!usersByAlphabet[firstLetter]) {
        usersByAlphabet[firstLetter] = [];
      }
      usersByAlphabet[firstLetter].push(user);
    });

    return res.json({
      message: "Users fetched.",
      data: usersByAlphabet,
      status: true,
    });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const prisma = PrismaClient.instance;
    const { id } = req.query;
    if (id) {
      const user = await prisma.user.findUnique({
        where: { id: +id },
        select: {
          id: true,
          name: true,
          email: true,
          profileImg: true,
          about: true,
        },
      });
      return res.json({
        message: "User found.",
        data: user,
        status: true,
      });
    }
    return res.json({ message: "Invalid user ID", status: false });
  } catch (err) {
    next(err);
  }
};
