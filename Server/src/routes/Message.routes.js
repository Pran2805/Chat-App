import express, { Router } from "express"
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getMessages, getUsers, sendMessages } from "../controllers/message.controller.js";

const router = Router()

router.route("/users").get(protectRoute, getUsers)
router.route('/:id').get(protectRoute, getMessages)
router.route("/send/:id").post(protectRoute, sendMessages)
export default router;