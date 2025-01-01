import express, { Router } from "express"
import { checkAuth, loginUser, logoutUser, registerUser, updateProfile } from "../controllers/User.controller.js"
import { protectRoute } from "../middlewares/auth.middleware.js"

const router = Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(logoutUser)
router.route('/update').put(protectRoute, updateProfile)
router.route('/check').get(protectRoute, checkAuth)

export default router