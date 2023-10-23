import { Router } from "express";
import {
  createMessage,
  createMediaMessage,
  getChats,
  getMessages,
} from "../controllers/MessageController.js";
import multer from "multer";
import fs from "fs";

const router = Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let mimeType = file.mimetype.split("/")[0];
    switch (mimeType) {
      case "image":
      case "audio":
      case "video":
        break;
      default:
        mimeType = "other";
    }
    req.fileCategory = mimeType;
    const dir = `uploads/${mimeType}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const date = Date.now();
    let fileName = `${date}-${file.originalname}`;
    cb(null, fileName);
  },
});
const upload = multer({ storage });

router.post("/create-message", createMessage);
router.post("/create-media-message", upload.single("file"), createMediaMessage);
router.post("/get-messages", getMessages);
router.post("/get-chats", getChats);

export default router;
