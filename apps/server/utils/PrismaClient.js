import { PrismaClient } from "@prisma/client";

const Client = {
  instance: new PrismaClient(),
};

Object.freeze(Client);

export default Client;
