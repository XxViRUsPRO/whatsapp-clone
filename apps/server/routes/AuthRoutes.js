import { Router } from "express";
import {
  checkUser,
  getUsers,
  onBoardUser,
  getUser,
} from "../controllers/AuthController.js";

const router = Router();
router.post("/check-user", checkUser);
router.post("/onboard-user", onBoardUser);
router.get("/get-users", getUsers);
router.get("/get-user", getUser);

export default router;
