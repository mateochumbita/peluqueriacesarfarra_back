import { Router } from "express";
import { register, login } from "./controller.js";

const router = Router();

// Registro de usuario y cliente
router.post("/register", register);

// Login de usuario
router.post("/login", login);

export default router;